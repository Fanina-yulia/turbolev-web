import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  PUBLIC_PRIVACY_NOTICE_VERSION,
  PublicLeadValidationError,
  parseBrowserPublicLeadRequest,
  type BrowserLeadAttribution,
  type PublicLeadType,
} from "@/lib/public-lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32 * 1024;
const UPSTREAM_TIMEOUT_MS = 10_000;
const IDEMPOTENCY_RE = /^[A-Za-z0-9._:-]{16,128}$/;

type SourceClass =
  | "ORGANIC_SEARCH"
  | "PAID_SEARCH"
  | "ORGANIC_SOCIAL"
  | "PAID_SOCIAL"
  | "REFERRAL"
  | "DIRECT"
  | "EMAIL"
  | "MESSENGER"
  | "AI_ASSISTED"
  | "OTHER"
  | "UNKNOWN";

function noStoreHeaders(correlationId: string, extra: Record<string, string> = {}) {
  return {
    "Cache-Control": "no-store",
    "X-Correlation-Id": correlationId,
    ...extra,
  };
}

function publicError(
  status: number,
  code: string,
  message: string,
  correlationId: string,
  retryable = false,
  extraHeaders: Record<string, string> = {},
) {
  return NextResponse.json(
    { ok: false, error: { code, message, retryable }, correlationId },
    { status, headers: noStoreHeaders(correlationId, extraHeaders) },
  );
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function sourceClassFor(attribution?: BrowserLeadAttribution): SourceClass {
  if (attribution?.aiAssisted) return "AI_ASSISTED";
  const source = attribution?.source?.toLowerCase() || "";
  const medium = attribution?.medium?.toLowerCase() || "";
  const host = attribution?.referrerHost?.toLowerCase() || "";
  const paid = /(^|[-_ ])(cpc|ppc|paid|cpm)([-_ ]|$)/.test(medium);
  const social = /(facebook|instagram|tiktok|linkedin|twitter|x\.com|youtube|telegram)/.test(`${source} ${host}`);
  const search = /(google|bing|duckduckgo|yahoo)/.test(`${source} ${host}`);

  if (medium.includes("email")) return "EMAIL";
  if (medium.includes("messenger") || source.includes("viber") || source.includes("telegram")) return "MESSENGER";
  if (paid && social) return "PAID_SOCIAL";
  if (paid && search) return "PAID_SEARCH";
  if (paid) return "OTHER";
  if (social || medium.includes("social")) return "ORGANIC_SOCIAL";
  if (search) return "ORGANIC_SEARCH";
  if (host) return "REFERRAL";
  if (!source && !medium) return "DIRECT";
  return "OTHER";
}

function entrypointFor(leadType: PublicLeadType) {
  switch (leadType) {
    case "BOOKING": return "BOOKING" as const;
    case "PART_SELECTION": return "WEB_FORM" as const;
    case "CALLBACK": return "CALLBACK" as const;
    case "PRODUCT": return "SHOP" as const;
    case "SEARCH_NO_RESULT": return "SHOP" as const;
    case "DIAGNOSTIC": return "WEB_FORM" as const;
    case "AI_HANDOFF": return "AI_ASSISTANT" as const;
  }
}

function integrationUrl() {
  const configured = process.env.TURBOLEV_INTEGRATION_API_URL?.trim();
  if (!configured) return null;
  try {
    const base = new URL(configured);
    if (process.env.NODE_ENV === "production" && base.protocol !== "https:") return null;
    return new URL("/api/integration/v1/leads", base).toString();
  } catch {
    return null;
  }
}

function oidcTokenFor(request: Request) {
  const requestToken = request.headers.get("x-vercel-oidc-token")?.trim();
  if (requestToken) return requestToken;
  const environmentToken = process.env.VERCEL_OIDC_TOKEN?.trim();
  return environmentToken || null;
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function boundedJson(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new PublicLeadValidationError("request", "Request is too large.");
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new PublicLeadValidationError("request", "Request is too large.");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new PublicLeadValidationError("request", "Invalid JSON.");
  }
}

export async function POST(request: Request) {
  const correlationId = randomUUID();

  if (!sameOrigin(request)) {
    return publicError(403, "ORIGIN_REJECTED", "Не вдалося підтвердити джерело запиту.", correlationId);
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() || "";
  if (!contentType.startsWith("application/json")) {
    return publicError(415, "UNSUPPORTED_MEDIA_TYPE", "Форма має надіслати JSON-запит.", correlationId);
  }

  const idempotencyKey = request.headers.get("x-idempotency-key")?.trim() || "";
  if (!IDEMPOTENCY_RE.test(idempotencyKey)) {
    return publicError(400, "INVALID_IDEMPOTENCY_KEY", "Не вдалося підготувати безпечне повторне надсилання.", correlationId);
  }

  let input;
  try {
    input = parseBrowserPublicLeadRequest(await boundedJson(request));
  } catch (error) {
    if (error instanceof PublicLeadValidationError) {
      return publicError(400, "INVALID_REQUEST", "Перевірте заповнені поля форми.", correlationId);
    }
    return publicError(400, "INVALID_REQUEST", "Не вдалося прочитати форму.", correlationId);
  }

  const upstreamUrl = integrationUrl();
  const oidcToken = oidcTokenFor(request);
  if (!upstreamUrl || !oidcToken) {
    return publicError(
      503,
      "LEAD_INTAKE_UNAVAILABLE",
      "Зараз не вдалося надіслати заявку. Ваші дані не позначені як прийняті — спробуйте ще раз.",
      correlationId,
      true,
    );
  }

  const attribution = input.attribution;
  const pagePath = input.context?.pagePath || attribution?.landingPath;
  const upstreamBody = {
    leadType: input.leadType,
    contact: input.contact,
    ...(input.message ? { message: input.message } : {}),
    ...(input.vehicle ? { vehicle: input.vehicle } : {}),
    ...(pagePath ? { context: { pagePath } } : {}),
    attribution: {
      schemaVersion: "v1",
      entrypoint: entrypointFor(input.leadType),
      conversionTouch: {
        sourceClass: sourceClassFor(attribution),
        ...(attribution?.source ? { source: attribution.source } : {}),
        ...(attribution?.medium ? { medium: attribution.medium } : {}),
        ...(attribution?.campaign ? { campaign: attribution.campaign } : {}),
        ...(attribution?.content ? { content: attribution.content } : {}),
        ...(attribution?.term ? { term: attribution.term } : {}),
        ...(pagePath ? { landingPath: pagePath } : {}),
        ...(attribution?.referrerHost ? { referrerHost: attribution.referrerHost } : {}),
        ...(attribution?.aiAssisted ? { aiAssisted: true } : {}),
      },
    },
    privacy: {
      noticeVersion: PUBLIC_PRIVACY_NOTICE_VERSION,
      acknowledgedAt: new Date().toISOString(),
      ...(typeof input.privacy.marketingConsent === "boolean"
        ? { marketingConsent: input.privacy.marketingConsent }
        : {}),
    },
    ...(input.aiHandoff ? { aiHandoff: input.aiHandoff } : {}),
  };

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oidcToken}`,
        "Content-Type": "application/json",
        "X-Correlation-Id": correlationId,
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(upstreamBody),
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("public lead BFF upstream unavailable", {
      correlationId,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return publicError(
      503,
      "LEAD_INTAKE_UNAVAILABLE",
      "Зараз не вдалося надіслати заявку. Ваші дані не позначені як прийняті — спробуйте ще раз.",
      correlationId,
      true,
    );
  }

  let upstreamPayload: unknown = null;
  try {
    upstreamPayload = await upstream.json();
  } catch {
    upstreamPayload = null;
  }

  if (!upstream.ok) {
    if (upstream.status === 409) {
      return publicError(409, "SUBMISSION_CONFLICT", "Форму було змінено під час повторного надсилання. Надішліть її ще раз.", correlationId);
    }
    if (upstream.status === 429) {
      const retryAfter = upstream.headers.get("retry-after") || "60";
      return publicError(429, "RATE_LIMITED", "Забагато спроб. Спробуйте трохи пізніше.", correlationId, true, { "Retry-After": retryAfter });
    }
    console.error("public lead BFF rejected by integration API", {
      correlationId,
      upstreamStatus: upstream.status,
    });
    return publicError(
      503,
      "LEAD_INTAKE_UNAVAILABLE",
      "Зараз не вдалося надіслати заявку. Ваші дані не позначені як прийняті — спробуйте ще раз.",
      correlationId,
      true,
    );
  }

  const envelope = record(upstreamPayload);
  const data = record(envelope?.data);
  if (
    envelope?.ok !== true
    || data?.accepted !== true
    || data?.status !== "ACCEPTED"
    || typeof data?.receiptRef !== "string"
    || typeof data?.acceptedAt !== "string"
  ) {
    console.error("public lead BFF received invalid acceptance envelope", { correlationId });
    return publicError(
      503,
      "LEAD_INTAKE_UNAVAILABLE",
      "CRM не підтвердила прийняття заявки. Спробуйте ще раз.",
      correlationId,
      true,
    );
  }

  return NextResponse.json(
    {
      ok: true,
      accepted: true,
      status: "ACCEPTED",
      receiptRef: data.receiptRef,
      acceptedAt: data.acceptedAt,
      correlationId,
    },
    { status: 201, headers: noStoreHeaders(correlationId) },
  );
}
