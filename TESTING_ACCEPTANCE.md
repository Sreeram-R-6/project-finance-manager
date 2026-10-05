# Testing and Acceptance Criteria

## Required quality gates

All must pass:
- lint
- TypeScript typecheck
- unit tests
- database/RLS tests
- critical integration tests
- Playwright E2E
- production build

## Unit tests

Test money utilities:
- add/subtract minor units
- formatting
- quantity × unit price calculations
- discounts/taxes
- allocation sum checks
- refund math
- reimbursement outstanding
- bill outstanding
- advance outstanding

## Database invariant tests

### Project isolation
User in Project A cannot SELECT Project B financial rows.

### Viewer
Viewer cannot INSERT/UPDATE/DELETE financial rows.

### Member
Member can create permitted drafts but cannot post privileged entries unless policy says so.

### Role escalation
User cannot change their own role to OWNER.

### Sole owner
Cannot remove/demote only project owner.

### Ledger append only
Posted ledger entries cannot be mutated/deleted by normal authenticated role.

### Purchase allocation
Cannot post when allocation sum != total.

### Reimbursement
Cannot reimburse above outstanding.

### Bill
Cannot pay above outstanding.

### Closed project
Blocks normal new postings.

## Integration flows

### Flow A
Create project with opening balance.
Expected:
- owner membership
- funding event
- correct project cash

### Flow B
Project-paid purchase.
Expected:
- cash decreases
- expense increases
- no reimbursement owed

### Flow C
Member-paid purchase.
Expected:
- cash unchanged
- expense increases
- member payable increases

### Flow D
Partial reimbursement.
Expected:
- cash decreases payment amount
- payable decreases payment amount
- claim remains partial

### Flow E
Bill creation/payment.
Expected:
- bill does not reduce cash on creation
- partial payment reduces cash only by partial amount
- outstanding remains

### Flow F
Mixed funded purchase.
Expected:
- project allocation reduces cash
- personal allocation creates payables

### Flow G
Advance issue/reconcile/return.
Expected invariants per LEDGER_RULES.

### Flow H
Refund.
Expected net expense and destination account correct.

### Flow I
Void posted transaction.
Expected reversal, no deletion.

## Storage tests

- member can upload to own accessible project
- nonmember cannot read project file
- viewer read permission only if project policy permits
- unauthorized project path upload blocked

## E2E

1. Sign-in page renders.
2. Authenticated demo/dev route enters app.
3. Create project.
4. Add member/invite flow UI.
5. Add funding.
6. Create personal-funded purchase.
7. Verify reimbursement appears.
8. Record partial reimbursement.
9. Create bill.
10. Pay partial bill.
11. Generate reimbursement letter preview.
12. View report.
13. Mobile viewport quick-add usable.

## Accessibility

Automated accessibility smoke checks if practical.
At minimum manually/test:
- keyboard navigation
- form labels
- dialogs
- focus state
- no inaccessible icon-only actions without names

## Performance acceptance

- transaction lists paginated
- no dashboard waterfall of dozens of requests
- no obvious N+1 loading
- images/thumbs appropriately sized

## Definition of done

The app must work from a clean clone using documented commands.

A new developer should be able to:
1. install packages
2. start Supabase
3. reset DB/seed
4. run Next.js
5. open app
6. exercise demo data

External Google/Supabase production credentials may remain user-provided.
