import { createHmac, randomUUID } from "node:crypto";
async function main() {
  const url = process.env.BAGYT_WEBHOOK_URL,
    secret = process.env.BAGYT_WEBHOOK_SECRET;
  if (!url || !secret)
    throw new Error(
      "Set BAGYT_WEBHOOK_URL and BAGYT_WEBHOOK_SECRET from Connect → Website.",
    );
  const eventId = process.env.BAGYT_EVENT_ID || randomUUID();
  const body = JSON.stringify({
    event_id: eventId,
    order: {
      external_id: process.env.BAGYT_ORDER_ID || "CLI-" + eventId,
      kind: "sale",
      date: new Date().toISOString(),
      amount: "25000",
      cost: "15000",
      status: "paid",
      channel: "Сайт",
    },
  });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac("sha256", secret)
    .update(timestamp + "." + body)
    .digest("hex");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-bagyt-timestamp": timestamp,
      "x-bagyt-signature": signature,
    },
    body,
  });
  console.log(res.status, await res.json());
  if (!res.ok) process.exitCode = 1;
}
main();
