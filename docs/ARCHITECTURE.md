# Architecture and accounting decisions

## Layers

App Router pages/handlers -> application services -> validated domain commands -> transactional PostgreSQL RPCs. Presentation is in `src/components`; exact utilities, Storage, documents and offline logic are in `src/lib`; services are in `src/services`; authoritative posting/authorization is in migrations. Browser and server use the caller's Supabase session, with no service-role bypass.

## Money and ledger

Authoritative money is bigint minor units, transported as decimal strings. Quantities are exact numeric; quantity times unit-price rounds half-up to a minor unit. Only charts use Number, with exact tables alongside. Each financial event has an idempotency UUID and command hash. Same-key retries return the event; changed commands under that key fail. Project locks serialize postings and owner changes. Posting, links and audit commit atomically. Deferred constraints enforce balanced debits/credits. Ledger rows are immutable. Reversal appends opposite entries; both original and reversal remain included in balances.

| Event | Debit | Credit |
|---|---|---|
| Funding/opening | Project cash | Funding |
| Project purchase | Expense | Cash |
| Personal purchase | Expense | Member payable |
| Advance purchase | Expense | Member advance |
| External purchase | Expense | External funding |
| Posted bill | Expense | Vendor payable |
| Bill payment | Vendor payable | Cash |
| Reimbursement | Member payable | Cash |
| Advance issue/top-up | Member advance | Cash |
| Advance return | Cash | Member advance |
| Cash refund | Cash | Expense |
| Member refund | Payable, then recovery receivable if already reimbursed | Expense |
| Vendor credit | Vendor payable | Expense |
| Recovery return | Cash | Member recovery |

Purchase funding allocations must equal total. Allocation-specific entitlements, claim reservations and settlement allocations prevent duplicate claims/overpayments. Reimbursements never create expense again. Advances track issue/top-up, reconciled expenses, returns and refunds; overspend uses a separate personal allocation, not a negative advance. Reversal guards require dependent settlements or consumed funds to be reversed first where necessary.

Bills use accrual recognition at posting, with no cash change until payment. A duplicate invoice cannot also be posted as a purchase. Linked request fulfillment reduces reservation when a purchase/bill posts. Available is the planning formula `cash - vendor payable - member payable - remaining approved request reservations`; advances already reduced cash and are not deducted twice. Budgets compare recognized category expense in the budget period plus remaining commitments; hard stops reject atomic posting.

## Security

Every exposed app table has RLS. Project reads require active membership. Finance posting requires Owner/Admin/Finance Manager; Viewer is read-only. Owner/Admin manage members, Owner controls ownership and closure, and the only active owner cannot be removed/demoted. Sequential approvals check the assigned user/role and forbid self-approval. Approved amount snapshots prevent posting a different advance amount under an old approval.

Security-definer RPCs have an empty search path, qualified relations, caller checks and minimal helper grants. Invitation tokens are random, hashed, expiring, verified-email-bound, revocable and single-use. Profile reads require self/shared project; update grants restrict safe columns.

Storage is private. Object policies require a matching authorized metadata intent, project membership and uploader/pending lifecycle. Entity/project, MIME and size are checked; the browser checks signatures. Signed links expire in 60 seconds. Generated HTML is sanitized again before PDF rendering, with browser network requests blocked.

## Drafts, closeout and offline

Draft edits replace unposted items/allocations atomically. Purchase versions detect stale edits. Posted financial corrections require reversal/replacement; controlled metadata updates are audited. Recurring templates create review reminders, never automatic monetary postings. Closeout checks monetary liabilities, advances/recoveries/reservations and pending approvals. Nonfinancial exceptions require an owner reason. The UI saves a final finance-pack snapshot before closing.

The service worker caches static shell resources only. Online draft sync reauthenticates and explicitly reviews the current project/inputs; its UUID is reused for safe upload retries. Local draft/receipts are removed only after successful submission. IndexedDB is user-scoped and logout clears it.
