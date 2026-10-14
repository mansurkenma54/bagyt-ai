import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  dailyCandidates,
  dailyFingerprint,
  selectDailySteps,
  composeDailyPlan,
} from "../src/lib/daily-plan";
import { businessContext } from "../src/lib/gemini";
import type { Event } from "../src/lib/types";
const now = new Date("2026-10-14T10:00:00Z");
const event = (patch: Partial<Event> = {}): Event => ({
  id: "sale",
  org_id: "a",
  source: "POS",
  external_id: "s1",
  kind: "sale",
  occurred_at: "2026-10-13T12:00:00Z",
  amount: 1250000,
  cost: 500000,
  status: "paid",
  verified: true,
  fingerprint: "x",
  duplicate_of: null,
  batch_id: null,
  payload: {},
  created_at: now.toISOString(),
  ...patch,
});
const context = (events: Event[], role = "owner") =>
  businessContext(
    { name: "QA", goal: "Развитие", demo: true },
    events,
    [],
    30,
    role,
    now,
  );

test("Empty data gives field-by-field onboarding; viewer cannot get edit actions", () => {
  const steps = dailyCandidates(context([]), [], "ru");
  assert.deepEqual(
    steps[0].guides.map((g) => g.action),
    [
      "manual_kind",
      "manual_date",
      "manual_amount",
      "manual_cost",
      "manual_name",
      "records",
    ],
  );
  const viewer = dailyCandidates(context([], "viewer"), [], "kk");
  assert.ok(
    viewer.every((s) =>
      s.guides.every((g) => g.action === null || g.action === "records"),
    ),
  );
  assert.equal(viewer[0].id, steps[0].id);
});
test("Plans distinguish pending records and use only verified nonduplicate financial facts", async () => {
  const events = [
    event(),
    event({ id: "pending", verified: false, amount: 999999999 }),
    event({ id: "dup", duplicate_of: "sale" }),
  ];
  const c = context(events),
    steps = dailyCandidates(c, events, "ru");
  assert.match(steps[0].id, /^verify-/);
  assert.deepEqual(steps[0].evidence, ["pending"]);
  assert.equal(c.metrics.revenue, 1250000);
  assert.ok(
    steps.find((s) => s.id.startsWith("review-"))?.reason.includes("12 500") ||
      steps.find((s) => s.id.startsWith("review-"))?.reason.includes("12 500"),
  );
});
test("Daily cache changes with date, data, role, period; cost completion does not carry to a different record", () => {
  const e = [event({ cost: null })];
  const fingerprint = (items: Event[], at = now, role = "owner", days = 30) =>
    dailyFingerprint({ name: "QA" }, items, [], days, role, at);
  assert.equal(
    fingerprint(e),
    fingerprint(e, new Date("2026-10-14T13:00:00Z")),
  );
  assert.notEqual(
    fingerprint(e),
    fingerprint(e, new Date("2026-10-15T10:00:00Z")),
  );
  assert.notEqual(fingerprint(e), fingerprint(e, now, "viewer"));
  assert.notEqual(fingerprint(e), fingerprint(e, now, "owner", 7));
  assert.notEqual(fingerprint(e), fingerprint([event({ amount: 1 })]));
  const id = (events: Event[], language: "ru" | "kk" = "ru") =>
    dailyCandidates(context(events), events, language).find((s) =>
      s.id.startsWith("cost-"),
    )!.id;
  assert.equal(id(e), id(e, "kk"));
  assert.notEqual(id(e), id([event({ id: "different", cost: null })]));
});
test("AI ranking accepts only known unique steps and always puts verification first", () => {
  const e = [event(), event({ id: "pending", verified: false })],
    s = dailyCandidates(context(e), e, "ru");
  const rank = (ids: string[]) =>
    selectDailySteps(JSON.stringify({ summary: "Focus", stepIds: ids }), s);
  assert.throws(() => rank(["invented"]));
  assert.throws(() => rank([s[0].id, s[0].id]));
  assert.equal(rank(s.map((x) => x.id).reverse()).steps[0].id, s[0].id);
  assert.equal(rank([s[1].id]).steps[0].id, s[0].id);
});
test("Google ranking is used when valid; provider failure is explicitly labelled as rules", async (t) => {
  const previous = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  try {
    const c = context([event()]),
      id = dailyCandidates(c, [event()], "ru")[0].id;
    t.mock.method(
      globalThis,
      "fetch",
      async () =>
        new Response(
          JSON.stringify({
            candidates: [
              {
                finishReason: "STOP",
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        answer: JSON.stringify({
                          summary: "Сначала проверьте факт.",
                          stepIds: [id],
                        }),
                        action: null,
                        evidence: [],
                      }),
                    },
                  ],
                },
              },
            ],
          }),
        ),
    );
    const p = await composeDailyPlan(c, [event()], "ru");
    assert.equal(p.mode, "Gemini");
    assert.equal(p.facts.revenue, 1250000);
    assert.equal(p.demo, true);
    t.mock.method(
      globalThis,
      "fetch",
      async () => new Response("SECRET", { status: 429 }),
    );
    const fallback = await composeDailyPlan(c, [event()], "kk");
    assert.equal(fallback.mode, "rules");
    assert.ok(fallback.warning);
    assert.doesNotMatch(JSON.stringify(fallback), /SECRET/);
  } finally {
    if (previous === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previous;
  }
});
test("Daily plans and completion are protected by tenant RLS", async () => {
  const pg = new PGlite();
  try {
    await pg.exec(await readFile("migrations/001_initial.sql", "utf8"));
    await pg.exec(await readFile("migrations/003_daily_plans.sql", "utf8"));
    await pg.exec(
      "INSERT INTO users(id,email,name,password_hash) VALUES('u','qa@example.test','QA','x'); INSERT INTO organizations(id,name,industry,city,webhook_secret) VALUES('a','A','Retail','City','x'),('b','B','Retail','City','x'); INSERT INTO aqyl_daily_plans(id,org_id,user_id,day,days,language,fingerprint,plan) VALUES('p','a','u','2026-10-14',30,'ru','f','{}'); INSERT INTO aqyl_daily_progress(org_id,user_id,day,days,step_id,done) VALUES('a','u','2026-10-14',30,'step',true)",
    );
    const scope = async (org: string, fn: (tx: any) => Promise<any>) =>
      pg.transaction(async (tx) => {
        await tx.query("SELECT set_config('bagyt.org_id',$1,true)", [org]);
        await tx.exec("SET LOCAL ROLE bagyt_tenant");
        return fn(tx);
      });
    for (const table of ["aqyl_daily_plans", "aqyl_daily_progress"]) {
      assert.equal(
        (await scope("a", (tx) => tx.query(`SELECT * FROM ${table}`))).rows
          .length,
        1,
      );
      assert.equal(
        (await scope("b", (tx) => tx.query(`SELECT * FROM ${table}`))).rows
          .length,
        0,
      );
      assert.equal(
        (
          await scope("b", (tx) =>
            tx.query(`UPDATE ${table} SET day='2026-10-15' RETURNING *`),
          )
        ).rows.length,
        0,
      );
    }
    await assert.rejects(
      scope("b", (tx) =>
        tx.query(
          "INSERT INTO aqyl_daily_progress(org_id,user_id,day,days,step_id) VALUES('a','u','2026-10-15',30,'bad')",
        ),
      ),
      /row-level security/,
    );
  } finally {
    await pg.close();
  }
});
