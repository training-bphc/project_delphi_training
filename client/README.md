# Project Delphi - Client

React + Vite frontend for Training Unit record workflows.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Default URL: `http://localhost:5173`

## Backend Integration

- Client calls backend through `/api`.
- Vite proxy in `vite.config.ts` points `/api` to `http://localhost:5000`.
- Start backend first (`server/`) for records/auth API calls.

## Main Views

- Overview table
- New/Pending requests
- Previous verifications

All record data is fetched from backend APIs (not local JSON runtime data).

