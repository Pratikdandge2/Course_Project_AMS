# Alumni Management System (VCET Alumni Association Portal)

This workspace contains a full-stack Alumni Management System as described in `alumni-management-system.md`.

## Prerequisites

- **Node.js (LTS)** installed (includes `npm`)
- **PostgreSQL** running locally (or a hosted Postgres URL)

## Project layout

```
AMS/
├── backend/   # Express + Prisma + Postgres (REST API)
└── frontend/  # Next.js (App Router) + Tailwind UI
```

## Quick start (after installing Node.js)

### 1) Backend

Create `backend/.env` from `backend/.env.example`, then:

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2) Frontend

Create `frontend/.env.local` from `frontend/.env.example`, then:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

