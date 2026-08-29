import assert from "node:assert/strict";
import { AiOrchestrator, AI_ORCHESTRATOR_RESULT } from "../lib/ai/orchestrator.mjs";
import { AiToolRegistry, AI_TOOL_RISK } from "../lib/ai/tool-registry.mjs";

const audit = [];
const registry = new AiToolRegistry()
  .register({
    name: "catalog.search",
    risk: AI_TOOL_RISK.READ,
    description: "Deterministic catalog search boundary",
    execute: async ({ input }) => ({ query: input.query, items: [] }),
  })
  .register({
    name: "cart.add",
    risk: AI_TOOL_RISK.WRITE,
    description: "Cart mutation boundary",
    execute: async ({ input }) => ({ productId: input.productId, quantity: input.quantity }),
  });

const orchestrator = new AiOrchestrator({ registry, onAudit: (entry) => audit.push(entry) });

const read = await orchestrator.executeTool({ toolName: "catalog.search", input: { query: "масляний фільтр" } });
assert.equal(read.ok, true);
assert.equal(read.code, AI_ORCHESTRATOR_RESULT.OK);

const deniedWrite = await orchestrator.executeTool({ toolName: "cart.add", input: { productId: "p1", quantity: 1 } });
assert.equal(deniedWrite.ok, false);
assert.equal(deniedWrite.code, AI_ORCHESTRATOR_RESULT.CONFIRMATION_REQUIRED);

const confirmedWrite = await orchestrator.executeTool({
  toolName: "cart.add",
  input: { productId: "p1", quantity: 1 },
  confirmationToken: "test-confirmation",
});
assert.equal(confirmedWrite.ok, true);

const unknown = await orchestrator.executeTool({ toolName: "admin.override_price", input: {} });
assert.equal(unknown.ok, false);
assert.equal(unknown.code, AI_ORCHESTRATOR_RESULT.TOOL_NOT_FOUND);

assert.ok(audit.some((entry) => entry.event === "ai_tool_denied" && entry.reason === "CONFIRMATION_REQUIRED"));
assert.ok(audit.some((entry) => entry.event === "ai_tool_denied" && entry.reason === "TOOL_NOT_FOUND"));

console.log("AI foundation smoke: PASS");
