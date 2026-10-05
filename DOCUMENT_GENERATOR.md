# One-Click Document Generator

## Goal

Generate professional letters/statements using project financial data without repeatedly typing the same information.

## Template model

Templates contain:
- name
- type
- optional subject
- HTML/structured body template
- placeholders
- optional repeating tables

## Required document types

1. Reimbursement Request
2. Fund Request
3. Purchase Approval
4. Expense Statement
5. Project Financial Summary
6. Vendor Payment Request
7. Advance Request
8. Fund Utilization Statement
9. Custom Template

## Placeholder examples

Project:
- `{{project.name}}`
- `{{project.code}}`
- `{{project.start_date}}`
- `{{project.available_balance}}`

Member:
- `{{member.name}}`
- `{{member.email}}`

Financial:
- `{{amount}}`
- `{{amount_words}}`
- `{{reimbursement.total}}`
- `{{funding.received}}`

Document:
- `{{today}}`
- `{{reference_number}}`

Vendor:
- `{{vendor.name}}`
- `{{vendor.gstin}}`

## Repeating table

Templates should support at least one structured repeating section for selected expenses.

Example generated table columns:
- Sl
- Date
- Item
- Vendor
- Bill No.
- Amount

## Generation flow

1. User selects document type.
2. User selects project.
3. User optionally selects member/vendor/transactions.
4. System resolves data.
5. Show editable preview.
6. User may edit non-authoritative prose before export.
7. Generate print-ready output.
8. Save generated document record.
9. Optional save PDF to project documents.

## Reimbursement request default content

A clean formal letter with:
- date
- recipient fields editable in UI
- project name/code
- member
- requested reimbursement amount
- selected expense table
- total
- brief declaration
- signature placeholders

Do not assume institution/person names.

## Fund request

Include:
- current project context
- requested amount
- purpose
- budget/category
- optional estimated purchase list

## Vendor payment request

Include:
- vendor
- invoice
- due date
- amount
- payment reference fields
- approval block

## Project finance summary

Include:
- funding
- spend
- bills/payables
- reimbursements
- current cash
- available to spend
- budget overview
- date range

## PDF quality

- A4 print layout
- sensible margins
- page breaks
- repeating table headers if feasible
- page numbers optional
- avoid clipped content
- currency formatting
- generated timestamp

## Template safety

Do not allow arbitrary unsafe script execution in templates.
Sanitize custom HTML or use a controlled template format.

## Versioning

Generated documents should capture rendered snapshot so later template changes do not alter historical output.
