# Release verification

## Local results

Verified locally on 2026-10-05:

| Gate | Result |
| --- | --- |
| Clean Supabase reset | All 14 migrations and seed applied; Auth, REST and Storage healthy |
| Generated database types | Regenerated; TypeScript strict check passed |
| Lint | No errors; one TanStack Table compiler compatibility warning; table opts out of compiler memoization |
| Database tests | 15 pgTAP assertions passed |
| Unit and integration tests | 31 tests passed |
| Browser workflows | 4 desktop/mobile workflow and presentation tests passed, including accessibility, receipts, partial payments and PDF downloads |
| Production build | Passed |
| Production PWA | 2 desktop/mobile offline tests passed |
| Production dependency audit | No vulnerabilities |
| PDF layout review | Reimbursement letter and all three finance-pack pages rendered and visually inspected |
| Responsive redesign | 294 production layout checks passed: 42 routes/states at seven viewports; 77 affected checks repeated after final refinements |

The redesign preserved the existing local database. Tests create isolated projects; the final UI pass did not reset user data. The original Aurora seed expects cash INR 98,400.00, expense INR 66,200.00, member payable INR 2,200.00, bill payable INR 12,400.00, advances zero and available INR 83,800.00. Existing additional purchases can change these live values. Money remains derived from posted ledger entries in integer paise.

The viewport sweep used 360x800, 390x844, 430x932, 768x1024, 1366x768, 1440x900 and 1920x1080. It checked document overflow, application error boundaries and browser errors. Visual review also covered light/dark themes, mobile entry and payment details. See [UI_REDESIGN.md](UI_REDESIGN.md) for scope and evidence.

Browser and integration tests cover real local Supabase Auth and database authorization. They do not establish hosted Google OAuth, deployment, physical-device installation or a completed remote CI run. Development-only dependency audit findings remain in the Next.js ESLint dependency chain; the production audit is clean.

## Hosted checks requiring real configuration

- Link actual Supabase project; apply migrations without demo seed.
- Supply public deployment settings, Google credentials, Auth Site URL, callback allowlist and HTTPS origin.
- Sign in with two real Google accounts; verify profile, refresh and logout.
- Accept matching-email invite once; reject another email/reused/revoked token.
- Test direct REST/RPC project isolation and private Storage authorization.
- Check role escalation, finance permissions, assigned approvals and sole-owner protection.
- Exercise purchases, mixed funding, partial reimbursements/bills, refunds, advances and reversal; compare exact ledger/report/document totals.
- Confirm Chromium PDF support on the actual deployment host and private file upload/download.
- Install on an actual mobile device; save a receipt offline, reconnect, review/submit explicitly, and verify no duplicate effect.
- Check keyboard/screen reader, dark/light themes, mobile quick-add and chart alternatives.
- Configure backups/restore, monitoring and secret handling.

Hosted deployment and a completed Google sign-in remain unverified. The Google Cloud OAuth client must authorize the hosted Supabase callback, and a Google test user must complete the browser flow. The local demo uses real local Auth/RLS rather than an authorization bypass.

## Hosted Supabase setup (2026-10-05)

The repository is linked to project `httkdzvonkupukjlfwxf`. All 14 migrations were pushed without seed data; a subsequent dry run reported the remote database up to date. A read-only management query confirmed 0 projects, 0 Auth users, and RLS enabled on all 42 public application tables. The `avatars` and `project-documents` Storage buckets are private. Hosted Google Auth is enabled with the supplied Web client, and its app redirect is set to `http://localhost:3000/auth/callback`.

The current `.env.local` targets the hosted project using its publishable key. Local data-creating test scripts deliberately reject hosted URLs. The hosted Google sign-in flow redirects to Google with `https://httkdzvonkupukjlfwxf.supabase.co/auth/v1/callback`; this exact callback must be authorized in Google Cloud Console before end-to-end Google login can pass. The previous local `.env.local` is backed up in ignored `.env.local.local-stack`.
