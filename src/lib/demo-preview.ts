export type DemoIndustry = "retail" | "education";
export const demoAmount = (industry: DemoIndustry, day: number) =>
  industry === "retail"
    ? 45000 + ((day * 7171) % 55000)
    : 65000 + ((day * 3111) % 85000);
export function demoPreview(industry: DemoIndustry) {
  const sales = Array.from({ length: 30 }, (_, day) =>
    demoAmount(industry, day),
  );
  return {
    name: industry === "retail" ? "Dala Store" : "Bilim Academy",
    revenue: sales.reduce((a, b) => a + b, 0),
    expenses: 204000,
    priorExpenses: 138000,
    leads: 18,
    unanswered: 8,
    records: 97,
    verified: 96,
    sales,
    margin: 14,
  };
}
