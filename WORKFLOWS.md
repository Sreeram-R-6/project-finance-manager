# Business Workflows

## 1. Create project

1. User creates project.
2. User becomes OWNER.
3. Creates default accounts/categories.
4. Optional opening balance.
5. If opening balance > 0:
   - create funding source "Opening Balance";
   - create funding transaction;
   - post ledger entries atomically.
6. Redirect to project overview.

## 2. Invite member

1. Authorized user enters email and role.
2. Create pending invite token/hash and expiry.
3. Invite link may be copied.
4. User authenticates.
5. If authenticated email matches invite (or invite mode permits token acceptance), create membership.
6. Mark invite accepted.
7. Emit activity/audit event.

## 3. Project-funded purchase

1. Draft purchase.
2. Enter items/vendor/docs.
3. Funding allocation = project account.
4. Validate allocation total = purchase total.
5. If approval required, submit.
6. After approval/post:
   - recognize expense;
   - reduce project cash account;
   - attach supporting docs;
   - update budget actual.
7. Immutable ledger entries created.

## 4. Member-funded purchase

1. Member records purchase.
2. Payer = member.
3. Validate project eligibility/approval.
4. On post:
   - recognize project expense;
   - create member payable/reimbursement entitlement;
   - do NOT reduce project cash.
5. Dashboard shows project owes member.

## 5. Mixed-funded purchase

Example total ₹20,000:
- Project Bank ₹12,000
- Member A ₹5,000
- Member B ₹3,000

On post:
- expense = ₹20,000;
- project cash decreases ₹12,000;
- member payable A increases ₹5,000;
- member payable B increases ₹3,000.

## 6. Reimburse member

1. Choose eligible member expenses.
2. Calculate outstanding.
3. Enter payment amount.
4. Allow partial payment.
5. Select project account.
6. Add payment reference/proof.
7. Post:
   - decrease project cash;
   - decrease member payable.
8. Update source reimbursement balances.
9. Mark reimbursement paid only when remaining = 0.

## 7. Bill

1. Create bill with vendor/items/due date.
2. Save draft or submit approval.
3. Approval creates committed/payable state.
4. No project cash movement yet.
5. When bill payment posted:
   - reduce project cash;
   - reduce bill payable.
6. Support partial payments.
7. Overdue status is derived from due date + outstanding amount.

## 8. Purchase request

1. Member submits request.
2. Resolve approval chain.
3. Approvers approve/reject sequentially.
4. Approved request may be converted/linked to purchase.
5. Compare estimate vs actual.
6. Close request after purchase or cancel.

## 9. Advance

### Issue
1. Finance user creates advance.
2. Approve if policy requires.
3. Post issue:
   - project cash decreases;
   - member advance balance increases.

### Reconcile expense
1. Member attaches receipt/expense.
2. Expense uses advance as funding source.
3. Deduct documented amount from outstanding advance allocation.
4. Recognize expense.

### Return
1. Member returns unused cash.
2. Project cash increases.
3. outstanding advance decreases.

### Overspend
If member spends beyond advance:
- excess may become member-payable reimbursement after approval.

## 10. Funding received

1. Select/create funding source.
2. Enter tranche.
3. Enter project account.
4. Post:
   - project cash increases;
   - funding/equity/source side increases.
5. Funding source received total derived from posted tranches.

## 11. Refund

1. Select original purchase.
2. Enter refund amount.
3. Select destination:
   - project account;
   - original member payer;
   - mixed refund allocation.
4. Post appropriate reversing effect.
5. Purchase page shows gross, refunds, net.

## 12. Void transaction

Never hard-delete a posted financial event.

1. Authorized finance user chooses Void/Reverse.
2. Must provide reason.
3. Create reversal financial event and opposite ledger entries.
4. Original remains visible with VOIDED/REVERSED marker.
5. Audit logs actor/reason.

## 13. Edit posted transaction

For nonfinancial metadata (e.g. notes/tags) allow controlled edit.

For money-affecting changes:
- reverse old event;
- create corrected event;
- link them.

## 14. Bill due automation

Derived or scheduled server-side check:
- due soon
- overdue

App does not need background cron in local dev; statuses can be query-derived and notifications generated when sessions load or via scheduled function if configured.

## 15. Close project

1. Run closeout checks.
2. Block final closure when critical unsettled issues exist.
3. Allow owner override only if safe and reason is recorded.
4. Generate final finance pack.
5. Set project closed/read-only.
