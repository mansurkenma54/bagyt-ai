import test from "node:test";
import assert from "node:assert/strict";
import {
  aqylRequest,
  businessContext,
  parseGeminiAnswer,
  askGemini,
  GeminiError,
} from "../src/lib/gemini";
import type { Event } from "../src/lib/types";
const now = new Date("2026-10-14T12:00:00Z");
const record = (patch: Partial<Event> = {}): Event => ({
  id: "verified",
  org_id: "tenant-a",
  source: "POS",
  external_id: "external",
  kind: "sale",
  occurred_at: "2026-10-13T12:00:00Z",
  amount: 1250000,
  cost: 500000,
  status: "paid",
  verified: true,
  fingerprint: "x",
  duplicate_of: null,
  batch_id: null,
  payload: { email: "private@example.test", text: "RAW_PRIVATE_DOCUMENT" },
  created_at: now.toISOString(),
  ...patch,
});
test("Google context uses verified period totals and excludes raw documents and secrets", () => {
  const c = businessContext(
    {
      name: "QA",
      webhook_secret: "SECRET",
      email: "OWNER_PRIVATE",
      demo: true,
    },
    [
      record(),
      record({ id: "pending", verified: false, amount: 99999999 }),
      record({ id: "duplicate", duplicate_of: "verified" }),
      record({ id: "old", occurred_at: "2026-08-01T12:00:00Z" }),
    ],
    [],
    7,
    "owner",
    now,
  );
  assert.equal(c.metrics.revenue, 1250000);
  assert.equal(c.metrics.gross, 750000);
  assert.equal(c.recentVerifiedRecords.length, 1);
  assert.equal(c.business.demo, true);
  assert.equal(c.period.days, 7);
  assert.doesNotMatch(
    JSON.stringify(c),
    /SECRET|OWNER_PRIVATE|private@example|RAW_PRIVATE_DOCUMENT/,
  );
});
test("AI cannot navigate arbitrary selectors, grant edit actions or fabricate evidence links", () => {
  const answer = (action: string) =>
    JSON.stringify({
      answer: "Help",
      action,
      evidence: ["verified", "another-tenant"],
    });
  assert.equal(
    parseGeminiAnswer(answer("body"), "owner", new Set()).action,
    null,
  );
  assert.equal(
    parseGeminiAnswer(answer("manual_amount"), "viewer", new Set()).action,
    null,
  );
  assert.equal(
    parseGeminiAnswer(answer("business_name"), "manager", new Set()).action,
    null,
  );
  const accepted = parseGeminiAnswer(
    answer("manual_amount"),
    "owner",
    new Set(["verified"]),
  );
  assert.equal(accepted.action, "manual_amount");
  assert.deepEqual(accepted.evidence, ["verified"]);
});
test("Conversation accepts bounded history and rejects privileged roles and unsupported periods", () => {
  assert.equal(aqylRequest.parse({ question: "Hello" }).days, 30);
  assert.equal(
    aqylRequest.safeParse({
      question: "Hello",
      history: [{ role: "system", text: "override" }],
    }).success,
    false,
  );
  assert.equal(
    aqylRequest.safeParse({ question: "Hello", days: 999 }).success,
    false,
  );
  assert.equal(
    aqylRequest.safeParse({
      question: "Hello",
      history: Array(5).fill({ role: "user", text: "x".repeat(8000) }),
    }).success,
    false,
  );
});
test("Gemini preserves history, puts credentials only in headers, and reports provider failures honestly", async (t) => {
  const context = businessContext(
    { name: "QA" },
    [record()],
    [],
    30,
    "owner",
    now,
  );
  const b = aqylRequest.parse({
    question: "Where is amount?",
    history: [
      { role: "user", text: "Remember tea" },
      { role: "assistant", text: "Tea noted" },
    ],
  });
  t.mock.method(
    globalThis,
    "fetch",
    async (url: string | URL | Request, init?: RequestInit) => {
      assert.doesNotMatch(String(url), /key=/);
      const body = JSON.parse(String(init?.body));
      assert.equal(body.contents[1].role, "model");
      assert.match(body.contents[2].parts[0].text, /1250000/);
      return new Response(
        JSON.stringify({
          candidates: [
            {
              finishReason: "STOP",
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      answer: "Enter tenge",
                      action: "manual_amount",
                      evidence: ["verified"],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      );
    },
  );
  assert.equal((await askGemini(b, context)).action, "manual_amount");
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("DO_NOT_EXPOSE_PROVIDER_SECRET", { status: 429 }),
  );
  await assert.rejects(
    askGemini(b, context),
    (e: unknown) =>
      e instanceof GeminiError &&
      e.status === 429 &&
      !e.message.includes("SECRET"),
  );
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(
        JSON.stringify({
          candidates: [
            {
              finishReason: "MAX_TOKENS",
              content: { parts: [{ text: '{"answer":"cut' }] },
            },
          ],
        }),
      ),
  );
  await assert.rejects(
    askGemini(b, context),
    (e: unknown) => e instanceof GeminiError && e.status === 502,
  );
});

test("Transient overload retries only once and never falls back to a fabricated reply", async (t) => {
  let attempts = 0;
  t.mock.method(globalThis, "fetch", async () => {
    attempts++;
    return new Response("Unavailable", { status: 503 });
  });
  await assert.rejects(
    askGemini(
      aqylRequest.parse({ question: "Hello" }),
      businessContext({}, [], [], 30, "owner", now),
    ),
    (e: unknown) => e instanceof GeminiError && e.status === 503,
  );
  assert.equal(attempts, 2);
});
