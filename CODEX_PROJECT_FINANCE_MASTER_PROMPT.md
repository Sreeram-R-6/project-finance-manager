# MASTER CODEX PROMPT — BUILD THE COMPLETE APPLICATION

You are Codex working inside a repository. Build the entire production-quality application described in this repository.

## 0. Mandatory first action

Before writing code, read every specification file in this folder:

1. README.md
2. PRODUCT_SPEC.md
3. UX_UI_SPEC.md
4. WORKFLOWS.md
5. DATA_MODEL.md
6. LEDGER_RULES.md
7. AUTH_RLS_SECURITY.md
8. SUPABASE_SETUP.md
9. DOCUMENT_GENERATOR.md
10. REPORTING.md
11. TESTING_ACCEPTANCE.md
12. SEED_DATA.md
13. ENV_EXAMPLE.txt
14. SOURCE_NOTES.md

Treat them as one combined specification.

If there is a conflict:
1. security and ledger invariants win;
2. then DATA_MODEL and WORKFLOWS;
3. then PRODUCT_SPEC;
4. then UX/UI details.

Do not stop after scaffolding. Implement the complete usable application.

---

# 1. Product

Build a mobile-first responsive PWA called **Project Finance Manager**.

It is a project-centric finance platform for collaborative teams managing money across engineering projects, grants, competitions, research projects, college clubs and similar work.

Core capabilities:

- create/manage projects;
- set opening balances;
- maintain multiple funding sources;
- add credits, debits and transfers;
- record purchases and itemized invoices;
- upload receipts and invoices;
- know exactly what was purchased, when, where, and by whom;
- know who actually paid for every transaction;
- support project funds, personal funds, advance funds and mixed funding;
- automatically create reimbursement obligations when members spend personal money;
- support full/partial reimbursement;
- maintain member balances;
- manage bills, due dates, partial payments and overdue status;
- purchase requests and approval workflows;
- budget categories and utilization;
- vendor management;
- project asset register;
- advances and settlement;
- refunds linked to source purchase;
- comments/activity;
- audit log;
- reports and exports;
- generate one-click letters/documents from templates;
- Google OAuth;
- project membership/invites;
- role-based permissions;
- Supabase RLS;
- responsive desktop/mobile;
- installable PWA;
- local-first development through Supabase CLI.

---

# 2. Non-negotiable engineering constraints

## Financial integrity

Never use a mutable project balance as the accounting source of truth.

Use an append-only double-entry-inspired project ledger.

Every financial event must emit ledger entries in one database transaction.

Examples:
- funding received;
- project-funded purchase;
- member-funded purchase;
- reimbursement;
- bill payment;
- refund;
- advance issue;
- advance return;
- transfer;
- manual adjustment.

Never silently delete posted financial events.

Use statuses such as draft/posted/voided and reversal entries.

Once an event is posted:
- edits that affect money should create correction/reversal + new entries;
- retain the original audit trail.

Store money using integer minor units:
- `amount_minor bigint`
- default INR currency;
- never use JS floating-point arithmetic for money.

## Security

- Enable RLS on every exposed application table.
- Policies must enforce project membership and role permissions at the database layer.
- Never rely only on hidden UI controls for authorization.
- Never expose service-role keys to the browser.
- Private receipts/documents must live in private Supabase Storage.
- Storage object policies must check project membership.
- Validate every privileged server operation again server-side.
- Avoid SECURITY DEFINER unless necessary; if used, lock down `search_path`.

## Supabase

Install Supabase CLI locally as a dev dependency.

Use:
- `npm install supabase --save-dev`
- `npx supabase init`
- migrations under `supabase/migrations/`
- `supabase/seed.sql`
- generated TypeScript DB types

Do not instruct the user to manually create schema objects through the Supabase dashboard.

All schema, indexes, functions, triggers, constraints, buckets and storage policies must be reproducible from repository code/migrations.

Google Cloud OAuth credentials still require human-provided secrets/configuration. Provide exact documented setup notes and `.env.example`; never invent credentials.

---

# 3. Frontend stack

Use:

- latest stable Next.js App Router compatible with the installed environment
- React
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- Lucide icons
- React Hook Form
- Zod
- TanStack Table
- Recharts
- date-fns
- PWA manifest/service worker using a stable compatible approach
- server components where useful
- client components only where interactivity requires them

Prefer boring, maintainable dependencies over experimental ones.

---

# 4. Visual quality

