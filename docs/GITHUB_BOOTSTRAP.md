# GitHub + Vercel bootstrap for turbolev-web

This runbook starts only after an empty GitHub repository `Fanina-yulia/turbolev-web` exists.

## 1. Populate GitHub

Upload/push the complete v0.9 tree to the default `main` branch. Do not copy the currently deployed Vercel HTML back into this repository: v0.9 is the recovered/consolidated source candidate.

Expected root files include:

- `package.json`
- `tsconfig.json`
- `.github/workflows/ci.yml`
- `app/`
- `components/`
- `lib/`
- `public/`
- `scripts/foundation-contract-smoke.mjs`

## 2. First authoritative CI

The first GitHub Actions run must pass all four stages:

1. `npm run foundation:smoke`
2. `npm install --no-audit --no-fund`
3. `npm run typecheck`
4. `npm run build`

Do **not** mark WEB-FOUND-001 DONE if only the static smoke passes. The real dependency install and Next.js production build are the authoritative source gate.

After the first successful install, commit the generated `package-lock.json`, then change CI from `npm install` to `npm ci` and optionally enable the npm cache in `actions/setup-node`.

## 3. Link the existing Vercel project

Existing project:

- team: `Turbo Lev` (`team_inTDNG4JSRDLL7zhsHaisMS4`)
- project: `turbolev-web` (`prj_Yz7epGYZ2Tt3V7ckzOw60mn76nvd`)

Preferred CLI flow from a clean local clone after GitHub CI is green:

```bash
vercel link --yes --scope turbo-lev --project turbolev-web
vercel git connect
vercel git ls
```

`vercel git connect` is the documented Vercel CLI path for connecting the local Git repository to the linked Vercel project.

## 4. Preview before production

A Git-linked Preview deployment must pass before any production promotion. Verify at minimum:

- `/`
- `/vin`
- `/zapchastyny`
- one category and one product page
- `/koszyk`
- `/oformlennia`
- `/sto`
- `/sto/hlevakha`
- `/poslugy`
- one `/poslugy/[service]`
- `/zapys`
- `/account`
- `POST /api/vehicle/resolve` returns fail-closed 503 + masked identifier + `Cache-Control: no-store`

## 5. Do not activate yet

Connecting Git is not permission to enable production business writes. Keep disabled until their own gates are approved:

- real CRM lead intake
- OIDC Vehicle Resolution Integration API
- supplier writes/publication
- order/reservation/payment writes
- exact product compatibility claims

WEB-FOUND-001 can move from IN PROGRESS only when GitHub CI and the Git-linked Vercel Preview are both green.
