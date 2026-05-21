# QR Attendance System

React/Vite implementation of the QR Attendance Tracker described in the local product, technical, and frontend design documents.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS brutalist UI tokens
- Supabase Auth, PostgreSQL, and Realtime
- `react-qr-code` for session QR generation
- `html5-qrcode` for browser scanning
- PapaParse, jsPDF, and jsPDF AutoTable for exports

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Docs

- `docs/PRD_QR_Attendance_Tracker.md`
- `docs/TRD_QR_Attendance_Tracker.md`
- `docs/Frontend_Design_Document_Brutalist.md`
