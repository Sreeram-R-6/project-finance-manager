# Presentation redesign

## Design and scope

The application now uses a restrained indigo identity, Geist typography, layered neutral surfaces, subtle geometric backgrounds and purpose-designed light/dark themes. The project overview leads with available money, then attention items and recent activity. Advanced accounting and administration remain available through disclosures and detail drawers.

Navigation groups the primary workspace into Overview, Money, Purchases, Bills, People, Documents and Reports. Other modules sit under More. Mobile has its own bottom navigation, quick-add and transaction timeline. Keyboard search, accessible dialogs, visible focus and reduced-motion support are retained throughout.

Purchase entry starts with items, amount and who paid. Personal payments explain the amount owed; mixed allocations remain supported. Receipt previews support replacement/removal without claiming OCR. Bills group by urgency. Reimbursements lead with people and remaining amounts, including an explicit partial-payment state. Reports offer readable default columns and expandable technical detail while retaining complete exports.

The pass includes login, workspace, overview, transactions, all finance modules, requests, people, budgets, vendors, assets, documents, reports, activity, settings, inbox, profile, invitations, onboarding, offline drafts, loading, errors and empty states.

## Architecture and preserved behavior

Reusable presentation components live in `src/components/design-system.tsx`; the visual and motion system is in `src/app/redesign.css`. Human-readable copy is centralized in `src/components/page-copy.ts`. Drawers and receipt previews have separate components.

Backend services, API handlers, authentication rules, migrations, ledger posting, RLS, project permissions and audit behavior were not changed. Existing domain calculations remain authoritative. Transaction display amounts use exact integer strings and BigInt; they are display projections, not a replacement balance calculation. Additional reads remain subject to existing project RLS and batch visible records.

Animations use opacity/transform, short UI transitions and slow ambient motion. Nonessential motion respects reduced-motion preferences. No sound or large background images were added.

## Verification

- Lint: zero errors, one TanStack Table compiler compatibility warning; the table opts out of memoization.
- Typecheck and production build: passed.
- Unit/integration: 31 passed, including exact transaction presentation above JavaScript's safe integer range.
- Browser: four desktop/mobile workflow and presentation tests passed.
- Production PWA: two desktop/mobile offline tests passed.
- Clean isolated Supabase instance: all 14 migrations and seed applied; 15 pgTAP assertions passed. Existing working data was preserved.
- Production layout sweep: 42 routes/states across all seven requested viewports, 294 passing checks. Final affected-route sweep repeated 77 checks.

The read-only capture script is `scripts/ui-audit.mjs`. Local screenshots and results are in ignored `.ui-audit/`; its session file contains local authentication data and must not be published. Layout checks are complemented by manual screenshot review and workflow tests; they do not establish physical-device installation or hosted Google OAuth.

## Local runtime and remaining external checks

The development app runs at `http://localhost:3000`. Windows currently reserves the standard Supabase port range, so the preserved local stack uses API port 55321 and an ignored runtime configuration:

```sh
npx supabase start --workdir .local-runtime
npm run dev
```

The canonical checked-in Supabase configuration remains unchanged. `.env.local` points to the alternate local API. Local Google configuration must use the active API's callback port, currently `http://127.0.0.1:55321/auth/v1/callback`.

Local Google OAuth can be configured from a downloaded Web client JSON with `scripts/configure-local-google-auth.ps1`. Its secret remains in ignored local runtime settings. The Google client must authorize `http://127.0.0.1:55321/auth/v1/callback`, and test users must be listed while the consent screen is in Testing mode. Hosted Google OAuth, a production deployment and physical-device PWA installation require the external configuration and verification listed in [VERIFICATION.md](VERIFICATION.md).
