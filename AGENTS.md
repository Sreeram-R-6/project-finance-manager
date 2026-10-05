# AGENTS.md

## Purpose

This repository contains the specification for **Project Finance Manager**, a production-quality responsive web/PWA for collaborative project finance management.

This file defines how Codex/agents must work in this repository.

The detailed implementation specification is in `CODEX_MASTER_PROMPT.md` and the supporting specification files.

---

## Mandatory reading order

Before making architectural or implementation changes, read:

1. `CODEX_MASTER_PROMPT.md`
2. `PRODUCT_SPEC.md`
3. `UX_UI_SPEC.md`
4. `WORKFLOWS.md`
5. `DATA_MODEL.md`
6. `LEDGER_RULES.md`
7. `AUTH_RLS_SECURITY.md`
8. `SUPABASE_SETUP.md`
9. `DOCUMENT_GENERATOR.md`
10. `REPORTING.md`
11. `TESTING_ACCEPTANCE.md`
12. `SEED_DATA.md`
13. `TARGET_REPO_STRUCTURE.md`
14. `SOURCE_NOTES.md`

Treat these files as one combined specification.

If requirements conflict, use this precedence:

1. Security rules and ledger invariants
2. `DATA_MODEL.md`
3. `WORKFLOWS.md`
4. `PRODUCT_SPEC.md`
5. `UX_UI_SPEC.md`
6. Implementation convenience

Do not weaken financial integrity, RLS, auditability, or authorization to make implementation easier.

---

## Autonomous execution

Work autonomously and complete the requested implementation.

Do not stop after:
- scaffolding;
- creating only UI mockups;
- creating database tables without application flows;
- creating frontend flows without RLS;
- creating partial CRUD without tests.

When an external secret is unavailable, complete everything that does not require that secret and document the exact remaining configuration step.

Do not invent:
- Supabase project refs;
- Supabase access tokens;
- service-role keys;
- Google OAuth credentials;
- production domains.

---

## Required technical stack

Unless the existing repository already contains a compatible implementation, use:

- Next.js App Router
- React
- TypeScript with strict mode
- Tailwind CSS
- shadcn/ui
- Supabase PostgreSQL
- Supabase Auth
- Google OAuth
- Supabase Storage
- Supabase CLI
- React Hook Form
- Zod
- TanStack Table
- Recharts
- date-fns
- Lucide icons
- PWA support
- Vitest
- Playwright

Prefer stable, maintainable packages.

Do not add unnecessary frameworks.

---

## Supabase rules

Supabase must be managed through repository code and the Supabase CLI.

Install locally:

```bash
npm install supabase --save-dev
```

Use:

```bash
npx supabase init
npx supabase start
```

All reproducible backend configuration must live in version control, including:

- SQL migrations
- tables
- constraints
- indexes
- functions
- triggers
- RLS policies
- storage buckets
- storage policies
- seed data

Do not instruct the user to manually create database tables or RLS policies in the dashboard.

Remote credentials may require manual configuration, but schema must remain migration-driven.

---

## Financial correctness

### Money

Store authoritative money as integer minor units using `bigint`.

Never use JavaScript floating-point values as the source of truth for money.

### Balance

Do not store a mutable project balance as the source of truth.

Balances must be derived from posted ledger entries.

### Ledger

Posted financial events are immutable.

Posted ledger entries must be append-only.

Corrections must use:
- reversal;
- corrected replacement event;
- audit trail.

Never silently edit or delete posted accounting history.

### Posting

Financial posting must be atomic.

A failed posting operation must not leave partial ledger state.

Use database transactions / RPC functions where appropriate.

### Idempotency

Double-clicking or retrying a post/payment action must not create duplicate financial effects.

### Purchase allocations

For a posted purchase:

```text
sum(funding allocations) == purchase total
```

This is mandatory.

### Personal spending

A member-paid project purchase:
- increases project expense;
- does not reduce project cash;
- increases amount owed to that member.

A reimbursement:
- reduces project cash;
- reduces member payable;
- must not create the expense again.

