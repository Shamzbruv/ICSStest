# Backend scope inferred from the original project

This is a source review, not a successful production integration test. Existing schemas and functions are partial implementation, not evidence that the deployed workflows currently work.

## Features represented by the original screens

1. User accounts: email/password sign-in, registration, email OTP, Google sign-in, password reset, logout, and account deletion.
2. Contestants: parish assignment, name and biography, photos and performance videos, linking an account to its contestant profile, and owner-only editing. The current claim workflow needs ownership verification; a listing of unclaimed profiles is not sufficient proof of identity. The existing portal edits/claims existing contestant records; independent contestant application/approval is not complete.
3. Fan engagement: contestant listings/details, parish filters, comparing two contestants, sharing profiles, and fan comments.
4. Paid voting: token packages with bonuses, checkout, confirmed-payment wallet credit, balance display, token spending, vote records, pending-vote completion, and milestone emails.
5. Competition rules: voting rounds and deadlines, valid/active contestants, parish vote leaders, parish qualification, and overall leaderboard updates. Text describes ten contestants per parish and the top parish contestant advancing; automated qualification and capacity enforcement must be specified and implemented rather than assumed.
6. Battles: contestant matchups, open/closed state, fan vote totals, judge score totals, winner finalization, and winner highlights.
7. Judges: invitation emails, judge-only access, public judge biographies/photos, judge profile editing, scoring for performance/attire/crowd engagement, scorecards/notes, and activity records.
8. Administration: contestant content management, voting-round editing, judge invitations/profile management, battle scoring/conclusion, score exports, competition reset, and season archive.
9. Reporting: contestant counts, votes, paid token purchases, revenue totals, daily vote/revenue charts, and parish reporting. Values must reconcile against actual transactions, not a partially loaded page of records.
10. Media: configured YouTube livestream embedding, official performance/video links, and real social links. This covers embedding an existing livestream, not building a video broadcasting service.

## Observed implementation gaps requiring verification or repair

- `castVote` reads a balance and then writes the vote, balance, and count separately. Concurrent requests can overspend balances or overwrite vote totals. Atomic transactions, idempotency, authorization, rate limiting, and round/battle eligibility validation are required.
- `handleStripeWebhook` credits a wallet without a processed-event/session deduplication guard, payment-status validation, or timestamp-age enforcement. Replays and retries must not duplicate wallet credit; purchases and credits need an atomic, auditable ledger.
- Existing checkout is Stripe-specific and accepts return origins only for Base44-hosted domains. The gateway/account and Railway return URL need agreement and verification before quoting it as ready. Include one supported gateway integration only; recurring gateway fees are separate.
- Existing data permissions, judge score ownership, file uploads, contestant claiming, public comments, private data, and admin actions need role/ownership checks and abuse controls.
- The admin charts derive totals from paginated data loaded in the browser; final reports require complete server-side totals and consistent date/time handling.
- The livestream channel and several performance/social links are placeholders. Official links are required before delivery.
- Base44 functions run in the Base44 runtime. Hosting the frontend on Railway does not migrate the backend, deploy these functions there, or copy production records. A standalone database/auth/storage replacement is additional migration scope unless explicitly included in the agreed quote.

## Scope assumptions for an initial quote

Reuse the original design and existing Base44 project, complete and secure the workflows above, configure one agreed payment gateway, perform end-to-end tests, and provide an admin handover. Existing data import, gateway eligibility, email delivery, competition rules, deadlines, anticipated traffic, and credential access must be confirmed. Hosting, Base44/storage/email usage, gateway charges, and ongoing maintenance are separate. Moving entirely away from Base44 requires a revised scope and estimate.
