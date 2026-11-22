# Decisions

## Assumptions

- Staff are a small team. Accounts are seeded; no sign-up or password reset.
- An inquiry belongs to the staff member who created it. An admin can see everything.
- A customer can be reached by email **or** phone, so at least one is required, not both.
- "Same inquiry submitted twice" means: same subject + same email or phone, while the first one is still open.
- If the same problem comes back after it was resolved, staff **reopen** it. A different problem is a new inquiry.

## Main design choices

**1. Access rule is in the SQL, and "not yours" looks like "not found".**
Staff see only inquiries they created; admin sees all. The rule is in the `WHERE` clause of every
query in `models/inquiry.js`. A direct link to someone else's inquiry returns **404, not 403**, so the
API does not reveal that it exists.

**2. Status changes follow one small rule map.**
`utils/statusRules.js` allows only New → In Progress → Resolved, and Resolved → In Progress (reopen).
Anything else returns **422**. The UI only shows the allowed button, but the API decides. Every create
and status change is saved in `inquiry_history` (who, when, from, to) **in the same transaction**. The
detail page shows it as an Activity timeline, and a reopened inquiry is shown as "Reopened", while the
database keeps the brief's three statuses.

**3. Stale data is caught with a version number (optimistic locking).**
Each inquiry has a `version`. The browser sends the version it saw, and the update runs
`… WHERE id = $1 AND version = $3`. If another tab saved first, nothing matches and the API returns
**409 "changed by someone else, please refresh"**, and the page shows a Reload button.

**Validation happens three times:** in the form (to guide the user), in the API with zod (so bad data
is rejected even without the UI), and in the database with `CHECK` constraints.

## Trade-off I accepted

Stale data is only found **when the user tries to save**, not the moment another tab changes it.
Live updates (websockets or polling) would be faster but add a lot of code. The version check is
small, easy to test, and never lets one person silently overwrite another.

## What I would improve next

- Pagination in the API (`LIMIT` / `OFFSET`) instead of in the browser.
- A partial unique index for duplicates (check-then-insert can let two same-moment requests pass).
- A separate test database, more frontend tests, and one end-to-end test.
- One setting for both cookie and token lifetime (the cookie is fixed at 8 hours in code).

## Testing

- **Backend (12):** 401 rules, Bob can't open or change Alice's inquiry (404), allowed / blocked status
  changes (200 / 422), old version → 409, history saved (not on 409), missing contact → 400, bad login input → 400.
- **Frontend (4):** the inquiry form shows errors when empty, sends the values, disables Save while saving,
  and keeps the values when the save fails.
- **Gaps:** backend tests use the dev database (each run deletes its own rows); no list / detail page tests; no end-to-end test.

## Use of AI

I used Claude as a pair programmer for explanations, first drafts, reviews and finding bugs. I made the
decisions and checked every file before committing.

- **Changed:** it suggested keeping the login token in `localStorage`. I used an **httpOnly cookie**, so
  JavaScript (and XSS) can't read it.
- **Rejected:** a 4th status "Reopened" in the database. The brief names three, so I show "Reopened" from the history.
- **Rejected:** an AI-made mockup with a dashboard, reports, delete and a free status dropdown. I kept only
  the visual style; a free dropdown would allow blocked moves like New → Resolved.
- **Accepted, after proof:** it found login crashed (500) on a non-text email. I wrote a failing test first, then fixed it (400).
