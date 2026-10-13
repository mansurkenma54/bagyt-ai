import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { analyze } from "../src/lib/analytics";
import { cents, Event } from "../src/lib/types";
import { insertEvent, parseRow, resolveEvent } from "../src/lib/events";
import type { Tx } from "../src/lib/db";
const now = new Date("2026-10-13T12:00:00Z");
const event = (overrides: Partial<Event> = {}): Event => ({
  id: crypto.randomUUID(),
  org_id: "org-a",
  source: "POS",
  external_id: crypto.randomUUID(),
  kind: "sale",
  occurred_at: "2026-10-12T12:00:00Z",
  amount: 10000,
  cost: 8000,
  status: "paid",
  verified: true,
  fingerprint: "x",
  duplicate_of: null,
  batch_id: null,
  payload: {},
  created_at: "2026-10-12T12:00:00Z",
  ...overrides,
});
test("exact minor-unit parsing rejects invalid money", () => {
  assert.equal(cents("1 234,56"), 123456);
  assert.equal(cents("0.29"), 29);
  assert.throws(() => cents("-4"));
  assert.throws(() => cents("1.001"));
  assert.throws(() => cents("Infinity"));
});
test("only verified, paid, canonical sales and refunds affect revenue", () => {
  const a = analyze(
    [
      event(),
      event({ status: "pending" }),
      event({ verified: false }),
      event({ duplicate_of: "original" }),
      event({ kind: "lead", amount: 999999, status: "open" }),
      event({ kind: "refund", amount: 1000, cost: 800 }),
    ],
    [],
    30,
    now,
  );
  assert.equal(a.revenue, 9000);
  assert.equal(a.gross, 1800);
  assert.equal(a.orders, 1);
});
test("unknown costs never fabricate profit", () => {
  const a = analyze([event({ cost: null })], [], 30, now);
  assert.equal(a.gross, null);
  assert.equal(a.net, null);
  assert.equal(a.margin, null);
});
test("three independent risk detectors expose source evidence", () => {
  const es = [
    event({ amount: 100000, cost: 95000 }),
    event({ kind: "lead", status: "open", amount: 0, cost: null }),
    event({ kind: "expense", amount: 20000, cost: null }),
    event({
      kind: "expense",
      amount: 10000,
      cost: null,
      occurred_at: "2026-09-05T12:00:00Z",
    }),
  ];
  const a = analyze(es, [], 30, now);
  assert.deepEqual(
    a.insights.map((i) => i.id),
    ["unanswered", "expenses", "margin"],
  );
  assert.ok(a.insights.every((i) => i.evidence.length > 0));
});
test("views and unlinked leads cannot produce paid orders", () => {
  const a = analyze(
    [
      event({ kind: "campaign", status: "active", payload: { views: 99999 } }),
      event({ kind: "lead", status: "converted" }),
    ],
    [],
    30,
    now,
  );
  assert.equal(a.revenue, 0);
  assert.equal(a.conversion, 0);
});
test("invalid types, dates, money and backwards response times fail validation", () => {
  assert.throws(() =>
    parseRow({
      external_id: "x",
      kind: "sale",
      date: "yesterday",
      amount: 1,
      status: "paid",
    }),
  );
  assert.throws(() =>
    parseRow({
      external_id: "x",
      kind: "lead",
      date: "2026-01-02T12:00:00Z",
      responded_at: "2026-01-01T12:00:00Z",
      status: "open",
    }),
  );
  assert.throws(() =>
    parseRow({
      external_id: "x",
      kind: "lead",
      date: "2026-01-01",
      status: "paid",
    }),
  );
});
test("PostgreSQL RLS, cross-company imports, repeat imports, and duplicate resolution", async () => {
  const pg = new PGlite();
  await pg.exec(await readFile("migrations/001_initial.sql", "utf8"));
  try {
    for (const id of ["a", "b"])
      await pg.query(
        "INSERT INTO organizations(id,name,industry,city,webhook_secret) VALUES($1,$1,'retail','Тараз','test')",
        [id],
      );
    const scope = async <T>(org: string, fn: (tx: Tx) => Promise<T>) =>
      pg.transaction(async (tx) => {
        await tx.query("SELECT set_config('bagyt.org_id',$1,true)", [org]);
        await tx.exec("SET LOCAL ROLE bagyt_tenant");
        return fn(tx);
      });
    const row = {
      external_id: "SAME-ID",
      kind: "sale",
      date: "2026-01-01T12:00:00Z",
      amount: "100",
      cost: "80",
      status: "paid",
      payment_id: "PAY-1",
    };
    const first = await scope("a", (tx) => insertEvent(tx, "a", "POS", row));
    assert.equal(first.pending, true);
    const repeat = await scope("a", (tx) => insertEvent(tx, "a", "POS", row));
    assert.equal(repeat.skipped, true);
    const other = await scope("b", (tx) => insertEvent(tx, "b", "POS", row));
    assert.notEqual(other.id, first.id);
    await scope("a", async (tx) => {
      assert.equal((await tx.query("SELECT * FROM events")).rows.length, 1);
      assert.equal(
        (await tx.query("SELECT * FROM events WHERE id=$1", [other.id])).rows
          .length,
        0,
      );
      await resolveEvent(
        tx,
        {
          org_id: "a",
          user_id: "tester",
          role: "owner",
          name: "Test",
          email: "",
        },
        first.id,
        "confirm",
      );
    });
    await assert.rejects(
      scope("a", (tx) =>
        tx.query("UPDATE events SET org_id='b' WHERE id=$1", [first.id]),
      ),
      /row-level security/,
    );
    const duplicate = await scope("a", (tx) =>
      insertEvent(tx, "a", "Website", { ...row, external_id: "WEB-DUP" }),
    );
    await scope("a", async (tx) => {
      const pending = (
        await tx.query<Event>("SELECT * FROM events WHERE id=$1", [
          duplicate.id,
        ])
      ).rows[0];
      assert.equal(pending.payload.candidates[0].id, first.id);
      await resolveEvent(
        tx,
        {
          org_id: "a",
          user_id: "tester",
          role: "owner",
          name: "Test",
          email: "",
        },
        duplicate.id,
        "duplicate",
        first.id,
      );
      const es = (await tx.query<Event>("SELECT * FROM events")).rows;
      const a = analyze(es, [], 365, new Date("2026-02-01"));
      assert.equal(a.revenue, 10000);
    });
  } finally {
    await pg.close();
  }
});
