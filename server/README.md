# Project Delphi - Server

Express + TypeScript + PostgreSQL API for authentication and training records.

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL 12+

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` in `server/` (use `.env.example` as reference).
3. Run migrations:
   ```bash
   npm run db:migrate
   ```

## Run

```bash
npm run dev
```

Server starts on `http://localhost:5000` (or `PORT` from `.env`).

## Main Scripts

- `npm run dev` - Start server in watch mode
- `npm run db:migrate` - Run SQL migrations
- `npm run db:seed:test` - Insert/update deterministic test records
- `npm run db:clear:test` - Remove seeded test records (`added_by = API_TEST_SEED`)

## Environment Variables

- `PORT` (default `5000`)
- `NODE_ENV` (default `development`)
- `CLIENT_URL` (default `http://localhost:3000`)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` (**required**)
- `JWT_EXPIRES_IN` (default `7d`)
- `GOOGLE_CLIENT_ID` (**required**)

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

## Notes

- Records are stored in PostgreSQL table: `training_records`.
- Queries are parameterized to prevent SQL injection.
- Role route files exist but are not yet implemented.
