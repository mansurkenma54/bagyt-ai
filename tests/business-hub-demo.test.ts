import test from "node:test";
import assert from "node:assert/strict";
import {
  addDemoTask,
  allConversations,
  demoContacts,
  demoConversations,
  demoReviews,
  createThreadOrder,
  runAutoReply,
  sendThreadReply,
  initialHub,
  parseHub,
  replyDraft,
  simulateReply,
  syncDemoMessage,
  unanswered,
} from "../src/lib/business-hub-demo";

test("an incoming message reuses the customer and replay never duplicates it", () => {
  const next = syncDemoMessage(initialHub);
  assert.equal(allConversations(next).length, demoConversations.length + 1);
  assert.equal(
    allConversations(next).filter((c) => c.contact === "c2").length,
    2,
  );
  assert.equal(demoContacts.filter((c) => c.id === "c2").length, 1);
  assert.equal(syncDemoMessage(next), next);
  assert.equal(unanswered(next).length, demoConversations.length + 1);
});
test("drafting does not close a conversation; only explicit simulation records the edited text", () => {
  const draft = { ...initialHub, drafts: { "wa-101": "  Edited response  " } };
  assert.equal(unanswered(draft).length, demoConversations.length);
  const next = simulateReply(draft, "wa-101");
  assert.equal(next.replies["wa-101"], "Edited response");
  assert.equal(unanswered(next).length, demoConversations.length - 1);
  assert.equal(initialHub.replies["wa-101"], undefined);
  assert.equal(simulateReply(next, "wa-101"), next);
});
test("blank and unknown messages cannot be marked replied", () => {
  const blank = {
    ...initialHub,
    drafts: { "wa-101": "   ", missing: "text", "wa-105": "not received yet" },
  };
  assert.equal(simulateReply(blank, "wa-101"), blank);
  assert.equal(simulateReply(blank, "missing"), blank);
  assert.equal(simulateReply(blank, "wa-105"), blank);
});
test("review responses are separate from customer replies", () => {
  const draft = {
    ...initialHub,
    reviewDrafts: { r1: "Thanks; we will investigate." },
  };
  const next = simulateReply(draft, "r1", true);
  assert.equal(next.reviewReplies.r1, draft.reviewDrafts.r1);
  assert.equal(unanswered(next).length, demoConversations.length);
  assert.equal(simulateReply(next, "r1", true), next);
});
test("a follow-up or improvement is added once and invalid tasks are rejected", () => {
  const next = addDemoTask(initialHub, "follow-c1");
  assert.deepEqual(next.tasks, ["follow-c1"]);
  assert.equal(addDemoTask(next, "follow-c1"), next);
  assert.equal(addDemoTask(next, "invented"), next);
  assert.deepEqual(addDemoTask(next, "service").tasks, [
    "follow-c1",
    "service",
  ]);
});
test("stored progress round trips and malformed data cannot create phantom records", () => {
  const next = {
    ...syncDemoMessage(initialHub),
    drafts: { "wa-101": "draft" },
    tasks: ["service"],
    completed: ["service"],
  };
  assert.deepEqual(parseHub(JSON.parse(JSON.stringify(next))), next);
  assert.equal(parseHub(null), initialHub);
  assert.equal(parseHub({ version: 9 }), initialHub);
  const parsed = parseHub({
    ...next,
    drafts: { "wa-101": "draft", fake: "invented" },
    owners: { "wa-101": "admin" },
    tasks: ["service", "service", "fake"],
    completed: ["service", "retention"],
  });
  assert.deepEqual(parsed.tasks, ["service"]);
  assert.deepEqual(parsed.completed, ["service"]);
  assert.deepEqual(parsed.owners, {});
  assert.deepEqual(parsed.drafts, { "wa-101": "draft" });
});
test("a new response draft reflects the current stock after procurement", () => {
  assert.match(replyDraft("wa-101", "kk", 35), /35/);
  assert.match(replyDraft("wa-101", "ru", 10), /10/);
  assert.equal(replyDraft("missing", "kk", 35), "");
});

test("TikTok conversations and 2GIS reviews keep distinct source and customer identities", () => {
  const thread = demoConversations.find((c) => c.source === "TikTok")!;
  assert.ok(thread);
  assert.equal(demoContacts.filter((c) => c.id === thread.contact).length, 1);
  assert.ok(replyDraft(thread.id, "kk", 12).includes("12"));
  assert.equal(demoReviews.filter((r) => r.source === "2GIS").length, 1);
  assert.equal(
    new Set(demoConversations.map((c) => c.id)).size,
    demoConversations.length,
  );
});

