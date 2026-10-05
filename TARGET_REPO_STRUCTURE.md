# Target Repository Structure

Codex may refine this, but aim for a structure similar to:

```text
.
├─ app/
│  ├─ (public)/
│  ├─ auth/callback/
│  └─ app/
│     ├─ projects/
│     ├─ inbox/
│     └─ profile/
├─ components/
│  ├─ app-shell/
│  ├─ finance/
│  ├─ forms/
│  ├─ tables/
│  ├─ charts/
│  └─ ui/
├─ lib/
│  ├─ supabase/
│  ├─ finance/
│  ├─ auth/
│  ├─ validation/
│  ├─ documents/
│  └─ utils/
├─ services/
│  ├─ projects/
│  ├─ ledger/
│  ├─ purchases/
│  ├─ reimbursements/
│  ├─ bills/
│  └─ reports/
├─ src/types/
│  └─ database.generated.ts
├─ public/
│  ├─ icons/
│  └─ manifest assets
├─ supabase/
│  ├─ config.toml
│  ├─ migrations/
│  ├─ functions/
│  └─ seed.sql
├─ tests/
│  ├─ unit/
│  ├─ db/
│  └─ e2e/
├─ .env.example
├─ package.json
└─ README.md
```

Keep domain finance logic out of React components.

Use service/domain functions for posting and calculations.
