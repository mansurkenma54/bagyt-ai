import test from "node:test";
import assert from "node:assert/strict";
import {
  advancePurchase,
  initialPurchase,
  parsePurchase,
  demoDailySales,
} from "../src/lib/belgi-demo";

test("demo purchase requires a draft and approval before receipt", () => {
  assert.deepEqual(
    advancePurchase(initialPurchase, "receive"),
    initialPurchase,
  );
  assert.deepEqual(
    advancePurchase(initialPurchase, "approve"),
    initialPurchase,
  );
  const draft = advancePurchase(initialPurchase, "prepare");
  assert.equal(draft.stage, "draft");
  assert.deepEqual(advancePurchase(draft, "receive"), draft);
  assert.equal(advancePurchase(draft, "approve").stage, "approved");
});
test("partial receipt counts actual units once and rejects invalid quantities", () => {
  const approved = advancePurchase(
    advancePurchase(initialPurchase, "prepare"),
    "approve",
  );
  for (const invalid of [0, -1, 31, 2.5, NaN])
    assert.deepEqual(advancePurchase(approved, "receive", invalid), approved);
  const received = advancePurchase(approved, "receive", 25);
  assert.equal(received.received, 25);
  assert.equal(12 + received.received, 37);
  assert.equal(12 + received.received - 2, 35);
  assert.deepEqual(advancePurchase(received, "receive", 25), received);
});
test("persisted demo state validates data and restores valid progress", () => {
  for (const invalid of [
    null,
    {},
    { stage: "approved", received: 25 },
    { stage: "received", received: -1 },
    { stage: "received", received: 31 },
  ])
    assert.deepEqual(parsePurchase(invalid), initialPurchase);
  assert.deepEqual(parsePurchase({ stage: "received", received: 25 }), {
    stage: "received",
    received: 25,
  });
});
test("demo headline matches the chart source", () => {
  assert.equal(
    demoDailySales.reduce((a, b) => a + b, 0),
    2450000,
  );
  assert.equal(demoDailySales.slice(-7).length, 7);
});
