# Authentication, Roles, RLS and Security

## Authentication

Use Supabase Auth.

Primary sign-in:
- Google OAuth

Also structure code so email auth could be added later.

On first sign-in:
- ensure profile row exists;
- populate name/avatar/email from auth metadata where available.

## Roles

Project roles:

OWNER
- full project control
- owner transfer
- close/archive project
- configure finance/security

ADMIN
- manage most settings/members except owner-only actions

FINANCE_MANAGER
- post financial records
- pay bills
- reimburse members
- manage budgets/vendors/reports

APPROVER
- view relevant records
- approve/reject when assigned/policy permits

MEMBER
- view project if permitted
- create own expenses/purchases/requests
- view own reimbursement/advance position
- normal project collaboration

VIEWER
- read-only project access

## RLS design principles

Every project-owned row must resolve to a project_id.

Use helper SQL functions with stable/security-aware semantics to avoid repeating unsafe policy logic.

Example conceptual helper:
`public.is_project_member(p_project_id uuid)`

Do not expose arbitrary project data to any authenticated user.

## Profiles

Users:
- can read their own profile;
- can update safe fields on their own profile;
- may read basic profiles of fellow members in shared projects if needed for UI.

## Projects

SELECT:
member of project.

INSERT:
authenticated user.

UPDATE:
OWNER/ADMIN according to field sensitivity.

DELETE:
prefer archive, not physical delete.
If physical deletion exists before any financial activity, owner only.

## Memberships

SELECT:
project members.

INSERT/UPDATE/DELETE:
OWNER/ADMIN with safeguards.

Membership cannot be self-escalated.

Database must prevent:
- changing own MEMBER role to OWNER;
- removing only OWNER.

## Finance

Transactions/purchases/bills:
SELECT by members according to project visibility.

Create:
- MEMBER+ for allowed draft types.

Post financial event:
- FINANCE_MANAGER/ADMIN/OWNER or approved server/RPC workflow.

Approval:
only actual assigned approver / role allowed by active approval instance.

Viewer:
no mutations.

## Reimbursement

Member:
- can submit claim from their eligible personal expenses;
- cannot approve own claim if policy forbids self approval.

Finance:
- can approve/pay based on policy.

## Documents

Private storage bucket.

Object path includes project_id.

RLS checks:
- uploader is authenticated;
- project membership;
- operation-specific permission;
- path's project id must equal permitted project.

Avoid relying only on user-supplied metadata.

## Invites

Store invite tokens hashed, not raw, if implementing server-validated links.

Expire/revoke invites.

Joining should never permit selecting arbitrary role/project from the browser.

## Service role

Never in browser.

Only server-side/Edge Function use if absolutely required.

Prefer normal authenticated client + RLS whenever possible.

## Sensitive fields

Avoid logging:
- OAuth tokens
- service role secret
- full auth headers
- secret invite tokens

## Rate/abuse considerations

For public auth/invite endpoints:
- validate inputs;
- avoid user enumeration where practical;
- apply platform/provider protections where available.

## CSP and headers

Configure reasonable security headers:
- Content-Security-Policy compatible with Supabase/Google auth
- frame restrictions
- referrer policy
- nosniff
- HSTS in production platform if supported

Do not break OAuth by over-restricting without testing.

## Server input validation

Zod validation is required at app boundary.

Database constraints remain authoritative.

## Audit permissions

Project members may see relevant project activity.
Full audit log should default to OWNER/ADMIN/FINANCE_MANAGER.
