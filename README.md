# Project Delphi Training

Monorepo for the Training Unit web app and API.

## Structure

- `client/` - React + Vite frontend
- `server/` - Express + TypeScript + PostgreSQL backend

## Quick Start

1. Start backend:
   ```bash
   cd server
   npm install
   npm run db:migrate
   npm run dev
   ```
2. Start frontend (new terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```

Frontend uses Vite proxy for `/api` to `http://localhost:5000`.

## Test Data (Backend)

From `server/`:

- Add test records: `npm run db:seed:test`
- Remove test records: `npm run db:clear:test`

## Notes

- Backend records API is DB-backed (`training_records` table).
- See `server/README.md` for environment variables and endpoint details.
