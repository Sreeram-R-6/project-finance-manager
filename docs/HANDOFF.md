# Project Finance Manager — Codex Handoff Kit

This package is a complete product/engineering specification for Codex to build a responsive project-finance web application/PWA.

## Goal

Build a project-centric finance system for student teams, research projects, clubs, engineering teams, grants, competitions and small collaborative projects.

The application must handle:

- Multiple projects
- Opening balances and funding sources
- Credits and debits
- Purchases and line items
- Bills and bill payments
- Personal-pocket expenses
- Reimbursements
- Advances
- Purchase requests and approvals
- Project members and roles
- Google authentication
- Receipt/invoice/document storage
- Vendors
- Project assets
- Budgets
- Audit trails
- Financial reporting
- One-click letters and finance documents
- Responsive mobile and desktop UX
- PWA installation
- Supabase CLI-based local and production workflow

## Important architectural rule

Do **not** store a mutable `project.balance` as the source of truth.

All monetary movement must be represented by immutable/append-only ledger entries. Current balances are derived from the ledger.

## Recommended stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase PostgreSQL
- Supabase Auth
- Google OAuth
- Supabase Storage
- Supabase Realtime where beneficial
- Supabase Edge Functions only where server-side privileged operations are genuinely required
- Supabase CLI
- React Hook Form
- Zod
- TanStack Table
- TanStack Query where useful
- Recharts
- Lucide icons
- date-fns
- PWA support
- Vitest
- Playwright

## Start here

Give Codex the entire folder and then use:

`CODEX_MASTER_PROMPT.md`

That prompt explicitly instructs Codex to read all other files before writing code.

## Files

- `CODEX_MASTER_PROMPT.md` — single master instruction to Codex
- `PRODUCT_SPEC.md` — product scope and features
- `UX_UI_SPEC.md` — screens, layout, components, mobile behavior and design direction
- `WORKFLOWS.md` — exact business workflows
- `DATA_MODEL.md` — entities and database relationships
- `LEDGER_RULES.md` — accounting/ledger invariants
- `AUTH_RLS_SECURITY.md` — authentication, roles, permissions and RLS requirements
- `SUPABASE_SETUP.md` — Supabase CLI and repo workflow
- `DOCUMENT_GENERATOR.md` — one-click letters/documents
- `REPORTING.md` — dashboards, metrics, exports and reports
- `TESTING_ACCEPTANCE.md` — required tests and definition of done
- `SEED_DATA.md` — useful local/demo data
- `ENV_EXAMPLE.txt` — environment variable template
- `SOURCE_NOTES.md` — current-source implementation notes

## Product philosophy

The application should feel like a combination of:

- Splitwise for people balances and settlement clarity
- Ramp/Expensify for expense capture, receipts, approval and reimbursement flows
- Lightweight project accounting for budgets, funding, bills and auditability
- Linear for interaction quality, information density, command palette and keyboard-friendly desktop UX

Do not clone any product's exact visual design.
