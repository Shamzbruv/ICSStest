# ICSS Test · Rep Yuh Place client preview

Client presentation redesign for **Rep Yuh Place — The Singing Edition**, prepared by iCreate Solutions & Services. Emerald, warm gold, responsive layouts, and the supplied official logo.

## Deploy on Railway

1. Create a Railway project → Deploy from GitHub → select **Shamzbruv/ICSStest** and branch **main**.
2. Railway uses the included Dockerfile automatically. No environment variables or database are required for this demo.
3. In Railway networking, generate a domain and open the HTTPS URL.

The server listens on `0.0.0.0` using Railway's `PORT`. All browser routes fall back to `index.html`; missing assets return 404. `railway.json` includes a health check.

## Local development

Node 22.12+ recommended.

```sh
npm ci
npm run dev
```

Production check:

```sh
npm run build
npm start
```

## Demo scope

The default experience is a self-contained **client preview**. All artist names, totals, matchups, scores, and token packs are illustrative, not extracted database records. Artist artwork is deliberately labelled sample artwork. No invented live broadcast or contest deadlines are shown.

Working interactions: parish and text filtering, contestant detail navigation, demo wallet top-ups, vote validation, browser-local vote persistence, ranking updates, reset demo, artist comparison, sample battle scorecards, mobile navigation, and route recovery. Forms are presentation-only and do not save or send personal data. Payments are disabled. Admin/judge routes do not expose operational data or pretend to provide real authentication.

The source ZIP includes entity schemas and backend function implementations under `base44/`, which are retained. It does **not** include the production database records, Base44 application connection values, or deployment secrets needed to run those services. Original frontend pages/components remain under `src/pages`, `src/components`, `src/lib`, and `src/api`. The redesigned presentation is in `src/demo`. The supplied logo is in `public/brand`.

## Future production integration

The original Base44 frontend is retained for migration reference. Setting `VITE_DEMO_MODE=false` at build time selects that original frontend; this is NOT production ready until the original application's public Base44 environment values and its backend deployment are configured and verified. Existing environment variable names: `VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`, `VITE_BASE44_FUNCTIONS_VERSION`. Do not add service credentials to Vite environment variables or this public repository. A visual redesign of the retained operational portals and reconnection of backend workflows are separate from this client demo.

## Reusing this test repository

This repository holds one active client demo at a time. Before replacing it, tag or archive the current version if it is still needed. Replace the application files and branding in a normal new commit to `main`; preserve Git history. Railway will deploy the latest main branch after its GitHub integration is connected.

## Brand assets

The supplied full logo is used in the header, hero, stage, and footer. The coordinated asset set includes browser favicons, Apple home screen icons, Android maskable icons, a 1200×630 social-sharing card, and an emerald/gold stage backdrop. See `public/brand/ASSETS.md`. Production HTML resolves social-image URLs against the Railway request origin.

## Validation

Production Vite build and Node server syntax check pass. Browser checks cover homepage rendering, contestant search, demo vote/balance updates, and insufficient-token validation. The repository-wide original typecheck currently fails on the imported frontend UI component prop typings; those existing operational components are not used by the default client preview.

## Interactive parish map

The `/parishes` page uses a labelled 2D Jamaica SVG map with all 14 parishes, selection highlighting, an artist/vote detail panel, keyboard controls, and mobile-friendly parish selection. Geography is bundled locally; no map subscription or API key is needed. See `src/demo/MAP_DATA.md` for boundary provenance and licensing.
