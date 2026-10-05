# Data Model

Use PostgreSQL through Supabase migrations.

## Conventions

- UUID primary keys
- `created_at timestamptz not null default now()`
- `updated_at timestamptz`
- user/profile references use `auth.users.id`
- money fields use `bigint` minor units
- currency uses uppercase ISO string, e.g. `INR`
- preserve auditability
- prefer explicit foreign keys
- index all common project/date/status foreign keys

## Core tables

### profiles
- id uuid PK -> auth.users.id
- full_name text
- avatar_url text
- email text
- locale text
- timezone text

### projects
- id
- name
- code
- description
- currency
- status
- start_date
- expected_end_date
- created_by
- closed_at

Do not store mutable source-of-truth balance.

### project_members
- id
- project_id
- user_id
- role enum/text
- joined_at
- is_active
Unique(project_id, user_id)

### project_invites
- id
- project_id
- email
- role
- token_hash
- expires_at
- invited_by
- accepted_at
- revoked_at

### funding_sources
- id
- project_id
- name
- type
- sanctioned_amount_minor nullable
- currency
- notes

### financial_accounts
- id
- project_id
- name
- account_type
- owner_user_id nullable
- currency
- is_active

Types may include:
CASH, BANK, WALLET, MEMBER_PAYABLE, ADVANCE, EXTERNAL, CLEARING.

### financial_events
Represents human/business event.

- id
- project_id
- event_type
- status: DRAFT/POSTED/REVERSED/VOIDED
- event_date
- description
- reference_number
- created_by
- posted_by
- posted_at
- reverses_event_id nullable
- metadata jsonb

### ledger_entries
Append-only accounting movements.

- id
- project_id
- financial_event_id
- account_id
- direction enum DEBIT/CREDIT OR signed_amount strategy
- amount_minor positive bigint
- currency
- memo
- created_at

Pick one coherent convention and document it in code.
Each posted financial event must balance according to LEDGER_RULES.md.

### transactions
Optional user-facing normalized transaction record.
Could be a projection over financial_events; if table is used:
- id
- project_id
- financial_event_id unique
- transaction_type
- transaction_date
- payee/payor text
- amount_minor
- currency
- status

### categories
- id
- project_id nullable for defaults
- name
- kind
- is_active

### tags
- id
- project_id
- name
Unique(project_id, name)

## Vendors

### vendors
- id
- project_id
- name
- gstin
- contact_person
- email
- phone
- website
- address
- notes

## Purchases

### purchases
- id
- project_id
- vendor_id
- purchase_date
- invoice_number
- status
- subtotal_minor
- tax_minor
- shipping_minor
- discount_minor
- total_minor
- currency
- category_id
- purchased_by_user_id
- notes
- linked_request_id
- financial_event_id nullable until posted
- created_by

### purchase_items
- id
- purchase_id
- description
- sku
- quantity numeric
- unit
- unit_price_minor
- tax_minor
- discount_minor
- line_total_minor
- category_id nullable
- mark_as_asset boolean

### purchase_funding_allocations
- id
- purchase_id
- source_type PROJECT_ACCOUNT/MEMBER/ADVANCE/EXTERNAL
- project_account_id nullable
- member_user_id nullable
- advance_id nullable
- amount_minor
- currency

Constraint/business validation:
sum allocation amount == purchase total.

## Reimbursements

### reimbursement_claims
- id
- project_id
- claimant_user_id
- status
- requested_minor
- approved_minor
- paid_minor
- currency
- submitted_at
- approved_at
- notes

### reimbursement_claim_items
Links claim to member-funded purchase allocations.
- id
- reimbursement_claim_id
- purchase_funding_allocation_id
- eligible_minor
- claimed_minor

### reimbursement_payments
- id
- reimbursement_claim_id
- project_account_id
- amount_minor
- paid_at
- payment_method
- reference
- financial_event_id
- paid_by_user_id

## Bills

