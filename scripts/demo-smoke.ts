import assert from "node:assert/strict";
import { demoPreview, type DemoIndustry } from "../src/lib/demo-preview";
const base = process.env.BAGYT_TEST_URL || "http://127.0.0.1:3000";
async function example(industry: DemoIndustry) {
  const r = await fetch(base + "/api/auth/demo", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base },
    body: JSON.stringify({
      industry,
      language: industry === "education" ? "kk" : "ru",
    }),
  });
  assert.equal(r.status, 200, await r.text());
  const cookie = r.headers.get("set-cookie")!.split(";")[0];
  const response = await fetch(base + "/api/bootstrap?days=30&lang=ru", {
    headers: { Cookie: cookie },
  });
  assert.equal(response.status, 200);
  const data = await response.json();
  const preview = demoPreview(industry);
  assert.equal(data.org.demo, true);
  assert.equal(data.org.name, preview.name);
  assert.equal(data.events.length, 97);
  assert.equal(data.analytics.coverage.verified, 96);
  assert.equal(data.analytics.revenue, preview.revenue * 100);
  assert.equal(data.analytics.expenses, preview.expenses * 100);
  assert.equal(data.analytics.priorExpenses, preview.priorExpenses * 100);
  assert.equal(data.analytics.unanswered, preview.unanswered);
  assert.equal(data.analytics.margin, preview.margin);
  assert.equal(data.plans.length, 1);
  assert.equal(data.plans[0].status, "draft");
  assert.equal(data.tasks.length, 3);
  if (industry === "education")
    assert.ok(data.tasks.some((t: any) => t.title.includes("Өтініштерді")));
  assert.ok(data.tasks.every((t: any) => t.status === "draft"));
  const ids = new Set(data.events.map((e: any) => e.id));
  assert.ok(
    data.tasks.every(
      (t: any) =>
        t.evidence.length > 0 && t.evidence.every((id: string) => ids.has(id)),
    ),
  );
  assert.equal(
    data.outcomes.length,
    0,
    "Example must not invent achieved results",
  );
  assert.equal(
    data.tasks.filter((t: any) => t.assignee !== data.user.user_id).length,
    1,
  );
  const confirm = await fetch(base + "/api/plans/approve", {
    method: "POST",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
      Origin: base,
    },
    body: JSON.stringify({ id: data.plans[0].id }),
  });
  assert.equal(confirm.status, 200, await confirm.text());
  console.log(
    "PASS",
    industry,
    "preview matches database, isolated draft and 3 evidence-backed tasks can be approved",
  );
  return data;
}
async function main() {
  const a = await example("retail");
  const b = await example("education");
  assert.notEqual(a.org.id, b.org.id);
  assert.ok(
    !b.events.some((e: any) => a.events.some((x: any) => x.id === e.id)),
  );
  console.log(
    "PASS independently created examples do not share business records",
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
