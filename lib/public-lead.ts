export const PUBLIC_PRIVACY_NOTICE_VERSION = "2026-08-26-v1" as const;

export const PUBLIC_LEAD_TYPES = [
  "PART_SELECTION",
  "CALLBACK",
  "BOOKING",
  "PRODUCT",
  "SEARCH_NO_RESULT",
  "DIAGNOSTIC",
  "AI_HANDOFF",
] as const;

export type PublicLeadType = (typeof PUBLIC_LEAD_TYPES)[number];

export type BrowserLeadAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  landingPath?: string;
  referrerHost?: string;
  aiAssisted?: boolean;
};

export type BrowserPublicLeadRequest = {
  leadType: PublicLeadType;
  contact: {
    name?: string;
    phone: string;
  };
  message?: string;
  vehicle?: {
    label?: string;
  };
  context?: {
    pagePath?: string;
  };
  attribution?: BrowserLeadAttribution;
  privacy: {
    acknowledged: true;
    marketingConsent?: boolean;
  };
  aiHandoff?: {
    sessionId?: string;
    summary?: string;
  };
};

export class PublicLeadValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message);
    this.name = "PublicLeadValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function strictRecord(value: unknown, field: string, keys: readonly string[]) {
  if (!isRecord(value)) throw new PublicLeadValidationError(field, `Invalid ${field}.`);
  const unknown = Object.keys(value).filter((key) => !keys.includes(key));
  if (unknown.length) throw new PublicLeadValidationError(field, `Unsupported ${field} fields.`);
  return value;
}

function optionalString(value: unknown, max: number) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function requiredString(value: unknown, field: string, max: number) {
  const parsed = optionalString(value, max);
  if (!parsed) throw new PublicLeadValidationError(field, `Required ${field}.`);
  return parsed;
}

function safePath(value: unknown, field: string) {
  const raw = optionalString(value, 512);
  if (!raw) return undefined;
  try {
    const url = raw.startsWith("/") ? new URL(raw, "https://turbolev.invalid") : new URL(raw);
    return (url.pathname || "/").slice(0, 300);
  } catch {
    throw new PublicLeadValidationError(field, `Invalid ${field}.`);
  }
}

function safeHost(value: unknown) {
  const raw = optionalString(value, 512);
  if (!raw) return undefined;
  try {
    const candidate = raw.includes("://") ? raw : `https://${raw}`;
    return new URL(candidate).hostname.toLowerCase().slice(0, 180) || undefined;
  } catch {
    return undefined;
  }
}

function parseAttribution(value: unknown): BrowserLeadAttribution | undefined {
  if (value === undefined || value === null) return undefined;
  const row = strictRecord(value, "attribution", [
    "source",
    "medium",
    "campaign",
    "content",
    "term",
    "landingPath",
    "referrerHost",
    "aiAssisted",
  ]);
  const result: BrowserLeadAttribution = {};
  const source = optionalString(row.source, 100);
  if (source) result.source = source;
  const medium = optionalString(row.medium, 100);
  if (medium) result.medium = medium;
  const campaign = optionalString(row.campaign, 160);
  if (campaign) result.campaign = campaign;
  const content = optionalString(row.content, 160);
  if (content) result.content = content;
  const term = optionalString(row.term, 160);
  if (term) result.term = term;
  const landingPath = safePath(row.landingPath, "attribution.landingPath");
  if (landingPath) result.landingPath = landingPath;
  const referrerHost = safeHost(row.referrerHost);
  if (referrerHost) result.referrerHost = referrerHost;
  if (typeof row.aiAssisted === "boolean") result.aiAssisted = row.aiAssisted;
  return Object.keys(result).length ? result : undefined;
}

function parseContext(value: unknown) {
  if (value === undefined || value === null) return undefined;
  const row = strictRecord(value, "context", ["pagePath"]);
  const pagePath = safePath(row.pagePath, "context.pagePath");
  return pagePath ? { pagePath } : undefined;
}

function parseVehicle(value: unknown) {
  if (value === undefined || value === null) return undefined;
  const row = strictRecord(value, "vehicle", ["label"]);
  const label = optionalString(row.label, 180);
  return label ? { label } : undefined;
}

function parseAiHandoff(value: unknown) {
  if (value === undefined || value === null) return undefined;
  const row = strictRecord(value, "aiHandoff", ["sessionId", "summary"]);
  const sessionId = optionalString(row.sessionId, 128);
  const summary = optionalString(row.summary, 1200);
  return sessionId || summary ? { ...(sessionId ? { sessionId } : {}), ...(summary ? { summary } : {}) } : undefined;
}

export function parseBrowserPublicLeadRequest(value: unknown): BrowserPublicLeadRequest {
  const row = strictRecord(value, "request", [
    "leadType",
    "contact",
    "message",
    "vehicle",
    "context",
    "attribution",
    "privacy",
    "aiHandoff",
  ]);

  if (typeof row.leadType !== "string" || !PUBLIC_LEAD_TYPES.includes(row.leadType as PublicLeadType)) {
    throw new PublicLeadValidationError("leadType", "Invalid leadType.");
  }

  const contact = strictRecord(row.contact, "contact", ["name", "phone"]);
  const phone = requiredString(contact.phone, "contact.phone", 40);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    throw new PublicLeadValidationError("contact.phone", "Invalid phone.");
  }
  const name = optionalString(contact.name, 120);

  const privacy = strictRecord(row.privacy, "privacy", ["acknowledged", "marketingConsent"]);
  if (privacy.acknowledged !== true) {
    throw new PublicLeadValidationError("privacy.acknowledged", "Privacy acknowledgement is required.");
  }

  const aiHandoff = parseAiHandoff(row.aiHandoff);
  if (row.leadType === "AI_HANDOFF" && !aiHandoff?.summary) {
    throw new PublicLeadValidationError("aiHandoff.summary", "AI handoff summary is required.");
  }

  const message = optionalString(row.message, 2000);
  const vehicle = parseVehicle(row.vehicle);
  const context = parseContext(row.context);
  const attribution = parseAttribution(row.attribution);

  return {
    leadType: row.leadType as PublicLeadType,
    contact: { ...(name ? { name } : {}), phone },
    ...(message ? { message } : {}),
    ...(vehicle ? { vehicle } : {}),
    ...(context ? { context } : {}),
    ...(attribution ? { attribution } : {}),
    privacy: {
      acknowledged: true,
      ...(typeof privacy.marketingConsent === "boolean" ? { marketingConsent: privacy.marketingConsent } : {}),
    },
    ...(aiHandoff ? { aiHandoff } : {}),
  };
}

export function browserAttributionFromLocation(input: {
  href: string;
  referrer?: string;
  aiAssisted?: boolean;
}): BrowserLeadAttribution {
  const url = new URL(input.href);
  const params = url.searchParams;
  const result: BrowserLeadAttribution = {
    landingPath: url.pathname || "/",
    ...(input.aiAssisted ? { aiAssisted: true } : {}),
  };

  const source = optionalString(params.get("utm_source"), 100);
  if (source) result.source = source;
  const medium = optionalString(params.get("utm_medium"), 100);
  if (medium) result.medium = medium;
  const campaign = optionalString(params.get("utm_campaign"), 160);
  if (campaign) result.campaign = campaign;
  const content = optionalString(params.get("utm_content"), 160);
  if (content) result.content = content;
  const term = optionalString(params.get("utm_term"), 160);
  if (term) result.term = term;
  const referrerHost = safeHost(input.referrer);
  if (referrerHost) result.referrerHost = referrerHost;
  return result;
}
