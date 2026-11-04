# Rep Yuh Place — original design restored

The application now renders the original uploaded Base44 frontend: original home page, navigation, contestant and parish pages, battles, leaderboards, token store, contestant portal, judge dashboard, and admin dashboard. The supplied new official logo remains in the header and existing branded assets. The later redesign and interactive parish map are not part of the active website.

## Railway

Deploy `Shamzbruv/ICSStest`, branch `main`. The existing Dockerfile builds the Vite frontend; `npm start` serves it on `0.0.0.0` using Railway's `PORT`. Generate a domain in Railway after deployment.

Without `VITE_BASE44_APP_ID`, the original layout renders in an explicitly labelled, read-only preview with empty records. The preview creates no accounts, records no votes, accepts no payments, and sends no emails. It must not be described as a completed backend.

To reconnect the original hosted Base44 application, configure its real public build-time connection values: `VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`, and, if required by that application, `VITE_BASE44_FUNCTIONS_VERSION`. Rebuild after changes. The Base44 backend functions, entity schemas, permissions, secrets, account access, payment configuration, and deployment still require setup and testing. Do not put service credentials in frontend environment variables or this public repository.

`VITE_DEMO_MODE` is no longer used. The restored original application is always the entry point. Historical redesign files remain in `src/demo` for reference and do not load in the active application.

## Development and validation

Use Node 22.12 or later, `npm ci`, then `npm run dev`. Build with `npm run build`; serve with `npm start`.

The original frontend contains existing JavaScript type-check issues and placeholder video/social links. Restoring its design does not certify its existing backend workflows as ready for live operation. See `BACKEND_SCOPE.md` for the observed workflow scope and implementation gaps.
