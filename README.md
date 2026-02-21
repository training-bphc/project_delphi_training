# Project Delphi Training

Monorepo for the Training Unit web application.

- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript + PostgreSQL

## Quick Start

### 1) Backend
```bash
cd server
npm install
npm run db:migrate
npm run dev
```

### 2) Frontend
```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to backend `http://localhost:5000`.

## Repository Tree

```text
project_delphi_training/
├─ README.md
├─ client/
│  ├─ README.md
│  ├─ package.json
│  ├─ vite.config.ts
│  ├─ public/
│  └─ src/
│     ├─ App.tsx                         # Routing + auth gate + records context
│     ├─ App.css
│     ├─ main.tsx                        # React entry
│     ├─ contexts/
│     │  └─ auth.tsx                     # Auth context + token persistence
│     ├─ pages/
│     │  └─ Login.tsx                    # Google login page
│     ├─ components/
│     │  ├─ AppLayout.tsx
│     │  ├─ Sidebar.tsx
│     │  ├─ Table.tsx
│     │  ├─ GoogleLogin.tsx
│     │  ├─ InfoIcon.tsx
│     │  └─ layout/
│     │     └─ createNewRecord.tsx
│     └─ views/
│        ├─ admin/
│        │  ├─ Overview.tsx
│        │  └─ tabs/
│        │     ├─ NewandPendingRequestsTab.tsx
│        │     └─ PreviousVerificationsTab.tsx
│        └─ student/
│           ├─ TrainingPoints.tsx
│           ├─ AddTrainingPoints.tsx
│           ├─ AddTrainingEmail.tsx
│           └─ AddTrainingCSV.tsx
└─ server/
   ├─ README.md
   ├─ package.json
   ├─ tsconfig.json
   ├─ test.rest
   └─ src/
      ├─ index.ts                        # Express app bootstrap
      ├─ config/
      │  ├─ db.ts                        # PostgreSQL pool
      │  └─ jwt.ts                       # JWT sign/verify helpers
      ├─ controllers/
      │  ├─ authController.ts
      │  └─ recordsController.ts
      ├─ repositories/
      │  └─ recordsRepository.ts         # SQL layer
      ├─ services/
      │  └─ recordsService.ts            # Business layer
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
      │  ├─ seed.ts
      │  ├─ seedTestData.ts
      │  ├─ clearTestData.ts
      │  └─ migrations/
      │     └─ 001_initial_schema.sql
      ├─ types/
      │  └─ index.ts
      └─ utils/
         └─ asyncHandler.ts
```

## Notes

- Record IDs are standardized as `s_no` across API and client.
- BITS ID validation is enforced on the client in admin record creation.
- Training categories in student/admin flows follow the latest placement policy categories.
