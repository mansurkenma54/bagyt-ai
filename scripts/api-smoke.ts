import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHmac, randomUUID } from "node:crypto";
const base = process.env.BAGYT_TEST_URL || "http://127.0.0.1:3000";
let passed = 0;
function check(value: unknown, message: string) {
  assert.ok(value, message);
  passed++;
  console.log("PASS", message);
}
function client() {
  let cookie = "";
  return async (path: string, body?: unknown, expected = 200) => {
    const r = await fetch(base + "/api/" + path, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        Origin: base,
      },
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    });
    const set = r.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    const result = await r.json();
    assert.equal(r.status, expected, path + ": " + JSON.stringify(result));
    return result;
  };
}
async function main() {
  const anon = client();
  await anon("bootstrap", undefined, 401);
  check(true, "unauthenticated access denied");
  const c = client();
  const email = `smoke-${randomUUID()}@bagyt.test`,
    password = "Smoke-test-" + randomUUID();
  await c("auth/register", {
    email,
    password,
    name: "Test Owner",
    organization: "QA isolated company",
    industry: "retail",
    city: "Тараз",
    employees: 3,
    branches: 1,
    goal: "Test",
    channels: ["POS"],
  });
  let d = await c("bootstrap");
  check(
    d.events.length === 0 && d.user.role === "owner",
    "registration creates isolated empty organization",
  );
  await c(
    "connections",
    { provider: "WhatsApp", identifier: "+7 700 000 00 00", consent: false },
    400,
  );
  check(true, "connection requires explicit consent");
  await c(
    "connections",
    { provider: "Instagram", identifier: "https://example.com", consent: true },
    400,
  );
  check(true, "connection validates the provider domain");
  for (const [provider, identifier] of [
    ["WhatsApp", "+7 700 000 00 00"],
    ["POS", "+7 701 000 00 00"],
    ["TikTok", "https://www.tiktok.com/@bagyt-demo"],
    ["Instagram", "https://instagram.com/bagyt.demo"],
    ["2GIS", "https://2gis.kz/almaty/firm/123"],
    ["Сайт", "https://example.com"],
  ]) {
    await c("connections", { provider, identifier, consent: true });
  }
  d = await c("bootstrap");
  check(
    d.sources.filter((s: any) => s.connection?.mode === "Demo").length === 6 &&
      d.events.length === 0,
    "all six demo connections persist without fabricating financial events",
  );
  await c("connections/disconnect", { provider: "WhatsApp" });
  check(
    !(await c("bootstrap")).sources.find((s: any) => s.name === "WhatsApp")
      .connection,
    "demo permission can be revoked",
  );
  for (const name of ["pos-sales.csv", "pos-sales.xlsx"]) {
    const file = new FormData();
    file.set("file", new File([await readFile("fixtures/" + name)], name));
    const preview = await c("upload", file);
    check(preview.rows.length === 3, name + " parsed from real file");
  }
  const row = {
    external_id: "QA-SALE-1",
    kind: "sale",
    date: new Date(Date.now() - 3600000).toISOString(),
    amount: "10000.29",
    cost: "9000",
    status: "paid",
    order_id: "QA-ORDER-1",
    payment_id: "QA-PAY-1",
  };
  const imported = await c("imports", {
    source: "POS",
    filename: "qa.csv",
    rows: [row],
  });
  check(imported.imported === 1, "file rows persisted");
  d = await c("bootstrap");
  check(
    d.analytics.revenue === 0 && d.analytics.coverage.pending === 1,
    "unconfirmed import excluded from metrics",
  );
  const sale = d.events[0];
  await c("verify", { id: sale.id, decision: "confirm" });
  d = await c("bootstrap");
  check(
    d.analytics.revenue === 1000029,
    "confirmed revenue calculated in exact minor units",
  );
  const repeat = await c("imports", {
    source: "POS",
    filename: "qa.csv",
    rows: [row],
  });
  check(repeat.skipped === 1, "repeat import skipped");
  await c("imports", {
    source: "Сайт",
    filename: "duplicate.csv",
    rows: [{ ...row, external_id: "QA-WEB-1" }],
  });
  d = await c("bootstrap");
  const dupe = d.events.find((e: any) => e.external_id === "QA-WEB-1");
  check(
    dupe.payload.candidates.some((x: any) => x.id === sale.id),
    "cross-source payment ID duplicate detected",
  );
  await c("verify", {
    id: dupe.id,
    decision: "duplicate",
    duplicateId: sale.id,
  });
  d = await c("bootstrap");
  check(
    d.analytics.revenue === 1000029,
    "duplicate resolution does not double revenue",
  );
  await c(
    "imports",
    {
      source: "POS",
      filename: "invalid.csv",
      rows: [{ ...row, amount: "bad" }],
    },
    422,
  );
  check(true, "invalid import rejected atomically");
  const other = client();
  await other("auth/register", {
    email: `other-${randomUUID()}@bagyt.test`,
    password,
    name: "Other",
    organization: "Other QA company",
    industry: "education",
    city: "Тараз",
    employees: 1,
    branches: 1,
    goal: "Test",
    channels: [],
  });
  check(
    (await other("bootstrap")).events.length === 0,
    "other company cannot read records",
  );
  await other("verify", { id: sale.id, decision: "confirm" }, 400);
  check(true, "cross-company mutation blocked");
  const settings = await c("webhook/settings");
  const event = {
    event_id: randomUUID(),
    order: {
      ...row,
      external_id: "QA-WEBHOOK-NEW",
      order_id: "NEW-ORDER",
      payment_id: "NEW-PAY",
      amount: "234.56",
    },
  };
  const body = JSON.stringify(event),
    timestamp = String(Math.floor(Date.now() / 1000));
  const signed = (signature: string) =>
    fetch(base + "/api/webhook?org=" + d.org.id, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bagyt-timestamp": timestamp,
        "x-bagyt-signature": signature,
      },
      body,
    });
  const bad = await signed("0".repeat(64));
  check(bad.status === 401, "bad webhook signature rejected");
  const signature = createHmac("sha256", settings.secret)
    .update(timestamp + "." + body)
    .digest("hex");
  const good = await signed(signature);
  check(good.status === 200, "real signed webhook accepted");
  const replay = await signed(signature);
  check((await replay.json()).duplicate === true, "webhook replay idempotent");
  check(
    (await c("bootstrap")).analytics.revenue === 1023485,
    "new confirmed webhook recalculates revenue",
  );
  await c("manual", {
    row: {
      external_id: "QA-MANUAL",
      kind: "expense",
      date: new Date().toISOString(),
      amount: "50",
      status: "paid",
    },
  });
  d = await c("bootstrap");
  check(
    d.events.some((e: any) => e.external_id === "QA-MANUAL" && !e.verified),
    "manual event waits for confirmation",
  );
  const p = await c("plans", { days: 7 });
  d = await c("bootstrap");
  const task = d.tasks.find((t: any) => t.plan_id === p.id);
  check(task?.status === "draft", "risk produces editable draft task");
  await c("tasks/status", { id: task.id, status: "completed" }, 409);
  check(true, "cannot complete a draft task");
  await c("plans/approve", { id: p.id });
  await c("tasks/status", { id: task.id, status: "in_progress" });
  await c("tasks/status", { id: task.id, status: "completed" });
  const outcome = await c("results/check", { id: task.id });
  check(
    outcome.verdict === "insufficient_data" && outcome.actual === null,
    "completion does not invent measured success",
  );
  const managerEmail = `manager-${randomUUID()}@bagyt.test`;
  await c("members", {
    email: managerEmail,
    name: "QA Manager",
    password,
    role: "manager",
  });
  const p2 = await c("plans", { days: 7 });
  d = await c("bootstrap");
  const managed = d.tasks.find((t: any) => t.plan_id === p2.id),
    managerId = d.members.find((m: any) => m.email === managerEmail).id;
  await c("tasks/edit", {
    id: managed.id,
    title: "Manager assigned verification",
    assignee: managerId,
    due_at: new Date(Date.now() + 7 * 864e5).toISOString(),
    target: managed.target,
    resources: "QA test",
  });
  await c("plans/approve", { id: p2.id });
  const manager = client();
  await manager("auth/login", { email: managerEmail, password });
  check(
    (await manager("bootstrap")).tasks.every(
      (t: any) => t.assignee === managerId,
    ),
    "manager sees only assigned tasks",
  );
  await manager("tasks/status", { id: task.id, status: "in_progress" }, 403);
  await manager("tasks/status", { id: managed.id, status: "in_progress" });
  await manager("tasks/status", { id: managed.id, status: "completed" });
  check(true, "manager completes own task; foreign assignment blocked");
  const viewerEmail = `viewer-${randomUUID()}@bagyt.test`;
  await c("members", {
    email: viewerEmail,
    name: "QA Viewer",
    password,
    role: "viewer",
  });
  const viewer = client();
  await viewer("auth/login", { email: viewerEmail, password });
  await viewer("manual", { row }, 403);
  await viewer("webhook/settings", undefined, 403);
  check(true, "viewer cannot mutate data or obtain webhook secret");
  const csrf = await fetch(base + "/api/manual", {
    method: "POST",
    headers: {
      Origin: "https://attacker.invalid",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  check(csrf.status === 403, "cross-origin mutation rejected");
  await c("aqyl", { question: "What is revenue?", language: "ru" }, 503);
  check(true, "missing LLM key reported honestly");
  if (process.env.BAGYT_TEST_OCR === "true") {
    const fd = new FormData();
    fd.set(
      "file",
      new File(
        [await readFile("fixtures/demo-receipt.png")],
        "demo-receipt.png",
        { type: "image/png" },
      ),
    );
    const result = await c("ocr", fd);
    check(
      result.text.includes("12500") && result.amount === "12500.00",
      "real receipt OCR recognizes total",
    );
    await c("manual", {
      row: {
        external_id: "OCR-" + randomUUID(),
        kind: "expense",
        date: new Date().toISOString(),
        amount: result.amount,
        status: "paid",
        document_file: result.attachment.split("/").pop(),
        text: result.text,
      },
    });
    const saved = (await c("bootstrap")).events.find(
      (e: any) => e.payload.document_file,
    );
    check(
      !!saved && !saved.verified,
      "OCR source attachment retained pending confirmation",
    );
  }
  await c("auth/logout", {});
  await c("bootstrap", undefined, 401);
  await c("auth/login", { email, password });
  check(
    (await c("bootstrap")).events.length >= 4,
    "login restores persisted records",
  );
  const demo = client();
  await demo("auth/demo", { industry: "education" });
  const ed = await demo("bootstrap");
  check(
    ed.org.industry === "education" &&
      ed.org.demo &&
      ed.analytics.insights.length >= 3,
    "education demo has three real detectors",
  );
  check(
    (await other("bootstrap")).events.length === 0,
    "creating demo cannot alter another tenant",
  );
  console.log(`API smoke: ${passed} checks passed.`);
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
