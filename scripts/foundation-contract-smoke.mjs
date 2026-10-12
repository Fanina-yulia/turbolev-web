import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "app/page.tsx",
  "app/vin/page.tsx",
  "app/zapys/page.tsx",
  "app/oformlennia/page.tsx",
  "app/poslugy/[service]/page.tsx",
  "app/sto/hlevakha/page.tsx",
  "app/zapchastyny/[category]/[product]/page.tsx",
  "app/api/vehicle/resolve/route.ts",
  "app/api/public/leads/route.ts",
  "app/privacy/page.tsx",
  "components/BookingClient.tsx",
  "components/CheckoutClient.tsx",
  "components/GarageClient.tsx",
  "components/ProductFitmentContext.tsx",
  "components/VehicleContextProvider.tsx",
  "components/VehicleIdentityResolver.tsx",
  "lib/public-lead.ts",
  "lib/vehicle-identity.ts",
];

for (const path of requiredFiles) {
  assert.equal(existsSync(join(root, path)), true, `Missing consolidated foundation file: ${path}`);
}
for (const obsolete of [
  "components/VehicleProvider.tsx",
  "components/VinResolverClient.tsx",
  "components/VehicleHeaderStatus.tsx",
  "lib/vehicle.ts",
]) {
  assert.equal(existsSync(join(root, obsolete)), false, `Obsolete vehicle-context implementation must stay removed: ${obsolete}`);
}

const provider = readFileSync(join(root, "components/VehicleContextProvider.tsx"), "utf8");
assert.match(provider, /turbolev\.publicVehicleContext\.v2/);
assert.match(provider, /LEGACY_STORAGE_KEYS/);
assert.doesNotMatch(provider, /vinLast6|plateNumber|rawVin|rawPlate/);

const vehicleBff = readFileSync(join(root, "app/api/vehicle/resolve/route.ts"), "utf8");
assert.match(vehicleBff, /no-store/);
assert.match(vehicleBff, /PUBLIC_BFF_PENDING_INTEGRATION/);
assert.doesNotMatch(vehicleBff, /Prisma|prisma|DATABASE_URL|directUrl/);

const fitment = readFileSync(join(root, "components/ProductFitmentContext.tsx"), "utf8");
assert.match(fitment, /authoritative product fitment check/);
assert.match(fitment, /Невідоме ≠ сумісне/);

const publicLead = readFileSync(join(root, "lib/public-lead.ts"), "utf8");
assert.match(publicLead, /PUBLIC_PRIVACY_NOTICE_VERSION/);
assert.match(publicLead, /strictRecord/);
assert.match(publicLead, /privacy\.acknowledged/);
assert.match(publicLead, /utm_source/);
assert.doesNotMatch(publicLead, /rawVin|rawPlate|plateNumber|vinLast6/);

const leadBff = readFileSync(join(root, "app/api/public/leads/route.ts"), "utf8");
assert.match(leadBff, /MAX_BODY_BYTES/);
assert.match(leadBff, /TURBOLEV_INTEGRATION_API_URL/);
assert.match(leadBff, /x-idempotency-key/i);
assert.match(leadBff, /Authorization: `Bearer \$\{oidcToken\}`/);
assert.match(leadBff, /cache: "no-store"/);
assert.match(leadBff, /data\?\.accepted !== true/);
assert.match(leadBff, /data\?\.status !== "ACCEPTED"/);
assert.doesNotMatch(leadBff, /Prisma|prisma|DATABASE_URL|directUrl/);

const booking = readFileSync(join(root, "components/BookingClient.tsx"), "utf8");
assert.match(booking, /fetch\("\/api\/public\/leads"/);
assert.match(booking, /X-Idempotency-Key/);
assert.match(booking, /ЗАЯВКУ ПРИЙНЯТО CRM/);
assert.match(booking, /href="\/privacy"/);
assert.match(booking, /без повного VIN або держномера/);
assert.doesNotMatch(booking, /DEMO: НЕ ВІДПРАВЛЕНО|setSent\(true\)/);

const privacy = readFileSync(join(root, "app/privacy/page.tsx"), "utf8");
assert.match(privacy, /robots/);
assert.match(privacy, /index: false/);

console.log("TURBO LEV storefront foundation contract smoke: PASS");
