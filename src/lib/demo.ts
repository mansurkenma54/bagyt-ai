import { randomBytes, createHash } from "node:crypto";
import { db, uid, type Tx } from "./db";
import { hashPassword } from "./auth";
import { parseRow } from "./events";
import { analyze } from "./analytics";
import { localizeAnalytics } from "./i18n";
import { demoAmount } from "./demo-preview";
export async function createDemo(
  industry: "retail" | "education",
  language: "ru" | "kk" = "ru",
) {
  const pg = await db(),
    userId = uid(),
    orgId = uid(),
    managerId = uid(),
    viewerId = uid(),
    password = randomBytes(18).toString("hex");
  // This generator only writes to a newly-created, explicitly synthetic workspace.
  // Build the fixture in memory and send two batches instead of hundreds of network round trips.
  const events: any[] = [],
    rawEvents: any[] = [];
  async function insertEvent(
    _tx: Tx,
    org: string,
    source: string,
    raw: unknown,
    _batch: null,
    trusted: boolean,
  ) {
    const row = parseRow(raw);
    const { date, amountCents, costCents, ...payload } = row;
    const candidates = events
      .filter(
        (e) =>
          e.kind === row.kind &&
          (e.external_id === row.external_id ||
            (row.order_id && e.payload.order_id === row.order_id) ||
            (row.payment_id && e.payload.payment_id === row.payment_id) ||
            (["sale", "refund", "expense"].includes(row.kind) &&
              e.amount === amountCents &&
              Math.abs(+new Date(e.occurred_at) - +new Date(date)) < 3600000)),
      )
      .slice(0, 5);
    const id = uid();
    events.push({
      id,
      org_id: org,
      source,
      external_id: row.external_id,
      kind: row.kind,
      occurred_at: date,
      amount: amountCents,
      cost: costCents,
      status: row.status,
      verified: trusted && !candidates.length,
      fingerprint: createHash("sha256")
        .update(JSON.stringify({ source, ...row }))
        .digest("hex"),
      payload: {
        ...payload,
        revision: 0,
        candidates: candidates.map((e) => ({
          id: e.id,
          source: e.source,
          external_id: e.external_id,
          amount: e.amount,
        })),
      },
    });
    rawEvents.push({
      id: uid(),
      org_id: org,
      source,
      event_id: id,
      payload: raw,
    });
  }
  await pg.transaction(async (tx) => {
    for (const [id, name, role] of [
      [userId, "Айдана", "owner"],
      [managerId, "Данияр", "manager"],
      [viewerId, "Мадина", "viewer"],
    ]) {
      await tx.query(
        "INSERT INTO users(id,email,name,password_hash) VALUES($1,$2,$3,$4)",
        [id, `${id}@demo.bagyt.local`, name, hashPassword(password)],
      );
    }
    await tx.query(
      "INSERT INTO organizations(id,name,industry,city,employees,demo,revenue_target,webhook_secret,goal) VALUES($1,$2,$3,$4,3,true,$5,$6,$7)",
      [
        orgId,
        industry === "retail" ? "Тестовый бизнес" : "Учебный пример",
        industry,
        "Тараз",
        industry === "retail" ? 450000000 : 650000000,
        randomBytes(32).toString("hex"),
        industry === "retail"
          ? "Сохранить прибыль и не терять клиентов"
          : "Превращать заявки в оплаченные занятия",
      ],
    );
    for (const [id, role] of [
      [userId, "owner"],
      [managerId, "manager"],
      [viewerId, "viewer"],
    ])
      await tx.query(
        "INSERT INTO memberships(org_id,user_id,role) VALUES($1,$2,$3)",
        [orgId, id, role],
      );
    const demoNow = new Date();
    // Relative timestamps keep the 30-day example stable at every time of day.
    const date = (days: number, hours = 12) =>
      new Date(
        demoNow.getTime() - (days * 24 + 1 + 12 - hours) * 3600000,
      ).toISOString();
    for (let i = 0; i < 60; i++) {
      const amount = demoAmount(industry, i);
      await insertEvent(
        tx,
        orgId,
        "POS",
        {
          external_id: `POS-${i + 1000}`,
          kind: "sale",
          date: date(i),
          amount,
          cost: Math.round(amount * (i < 30 ? 0.86 : 0.71)),
          status: "paid",
          channel:
            i % 4 === 0
              ? "Сайт"
              : industry === "retail"
                ? "Магазин"
                : "Учебный центр",
          payment_id: `PAY-${i}`,
          order_id: `ORDER-${i}`,
          lead_id: i < 7 ? `LEAD-${i}` : "",
          campaign_id: i % 4 === 0 ? "TIKTOK-01" : "",
        },
        null,
        true,
      );
      if (i % 5 === 0)
        await insertEvent(
          tx,
          orgId,
          "Расходы",
          {
            external_id: `EXP-${i}`,
            kind: "expense",
            date: date(i, 8),
            amount: i < 30 ? 34000 : 23000,
            status: "paid",
            name: i % 2 ? "Аренда" : "Логистика",
          },
          null,
          true,
        );
    }
    for (let i = 0; i < 18; i++)
      await insertEvent(
        tx,
        orgId,
        "WhatsApp",
        {
          external_id: `LEAD-${i}`,
          kind: "lead",
          date: date((i % 6) + 1, 6),
          amount: 0,
          status: i < 7 ? "converted" : "open",
          responded_at: i < 10 ? date((i % 6) + 1, 7) : "",
          text:
            industry === "retail"
              ? "Синтетическое обращение о наличии"
              : "Синтетическое обращение о расписании",
          channel: "WhatsApp",
        },
        null,
        true,
      );
    await insertEvent(
      tx,
      orgId,
      "TikTok",
      {
        external_id: "TIKTOK-01",
        kind: "campaign",
        date: date(8),
        amount: 78000,
        status: "active",
        name: industry === "retail" ? "Осенняя коллекция" : "Осенний набор",
        views: 24800,
      },
      null,
      true,
    );
    for (let i = 0; i < 5; i++)
      await insertEvent(
        tx,
        orgId,
        "2GIS",
        {
          external_id: `REVIEW-${i}`,
          kind: "review",
          date: date(i + 2),
          amount: 0,
          status: "published",
          rating: i % 2 ? 3 : 4,
          text:
            i % 2
              ? "Долго ждал ответ, но качество хорошее"
              : "Хороший ассортимент и вежливое общение",
        },
        null,
        true,
      );
    await insertEvent(
      tx,
      orgId,
      "Сайт",
      {
        external_id: "WEB-1000",
        order_id: "ORDER-0",
        payment_id: "PAY-0",
        kind: "sale",
        date: date(0),
        amount: demoAmount(industry, 0),
        cost: Math.round(demoAmount(industry, 0) * 0.86),
        status: "paid",
      },
      null,
      false,
    );
    await tx.query(
      `INSERT INTO events(id,org_id,source,external_id,kind,occurred_at,amount,cost,status,verified,fingerprint,payload)
      SELECT id,org_id,source,external_id,kind,occurred_at,amount,cost,status,verified,fingerprint,payload FROM jsonb_to_recordset($1::jsonb) AS e(id text,org_id text,source text,external_id text,kind text,occurred_at timestamptz,amount bigint,cost bigint,status text,verified boolean,fingerprint text,payload jsonb)`,
      [JSON.stringify(events)],
    );
    await tx.query(
      `INSERT INTO raw_events(id,org_id,source,event_id,payload) SELECT id,org_id,source,event_id,payload FROM jsonb_to_recordset($1::jsonb) AS e(id text,org_id text,source text,event_id text,payload jsonb)`,
      [JSON.stringify(rawEvents)],
    );
    const baseline = localizeAnalytics(
      analyze(events, [], 30, demoNow),
      language,
    );
    const planId = uid();
    await tx.query(
      "INSERT INTO plans(id,org_id,title,days,baseline) VALUES($1,$2,$3,30,$4)",
      [planId, orgId, "Демо-план развития · 30 дней", JSON.stringify(baseline)],
    );
    for (const insight of baseline.insights.slice(0, 3)) {
      await tx.query(
        "INSERT INTO tasks(id,org_id,plan_id,title,description,assignee,due_at,metric,baseline,target,evidence,resources,measurement) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)",
        [
          uid(),
          orgId,
          planId,
          insight.action,
          insight.fact,
          insight.id === "unanswered" ? managerId : userId,
          new Date(demoNow.getTime() + 30 * 864e5).toISOString(),
          insight.metric,
          insight.value,
          insight.target,
          JSON.stringify(insight.evidence),
          language === "kk"
            ? "Оқу сценарийі: кәсіпкер мен менеджер"
            : "Учебный сценарий: владелец и менеджер",
          language === "kk"
            ? "Бекіткеннен кейін ұзақтығы бірдей 30 күндік кезеңдерді салыстыру. Жаңа расталған жазбалар қажет; жақсару алдын ала қол жеткізілді деп саналмайды."
            : "Сравнить равные 30-дневные периоды после утверждения. Нужны новые подтверждённые записи; улучшение не считается достигнутым заранее.",
        ],
      );
    }
  });
  return { userId, orgId };
}
