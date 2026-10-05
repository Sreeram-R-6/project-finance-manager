# Current Implementation Source Notes

These notes were prepared against current official documentation at handoff time.

## Supabase CLI

Official Supabase docs support project-local CLI installation:

```bash
npm install supabase --save-dev
npx supabase init
npx supabase start
```

The npm/npx CLI path requires Node.js 20+.

Local Supabase uses a Docker-compatible runtime.

Reference:
https://supabase.com/docs/guides/local-development/cli/getting-started

## Local workflow

Supabase recommends keeping the `supabase/` directory and migrations in version control.

Reference:
https://supabase.com/docs/guides/local-development/cli-workflows

## Google OAuth

Supabase Auth supports Google sign-in for web applications.

Reference:
https://supabase.com/docs/guides/auth/social-login/auth-google

## Row Level Security

RLS should be enabled on exposed tables and is the correct database-layer tool for project authorization.

Reference:
https://supabase.com/docs/guides/database/postgres/row-level-security

## Storage

Supabase Storage access can be governed through RLS policies on storage objects.

Reference:
https://supabase.com/docs/guides/storage/security/access-control

## Version policy

Codex should inspect the current package ecosystem before pinning framework/library versions.

Prefer latest stable versions compatible with:
- Node 20+
- current Next.js stable
- current Supabase JS
- current Supabase CLI

Do not blindly paste stale version numbers from this handoff.
