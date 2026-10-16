import { demoDailySales } from "./belgi-demo";
import {
  addDemoTask,
  allConversations,
  unanswered,
  type HubState,
} from "./business-hub-demo";

export type GoalTargets = {
  revenue: number;
  orders: number;
  replyRate: number;
};
export const GOAL_STORAGE_KEY = "bagyt-business-goals-v1";
export const defaultGoalTargets: GoalTargets = {
  revenue: 4_000_000,
  orders: 350,
  replyRate: 100,
};
// Synthetic paid-order counts for the same 1–14 October snapshot as demoDailySales.
export const demoDailyOrderCounts = [
  8, 10, 9, 12, 11, 14, 10, 13, 12, 16, 14, 17, 14, 16,
];
export const goalPeriod = {
  month: "2026-10",
  elapsedDays: 14,
  daysInMonth: 31,
} as const;

export function validateGoalTargets(value: unknown): GoalTargets | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  const within = (n: unknown, min: number, max: number) =>
    typeof n === "number" && Number.isSafeInteger(n) && n >= min && n <= max;
  if (
    !within(v.revenue, 100_000, 1_000_000_000) ||
    !within(v.orders, 1, 100_000) ||
    !within(v.replyRate, 1, 100)
  )
    return null;
  return {
    revenue: v.revenue as number,
    orders: v.orders as number,
    replyRate: v.replyRate as number,
  };
}

export function parseGoalPreferences(value: unknown): GoalTargets {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { ...defaultGoalTargets };
  const record = value as Record<string, unknown>;
  return record.version === 1 && record.month === goalPeriod.month
    ? validateGoalTargets(record.targets) || { ...defaultGoalTargets }
    : { ...defaultGoalTargets };
}

export function goalMetrics(hub: HubState, targets: GoalTargets) {
  const revenue = demoDailySales.reduce((sum, value) => sum + value, 0);
  const orders = demoDailyOrderCounts.reduce((sum, value) => sum + value, 0);
  const threads = allConversations(hub);
  const answered = threads.filter((thread) =>
    Boolean(hub.replies[thread.id]?.trim()),
  ).length;
  const rawReplyRate = threads.length ? (answered / threads.length) * 100 : 0;
  const replyRate = Number(rawReplyRate.toFixed(1));
  const remainingDays = goalPeriod.daysInMonth - goalPeriod.elapsedDays;
  const revenueGap = Math.max(0, targets.revenue - revenue);
  const orderGap = Math.max(0, targets.orders - orders);
  const repliesNeeded = Math.max(
    0,
    Math.ceil((threads.length * targets.replyRate) / 100) - answered,
  );
  return {
    revenue,
    orders,
    answered,
    threads: threads.length,
    replyRate,
    remainingDays,
    revenueGap,
    orderGap,
    repliesNeeded,
    revenueDaily: Math.ceil(revenueGap / remainingDays),
    orderDaily: Math.ceil(orderGap / remainingDays),
    revenuePercent: Math.min(
      100,
      Math.floor((revenue / targets.revenue) * 100),
    ),
    orderPercent: Math.min(100, Math.floor((orders / targets.orders) * 100)),
    replyPercent: Math.min(
      100,
      Math.floor((rawReplyRate / targets.replyRate) * 100),
    ),
  };
}

export const goalStepIds = [
  "retention",
  "restock-coffee",
  "assortment",
] as const;
export type GoalStepId = (typeof goalStepIds)[number];

export function goalStepStatus(hub: HubState, available: number) {
  return {
    retention:
      unanswered(hub).length === 0 || hub.completed.includes("retention"),
    "restock-coffee":
      available >= 20 || hub.completed.includes("restock-coffee"),
    assortment: hub.completed.includes("assortment"),
  };
}

export function toggleGoalStep(hub: HubState, id: string): HubState {
  if (!goalStepIds.includes(id as GoalStepId)) return hub;
  const next = addDemoTask(hub, id);
  if (!next.tasks.includes(id)) return hub;
  return {
    ...next,
    completed: next.completed.includes(id)
      ? next.completed.filter((item) => item !== id)
      : [...next.completed, id],
  };
}
