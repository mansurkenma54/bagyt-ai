export type PurchaseStage = "suggested" | "draft" | "approved" | "received";
export type DemoPurchase = { stage: PurchaseStage; received: number };
export const initialPurchase: DemoPurchase = {
  stage: "suggested",
  received: 0,
};
export function advancePurchase(
  current: DemoPurchase,
  action: "prepare" | "approve" | "receive",
  quantity = 25,
): DemoPurchase {
  if (action === "prepare" && current.stage === "suggested")
    return { stage: "draft", received: 0 };
  if (action === "approve" && current.stage === "draft")
    return { stage: "approved", received: 0 };
  if (
    action === "receive" &&
    current.stage === "approved" &&
    Number.isInteger(quantity) &&
    quantity > 0 &&
    quantity <= 30
  )
    return { stage: "received", received: quantity };
  return current;
}
export function parsePurchase(value: unknown): DemoPurchase {
  if (!value || typeof value !== "object") return initialPurchase;
  const p = value as DemoPurchase;
  if (["suggested", "draft", "approved"].includes(p.stage) && p.received === 0)
    return { stage: p.stage, received: 0 };
  if (
    p.stage === "received" &&
    Number.isInteger(p.received) &&
    p.received > 0 &&
    p.received <= 30
  )
    return { stage: p.stage, received: p.received };
  return initialPurchase;
}
export const demoDailySales = [
  120000, 145000, 112000, 168000, 154000, 192000, 143000, 185000, 176000,
  213000, 194000, 225000, 198000, 225000,
];