Do not create generic AI-dashboard visual clutter.

Visual direction:
- clean, modern, neutral;
- Linear-style interaction density;
- Ramp-style financial hierarchy;
- Splitwise-like human readable balances;
- crisp typography;
- mostly neutral surfaces;
- restrained accent color;
- no giant gradients;
- no glassmorphism;
- no cartoon finance illustrations;
- no excessive cards;
- tables and timelines should be genuinely usable.

Desktop:
- persistent sidebar;
- page header;
- quick-add action;
- dense but readable tables.

Mobile:
- bottom navigation;
- floating/central add button;
- thumb-friendly controls;
- receipt capture first-class;
- sheets/drawers instead of desktop modal assumptions where appropriate.

Support light/dark mode.

---

# 5. Pages to implement

Public:
- `/`
- `/login`
- `/auth/callback`

Authenticated:
- `/app`
- `/app/projects`
- `/app/projects/new`
- `/app/projects/[projectId]`
- `/app/projects/[projectId]/transactions`
- `/app/projects/[projectId]/purchases`
- `/app/projects/[projectId]/purchases/new`
- `/app/projects/[projectId]/bills`
- `/app/projects/[projectId]/reimbursements`
- `/app/projects/[projectId]/requests`
- `/app/projects/[projectId]/people`
- `/app/projects/[projectId]/budgets`
- `/app/projects/[projectId]/vendors`
- `/app/projects/[projectId]/assets`
- `/app/projects/[projectId]/documents`
- `/app/projects/[projectId]/reports`
- `/app/projects/[projectId]/activity`
- `/app/projects/[projectId]/settings`
- `/app/inbox`
- `/app/profile`

Implement appropriate nested/detail pages and edit routes as required.

---

# 6. Project dashboard

Show:

- total funding received;
- project cash balance;
- available-to-spend;
- total spent;
- committed/approved spend;
- unpaid bills;
- reimbursements owed to members;
- advances outstanding;
- current-month spend;
- budget utilization;
- recent activity;
- pending approvals;
- finance issues;
- spending by category chart;
- monthly spend chart;
- member balances;
- upcoming bills.

Important:
`available_to_spend` is not necessarily equal to cash balance.

Make the distinction explicit.

---

# 7. Global quick-add

Implement a context-aware `+ Add` action.

Options:
- Purchase
- Bill
- Credit / Funding
- Debit / Expense
- Personal Expense
- Reimbursement
- Transfer
- Refund
- Advance
- Purchase Request

The selected project should be remembered when launched from within a project.

---

# 8. Purchases

Purchase form fields:
- project
- vendor
- purchase date
- merchant invoice number
- itemized purchase lines
- quantity
- unit
- unit price
- tax
- discount
- shipping
- total
- currency
- category
- tags
- purpose/notes
- purchased by
- funding allocation(s)
- payment method
- transaction reference
- attachments
- asset checkbox per applicable item
- linked purchase request
- approval metadata

Funding allocation must support:
- project account;
- one member's personal funds;
- multiple members;
- advance;
- sponsor/external source;
- mixed split.

If a member personally funds part of a valid project expense, create reimbursement payable automatically.

---

# 9. Reimbursements

States:
- draft
- submitted
- needs_info
- approved
- rejected
- payment_pending
- partially_paid
- paid
- voided

Support:
- reimburse a single expense;
- aggregate several eligible expenses;
- partial payments;
- payment references;
- attachments;
- approval;
- remaining balance;
- history.

A member-funded purchase should create a reimbursement entitlement, not reduce project cash until reimbursement payment is actually made.

---

# 10. Bills

Bills are liabilities, not automatically cash transactions.

Fields/status:
- vendor
- invoice
- issue date
- due date
- line items
- tax
- amount
- attachment
- approval
- draft
- pending approval
- approved
- unpaid
- partially paid
- paid
- overdue
- cancelled

Posting a bill creates/updates committed or payable state.
Cash ledger changes only when payments are posted.

Support multiple payments against one bill.

---

# 11. Advances

Support:
- advance issued to member;
- member spends from advance;
- receipts attached;
- remaining balance;
- return unused funds;
- approved additional advance;
- close settlement.

Track:
- issued;
- documented;
- remaining;
- returned;
- overspent;
- reimbursable overspend.

---

# 12. Purchase requests / approvals

A purchase request includes:
- requester;
- project;
- item(s);
- estimated amount;
- reason;
- vendor suggestion;
- attachments/quotation;
- desired date.

