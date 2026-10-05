# UX / UI Specification

## Design principles

1. Financial clarity over decoration.
2. Mobile receipt capture must be extremely fast.
3. Desktop tables must be information-dense but readable.
4. Always show status and payer/source clearly.
5. Destructive accounting actions require confirmation and reason.
6. Important information must not rely on color alone.
7. Default to understandable language before accounting jargon.

## Inspiration

Interaction patterns may take inspiration from:
- Linear: speed, command palette, keyboard navigation, dense clean UI
- Ramp: financial hierarchy, approvals, spend overview
- Splitwise: who-paid / who-is-owed human-readable presentation
- Expensify: receipt-oriented mobile entry

Do not visually clone these products.

## Desktop shell

Left sidebar:
- Overview
- Projects
- Inbox / Approvals
- Reports (cross-project if implemented)
- Profile

Inside project:
- Overview
- Transactions
- Purchases
- Bills
- Reimbursements
- Requests
- People
- Budgets
- Vendors
- Assets
- Documents
- Reports
- Activity
- Settings

Top bar:
- project switcher
- search
- quick add
- notifications
- user avatar

## Mobile shell

Bottom navigation:
- Home
- Transactions
- Add
- Team
- More

Project switcher accessible from page header.

`Add` should open a bottom sheet.

## Global dashboard cards

Do not create 12 oversized cards.

Preferred:
- one primary balance block
- 3–4 compact KPI cells
- recent activity
- action-required list
- project list

## Project overview

Primary balance section:
- Available to spend
- Project cash
- Total spent
- Reimbursements outstanding
- Bills payable
- Committed spend

Secondary:
- budget utilization
- spend over time
- category breakdown
- people balances
- recent transactions
- approvals
- bills due

## Transaction list

Columns desktop:
- date
- description
- type/status
- vendor/counterparty
- paid by
- category
- amount
- attachment indicator

Mobile row:
- icon/type
- description
- amount
- paid by/source
- date/status

Credits and debits use direction icons and signs in addition to color.

## Purchase entry — mobile optimized

Step/sheet sections:
1. Receipt photo/upload
2. Merchant/vendor
3. Amount/date
4. Items
5. Who paid?
6. Funding split if needed
7. Category/tags
8. Notes/request link
9. Review/post

Allow save draft at any time.

## Who paid control

Prominent choices:
- Project Funds
- Me
- Another Member
- Split Payment
- Advance

If "Me" or "Another Member":
show resulting reimbursement before save:
`Project will owe Soorya ₹6,200`.

## Tables

Use TanStack Table.

Requirements:
- column visibility
- sorting
- search/filter
- pagination
- mobile alternative cards
- export current filtered result when relevant

## Status badges

Use consistent semantic labels:
- Draft
- Submitted
- Approved
- Rejected
- Unpaid
- Partial
- Paid
- Overdue
- Voided
- Needs Info

## Empty states

Every empty state should answer:
- what this area is;
- what to do next.

Example:
`No purchases yet. Add your first purchase to start tracking project spend.`

## Command palette

Desktop shortcut: Ctrl/Cmd+K.

Commands:
- switch project
- new purchase
- new bill
- add funding
- search transactions
- invite member
- generate report
- open settings

## Accessibility

- no placeholder-only labels
- focus traps for dialogs
- `aria-live` for submit result where appropriate
- text summary below/near charts
- 44px recommended minimum touch targets on mobile
- keyboard accessible menus/tables/forms

## Responsive breakpoints

Use Tailwind defaults unless app requirements warrant adjustment.

At mobile widths:
- sidebar becomes navigation drawer/bottom nav;
- tables become card lists when horizontal scrolling hurts usability;
- summary charts stack;
- forms are single column.

## Theme

Support system/light/dark.

Suggested visual tokens:
- neutral background
- subtle borders
- one primary accent
- green/red only where semantics require
- amber for warnings

No gradients required.

## Receipt preview

Use thumbnail gallery with:
- file type
- upload status
- view
- download where allowed
- remove only before posting or with audited removal workflow

## Approval inbox

One consolidated `/app/inbox`:
- pending purchase requests
- pending reimbursements
- pending bills
- finance issues requiring user action

Filters by project/type.

## Project Financial Story

Create a narrative summary:

Funding received
↓
Spend by major category
↓
Liabilities / reimbursements / committed spend
↓
Available amount

Use a simple Sankey-like visualization only if accessible and stable; otherwise use stacked rows with clear amounts.

## Loading behavior

Use skeletons for dashboard content.
Avoid full-page spinners where possible.

## Toasts

Use toasts for:
- saved
- posted
- approved
- invite copied

Do not use toast as the only place to show validation failure.
