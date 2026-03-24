# Project Delphi - Client

React + Vite + TypeScript frontend for admin/student training-points workflows.

## Prerequisites

- Node.js 18+
- npm

## Setup & Run

```bash
npm install
npm run dev
```

Default URL: `http://localhost:5173`

Create `client/.env` from `client/.env.example` for local setup.

## Backend Integration

- API base path is `/api`
- Proxy config: `vite.config.ts` → `/api` forwarded to `VITE_API_PROXY_TARGET` (default `http://localhost:5000`)
- Backend must be running for auth/records actions

## Local Testing Login

- Development quick-login buttons are opt-in.
- Set `VITE_ENABLE_DEV_LOGIN=true` in `client/.env` to show:
	- `Dev Login as Student` (`f20240546@hyderabad.bits-pilani.ac.in`)
	- `Dev Login as Admin` (`admin@hyderabad.bits-pilani.ac.in`)
- These use backend `POST /api/auth/dev-login` and still validate against database users (requires seeded users via `npm run db:seed` in `server`).

## Directory Tree (Client)

```text
client/
├─ README.md
├─ package.json
├─ vite.config.ts
├─ index.html
├─ public/
└─ src/
	 ├─ main.tsx
	 ├─ App.tsx
	 ├─ App.css
	 ├─ index.css
	 ├─ contexts/
	 │  └─ auth.tsx                         # Login state, token persistence, logout
	 ├─ pages/
	 │  └─ Login.tsx                        # Google OAuth page
	 ├─ components/
	 │  ├─ AppLayout.tsx                    # App shell (sidebar + outlet)
	 │  ├─ Sidebar.tsx                      # Role-based navigation
	 │  ├─ Table.tsx                        # Records table + verify action
	 │  ├─ GoogleLogin.tsx                  # Google login component
	 │  ├─ InfoIcon.tsx
	 │  └─ layout/
	 │     └─ createNewRecord.tsx           # Admin add-record form
	 └─ views/
			├─ admin/
			│  ├─ Overview.tsx
			│  └─ tabs/
			│     ├─ NewandPendingRequestsTab.tsx
			│     └─ PreviousVerificationsTab.tsx
			└─ student/
				 ├─ TrainingPoints.tsx
				 ├─ AddTrainingPoints.tsx
				 ├─ AddTrainingEmail.tsx
				 └─ AddTrainingCSV.tsx
```
