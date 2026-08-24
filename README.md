# TURBO LEV Web — consolidated foundation v0.9

Separate public Website + Shop codebase for TURBO LEV. This package consolidates the fuller v0.7 customer flows with the safer v0.8 Unified Vehicle Identity boundary.

## Included

- Next.js 16 App Router / React 19.2 / strict TypeScript
- home + SEO/storefront navigation
- `/zapchastyny/`, category and product detail routes
- `/vin/` unified registration-number/VIN resolver UI
- same-origin fail-closed `/api/vehicle/resolve` Public BFF placeholder
- privacy-safe persistent `PublicVehicleContext`
- `/koszyk` + `/oformlennia` checkout foundation
- `/sto`, `/sto/hlevakha`, `/poslugy`, `/poslugy/[service]`
- `/zapys` durable-lead UX foundation with explicit DEMO-not-sent state
- `/account` garage context
- metadata, robots, sitemap, 404 and health endpoint
- first-run GitHub Actions CI for static contract smoke + install + typecheck + Next production build

## Vehicle / fitment truth rules

1. Number/VIN identity resolution and product compatibility are separate states.
2. `ASSISTED` / `PARTIAL` may continue to STO/booking handoff.
3. Shop must not claim a product fits merely because a vehicle context exists.
4. Exact product compatibility requires authoritative VehicleReference + VehicleFitment criteria evaluation.
5. Raw number/VIN is not persisted in localStorage and is not intended for marketing analytics.

## Safety

This foundation contains no CRM database connection, no supplier writes, no real lead submission, no payment/order mutation and no production Integration API activation. `/api/vehicle/resolve` deliberately returns a fail-closed `503` assisted context until the OIDC Integration API resolver is wired.

## CI bootstrap

The recovered Library packages did not include a lockfile, so the first repository CI intentionally uses:

```bash
npm install --no-audit --no-fund
npm run typecheck
npm run build
```

After the first successful install, commit the generated `package-lock.json` and switch CI to `npm ci` plus npm cache.

## Local commands

```bash
npm run foundation:smoke
npm install
npm run typecheck
npm run build
npm run dev
```

Node.js 22–24 is the supported bootstrap range.

See `docs/SOURCE_PROVENANCE.md` for why v0.9 is a consolidation of v0.7 + v0.8 rather than a direct copy of v0.8.
