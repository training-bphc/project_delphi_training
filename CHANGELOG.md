# Changelog

All notable changes to this project are documented in this file.

## v1.2.6 (27.03.2026, Madhav Ramini)

### Added
- Points-assignment step in admin verification flow:
  - Verifying a student submission now requires entering points.
  - Points input is integer-only and required before accept.
  - Decision modal now shows live limits (`0` to remaining allowable points for that category).
- Student verification history now displays assigned points for reviewed requests.
- New migration `004_add_awarded_points_and_training_caps.sql`:
  - Adds `awarded_points` to `hackathon_submissions`.
  - Adds DB-level cap enforcement trigger so verified category totals cannot exceed category `max_points`.

### Changed
- Verification API contract updated to accept points during verify action.
- Verification status updates now follow explicit status-specific decision paths with transactional handling.
- Admin decision modal keeps context and surfaces inline validation/API errors without forcing the user to restart the review flow.
- Seed data updated with non-zero verification points aligned to category limits.

## v1.2.5 (27.03.2026, Vishwa Somayajula)

### Added
- Student verification request workflow on the frontend:
  - New student page for submitting hackathon proof links.
  - Student-side request history sections for `Pending`, `Verified`, and `Rejected` requests.
  - Rejected requests now surface rejection reasons to students.
- New student navigation entry for verification submission and tracking.
- Admin review UX enhancements in pending requests:
  - Proof-review modal before decision.
  - Decision modal with explicit accept/reject flow.
  - Rejection-reason capture UI.
- New migration `003_add_rejection_reason_to_hackathon_submissions.sql` to persist rejection reasons.

### Changed
- Verification request API access model expanded:
  - Students can now fetch their own verification requests.
  - Students can create verification requests.
  - Admin verification/rejection endpoints remain admin-only.
- Verification request payloads now include `rejection_reason` and student-facing metadata needed by the updated UI.
- App-level client context now includes handlers for creating verification requests and rejecting with explicit reasons.
- Migration runner now includes baseline table health-check logic and can reapply baseline schema when marked-applied state is inconsistent.
- Verification decision handling now uses explicit status-specific update paths for `Verified` and `Rejected` actions, with rejection reason persistence as part of the standard decision flow.
- Admin rejection modal input behavior was refined to keep long reasons fully contained within dialog bounds.

### Notes
- Removed legacy `updates.txt` from the repository.

## v1.2.4 (26.03.2026, Madhav Ramini)

### Changed
- Frontend layout refreshed for higher information density and better use of screen width, reducing unnecessary side gutters and scrolling.
- Sidebar identity is now role-aware:
  - Admin: name + email
  - Student: name + email + ID
- Admin Overview redesigned to a student-centric summary view with totals and per-category breakdown.
- Verification views streamlined to show essential review fields (email, date, category, proof links, status).
- Resources UI reorganized under the layout component area and aligned back to CSS module conventions.

### Fixed
- Removed obsolete project info tooltip widget from the app shell.
- Training-points progress bar added.

### Backend
- Verification request payload now includes student identity metadata used by the updated admin tables.

## v1.2.3 (26.03.2026, Madhav Ramini)

### Added
- Full Resources module (folder-style file system for links) across backend and frontend.
  - Database migration `002_resources_module.sql` introducing:
    - `resource_folders` (self-referential tree via `parent_folder_id`)
    - `resources` (link records tied to folders)
    - Referential constraints, sibling-name uniqueness constraints, and lookup indexes for tree traversal.
  - Resource APIs with role-aware access:
    - Read tree: `GET /api/resources/tree` (admin + student)
    - Folder management (admin only):
      - `POST /api/resources/folders`
      - `PATCH /api/resources/folders/:folderId`
      - `DELETE /api/resources/folders/:folderId`
    - Resource management (admin only):
      - `POST /api/resources`
      - `PATCH /api/resources/:resourceId`
      - `DELETE /api/resources/:resourceId`
  - New backend layers for resources:
    - Repository: tree fetch + CRUD operations
    - Service: validation and business guards
    - Controller/routes: request handling and RBAC wiring
  - New React resources views/pages for both roles:
    - Admin: create/rename/delete folders and add/edit/remove links
    - Student: read-only browsing of the same shared resource tree
- Seed data for resources module to provide immediately testable folder/link hierarchy in local environments.

### Changed
- Server route registration updated to mount resources routes in app bootstrap.
- Sidebar/navigation expanded for both admin and student to include resources entry points.
- Resources UI styling naming simplified:
  - Migrated from CSS-module-style naming to plain stylesheet naming.
  - Finalized resource styles in `client/src/components/resources/resources.css`.

### Fixed
- Folder delete behavior now safely rejects deletion when folder is non-empty (contains child folders or resources), preventing accidental structure loss.
- Resources link validation hardened to accept only secure external links (`https://`) to avoid malformed URL entries.

### Notes
- Resources module is intentionally isolated from existing training-points and verification business flows.
- Current resources scope supports folder/link CRUD and hierarchical browsing; move/reorder operations are intentionally out of scope for this release.

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
