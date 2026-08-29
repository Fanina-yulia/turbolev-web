export const AI_TOOL_RISK = Object.freeze({
  READ: "READ",
  WRITE: "WRITE",
  SENSITIVE_WRITE: "SENSITIVE_WRITE",
});

export class AiToolRegistry {
  #tools = new Map();

  register(tool) {
    if (!tool || typeof tool.name !== "string" || !tool.name.trim()) {
      throw new TypeError("AI tool must have a non-empty name");
    }
    if (this.#tools.has(tool.name)) {
      throw new Error(`Duplicate AI tool: ${tool.name}`);
    }
    if (!Object.values(AI_TOOL_RISK).includes(tool.risk)) {
      throw new TypeError(`Unsupported AI tool risk: ${tool.risk}`);
    }
    if (typeof tool.execute !== "function") {
      throw new TypeError(`AI tool ${tool.name} must define execute()`);
    }

    this.#tools.set(tool.name, Object.freeze({ ...tool }));
    return this;
  }

  list() {
    return [...this.#tools.values()].map(({ execute: _execute, ...tool }) => tool);
  }

  get(name) {
    return this.#tools.get(name) ?? null;
  }
}

export function requiresExplicitConfirmation(tool) {
  return tool?.risk === AI_TOOL_RISK.WRITE || tool?.risk === AI_TOOL_RISK.SENSITIVE_WRITE;
}
