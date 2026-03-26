# Bridgeburners

> *"They were the finest soldiers the Malazan Empire ever produced. And the Empire spent them like coin."*
> — Steven Erikson, Gardens of the Moon

A private platform for the squad. Real-time chat, a leaderboard, and access control — built for people who don't need an introduction.

---

## What it is

A full-stack web application with:

- **Authentication** — register and log in with hashed passwords, JWT-style bearer tokens, single active session per user
- **Access control** — users must be permitted by an admin before they can access anything beyond the waiting page
- **Real-time chat** — WebSocket-powered messaging with pagination, unread counters, and notification sounds
- **Leaderboard** — score tracking with admin controls to adjust individual scores
- **Admin panel** — permit or revoke user access, manage the squad roster

---

## Stack

**Frontend** — React, TypeScript, Vite, Tailwind CSS v4

**Backend** — Node.js, Express, Prisma, PostgreSQL, WebSockets (`ws`)

---

## Project structure

```
Bridgeburners/
├── frontend/   # React + Vite
└── backend/    # Express + Prisma
```

---

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL (or Docker)

### Backend

```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env   # fill in VITE_API_URL and VITE_API_SECRET
npm install
npm run dev
```

---

## Environment variables

### Backend (`.env`)

| Variable | Description |
|---|---|
| `PORT` | Port to run the server on (default `3000`) |
| `API_SECRET` | Shared secret required on every request via `x-api-secret` header |
| `ADMIN_EMAILS` | Comma-separated list of emails that are automatically granted admin role on register |
| `DATABASE_URL` | PostgreSQL connection string |

### Frontend (`.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL |
| `VITE_API_SECRET` | Matches the backend `API_SECRET` |

---

## Quotes

> *"Never trust a man who can't look you in the eye, and never trust a man who can."*
> — Whiskeyjack, Gardens of the Moon

> *"Fisher once wrote that the Bridgeburners were the Empire's most expendable soldiers precisely because they were its finest. Command feared what it could not control. So it spent them. Again and again."*
> — Steven Erikson, Gardens of the Moon

> *"No plan, sergeant. Just courage. And that's the most terrifying thing in the world."*
> — Gardens of the Moon

---

## The motto

*We burn the bridge and we keep walking.*

There is no going back. No retreat, no surrender of identity. The Bridgeburners do not preserve their options — they commit, fully, to whatever is ahead. The bridge burns behind them not out of recklessness, but out of certainty.

---

*For the squad. You know who you are.*
