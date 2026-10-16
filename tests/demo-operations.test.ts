import test from "node:test";
import assert from "node:assert/strict";
import {
  quoteTotal,
  runDemoRules,
  inventoryCatalog,
} from "../src/lib/demo-operations";
import { initialHub, parseHub } from "../src/lib/business-hub-demo";

test("quote totals preserve unknown shipping and respect minimum order quantities", () => {
  assert.deepEqual(quoteTotal("almaty"), {
    quantity: 30,
    subtotal: 60000,
    delivery: null,
    total: null,
  });
  assert.equal(quoteTotal("steppe")?.total, 67000);
  assert.deepEqual(quoteTotal("nomad"), {
    quantity: 40,
    subtotal: 76000,
    delivery: 1500,
    total: 77500,
  });
  assert.equal(quoteTotal("nomad", 50)?.total, 96500);
  for (const value of [0, -1, 2.5, NaN, Infinity])
    assert.equal(quoteTotal("almaty", value), null);
  assert.equal(quoteTotal("unknown"), null);
});

test("inventory quantities distinguish physical stock and reservations", () => {
  assert.equal(
    inventoryCatalog.reduce((sum, item) => sum + item.onHand, 0),
    200,
  );
  assert.equal(
    inventoryCatalog.reduce(
      (sum, item) => sum + item.onHand - item.reserved,
      0,
    ),
    185,
  );
  assert.deepEqual(
    inventoryCatalog
      .filter((item) => (item.onHand - item.reserved) / item.daily < item.lead)
      .map((item) => item.sku),
    ["COF-0250"],
  );
});

test("rules create only enabled follow-ups and never duplicate tasks or send replies", () => {
  const disabled = runDemoRules(initialHub);
  assert.deepEqual(disabled.tasks, []);
  const state = { ...initialHub, rules: ["followup", "review"] };
  const first = runDemoRules(state);
  assert.deepEqual(first.tasks, [
    "follow-c2",
    "follow-c3",
    "follow-c4",
    "service",
  ]);
  assert.deepEqual(first.replies, {});
  assert.deepEqual(first.reviewReplies, {});
  assert.deepEqual(state.tasks, []);
  const second = runDemoRules(first);
  assert.deepEqual(second.tasks, first.tasks);
  assert.equal(second.ruleRuns, 2);
});

test("resolved conversations and reviews do not produce new reminders", () => {
  const state = {
    ...initialHub,
    rules: ["followup", "review"],
    replies: {
      "ig-102": "Answered",
      "wa-103": "Answered",
      "web-104": "Answered",
    },
    reviewReplies: { r1: "Answered" },
  };
  assert.deepEqual(runDemoRules(state).tasks, []);
  assert.equal(runDemoRules({ ...state, ruleRuns: 10000 }).ruleRuns, 10000);
});

test("new preferences restore safely and old saved demo versions remain compatible", () => {
  const saved = {
    ...initialHub,
    rules: ["followup", "invalid", "followup"],
    quoteRequests: ["nomad", "invented", "nomad"],
    ruleRuns: 4,
  };
  const restored = parseHub(JSON.parse(JSON.stringify(saved)));
  assert.deepEqual(restored.rules, ["followup"]);
  assert.deepEqual(restored.quoteRequests, ["nomad"]);
  assert.equal(restored.ruleRuns, 4);
  const legacy = { ...initialHub } as Partial<typeof initialHub>;
  delete legacy.rules;
  delete legacy.ruleRuns;
  delete legacy.quoteRequests;
  const old = parseHub(JSON.parse(JSON.stringify(legacy)));
  assert.deepEqual(old.rules, []);
  assert.deepEqual(old.quoteRequests, []);
  assert.equal(old.ruleRuns, 0);
});