Approval policies may depend on:
- amount thresholds;
- category;
- project role;
- request type.

Implement at least:
- no approval below configurable threshold;
- single approver;
- sequential multi-approver.

Actual purchase can be linked to approved request and show:
- approved budget;
- actual spend;
- variance.

---

# 13. People and roles

Project roles:
- OWNER
- ADMIN
- FINANCE_MANAGER
- APPROVER
- MEMBER
- VIEWER

Implement invites by email/link.

Invited user joins after authentication.

Membership page shows:
- role;
- joined date;
- personal spend;
- reimbursement outstanding;
- advance outstanding;
- recent project activity.

Owner transfer must be explicit and safe.

Prevent removal of the only owner.

---

# 14. Authentication

Implement Supabase Auth with:
- Google OAuth;
- session handling for Next.js;
- protected app routes;
- sign out;
- profile creation/update;
- avatar/name/email pulled from auth metadata where available.

Provide a local-development auth fallback/documented approach if Google OAuth cannot be used against localhost without configuring credentials.

---

# 15. Storage

Private buckets:
- `project-documents`
- `avatars` can be public or private according to implementation choice

Path convention:
`projects/{project_id}/{document_type}/{uuid}-{safe_filename}`

Store document metadata in DB.

Document types include:
- receipt
- invoice
- quotation
- purchase_order
- payment_proof
- warranty
- approval_document
- generated_letter
- report
- other

Enforce MIME/size restrictions.

---

# 16. Search and filters

Implement global/project search over:
- projects
- purchases/items
- vendors
- members
- bills
- assets
- document numbers
- transaction references

Filters:
- date range
- project
- member
- vendor
- category
- tag
- amount range
- payment source
- reimbursement status
- approval status
- receipt presence
- bill status

Persist filters in URL query params where useful.

---

# 17. Activity and audit

Business activity feed:
- purchase created
- bill submitted
- expense approved
- reimbursement paid
- member added
- funding received
- request approved
- document generated

Audit log:
- actor
- action
- entity
- before snapshot if safe
- after snapshot if safe
- timestamp
- reason
- request correlation id where practical

Do not place sensitive auth secrets in audit payloads.

---

# 18. Budgets

Allow project-level budget categories.

Fields:
- category
- planned amount
- warning threshold
- optional hard-stop flag

Show:
- actual
- committed
- remaining
- utilization %

Warnings:
- 80%
- 90%
- 100%
or project-configurable.

---

# 19. Vendors

Vendor profile:
- name
- GSTIN/tax id optional
- contact person
- email
- phone
- website
- address
- notes

Show aggregate purchases and linked bills.

---

# 20. Assets

Allow purchase items to be capitalized/marked as assets.

Asset fields:
- asset name
- linked purchase item
- serial number
- internal asset tag
- assigned member
- status
- purchase date
- purchase value
- warranty expiry
- location
- notes

Statuses:
- available
- assigned
- repair
- retired
- lost

---

# 21. Refunds

A refund must link to an original financial event/purchase when applicable.

Show:
- gross purchase;
- refunds;
- net cost.

Create correct reversing/credit ledger movement.

---

# 22. Recurring expenses

Support recurring templates for:
- software
- cloud
- domains
- mobile/SIM
- subscriptions
- routine project expenses

Do not auto-post destructive monetary events without visibility.
Generate due/upcoming entries or drafts unless implementation has a safe explicit posting model.

---

# 23. Document generator

Implement template-driven one-click documents described in DOCUMENT_GENERATOR.md.

Must support at least:
- Reimbursement Request
- Fund Request
- Purchase Approval
- Expense Statement
- Project Financial Summary
- Vendor Payment Request
- Advance Request
- Fund Utilization Statement
- Custom Template

Use placeholders and selected records.

Output:
- print-ready HTML;
- PDF download using a stable server/browser-compatible solution;
- save generated document metadata and optionally file in Supabase Storage.

Do not hardcode user-specific names.

---

# 24. Reports

Implement reports in REPORTING.md.

At minimum:
- project statement;
- expense report;
- member spend/reimbursement report;
- vendor report;
- budget report;
- bill register;
- asset register;
- reimbursement report;
- funding report;
- audit report.

Exports:
- CSV;
- print/PDF;
- XLSX if a reliable dependency is used.

---

# 25. PWA

