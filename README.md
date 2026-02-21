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
│  └─ src/
│     ├─ App.tsx
│     ├─ components/
│     └─ views/
└─ server/
   ├─ README.md
   ├─ package.json
   └─ src/
      ├─ controllers/
      ├─ services/
      ├─ repositories/
      ├─ routes/
      └─ db/
```

