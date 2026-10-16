export type AgentId = "belgi" | "sana" | "qor";
export type AgentPlan = "free" | "pro";
export const agentTeam = [
  {
    id: "belgi" as const,
    name: "Belgi",
    role: { kk: "Бизнес бағыты", ru: "Бизнес и решения" },
    greeting: {
      kk: "Бүгін қай істен бастаймыз?",
      ru: "С чего начнём сегодня?",
    },
  },
  {
    id: "sana" as const,
    name: "Sana",
    role: { kk: "Клиенттер мен чаттар", ru: "Клиенты и сообщения" },
    greeting: {
      kk: "Әр клиент назарда болсын.",
      ru: "Каждый клиент — под вниманием.",
    },
  },
  {
    id: "qor" as const,
    name: "Qor",
    role: { kk: "Қойма мен сатып алу", ru: "Запасы и закупки" },
    greeting: { kk: "Қорды бірге тексерейік.", ru: "Давайте проверим запасы." },
  },
] as const;
export function agentForSection(section: string): AgentId {
  if (["inbox", "customers", "reviews"].includes(section)) return "sana";
  if (["stock", "purchases", "suppliers"].includes(section)) return "qor";
  return "belgi";
}
export function availableAgent(agent: unknown, plan: AgentPlan): AgentId {
  return plan === "pro" && (agent === "sana" || agent === "qor")
    ? agent
    : "belgi";
}
export const AGENT_PLAN_KEY = "bagyt-agent-plan";
export const AGENT_ID_KEY = "bagyt-agent-id";
