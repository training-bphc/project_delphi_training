# Project Delphi Server API

Express + TypeScript + PostgreSQL backend for:
- Auth (Google + dev login)
- Training records
- Verification requests
- Resources
- Events tracking
- Student bulk upload

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL 12+

## Setup

1. Install dependencies:

   npm install

2. Apply migrations:

   npm run db:migrate

3. Optional seed:

   npm run db:seed

## Run

npm run dev

Default base URL: http://localhost:5000

## Scripts

- npm run dev
- npm run db:migrate
- npm run db:reset
- npm run db:seed
- npm run db:clear:test

## Environment Variables

- PORT (default: 5000)
- NODE_ENV (default: development)
- CLIENT_URL (default: http://localhost:5173)
- DATABASE_URL (recommended)
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (alternative to DATABASE_URL)
- JWT_SECRET (required)
- JWT_EXPIRES_IN (default: 7d)
- GOOGLE_CLIENT_ID (required for Google auth)
- GOOGLE_CLIENT_SECRET (optional)

## Auth Model

Most endpoints require JWT auth using:

Authorization: Bearer <token>

Role guards are enforced in routes:
- student
- admin

## Endpoint Summary

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | /api/health | Public | Health check |
| POST | /api/auth/google | Public | Google sign-in |
| POST | /api/auth/dev-login | Public | Dev-only login |
| GET | /api/categories | Authenticated | Training categories |
| GET | /api/records | Authenticated | Optional status query |
| GET | /api/records/by-bits-id/:bitsId | Authenticated | Latest record by bits id |
| POST | /api/records | Authenticated | Create record |
| PATCH | /api/records/:sNo/verify | Admin | Verify record |
| DELETE | /api/records/:sNo | Admin | Soft-delete record |
| POST | /api/records/:sNo/undo | Admin | Undo soft-delete |
| POST | /api/records/bulk-add | Admin | Bulk add records by emails |
| GET | /api/verification-requests | Admin, Student | Student sees own requests |
| POST | /api/verification-requests | Student | Submit request |
| GET | /api/verification-requests/:requestId | Admin | Get one request |
| PATCH | /api/verification-requests/:requestId/verify | Admin | Body uses points |
| PATCH | /api/verification-requests/:requestId/reject | Admin | Body uses rejection_reason |
| GET | /api/resources/tree | Admin, Student | Resource tree |
| POST | /api/resources/folders | Admin | Create folder |
| PATCH | /api/resources/folders/:folderId | Admin | Rename folder |
| DELETE | /api/resources/folders/:folderId | Admin | Delete folder |
| POST | /api/resources | Admin | Create resource |
| PATCH | /api/resources/:resourceId/rename | Admin | Rename resource |
| PATCH | /api/resources/:resourceId/url | Admin | Update resource URL |
| DELETE | /api/resources/:resourceId | Admin | Delete resource |
| POST | /api/students/bulk-upload | Admin | CSV upload |
| GET | /api/events | Admin, Student | List events |
| GET | /api/events/my | Student | Student event statuses |
| GET | /api/events/:eventId | Admin, Student | Event details |
| POST | /api/events | Admin | Create event |
| PATCH | /api/events/:eventId | Admin | Update event |
| DELETE | /api/events/:eventId | Admin | Soft-delete event |
| GET | /api/events/:eventId/registrations | Admin | Registrations for event |
| POST | /api/events/:eventId/registrations/bulk-upload | Admin | CSV import registrations |

## Core Request Contracts

### Auth

POST /api/auth/google
- Body:
  - id_token: string
  - role: student | admin

POST /api/auth/dev-login
- Body:
  - email: string
  - role: student | admin
- Returns 403 in production mode.

### Training Records

GET /api/records
- Query (optional):
  - status: pending | verified | rejected

POST /api/records
- Body:
  - email_id: string (required)
  - date: YYYY-MM-DD (required)
  - category_id: number (required)
  - name?: string
  - bits_id?: string
  - verification_status?: Pending | Verified | Rejected
  - points?: number (>= 0)

PATCH /api/records/:sNo/verify
- No body required.

POST /api/records/bulk-add
- Body:
  - emails: string[] (required)
  - category_id: number (required)
  - points: number (required)

### Verification Requests

POST /api/verification-requests
- Student only
- Body:
  - student_name: string
  - student_email: string
  - proof_link: https Google Drive URL

PATCH /api/verification-requests/:requestId/verify
- Admin only
- Body:
  - points: number (integer, >= 0)

PATCH /api/verification-requests/:requestId/reject
- Admin only
- Body:
  - rejection_reason: string

### Resources

POST /api/resources/folders
- Body:
  - folder_name: string
  - parent_folder_id?: number | null
  - domain_id?: number | null

POST /api/resources
- Body:
  - resource_name: string
  - file_url: string (https only)
  - folder_id: number

### Students Bulk Upload

POST /api/students/bulk-upload
- Content-Type: multipart/form-data
- Field:
  - file: CSV
- CSV headers:
  - email,student_name,roll_number,start_year,end_year,cgpa,sector

### Events Tracking

POST /api/events
- Admin only
- Body:
  - title: string
  - event_type: string
  - event_date: YYYY-MM-DD
  - venue: string
  - url?: string | null
  - is_mandatory?: boolean

PATCH /api/events/:eventId
- Admin only
- Body: any subset of create fields

POST /api/events/:eventId/registrations/bulk-upload
- Admin only
- Content-Type: multipart/form-data
- Field:
  - file: CSV
- CSV headers:
  - email,is_registered,has_attended
- Boolean accepted values:
  - true/false, 1/0, yes/no, y/n

## Common Response Shape

Successful responses usually follow:

{
  "success": true,
  "data": ...
}

Some endpoints also include message and summary fields for bulk operations.

Error responses usually follow:

{
  "success": false,
  "message": "..."
}

## Frontend Integration Notes

This README is primarily useful to frontend for:
- Route discovery
- Access control expectations by role
- Required request fields
- CSV headers for bulk flows

Known limits for frontend consumption:
- It is not an OpenAPI spec, so it lacks machine-readable schemas.
- It does not enumerate every field in every response object.
- It does not provide pagination/filtering conventions beyond existing queries.

If frontend wants stronger integration contracts, add one of these next:
1. OpenAPI spec with request/response schemas and examples.
2. Error code catalog with consistent error keys.
3. Frontend-oriented examples for each major page flow.
