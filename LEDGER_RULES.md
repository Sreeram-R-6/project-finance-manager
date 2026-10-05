# Ledger Rules and Financial Invariants

This file is mandatory. Do not simplify these rules away.

## 1. Money representation

- Persist money as integer minor units (`bigint`).
- Example: ₹62.00 => `6200` paise if using 2-decimal INR representation.
- UI formatting converts integer minor units to display currency.
- Never store authoritative money as JS float.

## 2. Posting

Draft business objects do not affect the ledger.

Only POSTED financial events affect balances.

Posting must happen within one PostgreSQL transaction.

## 3. Immutability

Posted ledger entries are append-only.

No normal update/delete to posted ledger rows.

Corrections:
- create reversal event;
- create corrected event.

## 4. Balance

Do not trust cached balance fields as source of truth.

Derived balances come from ledger entries.

You may create cached summaries/materialized views for performance only if they can be rebuilt.

## 5. Event examples

The implementation can choose debit/credit accounting account conventions, but must preserve these business effects.

### A. Funding received ₹50,000

Business result:
- project cash +₹50,000
- funding/source balance reflected

### B. Project-paid purchase ₹6,200

Business result:
- project expense +₹6,200
- project cash -₹6,200
- no member reimbursement payable

### C. Member-paid purchase ₹6,200

Business result:
- project expense +₹6,200
- project cash unchanged
- payable to member +₹6,200

### D. Reimburse member ₹4,000

Business result:
- project cash -₹4,000
- payable to member -₹4,000
- original project expense does not increase again

### E. Bill approved ₹12,000

Business result:
- cash unchanged
- committed/payable +₹12,000
- expense recognition timing may be bill-post or payment-post depending chosen model, but must not double-count.

For this product, prefer:
- approved/posted bill creates expense + payable;
- bill payment reduces cash + payable;
- purchase and bill concepts must not both be posted for the same invoice unless linked in a no-double-count workflow.

### F. Refund ₹1,500 to project account

Business result:
- project cash +₹1,500
- net expense reduced appropriately
- linked original purchase remains visible

### G. Advance ₹10,000

Issue:
- project cash -₹10,000
- member advance/receivable +₹10,000

Reconciled expense ₹7,000:
- project expense +₹7,000
- advance/receivable -₹7,000

Return ₹3,000:
- cash +₹3,000
- advance/receivable -₹3,000

## 6. Reimbursement invariant

For each member-funded allocation:

`outstanding_reimbursement =
eligible_personal_funding
- valid_refunds_returned_to_member
- reimbursement_payments
- rejected/nonreimbursable_amount`

Never allow paid reimbursement > eligible outstanding except through an explicit audited override workflow.

## 7. Bill invariant

`outstanding_bill = bill_total - posted_bill_payments - applicable_vendor_credits`

Never allow payment greater than outstanding without explicit credit/prepayment model.

## 8. Funding allocation invariant

For posted purchase:
`sum(purchase_funding_allocations.amount_minor) = purchase.total_minor`

Must be enforced atomically before posting.

## 9. Currency

V1:
- each project has one base currency;
- financial events in the project must use that currency.

Do not silently convert currencies.

Future FX can be added separately.

## 10. Idempotency

Posting endpoints/RPCs must be resilient to duplicate submission.

Use:
- unique business/posting identifiers;
- row locking or safe constraints;
- transaction boundaries.

Double-clicking `Post` must never double-spend.

## 11. Deletion

Drafts may be deleted by authorized users if not referenced.

Posted events may not be deleted through normal product workflows.

## 12. Close project

Closed project:
- no new financial events by default;
- reversal/correction requires elevated role and explicit reason.
