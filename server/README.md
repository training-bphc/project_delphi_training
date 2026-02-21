# Project Delphi - Server

Express + TypeScript + PostgreSQL API for auth and training records.

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL 12+

## Setup

```bash
npm install
npm run db:migrate
```

Create `server/.env` (or update existing values).

## Run

```bash
npm run dev
```

Default server URL: `http://localhost:5000`

## Scripts

- `npm run dev` - Start server in watch mode
- `npm run db:migrate` - Apply SQL migrations
- `npm run db:reset` - Drop and recreate the `public` schema (full reset)
- `npm run db:seed` - Seed test users (admins/students) and training records
- `npm run db:clear:test` - Remove deterministic test records

## Environment Variables

- `PORT` (default `5000`)
- `NODE_ENV` (default `development`)
- `CLIENT_URL` (recommended `http://localhost:5173`)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` (required)
- `JWT_EXPIRES_IN` (default `7d`)
- `GOOGLE_CLIENT_ID` (required)
- `GOOGLE_CLIENT_SECRET` (if used by your OAuth setup)

## API Endpoints

### Health
- `GET /api/health`

### Auth
- `POST /api/auth/google`

### Records
- `GET /api/records`
- `GET /api/records?status=pending|verified|rejected`
- `GET /api/records/by-bits-id/:bitsId`
- `POST /api/records`
- `PATCH /api/records/:sNo/verify`

## Directory Tree (Server)

```text
server/
├─ README.md
├─ package.json
├─ tsconfig.json
├─ .env.example
├─ test.rest
└─ src/
   ├─ index.ts                            # Express bootstrap + middleware + routes
   ├─ config/
   │  ├─ db.ts                            # PostgreSQL connection pool
   │  └─ jwt.ts                           # JWT sign/verify
   ├─ controllers/
   │  ├─ authController.ts
   │  └─ recordsController.ts
   ├─ repositories/
   │  └─ recordsRepository.ts             # SQL queries
   ├─ services/
   │  └─ recordsService.ts                # Validation/business layer
   ├─ routes/
   │  ├─ authRoutes.ts
   │  ├─ recordsRoutes.ts
   │  └─ roles/
   │     ├─ adminRoutes.ts
   │     └─ studentRoutes.ts
   ├─ middleware/
   │  ├─ auth.ts
   │  └─ logger.ts
   ├─ db/
   │  ├─ migrate.ts
   │  ├─ seedAll.ts                       # Unified seed (users + test training records)
   │  ├─ resetDatabase.ts
   │  ├─ clearTestData.ts
   │  └─ migrations/
   │     ├─ 001_initial_schema.sql
   │     └─ 002_allow_multiple_records_per_student.sql
   ├─ types/
   │  └─ index.ts
   └─ utils/
      └─ asyncHandler.ts
```

## Data Contract Notes

- Records API returns serial number as `s_no`.
- Status values: `Pending | Verified | Rejected`.
- SQL queries are parameterized.
