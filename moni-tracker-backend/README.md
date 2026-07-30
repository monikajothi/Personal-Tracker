# Moni Wellness Tracker — API

Express + MongoDB backend. JWT auth, per-user entries with edit history,
and a small analytics service (cycle prediction, correlation, weekly summary).

## Setup

1. Install MongoDB locally, or create a free cluster at mongodb.com/atlas and
   copy its connection string.
2. `cp .env.example .env` and fill in `MONGO_URI` (and change `JWT_SECRET`
   to any long random string).
3. `npm install`
4. `npm run dev` — starts on `http://localhost:4000` and restarts on save.

## Endpoints

**Auth**
- `POST /api/auth/signup` — `{ name, email, password }` → `{ token, user }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`

All routes below require `Authorization: Bearer <token>`.

**Entries**
- `GET /api/entries?start=YYYY-MM-DD&end=YYYY-MM-DD` — entries in range (defaults to last 60 days)
- `GET /api/entries/:date` — one day's categories
- `GET /api/entries/:date/history` — snapshots of that day's previous states
- `PUT /api/entries/:date` — `{ category, data }`, merges + snapshots history

**Settings**
- `GET /api/settings`
- `PUT /api/settings` — partial update, any settings field

**Analytics**
- `GET /api/analytics/cycle-prediction`
- `GET /api/analytics/correlation?a=sleep.duration&b=mood.energy`
- `GET /api/analytics/weekly-summary`

## Data model notes

- One `Entry` document per `(user, date)`. `categories` is flexible on purpose —
  each tracker (sleep, water, mood, cycle, …) has its own shape.
- Every `PUT` snapshots the *previous* `categories` into `history` (capped at
  the last 20 edits) before overwriting — that's what gives real edit history
  instead of silent overwrites.
- Multi-device sync falls out of this for free: since data lives server-side
  keyed by user, any device that logs in sees the same entries.

## Testing the API quickly

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Moni","email":"moni@example.com","password":"testpass123"}'

# copy the returned token, then:
curl -X PUT http://localhost:4000/api/entries/2026-07-29 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"category":"water","data":{"glasses":4}}'
```
