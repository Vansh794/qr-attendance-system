# Product Correction: ID Card QR Scanning

## Correct Primary Workflow

The system is scanner-first.

Faculty/admin users scan QR codes printed on student ID cards. The QR payload provides the student's enrollment number. The app stores each scan as an attendance record against the class/session currently active at that time.

## Landing Page

The website landing page (`/`) must be the ID-card QR scanner, not a dashboard and not a generated session QR code.

## Requirements

- Scan QR codes from student ID cards using the device camera.
- Extract enrollment number from the QR payload.
- Save attendance against the selected/current live class.
- Prevent duplicate attendance for the same student in the same class.
- Keep manual enrollment fallback for unreadable QR codes.
- Keep sessions, dashboards, reports, and exports as supporting features.

## Supported QR Payloads

- `2023CSE001`
- `ENR:2023CSE001`
- `STU:2023CSE001`
- `https://example.edu/id?enrollment=2023CSE001`
- `{"enrollment_number":"2023CSE001"}`
