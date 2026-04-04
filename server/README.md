# Project Delphi - Server

Express + TypeScript + PostgreSQL API for authentication, training records, verification requests, and learning resources.

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL 12+

## Setup

```bash
npm install
npm run db:migrate
npm run db:seed  # Optional: seed test data
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
- `DATABASE_URL` (recommended)
- Optional alternative: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` (required)
- `JWT_EXPIRES_IN` (default `7d`)
- `GOOGLE_CLIENT_ID` (required)
- `GOOGLE_CLIENT_SECRET` (optional)

---

## API Endpoints

### Legend
- Public (no auth required)
- Authenticated (JWT token in `Authorization: Bearer <token>` header required)
- Student role required
- Admin role required

---

## Quick Reference

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | Public | Server health check |
| POST | `/api/auth/google` | Public | Google OAuth login |
| POST | `/api/auth/dev-login` | Public | Dev-only login |
| GET | `/api/categories` | Authenticated | Get training categories |
| GET | `/api/records` | Authenticated | Get training records |
| GET | `/api/records/by-bits-id/:bitsId` | Authenticated | Get student's latest record |
| POST | `/api/records` | Authenticated | Create training record |
| PATCH | `/api/records/:sNo/verify` | Admin | Verify record & award points |
| DELETE | `/api/records/:sNo` | Admin | Delete record |
| POST | `/api/records/:sNo/undo` | Admin | Restore deleted record |
| POST | `/api/records/bulk-add` | Admin | Bulk add training records |
| GET | `/api/verification-requests` | Authenticated | Get verification requests |
| POST | `/api/verification-requests` | Student | Submit verification request |
| GET | `/api/verification-requests/:requestId` | Admin | Get specific request |
| PATCH | `/api/verification-requests/:requestId/verify` | Admin | Approve request |
| PATCH | `/api/verification-requests/:requestId/reject` | Admin | Reject request |
| GET | `/api/resources/tree` | Authenticated | Get all resources |
| POST | `/api/resources/folders` | Admin | Create folder |
| PATCH | `/api/resources/folders/:folderId` | Admin | Rename folder |
| DELETE | `/api/resources/folders/:folderId` | Admin | Delete folder |
| POST | `/api/resources` | Admin | Create resource |
| PATCH | `/api/resources/:resourceId/rename` | Admin | Rename resource |
| PATCH | `/api/resources/:resourceId/url` | Admin | Update resource URL |
| DELETE | `/api/resources/:resourceId` | Admin | Delete resource |
| POST | `/api/students/bulk-upload` | Admin | Bulk upload students (CSV) |

---

## Detailed Endpoint Documentation

All endpoints in a single copyable format:

```
GET /api/health
Headers: None
Body: None
Query Params: None

Response (200):
{
  "success": true,
  "message": "Server is running"
}
```

---

```
POST /api/auth/google
Headers: Content-Type: application/json
Body:
{
  "id_token": "google-oauth-id-token",
  "role": "student" | "admin"
}

Response (200 - Student):
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "roll_number": "2024A8PS0546H",
    "student_name": "John Doe",
    "email": "john@hyderabad.bits-pilani.ac.in",
    "start_year": 2024,
    "end_year": 2028,
    "cgpa": 8.5,
    "sector": "IT"
  }
}

Response (200 - Admin):
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "admin_name": "Admin User",
    "email": "admin@hyderabad.bits-pilani.ac.in"
  }
}

Errors:
- 400: id_token or role missing
- 401: Invalid Google token
- 403: User not registered or ineligible
```

---

```
POST /api/auth/dev-login
Headers: Content-Type: application/json
Body:
{
  "email": "user@hyderabad.bits-pilani.ac.in",
  "role": "student" | "admin"
}

Response (200): Same as /auth/google

Errors:
- 400: email or role missing
- 403: User not found or dev-login disabled
```

---

```
GET /api/categories
Headers: Authorization: Bearer <token>
Body: None
Query Params: None

Response (200):
{
  "success": true,
  "data": [
    {
      "category_id": 1,
      "category_name": "Mock Interviews",
      "description": "Interview simulation sessions",
      "max_points": 12,
      "is_mythology": false
    }
  ]
}
```

---

```
GET /api/records
Headers: Authorization: Bearer <token>
Body: None
Query Params: status=pending|verified|rejected (optional)

Response (200):
{
  "success": true,
  "data": [
    {
      "s_no": 1,
      "name": "John Doe",
      "bits_id": "2024A8PS0546H",
      "email_id": "john@hyderabad.bits-pilani.ac.in",
      "date": "2026-01-15",
      "category_id": 2,
      "category": "Mock Interviews",
      "added_by": "admin@hyderabad.bits-pilani.ac.in",
      "verification_status": "Verified",
      "points": 8,
      "awarded_by": "admin@hyderabad.bits-pilani.ac.in",
      "deleted_at": null
    }
  ]
}
```

