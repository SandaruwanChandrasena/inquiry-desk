# Inquiry Desk

A small web app for tracking customer inquiries.

Staff sign in, record an inquiry, find it later, and move it through **New → In Progress → Resolved**.
Every create and status change is saved with who did it and when.

Built for the Coffee Ninja Full-Stack Intern assessment.
Design choices and trade-offs are in [DECISIONS.md](DECISIONS.md).

## Stack

| Part | Tools |
|---|---|
| Frontend | React 19 + Vite, React Router, Tailwind CSS v4 |
| Backend | Node.js + Express 5 (ES modules) |
| Database | PostgreSQL, `pg` with plain SQL, `.sql` migration files |
| Auth | bcrypt + JWT in an httpOnly cookie |
| Validation | zod (API), plus checks in the form and in the database |
| Tests | Jest + Supertest (backend), Vitest + React Testing Library (frontend) |

## What you need

- Node.js 22 (tested with 22.17)
- PostgreSQL 17 (any recent version should work)
- Git

## Setup

### 1. Clone

```bash
git clone https://github.com/SandaruwanChandrasena/inquiry-desk.git
cd inquiry-desk
```

### 2. Create the database

In `psql` (or pgAdmin), create an empty database:

```sql
CREATE DATABASE inquiry_desk;
```

### 3. Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`:

```bash
cp .env.example .env        # Windows (cmd): copy .env.example .env
```

Open `.env` and change two values:

- `DB_PASSWORD` – your PostgreSQL password
- `JWT_SECRET` – any long random string

Create the tables and the test accounts, then start the API:

```bash
npm run migrate
npm run seed
npm run dev
```

The API runs on **http://localhost:4000**.
Check it with http://localhost:4000/api/health.

### 4. Frontend

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

The Vite dev server forwards `/api` requests to the backend on port 4000.
So the browser sees one site: the login cookie works and no CORS setup is needed.
The backend must be running first.

## Test accounts

All passwords: `Password123!`

| Email | Role | Sees |
|---|---|---|
| alice@example.com | staff | only inquiries Alice created |
| bob@example.com | staff | only inquiries Bob created |
| admin@example.com | admin | all inquiries |

## Running the tests

### Backend (11 tests)

```bash
cd backend
npm test
```

- Needs `npm run migrate` and `npm run seed` first (the tests log in as Alice and Bob).
- Uses the same database as the dev server. Each run deletes only the rows it created.

### Frontend (4 tests)

```bash
cd frontend
npm test
```

- Tests the inquiry form: missing fields, saving state, and a failed save.
- No database or backend needed.

## Main features

- **Sign in / out** – the API checks the cookie on every inquiry request (401 if missing or invalid).
- **New inquiry** – customer name, email and/or phone (at least one), subject, description.
- **Inquiry list** – status badge, status filter, search by name or subject, page size 5 / 10 / 20.
- **Detail page** – status steps, only the allowed next action as a button, and an activity timeline.
- **Status rules** – New → In Progress → Resolved. Resolved can be reopened (back to In Progress).
  A reopened inquiry is shown as "Reopened".

## The three situations from the brief

| Situation | How to see it |
|---|---|
| Missing or invalid input | Open **New inquiry** and press Save with empty fields. The form shows errors. The API also rejects bad data on its own (400) – see the backend tests or send a bad request in Postman. Sending the same open inquiry twice gives 409. |
| Two tabs, stale data | Open the same inquiry in two tabs. Change the status in tab 1. Then try to change it in tab 2. Tab 2 gets "changed by someone else" (409) and a Reload button. |
| Direct link to someone else's inquiry | Sign in as Alice and create an inquiry. Copy its URL. Sign out, sign in as Bob, and open the URL. Bob sees "not found" – the API returns 404, so it does not even reveal that the inquiry exists. |

## API overview

All inquiry routes need a signed-in user.

| Method | Path | What it does |
|---|---|---|
| POST | /api/auth/login | Sign in, sets the cookie |
| POST | /api/auth/logout | Clears the cookie |
| GET | /api/auth/me | Current user |
| GET | /api/inquiries?status=&search= | List (own inquiries, or all for admin) |
| GET | /api/inquiries/:id | One inquiry + its history |
| POST | /api/inquiries | Create |
| PATCH | /api/inquiries/:id/status | Change status. Body: `{ "status": "in_progress", "version": 1 }` |

Error codes: 400 invalid input or ID, 401 not signed in, 404 not found or not yours,
409 duplicate or changed by someone else, 422 status change not allowed.

## Folder structure

```
inquiry-desk/
├── backend/
│   ├── db/            migrations (.sql), migrate.js, seed.js
│   ├── src/
│   │   ├── routes/      HTTP: read the request, send the response
│   │   ├── models/      SQL queries
│   │   ├── middleware/  requireAuth, errorHandler
│   │   ├── validation/  zod schemas
│   │   └── utils/       status rules
│   └── tests/
└── frontend/
    └── src/
        ├── api/         fetch helper
        ├── context/     signed-in user
        ├── components/  layout, form, badges, timeline
        ├── pages/       login, list, new, detail, 404
        └── tests/
```
