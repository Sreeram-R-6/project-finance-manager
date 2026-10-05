# Reporting and Analytics

## Dashboard calculations

### Project cash balance
Derived from posted ledger entries impacting project cash/bank/wallet accounts.

### Total spent
Project expenses recognized, net of refunds/reversals according to ledger policy.

### Reimbursements outstanding
Approved/eligible member payables minus reimbursement payments.

### Bills payable
Posted bill liability minus bill payments/credits.

### Committed spend
Approved purchase requests / approved unpaid bills according to clear non-double-count rules.

### Available to spend
Define and label formula clearly, e.g.:

`cash_balance - committed_cash_requirements - reimbursement_payables_reserved`

Do not imply it is legally/accountingly standardized.

## Required reports

### 1. Project Statement
- date
- transaction/event
- reference
- counterparty
- debit/credit
- running cash balance

### 2. Expense Report
Filters:
- date
- category
- vendor
- member
- payment source
- status

### 3. Member Report
- personally funded expenses
- claims
- reimbursements paid
- outstanding
- advances
- advance reconciliation

### 4. Reimbursement Report
- claimant
- source expenses
- claim
- approved
- paid
- remaining
- status

### 5. Vendor Report
- purchases
- bills
- payments
- refunds
- total spend

### 6. Budget Report
- planned
- committed
- actual
- remaining
- utilization

### 7. Funding Report
- source
- sanctioned
- received
- tranches
- dates

### 8. Bill Register
- vendor
- invoice
- issue
- due
- total
- paid
- outstanding
- overdue

### 9. Asset Register
- asset tag
- item
- purchase value/date
- assignee
- status
- warranty

### 10. Audit Report
- timestamp
- actor
- action
- entity
- reason

## Charts

Use charts only when they add meaning.

Required:
- monthly spend
- spending by category
- budget utilization

Optional:
- cumulative spend

Every chart gets a text/tabular alternative.

## Export

- CSV on tabular reports
- print/PDF
- XLSX optional but desirable

CSV should export raw useful columns, not formatted UI labels only.

## Finance pack

Project closeout finance pack:
- project info
- funding summary
- project statement
- expense statement
- category summary
- reimbursement statement
- bill register
- asset register
- document index
- final balance
- unresolved issues if any