### bills
- id
- project_id
- vendor_id
- invoice_number
- issue_date
- due_date
- status
- subtotal_minor
- tax_minor
- total_minor
- currency
- category_id
- notes
- approval_request_id nullable

### bill_items
Similar to purchase_items.

### bill_payments
- id
- bill_id
- project_account_id
- paid_at
- amount_minor
- method
- reference
- financial_event_id

## Purchase requests / approvals

### purchase_requests
- id
- project_id
- requester_user_id
- title
- reason
- estimated_minor
- currency
- preferred_vendor_id nullable
- desired_by_date
- status
- created_at
- approved_at

### purchase_request_items
- id
- request_id
- description
- quantity
- estimated_unit_minor
- estimated_total_minor

### approval_policies
- id
- project_id
- name
- entity_type
- is_active
- priority
- rule_json

### approval_instances
- id
- project_id
- entity_type
- entity_id
- policy_id
- status
- created_at
- completed_at

### approval_steps
- id
- approval_instance_id
- step_order
- approver_user_id nullable
- approver_role nullable
- status
- decided_by
- decided_at
- comment

## Advances

### advances
- id
- project_id
- member_user_id
- issued_minor
- currency
- status
- purpose
- issued_at
- project_account_id
- financial_event_id

### advance_expense_links
- id
- advance_id
- purchase_funding_allocation_id
- amount_minor

### advance_returns
- id
- advance_id
- amount_minor
- returned_at
- financial_event_id
- reference

## Budgets

### budgets
- id
- project_id
- name
- start_date
- end_date
- status

### budget_lines
- id
- budget_id
- category_id
- planned_minor
- warning_percent
- hard_stop boolean

Actual and committed values should be derived.

## Assets

### assets
- id
- project_id
- purchase_item_id nullable
- name
- serial_number
- asset_tag
- assigned_user_id nullable
- status
- purchase_value_minor
- currency
- purchase_date
- warranty_expires_at
- location
- notes

## Attachments/Documents

### documents
- id
- project_id
- entity_type
- entity_id
- document_type
- storage_bucket
- storage_path
- original_filename
- mime_type
- size_bytes
- uploaded_by
- created_at
- checksum nullable

Do not use entity_id without validation helpers; RLS/storage authorization must map safely to project.

## Comments

### comments
- id
- project_id
- entity_type
- entity_id
- author_user_id
- body
- created_at
- edited_at
- deleted_at

## Notifications

### notifications
- id
- user_id
- project_id nullable
- type
- title
- body
- entity_type
- entity_id
- read_at
- created_at

## Document templates

### document_templates
- id
- project_id nullable
- template_type
- name
- subject_template
- body_template
- is_system_template
- created_by
- updated_at

### generated_documents
- id
- project_id
- template_id
- generated_by
- entity_type
- entity_id
- rendered_html
- storage_document_id nullable
- generated_at

## Audit

### audit_logs
- id
- project_id nullable
- actor_user_id nullable
- action
- entity_type
- entity_id
- before_data jsonb
- after_data jsonb
- reason
- correlation_id
- created_at

## Activity

### activity_events
- id
- project_id
- actor_user_id
- type
- entity_type
- entity_id
- summary
- metadata jsonb
- created_at

## Recurring templates

### recurring_expense_templates
- id
- project_id
- vendor_id nullable
- description
- amount_minor nullable
- currency
- category_id
- recurrence_rule
- next_due_date
- active

Prefer generating drafts/upcoming reminders over autonomous posting.

## Useful DB functions/views

Implement safe helper functions such as:
- `is_project_member(project_id, user_id)`
- `has_project_role(project_id, allowed_roles[])`
- `project_cash_balance(project_id)`
- `member_reimbursement_outstanding(project_id, user_id)`
- `bill_outstanding(bill_id)`
- `advance_outstanding(advance_id)`

Views/materialized views only when they improve query clarity/performance:
- project_finance_summary
- member_balances
- budget_actuals
- bill_balances
- reimbursement_balances

Security-sensitive views must use appropriate security semantics and RLS behavior.
