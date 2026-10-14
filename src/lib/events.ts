import { z } from "zod";
import { createHash } from "node:crypto";
import { Tx, uid, audit } from "./db";
import { Context, Event, cents, Kind } from "./types";
export const rowSchema = z.object({
  external_id: z.string().trim().min(1).max(150),
  kind: z.enum(["sale", "refund", "expense", "lead", "campaign", "review"]),
  date: z.string().min(1),
  amount: z.union([z.string(), z.number()]).default("0"),
  cost: z.union([z.string(), z.number()]).optional(),
  status: z.string().max(40).default("paid"),
  name: z.string().max(300).optional(),
  order_id: z.string().max(150).optional(),
  payment_id: z.string().max(150).optional(),
  lead_id: z.string().max(150).optional(),
  campaign_id: z.string().max(150).optional(),
  channel: z.string().max(80).optional(),
  responded_at: z.string().optional(),
  text: z.string().max(5000).optional(),
  rating: z.union([z.string(), z.number()]).optional(),
  views: z.union([z.string(), z.number()]).optional(),
  document_file: z
    .string()
    .regex(/^[a-f0-9-]{36}\.(png|jpg)$/)
    .optional(),
});
export type ImportRow = z.infer<typeof rowSchema>;
export function parseRow(raw: unknown) {
  const row = rowSchema.parse(raw);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(row.date)
    ? z.iso.date().safeParse(row.date).success
    : z.iso.datetime({ offset: true }).safeParse(row.date).success;
  if (!validDate)
    throw new Error(
      "Дата должна быть корректной ISO-датой YYYY-MM-DD или ISO timestamp с часовым поясом",
    );
  const dt = /^\d{4}-\d{2}-\d{2}$/.test(row.date)
    ? `${row.date}T00:00:00+05:00`
    : row.date;
  if (!Number.isFinite(+new Date(dt))) throw new Error("Некорректная дата");
  if (+new Date(dt) > Date.now() + 864e5)
    throw new Error("Дата находится в будущем");
  if (
    row.responded_at &&
    (!Number.isFinite(+new Date(row.responded_at)) ||
      +new Date(row.responded_at) < +new Date(dt))
  )
    throw new Error("Ответ не может быть раньше обращения");
  const allowed: Record<Kind, string[]> = {
    sale: ["paid", "pending", "cancelled"],
    refund: ["paid", "pending"],
    expense: ["paid", "pending"],
    lead: ["open", "closed", "converted"],
    campaign: ["active", "completed"],
    review: ["published"],
  };
  if (!allowed[row.kind].includes(row.status))
    throw new Error(`Статус для ${row.kind}: ${allowed[row.kind].join(", ")}`);
  if (row.rating && (Number(row.rating) < 1 || Number(row.rating) > 5))
    throw new Error("Рейтинг должен быть от 1 до 5");
  return {
    ...row,
    date: new Date(dt).toISOString(),
    amountCents: cents(row.amount),
    costCents:
      row.cost === undefined || row.cost === "" ? null : cents(row.cost),
  };
}
export async function insertEvent(
  tx: Tx,
  orgId: string,
  source: string,
  raw: unknown,
  batch: string | null = null,
  trusted = false,
) {
  const row = parseRow(raw);
  const { date, amountCents, costCents, ...payload } = row;
  const fingerprint = createHash("sha256")
    .update(JSON.stringify({ source, ...row }))
    .digest("hex");
  const existing = (
    await tx.query<Event>(
      "SELECT * FROM events WHERE source=$1 AND external_id=$2 AND org_id=$3",
      [source, row.external_id, orgId],
    )
  ).rows[0];
  if (existing?.fingerprint === fingerprint)
    return { id: existing.id, skipped: true, pending: !existing.verified };
  // A stable order/payment ID is stronger evidence than an amount/time match.
  const candidates = await tx.query<Event>(
    `SELECT * FROM events WHERE org_id=$8 AND kind=$1 AND duplicate_of IS NULL AND id<>$2 AND (external_id=$3 OR (payload->>'order_id'<>'' AND payload->>'order_id'=$4) OR (payload->>'payment_id'<>'' AND payload->>'payment_id'=$5) OR (kind IN ('sale','refund','expense') AND amount=$6 AND abs(extract(epoch from occurred_at-$7::timestamptz))<3600)) LIMIT 5`,
    [
      row.kind,
      existing?.id || "",
      row.external_id,
      row.order_id || "",
      row.payment_id || "",
      amountCents,
      date,
      orgId,
    ],
  );
  const id = existing?.id || uid();
  await tx.query(
    "INSERT INTO raw_events(id,org_id,source,event_id,payload) VALUES($1,$2,$3,$4,$5)",
    [uid(), orgId, source, id, JSON.stringify(raw)],
  );
  const data = {
    ...payload,
    candidates: candidates.rows.map((e) => ({
      id: e.id,
      source: e.source,
      external_id: e.external_id,
      amount: e.amount,
    })),
    revision: existing ? Number(existing.payload.revision || 0) + 1 : 0,
  };
  const verified = trusted && candidates.rows.length === 0;
  if (existing) {
    await tx.query(
      "UPDATE events SET occurred_at=$1,amount=$2,cost=$3,status=$4,verified=$5,fingerprint=$6,payload=$7,batch_id=$8,duplicate_of=NULL WHERE id=$9",
      [
        date,
        amountCents,
        costCents,
        row.status,
        verified,
        fingerprint,
        JSON.stringify(data),
        batch,
        id,
      ],
    );
  } else
    await tx.query(
      "INSERT INTO events(id,org_id,source,external_id,kind,occurred_at,amount,cost,status,verified,fingerprint,payload,batch_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)",
      [
        id,
        orgId,
        source,
        row.external_id,
        row.kind,
        date,
        amountCents,
        costCents,
        row.status,
        verified,
        fingerprint,
        JSON.stringify(data),
        batch,
      ],
    );
  return { id, skipped: false, pending: !verified };
}
export async function resolveEvent(
  tx: Tx,
  ctx: Context,
  id: string,
  decision: "confirm" | "duplicate",
  duplicateId?: string,
) {
  const e = (await tx.query<Event>("SELECT * FROM events WHERE id=$1", [id]))
    .rows[0];
  if (!e) throw new Error("Запись не найдена");
  if (decision === "duplicate") {
    const canonical = (
      await tx.query<Event>(
        "SELECT * FROM events WHERE id=$1 AND verified=true AND duplicate_of IS NULL",
        [duplicateId],
      )
    ).rows[0];
    if (!canonical || canonical.kind !== e.kind || canonical.id === e.id)
      throw new Error("Выберите подтвержденную исходную запись того же типа");
    await tx.query(
      "UPDATE events SET duplicate_of=$1,verified=false WHERE id=$2",
      [canonical.id, id],
    );
  } else
    await tx.query(
      "UPDATE events SET verified=true,duplicate_of=NULL WHERE id=$1",
      [id],
    );
  await audit(tx, ctx, "event." + decision, id, { duplicateId });
}
