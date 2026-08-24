import { NextResponse } from "next/server";
import { detectVehicleIdentifier } from "@/lib/vehicle-identity";

const NO_STORE_HEADERS = {
  "cache-control": "no-store, max-age=0",
  "x-robots-tag": "noindex, nofollow",
};

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ state: "ASSISTED", code: "INVALID_JSON", message: "Некоректний запит." }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const input = payload && typeof payload === "object" ? String((payload as Record<string, unknown>).input ?? "") : "";
  const parsed = detectVehicleIdentifier(input);
  if (!parsed) {
    return NextResponse.json({ state: "ASSISTED", code: "INVALID_VEHICLE_IDENTIFIER", message: "Введіть коректний державний номер або VIN (17 символів)." }, { status: 400, headers: NO_STORE_HEADERS });
  }

  // R0 fail-closed placeholder. Browser never calls CRM DB or staff-only endpoints.
  // API-VEH-ID-001 will replace this with an OIDC-authenticated Integration API call.
  return NextResponse.json({
    state: "ASSISTED",
    code: "VEHICLE_RESOLVER_NOT_CONNECTED",
    inputType: parsed.type,
    maskedIdentifier: parsed.masked,
    confidence: 0,
    source: "PUBLIC_BFF_PENDING_INTEGRATION",
    vehicle: null,
    vinAvailable: parsed.type === "VIN",
    canonicalReferenceReady: false,
    exactFitmentReady: false,
    needsVin: parsed.type === "PLATE",
    message: parsed.type === "PLATE"
      ? "Номер розпізнано. Integration API ще не підключений; можна ввести VIN або передати запит майстру."
      : "VIN розпізнано. Integration API ще не підключений; точну сумісність поки не підтверджуємо.",
  }, { status: 503, headers: NO_STORE_HEADERS });
}