Implement:
- manifest;
- app icons placeholders or generated simple app marks;
- installability;
- offline-friendly application shell;
- local draft support for expense entry where reasonable.

At minimum:
- user can begin/create a purchase/receipt draft offline;
- draft is stored client-side;
- sync occurs once online after explicit review.

Do not fake full offline accounting synchronization.

---

# 26. Database

Implement the schema in DATA_MODEL.md and invariants in LEDGER_RULES.md.

Use:
- UUID primary keys;
- timestamptz;
- created_at/updated_at;
- generated-safe enums or check constraints;
- foreign keys;
- indexes;
- unique constraints;
- database functions/triggers for invariant enforcement where appropriate.

Use SQL migrations, not ORM-only schema.

Generate TypeScript types from Supabase after migration.

---

# 27. Seed

Create realistic seed data:
- at least 3 users/profiles;
- 2 projects;
- multiple members;
- funding;
- project-funded purchase;
- personal-funded purchase;
- reimbursement;
- bill;
- purchase request;
- budget;
- vendor;
- asset;
- document metadata;
- activity.

Seed must make dashboards useful immediately.

---

# 28. Tests

Implement all critical tests described in TESTING_ACCEPTANCE.md.

Particularly:
- RLS isolation between projects;
- viewer cannot mutate;
- member cannot administer project;
- finance role can perform expected finance actions;
- amount calculations;
- reimbursement creation;
- partial reimbursements;
- void/reversal behavior;
- bill does not change cash until paid;
- mixed funding allocation totals;
- invitation/join flow;
- document storage authorization.

Use database-level tests where practical and Playwright for key browser flows.

---

# 29. Error handling

No raw Supabase errors exposed to normal users.

Provide:
- human-readable inline validation;
- retry behavior;
- destructive confirmations;
- empty states;
- loading skeletons;
- permission denied views;
- not found views.

Use error boundaries where appropriate.

---

# 30. Accessibility

- semantic HTML;
- keyboard navigation;
- visible focus;
- proper labels;
- accessible dialogs/drawers;
- sufficient contrast;
- charts must have textual summaries;
- no information conveyed only by color.

---

# 31. Performance

- paginate large transaction lists;
- use database indexes;
- avoid N+1 query patterns;
- server-render first useful data where beneficial;
- lazy load heavy report/chart components;
- optimize receipt thumbnails.

---

# 32. Repository quality

Include:
- `.env.example`
- `README.md` for actual app setup
- migrations
- seed
- scripts
- lint
- typecheck
- tests
- build script

Provide npm scripts such as:
- dev
- build
- lint
- typecheck
- test
- test:e2e
- supabase:start
- supabase:stop
- db:reset
- db:types

---

# 33. Execution order

Work autonomously in this order:

1. inspect environment and existing repo;
2. scaffold app if needed;
3. install dependencies;
4. install/init Supabase CLI;
5. design migrations;
6. implement RLS/storage policies;
7. seed database;
8. generate TS DB types;
9. implement auth;
10. implement app shell/navigation;
11. implement project CRUD/membership;
12. implement ledger/services;
13. implement purchases;
14. implement reimbursements;
15. implement bills;
16. implement requests/approvals;
17. implement budgets/vendors/assets;
18. implement documents/reports;
19. implement dashboard/search/activity;
20. implement PWA/offline draft;
21. implement tests;
22. lint/typecheck/test/build;
23. fix failures until clean;
24. provide final concise setup instructions.

Do not stop to ask the user questions unless a genuine external secret is required.
Use sensible defaults from the specification.

---

# 34. External secrets that Codex must not invent

The only expected manual values are things like:
- remote Supabase project credentials/URL;
- Google OAuth client ID/secret;
- production domain/callback URLs.

Everything else should be automated in the repository.

---

# 35. Definition of done

Do not call the project complete unless:

- app runs;
- local Supabase starts;
- migrations apply from empty state;
- seed succeeds;
- Google auth integration code exists;
- project creation works;
- member permissions work;
- purchase posting works;
- member-pocket purchase creates reimbursement obligation;
- reimbursement payment posts correct ledger effects;
- bills support partial payments;
- reports load;
- letters generate;
- receipt upload is private;
- RLS tests prove project isolation;
- responsive mobile layout is usable;
- PWA is installable;
- lint passes;
- typecheck passes;
- tests pass;
- production build passes.

If one item cannot be completed due to an unavailable external credential, leave code complete, document the exact manual credential step, and complete everything else.
