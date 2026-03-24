# Project Delphi - Operational Instructions

## Section 1: Constraints for Adding a New Record from Admin Side

When admin creates a training record, follow these constraints strictly:

1. Required payload fields
   - `email_id` (student email)
   - `date`
   - `category`
   - `added_by`

2. Points validation
   - `points` must be a non-negative number.
   - Invalid values return: `400 points must be a non-negative number`.

3. Student must exist
   - If `name` and `bits_id` are not sent, backend resolves them from `students` table using `email_id`.
   - If no matching student exists, API returns: `404 Student not found for provided email`.

4. Database-level identity constraint
   - `training_records(bits_id, email_id)` must match `students(roll_number, email)` due to foreign key.
   - Record creation fails if student identity does not exist in `students`.

5. Verification status rules
   - Default status is `Pending`.
   - Allowed values are only: `Pending`, `Verified`, `Rejected`.

6. Category consistency
   - Use categories from frontend dropdown to avoid inconsistent labels in reporting.

7. Practical admin usage note
   - In current admin form, sending `email_id + date + category + points + added_by` is sufficient.
   - Backend auto-resolves missing `name` and `bits_id` from student master data.

## Section 2: What to Change When Moving from Testing Setup to Organization Development Setup

Use this checklist when switching from personal/testing Supabase to organization Supabase and real API targets.

### A) Backend database and environment switch

1. File to update
   - `server/.env`

2. Keys to change
   - `DATABASE_URL` -> replace with organization Supabase Postgres connection string.
   - `SUPABASE_URL` -> replace with organization Supabase project URL.
   - `JWT_SECRET` -> replace with organization-level secure secret.
   - `CLIENT_URL` -> set to correct frontend URL for that environment.
   - `NODE_ENV` -> keep `development` for internal dev; set `production` only for production runtime.

3. Why this matters
   - `server/src/config/db.ts` reads `DATABASE_URL` first.
   - Wrong DB URL means auth and records APIs will fail.

### B) Client API target and OAuth switch

1. File to update
   - `client/.env`

2. Keys to change
   - `VITE_API_PROXY_TARGET` -> set to real backend API host if not local.
   - `VITE_GOOGLE_CLIENT_ID` -> replace with organization Google OAuth client ID.

3. Why this matters
   - `client/vite.config.ts` proxies `/api` to `VITE_API_PROXY_TARGET` in dev.
   - Login page uses `VITE_GOOGLE_CLIENT_ID` for Google sign-in.

### C) Postman switch from local to real API

1. File to update
   - `server/postman/Delphi-Local.postman_environment.json`

2. Key to change
   - `baseUrl` from `http://localhost:5000` to your real API URL.

3. Optional updates
   - Keep `bitsId`, `studentEmail`, `sNo` aligned with organization seed/test data.

### D) Dev-login behavior (important)

1. Dev login route
   - `POST /api/auth/dev-login` exists for non-production convenience only.

2. Production safety
   - In `server/src/controllers/authController.ts`, dev-login is blocked when `NODE_ENV=production`.

3. Recommendation
   - Use Google OAuth (`/api/auth/google`) for org-integrated environments.

### E) Minimal verification after switch

Run these checks after environment replacement:

1. Backend checks
   - `npm run db:migrate`
   - `npm run db:seed` (if test data is needed)
   - `npm run dev`
   - Verify: `GET /api/health`

2. Client checks
   - `npm run dev`
   - Confirm login and records fetch/create/verify flow.

3. Postman checks
   - Use updated `baseUrl` and verify health/auth/records endpoints.