---

```
GET /api/records/by-bits-id/:bitsId
Headers: Authorization: Bearer <token>
Body: None
Query Params: None

Response (200):
{
  "success": true,
  "data": {
    "s_no": 1,
    "name": "John Doe",
    "bits_id": "2024A8PS0546H",
    "email_id": "john@hyderabad.bits-pilani.ac.in",
    "date": "2026-01-15",
    "category_id": 2,
    "category": "Mock Interviews",
    "added_by": "admin@hyderabad.bits-pilani.ac.in",
    "verification_status": "Verified",
    "points": 8,
    "awarded_by": "admin@hyderabad.bits-pilani.ac.in",
    "deleted_at": null
  }
}

Errors:
- 404: Record not found
```

---

```
POST /api/records
Headers: Authorization: Bearer <token>, Content-Type: application/json
Body:
{
  "email_id": "john@hyderabad.bits-pilani.ac.in",
  "date": "2026-02-20",
  "category_id": 1,
  "name": "John Doe",
  "bits_id": "2024A8PS0546H",
  "verification_status": "Pending",
  "points": 5
}

Response (201):
{
  "success": true,
  "data": {
    "s_no": 2,
    "name": "John Doe",
    "bits_id": "2024A8PS0546H",
    "email_id": "john@hyderabad.bits-pilani.ac.in",
    "date": "2026-02-20",
    "category_id": 1,
    "category": "Mock Interviews",
    "added_by": "admin@hyderabad.bits-pilani.ac.in",
    "verification_status": "Pending",
    "points": 5,
    "awarded_by": null,
    "deleted_at": null
  }
}

Errors:
- 400: Missing required fields or invalid values
- 404: Student not found
```

---

```
PATCH /api/records/:sNo/verify
Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
Body:
{
  "awarded_points": 10
}

Response (200):
{
  "success": true,
  "data": {
    "s_no": 1,
    "name": "John Doe",
    "bits_id": "2024A8PS0546H",
    "email_id": "john@hyderabad.bits-pilani.ac.in",
    "date": "2026-01-15",
    "category_id": 2,
    "category": "Mock Interviews",
    "added_by": "admin@hyderabad.bits-pilani.ac.in",
    "verification_status": "Verified",
    "points": 10,
    "awarded_by": "admin@hyderabad.bits-pilani.ac.in",
    "deleted_at": null
  }
}

Errors:
- 403: Only admin can verify
- 404: Record not found
```

---

```
DELETE /api/records/:sNo
Headers: Authorization: Bearer <admin-token>
Body: None
Query Params: None

Response (200):
{
  "success": true,
  "message": "Record deleted"
}

Errors:
- 403: Only admin can delete
- 404: Record not found
```

---

```
POST /api/records/:sNo/undo
Headers: Authorization: Bearer <admin-token>
Body: None
Query Params: None

Response (200):
{
  "success": true,
  "message": "Record restored"
}

Errors:
- 403: Only admin can undo
- 404: Record not found or not deleted
```

---

```
POST /api/records/bulk-add
Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
Body:
{
  "emails": ["student1@hyderabad.bits-pilani.ac.in", "student2@hyderabad.bits-pilani.ac.in"],
  "category_id": 3,
  "points": 5
}

Response (201):
{
  "success": true,
  "data": {
    "success": 2,
    "failed": 0,
    "errors": [],
    "records": [
      {
        "s_no": 3,
        "name": "Student One",
        "bits_id": "2024A8PS0001H",
        "email_id": "student1@hyderabad.bits-pilani.ac.in",
        "date": "2026-04-04",
        "category_id": 3,
        "category": "Sectorial Briefs",
        "added_by": "admin@hyderabad.bits-pilani.ac.in",
        "verification_status": "Verified",
        "points": 5,
        "awarded_by": "admin@hyderabad.bits-pilani.ac.in",
        "deleted_at": null
      }
    ]
  }
}

Errors:
- 400: Invalid category_id or missing emails
- 403: Only admin
```

---

```
GET /api/verification-requests
Headers: Authorization: Bearer <token>
Body: None
Query Params: None

Response (200):
{
  "success": true,
  "data": [
    {
      "request_id": 1,
      "student_id": 5,
      "student_name": "Jane Smith",
      "student_email": "jane@hyderabad.bits-pilani.ac.in",
      "student_bits_id": "2023A8PS1100H",
      "category_id": 1,
      "category": "Hackathons/Competitions",
      "description": "Participated in HackerEarth hackathon",
      "proof_links": ["https://example.com/cert"],
      "status": "Pending",
      "awarded_points": null,
      "rejection_reason": null,
      "awarded_by": null,
      "created_at": "2026-02-01T10:30:00Z",
      "updated_at": "2026-02-01T10:30:00Z"
    }
  ]
}
```

