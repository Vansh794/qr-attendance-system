# QR Attendance System

React/Vite implementation of a scanner-first QR Attendance Tracker.

The primary workflow is faculty/admin scanning QR codes printed on student ID cards. The scanned QR payload is parsed into an enrollment number and saved against the class/session currently running.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS brutalist UI tokens
- Supabase Auth, PostgreSQL, and Realtime
- `html5-qrcode` for student ID card scanning
- PapaParse, jsPDF, and jsPDF AutoTable for exports

## Primary Flow

1. Open `/`.
2. Select the current live class.
3. Start the camera scanner.
4. Scan student ID-card QR codes containing enrollment numbers.
5. Attendance is stored against the selected live session.

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
