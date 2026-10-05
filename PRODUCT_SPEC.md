# Product Specification

## Product name

Working name: **Project Finance Manager**

The name should be easy to change from a single config constant.

## Core promise

For every unit of money in a project, the system should make it easy to answer:

- Where did it come from?
- What was it used for?
- Who requested it?
- Who approved it?
- Who actually paid?
- Was project money used or somebody's personal money?
- Does anybody need reimbursement?
- Which bill/receipt supports the spend?
- Which vendor supplied it?
- Which budget was it charged to?
- What changed later?
- What is the current financial position?

## Target users

- student project teams
- college clubs
- engineering teams
- competition teams
- research teams
- grant-funded projects
- small non-profit/project groups
- makers/build teams

## Project concepts

A project has:
- metadata
- members
- roles
- funding sources
- financial accounts
- ledger
- budgets
- transactions
- purchases
- bills
- reimbursements
- advances
- requests
- vendors
- assets
- documents
- reports
- activity
- audit log

## Project lifecycle

Statuses:
- active
- paused
- closing
- closed
- archived

Closed projects should default to read-only except owner/admin-controlled corrective accounting operations.

## Funding sources

Support:
- opening balance
- grant
- college/organization contribution
- sponsor
- member contribution
- donation
- revenue
- other

Separate:
- sanctioned amount
- received amount

A funding source may have multiple tranches.

## Accounts

Support conceptual accounts such as:
- Project Cash
- Project Bank
- Petty Cash
- UPI Wallet
- Member Payable
- Advances Receivable
- External Sponsor
- Other

Accounts exist mainly to make the ledger coherent and enable future expansion.

## Transactions

User-facing transaction types:
- funding credit
- debit/expense
- purchase
- bill payment
- reimbursement payment
- advance issue
- advance return
- refund
- transfer
- adjustment
- reversal

## Purchases

A purchase contains:
- vendor
- date
- purchaser
- line items
- subtotal
- tax
- shipping
- discount
- total
- funding allocations
- category
- tags
- receipt/invoice
- linked request
- linked assets

## Bills

A bill is payable but does not necessarily represent paid cash.

Track:
- issue date
- due date
- amount
- payments
- outstanding
- status

## Personal payments

If a team member pays personally:
- expense belongs to project;
- project cash does not change;
- reimbursement payable to member increases.

If project later reimburses member:
- project cash decreases;
- payable to member decreases.

## Mixed funding

One purchase may be funded by:
- project money
- member A
- member B
- advance

Allocation total must equal purchase total exactly.

## Reimbursements

A reimbursement may:
- cover one or more source expenses;
- be partially paid;
- be rejected;
- require approval;
- have payment proof/reference.

## Advances

Advance:
1. project issues funds to member;
2. member spends part of it;
3. receipts are reconciled;
4. unused amount is returned;
5. overspend can become reimbursable.

## Purchase requests

Supports pre-spend control:
- request item
- estimated cost
- reason
- supplier quote
- approval chain
- actual purchase
- variance

## Budgets

Budget by category:
- planned
- committed
- actual
- remaining
- utilization

Warnings at thresholds.

## People balances

For each member:
- personally funded valid project spend
- reimbursements received
- outstanding reimbursement
- advances received
- advances reconciled
- advance balance

## Vendors

Central vendor registry within project/workspace scope.

## Assets

Convert eligible purchase items into tracked assets.

## Documents

Attach:
- receipts
- invoices
- quotations
- purchase orders
- payment proofs
- warranties
- approval documents
- generated documents
- other

## Comments

Comments can exist on:
- purchase
- reimbursement
- bill
- request
- asset

Use mentions only if implementation is clean; otherwise leave mention-ready schema.

## Notifications

In-app notifications:
- approval required
- approved/rejected
- reimbursement due/paid
- bill approaching due date
- overdue bill
- budget threshold
- missing receipt
- invitation
- funding received
- request completed

Email notifications can be architected but do not require a third-party paid email provider for V1.

## Finance issue center

Surface actionable issues:
- missing receipts
- uncategorized transactions
- overdue bills
- reimbursements waiting too long
- unsettled advances
- approvals pending
- over-budget categories
- purchases without vendor/invoice if policy requires

## Finance Health

Optional deterministic score based on:
- missing documents
- overdue liabilities
- unresolved advances
- uncategorized transactions
- budget overruns
- stale approvals

Make clear it is an operational score, not an accounting certification.

## Project closeout

Checklist:
- no unpaid bills
- no pending reimbursements
- advances settled
- requests closed
- receipts complete
- categories complete
- assets assigned
- final funding/balance reconciled

Generate a final finance pack.

## Global dashboard

Across all accessible projects:
- projects
- total project funds
- spend
- reimbursements outstanding
- approvals
- bills due
- recent activity

Do not aggregate different currencies into a misleading single number without FX support.
For V1, show per-currency totals.