---

```
POST /api/verification-requests
Headers: Authorization: Bearer <student-token>, Content-Type: application/json
Body:
{
  "student_email": "john@hyderabad.bits-pilani.ac.in",
  "student_name": "John Doe",
  "proof_link": "https://drive.google.com/file/d/example"
}

Response (201):
{
  "success": true,
  "data": {
    "request_id": 2,
    "student_id": 1,
    "student_name": "John Doe",
    "student_email": "john@hyderabad.bits-pilani.ac.in",
    "student_bits_id": "2024A8PS0546H",
    "category_id": 2,
    "category": "Mock Interviews",
    "description": null,
    "proof_links": ["https://drive.google.com/file/d/example"],
    "status": "Pending",
    "awarded_points": null,
    "rejection_reason": null,
    "awarded_by": null,
    "created_at": "2026-04-04T14:00:00Z",
    "updated_at": "2026-04-04T14:00:00Z"
  }
}

Errors:
- 400: Missing required fields
- 403: Only students
```

---

```
GET /api/verification-requests/:requestId
Headers: Authorization: Bearer <admin-token>
Body: None
Query Params: None

Response (200):
{
  "success": true,
  "data": { /* VerificationRequest object */ }
}

Errors:
- 403: Only admin
- 404: Request not found
```

---

```
PATCH /api/verification-requests/:requestId/verify
Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
Body:
{
  "awarded_points": 8
}

Response (200):
{
  "success": true,
  "data": {
    "request_id": 1,
    "status": "Verified",
    "awarded_points": 8,
    "awarded_by": "admin@hyderabad.bits-pilani.ac.in",
    "updated_at": "2026-04-04T14:05:00Z"
  }
}

Errors:
- 403: Only admin
- 404: Request not found
```

---

```
PATCH /api/verification-requests/:requestId/reject
Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
Body:
{
  "rejection_reason": "Insufficient proof provided"
}

Response (200):
{
  "success": true,
  "data": {
    "request_id": 1,
    "status": "Rejected",
    "rejection_reason": "Insufficient proof provided",
    "awarded_by": "admin@hyderabad.bits-pilani.ac.in",
    "updated_at": "2026-04-04T14:05:00Z"
  }
}

Errors:
- 403: Only admin
- 404: Request not found
```

---

```
GET /api/resources/tree
Headers: Authorization: Bearer <token>
Body: None
Query Params: None

Response (200):
{
  "success": true,
  "data": {
    "folders": [
      {
        "folder_id": 1,
        "folder_name": "Placement Prep",
        "parent_folder_id": null,
        "children": [
          {
            "folder_id": 2,
            "folder_name": "Interview Prep",
            "parent_folder_id": 1,
            "children": []
          }
        ]
      }
    ],
    "resources": [
      {
        "resource_id": 1,
        "resource_name": "LeetCode Guide",
        "resource_type": "external_link",
        "file_url": "https://leetcode.com/...",
        "folder_id": 2
      }
    ]
  }
}
```

---

```
POST /api/resources/folders
Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
Body:
{
  "folder_name": "System Design",
  "parent_folder_id": 1
}

Response (201):
{
  "success": true,
  "data": {
    "folder_id": 3,
    "folder_name": "System Design",
    "parent_folder_id": 1
  }
}
```

---

```
PATCH /api/resources/folders/:folderId
Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
Body:
{
  "folder_name": "Advanced System Design"
}

Response (200):
{
  "success": true,
  "message": "Folder renamed"
}
```

---

```
DELETE /api/resources/folders/:folderId
Headers: Authorization: Bearer <admin-token>
Body: None
Query Params: None

Response (200):
{
  "success": true,
  "message": "Folder deleted"
}
```

---

```
POST /api/resources
Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
Body:
{
  "resource_name": "System Design Primer",
  "resource_type": "external_link",
  "file_url": "https://github.com/donnemartin/system-design-primer",
  "folder_id": 2
}

Response (201):
{
  "success": true,
  "data": {
    "resource_id": 1,
    "resource_name": "System Design Primer",
    "resource_type": "external_link",
    "file_url": "https://github.com/donnemartin/system-design-primer",
    "folder_id": 2
  }
}
```

---

```
PATCH /api/resources/:resourceId/rename
Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
Body:
{
  "resource_name": "Updated Resource Name"
}

Response (200):
{
  "success": true,
  "message": "Resource renamed"
}
```

---

```
PATCH /api/resources/:resourceId/url
Headers: Authorization: Bearer <admin-token>, Content-Type: application/json
Body:
{
  "file_url": "https://new-url.com"
}

Response (200):
{
  "success": true,
  "message": "Resource URL updated"
}
```

