# TURBO LEV Web v0.9 — Source Provenance

v0.9 is a consolidation candidate created from the latest recoverable storefront source artifacts. It is not reconstructed from the deployed HTML.

## Base sources

- v0.7: fuller customer flows — booking, checkout, garage, service and location details.
- v0.8: stronger Unified Vehicle Identity / BFF / privacy-safe public vehicle context.

## Consolidation rule

The v0.7 customer-flow surface is preserved while the older VIN-only browser context is removed and replaced with the v0.8-style `PublicVehicleContext` model.

The resulting source keeps a hard distinction between:

- vehicle identity resolution,
- canonical VehicleReference readiness,
- exact Product × Vehicle fitment,
- commercial price/availability truth.

No UI state is allowed to imply that a concrete Product fits only because a vehicle was identified.

## Authoritative gate

This recovered source becomes an authoritative repository baseline only after a real dependency install, TypeScript check and Next.js production build pass in GitHub CI, followed by a Git-linked Vercel Preview verification.
