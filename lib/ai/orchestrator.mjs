import { requiresExplicitConfirmation } from "./tool-registry.mjs";

export const AI_ORCHESTRATOR_RESULT = Object.freeze({
  OK: "OK",
  TOOL_NOT_FOUND: "TOOL_NOT_FOUND",
  CONFIRMATION_REQUIRED: "CONFIRMATION_REQUIRED",
  TOOL_FAILED: "TOOL_FAILED",
});

export class AiOrchestrator {
  constructor({ registry, onAudit = () => {} }) {
    if (!registry) throw new TypeError("AI orchestrator requires a tool registry");
    this.registry = registry;
    this.onAudit = onAudit;
  }

  async executeTool({ toolName, input, confirmationToken = null, context = {} }) {
    const tool = this.registry.get(toolName);
    if (!tool) {
      this.onAudit({ event: "ai_tool_denied", reason: "TOOL_NOT_FOUND", toolName, context });
      return { ok: false, code: AI_ORCHESTRATOR_RESULT.TOOL_NOT_FOUND };
    }

    if (requiresExplicitConfirmation(tool) && !confirmationToken) {
      this.onAudit({ event: "ai_tool_denied", reason: "CONFIRMATION_REQUIRED", toolName, context });
      return { ok: false, code: AI_ORCHESTRATOR_RESULT.CONFIRMATION_REQUIRED };
    }

    try {
      const data = await tool.execute({ input, confirmationToken, context });
      this.onAudit({ event: "ai_tool_executed", toolName, context });
      return { ok: true, code: AI_ORCHESTRATOR_RESULT.OK, data };
    } catch (error) {
      this.onAudit({ event: "ai_tool_failed", toolName, context });
      return {
        ok: false,
        code: AI_ORCHESTRATOR_RESULT.TOOL_FAILED,
        error: error instanceof Error ? error.message : "Unknown tool failure",
      };
    }
  }
}
