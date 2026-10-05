# Project Finance Manager

Responsive Next.js web/PWA using Supabase Auth, PostgreSQL and private Storage. Immutable balanced postings cover project and personal purchases, mixed funding, accrued bills, reimbursements, advances, refunds and corrections. Original specifications remain at the repository root; the original README is preserved in [docs/HANDOFF.md](docs/HANDOFF.md).

## Prerequisites and clean checkout

Node.js 22+, npm, Docker Desktop running Linux containers, and ports 3000, 3001, 54320-54324 available.

```sh
npm ci
npx playwright install chromium
npm run supabase:start
npm run db:reset
node scripts/local-env.mjs
npm run db:types
npm run dev
```

Open http://localhost:3000. The local environment helper copies only the local API URL and public anon key and refuses to overwrite `.env.local`. Alternatively copy `.env.example` and populate public values from `npx supabase status`. Docker must remain running. Studio is on port 54323; local email is on port 54324.

`supabase init` was performed during scaffolding; the configuration is already versioned. The project-local CLI is pinned to 2.75.0 because a newer JavaScript CLI failed to launch on this Windows environment. All reproducible tables, constraints, functions, triggers, RLS, buckets and policies are migrations. Never create canonical tables through the dashboard.

`db:reset` recreates only the local database, applies migrations/seed and checks service health. CLI 2.75 can return a gateway 502 during Storage restart; the wrapper recovers only this exact failure after independently verifying migrations and seed. SQL failures remain failures.

## Local demo

The local environment helper enables a development-only password form. These are real local Supabase Auth accounts with RLS:

| Email | Aurora role |
|---|---|
| alex@example.test | Owner |
| maya@example.test | Finance manager |
| tina@example.test | Approver |
| rahul@example.test | Member |
| viewer@example.test | Viewer |
| outside@example.test | Separate Weather project only |

Local-only password: `LocalDemo-Only-2026!`. Never apply `supabase/seed.sql` to production. The password form is disabled in production regardless of `LOCAL_DEMO_AUTH`.

Aurora seed: cash INR 98,400; recognized expense INR 66,200; member payable INR 2,200; unpaid bills INR 12,400; advance INR 0; available INR 83,800.

## Environment and Google OAuth

Public settings: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Keep `LOCAL_DEMO_AUTH=false` for the hosted project. No service-role key is needed. OAuth secrets must never use a `NEXT_PUBLIC_` name.

1. Create a Google Cloud Web OAuth client and configure its consent screen/test users.
2. Google authorized redirect URI locally: `http://127.0.0.1:54321/auth/v1/callback` for the standard stack, or `http://127.0.0.1:55321/auth/v1/callback` for this checkout's alternate runtime. Set `http://localhost:3000` as an authorized JavaScript origin. Hosted: use the exact callback shown in that project's Google provider settings, typically `https://<PROJECT_REF>.supabase.co/auth/v1/callback`.
3. To configure this checkout's ignored local runtime from a downloaded Google Web OAuth JSON file, run `./scripts/configure-local-google-auth.ps1 -ClientJsonPath 'C:/path/to/client_secret.json'`, then `npx supabase stop --workdir .local-runtime` and `npx supabase start --workdir .local-runtime`. The script keeps the client secret only in the ignored local configuration. The checked-in default remains disabled so a fresh clone starts without credentials.
4. Hosted: enable Google in Supabase Auth with real credentials, set Auth Site URL to the deployment origin, and allow `<APP_ORIGIN>/auth/callback`. The local app callback is `http://localhost:3000/auth/callback`.
5. Set the application's actual public URL/key, rebuild/restart, then use **Continue with Google**. The app exchanges the PKCE code and validates the redirect path.
6. Verify first-time profile creation, returning sessions, logout, matching-email invite acceptance and direct API project isolation with real users.

The Google Web client, hosted Supabase project and CLI access token were supplied for this checkout. A production app domain and its matching Auth redirects still need to be chosen before deployment.

### Connected hosted development project

This checkout is linked through the CLI to Supabase project `httkdzvonkupukjlfwxf`. The ignored `.env.local` selects its hosted URL and publishable key. All 14 checked-in migrations are applied there, with no demo seed. The hosted Google provider is enabled and permits `http://localhost:3000/auth/callback`. In Google Cloud Console, this OAuth Web client must also authorize `https://httkdzvonkupukjlfwxf.supabase.co/auth/v1/callback` as a redirect URI; add your Google address under Test users while the consent screen is in Testing mode. The local runtime has its own callback on port 55321.

The previous local environment is backed up in ignored `.env.local.local-stack`. Restore that file to `.env.local` before running data-creating tests against local Supabase. `npm test`, `npm run test:e2e`, and `npm run test:pwa` refuse to run when `.env.local` selects a hosted URL.

Project-scoped Supabase MCP settings are in `.codex/config.toml`. They use the hosted server with project scope, read-only mode and OAuth login, so no personal access token is stored in the repository. The CLI link and migrations use the local Supabase CLI installation.

## Migrations and verification

```sh
npx supabase migration new descriptive_change
npm run db:reset
npm run db:types
npm run lint
npm run typecheck
npm run test:db
npm test
npm run test:e2e
npm run build
npm run test:pwa
```

Generated types: `src/types/database.generated.ts`. Tests create additional isolated projects; reset to restore the demo. E2E uses development port 3000; PWA tests launch the production build on port 3001. Keep 3001 free. On Linux, install browser OS dependencies with `npx playwright install --with-deps chromium`. CI is in `.github/workflows/ci.yml`.

## PWA, documents and deployment

The PWA requires HTTPS outside localhost. The worker caches the offline form, static assets and icons, never private API responses or authenticated financial pages. Drafts/receipts stay in user-scoped IndexedDB until explicit online review/submission. Offline actions never post money. Logout clears local drafts and project preferences.

Nine system letter types and project custom templates produce sanitized HTML snapshots, references, amount-in-words and exact source tables. PDF generation uses Chromium in a Node runtime with outbound requests blocked. PDFs can be saved in private project Storage. Deploy to a compatible Node/container host with Chromium and its OS dependencies; an Edge-only runtime cannot render these PDFs.

```sh
npx supabase login
npx supabase link --project-ref <ACTUAL_PROJECT_REF>
npx supabase db push
npm run build
npm run start
```

Do not pass `--include-seed` in production. Schema/RLS/buckets come from migrations; provider credentials and deployment redirects are external configuration. Install Chromium on the host, configure backups, and complete [docs/VERIFICATION.md](docs/VERIFICATION.md) before release. Hosted Google OAuth and deployment remain unverified until configured.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for accounting and authorization decisions.

See [docs/UI_REDESIGN.md](docs/UI_REDESIGN.md) for the presentation system, route coverage and verification. On this Windows checkout, reserved ports require the preserved local Supabase stack to run with `npx supabase start --workdir .local-runtime`; the API is on port 55321 and `.env.local` matches it. The canonical configuration still uses the standard ports.
