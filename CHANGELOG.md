# Changelog

All notable changes to this project are documented in this file.

## v1.2.2 (26.03.2026, Madhav Ramini)

### Added
- New normalized category model with `training_point_categories` as the single source of truth.
  - Added fields: `category_name`, `description`, `max_points`, `is_mythology`.
  - Seeded default category rows in baseline migration.
- New endpoint: `GET /api/categories` for client-driven category dropdowns and dashboards.
- Admin attribution support (`awarded_by`) on both training points and verification submissions, with foreign key to `admins.email`.
- Category metadata now available in client context for all student/admin flows.

### Changed
- Consolidated schema baseline into a single active migration file.
  - `001_initial_schema.sql` now includes soft delete, verification submission model, normalized categories, and attribution columns.
  - Legacy `002` migration moved to deprecated state.
- Renamed data model tables to match the target structure:
  - `training_records` -> `training_points`
  - `verification_requests` -> `hackathon_submissions` (same business meaning retained)
- API payload contract moved from category-name strings to `category_id`.
  - Record creation and bulk upload now require `category_id`.
  - Backend resolves category display labels via joins.
- Admin identity behavior hardened end-to-end:
  - `added_by` and `awarded_by` are now derived from authenticated user credentials on server side.
  - Removed manual admin identity entry from create-record UI.
- Route security tightened:
  - Records and verification routes now require authentication.
  - Admin-only actions are protected with role authorization.
- Frontend category usage fully DB-backed:
  - Removed hardcoded training category lists from student/admin forms and dashboards.
  - Bulk upload now submits category IDs and refreshes context state without full page reload.
- Google login role fallback refined for deterministic behavior in one attempt:
  - Admin check is attempted first.
  - If user is not a registered admin, flow immediately falls back to student check without requiring a second login attempt.
- Admin create-record flow no longer asks for manual identity input.
  - `added_by` is always derived from authenticated login credentials.

### Fixed
- Foreign key failure on `training_points_awarded_by_fk` caused by manual free-text admin values.
  - Attribution now stores valid logged-in admin email IDs only.
- Verification approval flow now records admin attribution automatically when moving `Pending` -> `Verified`.
- Seed data updated to comply with the new schema and FK constraints across categories and admin attribution.
- Google token verification errors no longer surface as generic `500 Internal server error` for common token issues.
  - Expired/invalid Google ID tokens now return actionable `401` responses.
- Bulk upload testability improvements:
  - Added sample bulk-upload student emails to seed data.
  - UI now reports failed email IDs with reasons while still preserving partial success inserts.

### Notes
- Existing environments using old migrations should recreate/reset DB before applying the consolidated baseline.
- Client and server now assume ID-based category contract; older name-based payloads are rejected.

## v1.2.1 (25.03.2026, Madhav Ramini)

### Added
- Backend migration `002_remove_batches_add_verification_undo.sql`:
  - Removed `students.batch_id` and dropped `batches` table.
  - Added `training_records.deleted_at` for soft-delete/undo.
  - Added `verification_requests` table with statuses (`Pending`, `Verified`, `Rejected`).
- New backend endpoints for records and verification requests:
  - `DELETE /api/records/:sNo`
  - `POST /api/records/:sNo/undo`
  - `POST /api/records/bulk-add`
  - `GET /api/verification-requests`
  - `GET /api/verification-requests/:requestId`
  - `PATCH /api/verification-requests/:requestId/verify`
  - `PATCH /api/verification-requests/:requestId/reject`
- Admin bulk upload UI for assigning points to multiple students from CSV email lists.
- Verification requests admin table with clickable proof links shown as compact `Link` labels.

### Changed
- Admin-created training records are now auto-marked as `Verified` (no pending verification step).
- Records repository now excludes soft-deleted records (`deleted_at IS NULL`) by default.
- Seeding updated for the new schema:
  - Removed batches seeding.
  - Added verification request seed data.
  - Improved student ID lookup for reliable upsert behavior.
- Login/dev UX:
  - Dev bypass buttons are now opt-in via `VITE_ENABLE_DEV_LOGIN=true`.
  - Login watermark alignment/size improved.
- Data-entry UX improvements:
  - Email entry uses fixed domain pattern: `[local-part]@hyderabad.bits-pilani.ac.in`.
  - Date fields default to today in add-record forms.

### Fixed
- Runtime failures caused by schema mismatch after feature rollout:
  - Missing `deleted_at` column on `training_records`.
  - Missing `verification_requests` table.
- Records API stability after migration+seed workflow.

### Notes
- Local development quick-login remains available only when `VITE_ENABLE_DEV_LOGIN=true` is set in `client/.env`.
- Existing endpoints and UI continue to use the shared training category set (no new categories introduced).
