# Changelog

All notable changes to this project are documented in this file.

## 25.03.2026 1:20AM - Madhav Ramini

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
