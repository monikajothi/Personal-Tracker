# Moni's Wellness Tracker — Frontend

React (Vite) frontend, talks to the Express/MongoDB API in the sibling
`moni-tracker-backend` project. Real auth, server-stored entries, and
backend-computed analytics (cycle prediction, correlations, weekly summary).

## Setup

1. Get the backend running first (see its README) — you need its URL.
2. `cp .env.example .env` and set `VITE_API_URL` if your API isn't on
   `http://localhost:4000/api`.
3. `npm install`
4. `npm run dev` — opens on `http://localhost:5173`

## Structure

```
src/
  api/            fetch client + grouped endpoint functions (auth, entries, settings, analytics)
  hooks/          useAuth (session), useEntries, useSettings, useReminders
  theme/          theme tokens (6 palettes + dark mode)
  constants.js    categories, moods, date helpers, isCategoryDone()
  components/     shared UI primitives, forms, modal, nav, companion
  pages/          one file per screen (Dashboard, Calendar, Insights, Journal, Garden, Settings, Login)
  App.jsx         auth gate + tab routing + modal orchestration
```

## What's real vs. what's simplified (worth knowing for an interview)

- **Real:** JWT auth, password hashing, per-user data isolation, edit
  history stored server-side, cycle prediction / correlation / weekly
  summary computed on the backend from actual stored data.
- **Simplified on purpose:** reminders are a client-side `Notification`
  call (only fires while the tab is open) rather than real push
  notifications — that would need a service worker + VAPID keys, which
  is a reasonable "next step" to mention if asked.
- Session token lives in `localStorage` for simplicity; a production
  app would likely use an httpOnly cookie to reduce XSS exposure —
  also a good thing to be able to name if asked.