---

```
DELETE /api/resources/:resourceId
Headers: Authorization: Bearer <admin-token>
Body: None
Query Params: None

Response (200):
{
  "success": true,
  "message": "Resource deleted"
}
```

---

```
POST /api/students/bulk-upload
Headers: Authorization: Bearer <admin-token>, Content-Type: multipart/form-data
Body: Form-data with 'file' field containing CSV
Query Params: None

CSV Format (required columns):
email,student_name,roll_number,start_year,end_year,cgpa,sector
f20260001@hyderabad.bits-pilani.ac.in,Alice Smith,2026A8PS0001H,2026,2030,8.5,IT
f20260002@hyderabad.bits-pilani.ac.in,Bob Jones,2026A8PS0002H,2026,2030,7.2,Core

Response (201 - Full Success):
{
  "success": true,
  "message": "Bulk upload completed. 2 students added, 0 failed.",
  "data": {
    "summary": {
      "total_processed": 2,
      "successful": 2,
      "failed": 0
    },
    "students": [
      {
        "student_id": 11,
        "email": "f20260001@hyderabad.bits-pilani.ac.in",
        "student_name": "Alice Smith",
        "roll_number": "2026A8PS0001H",
        "start_year": 2026,
        "end_year": 2030,
        "cgpa": 8.5,
        "sector": "IT"
      },
      {
        "student_id": 12,
        "email": "f20260002@hyderabad.bits-pilani.ac.in",
        "student_name": "Bob Jones",
        "roll_number": "2026A8PS0002H",
        "start_year": 2026,
        "end_year": 2030,
        "cgpa": 7.2,
        "sector": "Core"
      }
    ],
    "errors": []
  }
}

Response (201 - Partial Failure):
{
  "success": true,
  "message": "Bulk upload completed. 1 student added, 1 failed.",
  "data": {
    "summary": {
      "total_processed": 2,
      "successful": 1,
      "failed": 1
    },
    "students": [
      {
        "student_id": 11,
        "email": "f20260001@hyderabad.bits-pilani.ac.in",
        "student_name": "Alice Smith",
        "roll_number": "2026A8PS0001H",
        "start_year": 2026,
        "end_year": 2030,
        "cgpa": 8.5,
        "sector": "IT"
      }
    ],
    "errors": [
      {
        "row": 3,
        "email": "f20260002@hyderabad.bits-pilani.ac.in",
        "error": "CGPA must be between 0 and 10, got: 15"
      }
    ]
  }
}

CSV Validation Rules:
- email: Valid email format, must not exist in database
- student_name: Non-empty string
- roll_number: Non-empty string (min 3 chars)
- start_year: Integer, 1900-2100
- end_year: Integer, 1900-2100, must be >= start_year
- cgpa: Number between 0-10 (decimal allowed)
- sector: One of: IT, ET, Core, FinTech

Errors:
- 400: File missing, invalid format, or invalid CSV structure
- 403: Only admin can upload
```

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
   │  ├─ recordsController.ts
   │  ├─ studentController.ts             # Bulk student upload handler
   │  ├─ verificationRequestsController.ts
   │  └─ resourcesController.ts
   ├─ repositories/
   │  ├─ recordsRepository.ts             # Training records SQL queries
   │  ├─ studentRepository.ts             # Student bulk insert queries
   │  └─ resourcesRepository.ts
   ├─ services/
   │  ├─ recordsService.ts                # Training records validation/business logic
   │  ├─ studentService.ts                # CSV parsing & student validation
   │  └─ resourcesService.ts
   ├─ routes/
   │  ├─ authRoutes.ts
   │  ├─ recordsRoutes.ts
   │  ├─ studentRoutes.ts                 # Bulk upload endpoint
   │  ├─ resourcesRoutes.ts
   │  └─ verificationRequestsRoutes.ts
   ├─ middleware/
   │  ├─ auth.ts                          # JWT authentication & authorization
   │  └─ logger.ts
   ├─ db/
   │  ├─ migrate.ts
   │  ├─ seedAll.ts                       # Unified seed (users + test training records)
   │  ├─ resetDatabase.ts
   │  ├─ clearTestData.ts
   │  └─ migrations/
   │     ├─ 001_initial_schema.sql        # Baseline schema with CGPA, sector, ENUM
   │     ├─ 002_remove_batches_add_verification_undo.sql
   │     ├─ 003_add_rejection_reason_to_hackathon_submissions.sql
   │     └─ 004_add_awarded_points_and_training_caps.sql
   ├─ types/
   │  └─ index.ts                         # TypeScript interfaces & types
   └─ utils/
      └─ asyncHandler.ts                  # Express async error handler
```
