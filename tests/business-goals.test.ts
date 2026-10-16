import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultGoalTargets,
  goalMetrics,
  goalStepStatus,
  parseGoalPreferences,
  toggleGoalStep,
  validateGoalTargets,
} from "../src/lib/business-goals";
import {
  allConversations,
  initialHub,
  parseHub,
} from "../src/lib/business-hub-demo";
import { runOperationsAutomation } from "../src/lib/demo-operations";

test("monthly goals reject corrupt preferences and keep valid saved targets", () => {
  const targets = { revenue: 6_000_000, orders: 420, replyRate: 95 };
  const saved = { version: 1, month: "2026-10", targets };
  assert.deepEqual(
    parseGoalPreferences(JSON.parse(JSON.stringify(saved))),
    targets,
  );
  for (const invalid of [
    null,
    [],
    {},
    { ...saved, version: 9 },
    { ...saved, month: "2026-09" },
    { ...saved, targets: { ...targets, revenue: "6000000" } },
  ])
    assert.deepEqual(parseGoalPreferences(invalid), defaultGoalTargets);
  for (const revenue of [0, -1, 99999, 1.1, Infinity, NaN, 1_000_000_001])
    assert.equal(validateGoalTargets({ ...targets, revenue }), null);
  for (const orders of [0, -1, 0.5, 100001])
    assert.equal(validateGoalTargets({ ...targets, orders }), null);
  for (const replyRate of [0, -1, 100.1, 101])
    assert.equal(validateGoalTargets({ ...targets, replyRate }), null);
});

test("goals use the same 2.45m sales snapshot and an arithmetic remaining pace", () => {
  const metrics = goalMetrics(initialHub, defaultGoalTargets);
  assert.equal(metrics.revenue, 2_450_000);
  assert.equal(metrics.orders, 176);
  assert.equal(metrics.remainingDays, 17);
  assert.equal(metrics.revenueGap, 1_550_000);
  assert.equal(metrics.revenueDaily, 91177);
  assert.equal(metrics.orderGap, 174);
  assert.equal(metrics.orderDaily, 11);
  assert.equal(metrics.revenuePercent, 61);
  const reached = goalMetrics(initialHub, {
    revenue: 2_000_000,
    orders: 100,
    replyRate: 100,
  });
  assert.equal(reached.revenueGap, 0);
  assert.equal(reached.revenueDaily, 0);
  assert.equal(reached.orderDaily, 0);
  assert.equal(reached.revenuePercent, 100);
});

test("goal completion persists without inventing revenue or paid orders", () => {
  const completed = toggleGoalStep(initialHub, "restock-coffee");
  assert.ok(completed.tasks.includes("restock-coffee"));
  assert.ok(completed.completed.includes("restock-coffee"));
  assert.equal(goalStepStatus(completed, 10)["restock-coffee"], true);
  assert.deepEqual(
    parseHub(JSON.parse(JSON.stringify(completed))).completed,
    completed.completed,
  );
  assert.equal(
    goalMetrics(completed, defaultGoalTargets).revenue,
    goalMetrics(initialHub, defaultGoalTargets).revenue,
  );
  assert.equal(
    goalMetrics(completed, defaultGoalTargets).orders,
    goalMetrics(initialHub, defaultGoalTargets).orders,
  );
  assert.deepEqual(toggleGoalStep(completed, "restock-coffee").completed, []);
  assert.equal(toggleGoalStep(initialHub, "invented-task"), initialHub);
  assert.equal(goalStepStatus(initialHub, 19)["restock-coffee"], false);
  assert.equal(goalStepStatus(initialHub, 20)["restock-coffee"], true);
});

test("local workflow creates reply history, one order draft and one purchasing request", () => {
  const enabled = {
    ...initialHub,
    autoReplyEnabled: true,
    rules: ["orders", "stock"],
  };
  const first = runOperationsAutomation(enabled, "kk", 10);
  assert.equal(
    Object.keys(first.state.replies).length,
    allConversations(enabled).length,
  );
  assert.equal(first.state.sentMessages["wa-101"].length, 1);
  assert.equal(first.state.sentMessages["wa-101"][0].kind, "auto");
  assert.equal(first.state.threadOrders.length, 1);
  assert.equal(first.state.threadOrders[0].quantity, 2);
  assert.equal(first.state.threadOrders[0].unitPrice, 3200);
  assert.equal(first.state.threadOrders[0].status, "draft");
  assert.deepEqual(first.state.quoteRequests, ["almaty"]);
  assert.ok(first.state.tasks.includes("restock-coffee"));
  assert.equal(goalMetrics(first.state, defaultGoalTargets).repliesNeeded, 0);
  assert.equal(goalMetrics(first.state, defaultGoalTargets).replyRate, 100);
  assert.equal(
    goalMetrics(first.state, defaultGoalTargets).orders,
    176,
    "an unpaid draft must not count as a paid order",
  );
  const second = runOperationsAutomation(first.state, "kk", 10);
  assert.equal(second.state.threadOrders.length, 1);
  assert.equal(second.state.sentMessages["wa-101"].length, 1);
  assert.deepEqual(second.state.quoteRequests, ["almaty"]);
  assert.ok(second.events.every((event) => event.status === "skipped"));
});

test("local workflow preserves edited drafts, disabled actions and sufficient stock", () => {
  const edited = {
    ...initialHub,
    autoReplyEnabled: true,
    rules: ["orders", "stock"],
    drafts: { "wa-101": "My edited answer" },
  };
  const result = runOperationsAutomation(edited, "ru", 30);
  assert.equal(result.state.drafts["wa-101"], "My edited answer");
  assert.equal(result.state.replies["wa-101"], undefined);
  assert.deepEqual(result.state.threadOrders, []);
  assert.deepEqual(result.state.quoteRequests, []);
  const disabled = runOperationsAutomation(initialHub, "ru", 10);
  assert.deepEqual(disabled.state.replies, {});
  assert.deepEqual(disabled.state.threadOrders, []);
  assert.deepEqual(disabled.state.quoteRequests, []);
  assert.deepEqual(
    runOperationsAutomation({ ...initialHub, rules: ["stock"] }, "kk", NaN)
      .state.quoteRequests,
    [],
  );
  assert.deepEqual(initialHub.tasks, []);
});

test("follow-up rules run after auto replies and do not reopen answered work", () => {
  const result = runOperationsAutomation(
    { ...initialHub, autoReplyEnabled: true, rules: ["followup", "stock"] },
    "kk",
    10,
  );
  assert.deepEqual(result.state.tasks, ["restock-coffee"]);
  assert.equal(result.state.ruleRuns, 1);
  assert.equal(
    result.events.some((event) => event.id === "tasks"),
    false,
  );
});