test("local chat supports multiple edited replies, clears drafts and does not duplicate a send", () => {
  const first = sendThreadReply(
    { ...initialHub, drafts: { "wa-101": "  First reply  " } },
    "wa-101",
  );
  assert.equal(first.sentMessages["wa-101"][0].text, "First reply");
  assert.equal(first.drafts["wa-101"], "");
  assert.equal(sendThreadReply(first, "wa-101"), first);
  const second = sendThreadReply(
    { ...first, drafts: { "wa-101": "Second reply" } },
    "wa-101",
  );
  assert.deepEqual(
    second.sentMessages["wa-101"].map((m) => m.text),
    ["First reply", "Second reply"],
  );
  assert.equal(second.replies["wa-101"], "Second reply");
  assert.equal(new Set(second.sentMessages["wa-101"].map((m) => m.id)).size, 2);
  assert.deepEqual(parseHub(JSON.parse(JSON.stringify(second))), second);
});

test("automatic reply needs opt-in, preserves user drafts and is idempotent", () => {
  assert.equal(runAutoReply(initialHub, "wa-101", "kk", 10), initialHub);
  const edited = {
    ...initialHub,
    autoReplyEnabled: true,
    drafts: { "wa-101": "My unfinished reply" },
  };
  assert.equal(runAutoReply(edited, "wa-101", "kk", 10), edited);
  const enabled = { ...initialHub, autoReplyEnabled: true };
  const result = runAutoReply(enabled, "wa-101", "kk", 10);
  assert.equal(result.sentMessages["wa-101"][0].kind, "auto");
  assert.ok(result.replies["wa-101"].includes("10"));
  assert.equal(runAutoReply(result, "wa-101", "kk", 10), result);
  assert.equal(runAutoReply(enabled, "wa-105", "kk", 10), enabled);
});

test("thread order links the existing customer and catalog price without duplicating or booking a sale", () => {
  const result = createThreadOrder(initialHub, "wa-101", "COF-0250", 2);
  assert.deepEqual(result.threadOrders[0], {
    id: "order-wa-101",
    conversationId: "wa-101",
    contactId: "c1",
    productId: "COF-0250",
    quantity: 2,
    unitPrice: 3200,
    status: "draft",
  });
  assert.equal(createThreadOrder(result, "wa-101", "COF-0250", 2), result);
  assert.equal(result.replies, initialHub.replies);
  assert.equal(
    createThreadOrder(initialHub, "unknown", "COF-0250", 2),
    initialHub,
  );
  assert.equal(
    createThreadOrder(initialHub, "wa-101", "unknown", 2),
    initialHub,
  );
  assert.equal(
    createThreadOrder(initialHub, "wa-101", "COF-0250", -1),
    initialHub,
  );
  assert.equal(
    createThreadOrder(initialHub, "wa-101", "COF-0250", 1.5),
    initialHub,
  );
  const restored = parseHub({
    ...result,
    threadOrders: [
      { ...result.threadOrders[0], unitPrice: 1 },
      { ...result.threadOrders[0], contactId: "other-customer" },
    ],
  });
  assert.equal(restored.threadOrders.length, 1);
  assert.equal(restored.threadOrders[0].unitPrice, 3200);
});

test("previous stored progress gains safe defaults for chat automation and orders", () => {
  const legacy = parseHub({
    version: 1,
    incoming: false,
    replies: { "wa-101": "Old response" },
    drafts: {},
    tasks: [],
    completed: [],
  });
  assert.equal(legacy.replies["wa-101"], "Old response");
  assert.equal(legacy.autoReplyEnabled, false);
  assert.deepEqual(legacy.sentMessages, {});
  assert.deepEqual(legacy.threadOrders, []);
  const continued = sendThreadReply(
    { ...legacy, drafts: { "wa-101": "New response" } },
    "wa-101",
  );
  assert.deepEqual(
    continued.sentMessages["wa-101"].map((m) => m.text),
    ["Old response", "New response"],
  );
  assert.deepEqual(parseHub(JSON.parse(JSON.stringify(continued))), continued);
  const invalid = parseHub({
    ...initialHub,
    autoReplyEnabled: "true",
    sentMessages: {
      fake: [
        {
          id: "fake-reply-1",
          text: "not a contact",
          time: "14:40",
          kind: "manual",
        },
      ],
    },
    threadOrders: [
      {
        id: "fake",
        conversationId: "unknown",
        contactId: "c1",
        productId: "COF-0250",
        quantity: 1,
        unitPrice: 1,
        status: "paid",
      },
    ],
  });
  assert.equal(invalid.autoReplyEnabled, false);
  assert.deepEqual(invalid.sentMessages, {});
  assert.deepEqual(invalid.threadOrders, []);
});
