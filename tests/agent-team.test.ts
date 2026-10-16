import test from "node:test";
import assert from "node:assert/strict";
import { availableAgent, agentForSection } from "../src/lib/agent-team";
test("Free never restores or selects a locked specialist", () => {
  for (const saved of ["sana", "qor", "unknown", null])
    assert.equal(availableAgent(saved, "free"), "belgi");
});
test("Pro restores valid specialists and falls back safely", () => {
  assert.equal(availableAgent("sana", "pro"), "sana");
  assert.equal(availableAgent("qor", "pro"), "qor");
  assert.equal(availableAgent("unknown", "pro"), "belgi");
});
test("Contextual handoff chooses clients, stock or business specialist", () => {
  assert.equal(agentForSection("reviews"), "sana");
  assert.equal(agentForSection("purchases"), "qor");
  assert.equal(agentForSection("analytics"), "belgi");
});
