# Supabase CLI Setup

## Requirements

- Node.js 20+
- npm
- Docker-compatible runtime for local Supabase stack

## Install CLI in project

```bash
npm install supabase --save-dev
```

Use the project-local CLI through `npx`.

## Initialize

```bash
npx supabase init
```

This should create the version-controlled `supabase/` directory.

## Start local stack

```bash
npx supabase start
```

Do not expose the local Supabase development stack publicly.

## Expected repository layout

```text
supabase/
  config.toml
  migrations/
    <timestamp>_initial_schema.sql
    <timestamp>_rls.sql
    <timestamp>_storage.sql
    ...
  functions/
    ...
  seed.sql
```

## Migration workflow

Create migrations using CLI or explicit timestamped files.

Apply/reset locally:

```bash
npx supabase db reset
```

Generate DB types:

```bash
npx supabase gen types typescript --local > src/types/database.generated.ts
```

Add package scripts:
```json
{
  "supabase:start": "supabase start",
  "supabase:stop": "supabase stop",
  "db:reset": "supabase db reset",
  "db:types": "supabase gen types typescript --local > src/types/database.generated.ts"
}
```

Because CLI is installed as an npm dev dependency, package scripts can resolve the binary directly.

## Remote project

When the user creates/provides a remote Supabase project:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

Do not invent project refs or access tokens.

## Google OAuth

Human setup still required:
1. Create/configure Google Cloud OAuth client.
2. Configure authorized origins/redirect URIs for local + production.
3. Configure Google provider in Supabase using real client credentials.
4. App triggers Supabase Google OAuth sign-in.
5. Auth callback exchanges session and redirects safely.

Write exact final setup instructions after implementation.

## Storage

Create private bucket(s) in SQL migration or code-backed reproducible setup.

Example bucket:
- `project-documents`

Create RLS policies on `storage.objects`.

Do not tell the user to manually click `New bucket` if migration can create it.

## Seed

`supabase/seed.sql` should seed application data required for local demonstration.

Auth-user seeding may require Supabase-supported local auth patterns.
If direct auth seed is awkward, provide a local dev bootstrap path documented clearly while still seeding domain data.

## CI suggestions

Optional:
- start Supabase in CI;
- reset DB;
- run DB tests;
- run app tests.

## Production rules

- never expose local dev instance;
- never commit `.env.local`;
- never commit service-role secrets;
- all remote schema changes come from migrations.
