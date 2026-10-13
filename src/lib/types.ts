export type Kind =
  "sale" | "refund" | "expense" | "lead" | "campaign" | "review";
export type Role = "owner" | "manager" | "viewer";
export type Event = {
  id: string;
  org_id: string;
  source: string;
  external_id: string;
  kind: Kind;
  occurred_at: string;
  amount: number;
  cost: number | null;
  status: string;
  verified: boolean;
  fingerprint: string;
  duplicate_of: string | null;
  batch_id: string | null;
  payload: Record<string, any>;
  created_at: string;
};
export type Task = {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  assignee: string;
  due_at: string;
  status: string;
  metric: string;
  baseline: number;
  target: number;
  evidence: string[];
  resources: string;
  measurement: string;
  completed_at: string | null;
};
export type Insight = {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  fact: string;
  action: string;
  limitation: string;
  evidence: string[];
  metric: string;
  value: number;
  target: number;
  unit: string;
};
export type Context = {
  user_id: string;
  org_id: string;
  role: Role;
  name: string;
  email: string;
};
export const money = (cents: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(
    cents / 100,
  ) + " ₸";
export const dayKey = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-CA", { timeZone: "Asia/Qyzylorda" });
export function cents(value: unknown): number {
  const s = String(value ?? "")
    .trim()
    .replace(/[\s₸]/g, "")
    .replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(s))
    throw new Error(
      "Сумма: положительное число, максимум 2 знака после запятой",
    );
  const [a, b = ""] = s.split(".");
  const n = Number(a) * 100 + Number(b.padEnd(2, "0"));
  if (!Number.isSafeInteger(n) || n > 1e12)
    throw new Error("Сумма вне допустимого диапазона");
  return n;
}