### Bills

Creating/approving a bill must not reduce project cash.

Cash changes only when a bill payment is posted.

### Advances

Maintain proper issue, reconciliation and return behavior as defined in `LEDGER_RULES.md`.

---

## Security

Enable RLS on every exposed application table.

Authorization must be enforced in the database, not only in React.

Never expose:
- service-role key;
- OAuth client secret;
- private server credentials.

Project data must be isolated between projects.

A user who is not a project member must not be able to access project records through direct Supabase API calls.

Private financial documents must use private Supabase Storage with project-aware access policies.

Avoid `SECURITY DEFINER` unless necessary. If used:
- minimize scope;
- set a safe `search_path`;
- validate caller/project permissions.

---

## Roles

Support:

- OWNER
- ADMIN
- FINANCE_MANAGER
- APPROVER
- MEMBER
- VIEWER

Do not allow client-side role escalation.

Do not allow deletion/demotion of the only project owner.

---

## Architecture

Keep domain logic outside React presentation components.

Preferred separation:

```text
UI components
    ↓
application/service layer
    ↓
validated domain operations
    ↓
Supabase/database posting functions
```

Financial calculations should live in reusable tested utilities/services.

Do not duplicate ledger logic in multiple UI components.

---

## UI requirements

Build responsive desktop and mobile experiences.

Desktop:
- persistent sidebar
- project switcher
- search
- command palette
- usable finance tables
- compact financial hierarchy

Mobile:
- bottom navigation
- prominent quick-add
- receipt-first expense entry
- thumb-friendly controls
- responsive cards/lists instead of unusable wide tables

Design direction:
- clean
- restrained
- modern
- information-dense
- minimal gradients
- no glassmorphism
- no generic AI-dashboard appearance

Support light and dark mode.

---

## Forms

Use:
- React Hook Form
- Zod

Validate:
- client-side for UX;
- server/database-side for integrity.

Do not trust browser input.

Show actionable validation errors.

---

## Database changes

All schema changes require migrations.

Never modify a remote database manually as the canonical change.

After schema changes:
- reset/apply locally;
- regenerate Supabase TypeScript types;
- update tests.

---

## Testing requirements

Before declaring completion, run and fix:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Also test Supabase migrations from a clean local database.

Critical tests must cover:

- project RLS isolation
- role permissions
- ledger immutability
- project-funded purchase
- member-funded purchase
- mixed-funded purchase
- partial reimbursement
- bill partial payment
- refund
- advance lifecycle
- reversal/void
- document storage authorization
- invitation/join behavior

Do not remove failing tests merely to make CI green.

---

## Accessibility

Use semantic HTML and accessible components.

Requirements:
- visible focus states
- keyboard-accessible navigation
- proper form labels
- accessible dialogs/drawers
- text equivalents for chart data
- no status communicated only by color

---

## Performance

Avoid:
- N+1 queries
- loading all transactions at once
- unnecessary client-side rendering
- giant dashboard request waterfalls

Use:
- pagination
- indexed queries
- server rendering where useful
- lazy loading for heavy visualizations
- optimized receipt previews

---

## Documentation

Maintain an application `README.md` containing:

- prerequisites
- install commands
- Supabase local setup
- environment setup
- database reset
- type generation
- Google OAuth setup
- dev command
- tests
- production build
- deployment notes

Keep `.env.example` current.

Never commit real secrets.

---

## Code quality

- TypeScript strict mode
- avoid `any` unless unavoidable and documented
- prefer explicit domain types
- keep functions focused
- avoid giant components
- avoid duplicated finance logic
- use descriptive names
- remove dead code
- do not leave placeholder TODOs for core requirements

Comments should explain non-obvious business or security rules, not restate code.

---

## Completion rule

Do not state that the application is complete until the definition of done in `TESTING_ACCEPTANCE.md` is satisfied.

If something is blocked only by an unavailable external credential, clearly list:
1. what is complete;
2. what exact credential/configuration is missing;
3. the exact final steps the user must perform.

Everything else should be finished.
