# 🧭 Decisions

## At a glance

| Choice | Result | Brief situation |
|---|---|---|
| Validation in the form, the API (zod) and the database | **400** with field errors | ✍️ Missing or invalid input |
| Version number on every inquiry | **409** "please refresh" | 🗂️ Two tabs, stale data |
| Owner rule inside the SQL | **404** for "not yours" | 🔒 Direct link |
| One map of allowed status moves | **422** for a blocked move | Status lifecycle |

## 📌 Assumptions

- Staff are a small team. Accounts are seeded; no sign-up or password reset.
- An inquiry belongs to the staff member who created it. An admin can see everything.
- A customer can be reached by email **or** phone, so at least one is required.
- "Submitted twice" = same subject + same email or phone, while the first one is still open → **409**.
- Same problem comes back after Resolved → **reopen** it. A different problem → a new inquiry.

## 🏗️ Main design choices

### 1. Access rule in the SQL – "not yours" looks like "not found"

- Staff see only inquiries they created; admin sees all.
- The rule is in the `WHERE` clause of every query in `models/inquiry.js`, so the UI can't bypass it.
- A direct link to someone else's inquiry returns **404, not 403**, so the API does not reveal that it exists.

### 2. Status changes follow one small rule map

- `utils/statusRules.js` allows New → In Progress → Resolved, and Resolved → In Progress (reopen). Anything else → **422**.
- The UI only shows the allowed button, but the API decides.
- Every create and status change is saved in `inquiry_history` (who, when, from, to) **in the same transaction**.
  The detail page shows it as an Activity timeline, and a reopened inquiry is shown as "Reopened",
  while the database keeps the brief's three statuses.

### 3. Stale data is caught with a version number (optimistic locking)

- The browser sends the `version` it saw. The update runs `… WHERE id = $1 AND version = $3`.
- If another tab saved first, nothing matches → **409 "changed by someone else, please refresh"** and a Reload button.

## ⚖️ Trade-off I accepted

> [!NOTE]
> Stale data is only found **when the user tries to save**, not the moment another tab changes it.
> Live updates (websockets or polling) would be faster but add a lot of code. The version check is
> small, easy to test, and never lets one person silently overwrite another.

## 🔭 What I would improve next

- Pagination in the API (`LIMIT` / `OFFSET`) instead of in the browser.
- A partial unique index for duplicates (check-then-insert can let two same-moment requests pass).
- A separate test database, more frontend tests, and one end-to-end test.
- One setting for both cookie and token lifetime (the cookie is fixed at 8 hours in code).

## 🧪 Testing

| Area | What is tested | Count |
|---|---|---|
| Backend (Jest + Supertest) | 401 rules; Bob can't open or change Alice's inquiry (404); allowed / blocked status changes (200 / 422); old version → 409; history saved (not on 409); missing contact → 400; bad login input → 400 | 12 |
| Frontend (Vitest + RTL) | Inquiry form: errors when empty; sends the values; Save disabled while saving; keeps the values when the save fails | 4 |

**Gaps:** backend tests use the dev database (each run deletes its own rows); no list / detail page tests; no end-to-end test.

## 🤖 Use of AI

| Tool | What I used it for |
|---|---|
| **Claude** | Pair programmer: explanations, first drafts of code, code reviews, finding bugs |
| **ChatGPT** | UI ideas: I generated mockup images of screens and used them as a visual guide |

I made the decisions, built the UI with my own components and Tailwind theme, and checked every file before committing.

| AI suggestion | What I did | Why |
|---|---|---|
| Keep the login token in `localStorage` (Claude) | ✏️ **Changed** to an httpOnly cookie | JavaScript (and XSS) can't read it |
| A 4th status "Reopened" in the database | ❌ **Rejected** | The brief names three statuses, so "Reopened" is shown from the history |
| A ChatGPT mockup with a dashboard, reports, delete and a free status dropdown | ❌ **Rejected** (kept only the visual style) | Extra features earn no points, and a free dropdown would allow blocked moves like New → Resolved |
| ChatGPT mockups for the detail and new inquiry pages (round back button, activity card, form layout) | ✅ **Accepted** the layout | I rebuilt it with my own components; the logic and API did not change |
| Fix for login crashing (500) on a non-text email (Claude) | ✅ **Accepted**, after proof | I wrote a failing test first, then fixed it (400) |
