# Product Requirements Document (PRD)
## QR Attendance Tracker — Web Application
**Version:** 1.0.0  
**Date:** May 2026  
**Status:** Draft  
**Project ID (Supabase):** `qwaamzrkgesiqxghisuq` (Region: ap-south-1)

---

## 1. Executive Summary

The QR Attendance Tracker is a web-based attendance management system for educational institutions. It allows faculty to create session-linked QR codes that students scan to mark themselves present, with a manual fallback via enrollment number search. The system provides real-time dashboards, attendance analytics, and downloadable reports.

---

## 2. Problem Statement

Current attendance mechanisms in colleges are:
- **Paper-based** — error-prone, slow, and not searchable
- **Manual roll-call** — consumes 5–10 minutes of every class
- **Spreadsheet-based** — no real-time insight, no automation
- **Biometric** — expensive hardware, no portability

There is no lightweight, device-agnostic solution that works from a faculty's phone or laptop and allows students to self-mark attendance instantly and verifiably.

---

## 3. Goals & Non-Goals

### Goals
- Allow faculty to generate a session QR code in under 10 seconds
- Allow students to scan the QR and mark attendance in under 5 seconds
- Allow manual attendance marking via enrollment number search
- Provide a real-time list of who has attended a session
- Provide per-student, per-course attendance percentage dashboards
- Support multiple departments, courses, and semesters simultaneously
- Be fully responsive (mobile + desktop)

### Non-Goals (v1.0)
- Native mobile app (PWA is acceptable)
- Biometric or face recognition
- LMS integration (Moodle, Canvas)
- SMS/Email notification to students
- Geo-fencing attendance validation
- Multi-institution (SaaS) support

---

## 4. User Personas

### Persona 1: Faculty / Admin
- **Name:** Dr. Rajesh Kumar
- **Role:** Creates sessions, monitors attendance, exports reports
- **Device:** Laptop (primary), mobile (secondary)
- **Pain point:** Roll-call wastes lecture time; spreadsheets are a nightmare to maintain
- **Need:** One-click session QR, real-time attendance dashboard

### Persona 2: Student
- **Name:** Priya Mehta
- **Role:** Scans QR or submits enrollment number to mark attendance
- **Device:** Smartphone (primary)
- **Pain point:** Attendance disputes with no digital proof
- **Need:** Instant confirmation that attendance was recorded

### Persona 3: Administrator (HOD / Registrar)
- **Role:** Reviews aggregate reports, monitors defaulters, exports data
- **Device:** Desktop / laptop
- **Need:** Department-wide analytics, defaulter lists

---

## 5. User Stories

### Faculty
| ID | Story | Priority |
|----|-------|----------|
| F-01 | As faculty, I want to create a new session for a course so that students can mark attendance for that class. | P0 |
| F-02 | As faculty, I want to display a QR code on the projector so students can scan it with their phones. | P0 |
| F-03 | As faculty, I want to see a real-time list of who has checked in, updating live as students scan. | P0 |
| F-04 | As faculty, I want to manually add a student by enrollment number if their phone doesn't work. | P0 |
| F-05 | As faculty, I want to set an expiry time on the QR code so it can't be scanned after class ends. | P1 |
| F-06 | As faculty, I want to close a session and mark all remaining students as absent. | P1 |
| F-07 | As faculty, I want to export attendance for a session as CSV/PDF. | P1 |

### Student
| ID | Story | Priority |
|----|-------|----------|
| S-01 | As a student, I want to scan a QR code shown in class to mark my attendance. | P0 |
| S-02 | As a student, I want to type my enrollment number if I can't scan the QR. | P0 |
| S-03 | As a student, I want immediate visual feedback confirming my attendance was recorded. | P0 |
| S-04 | As a student, I want to see my attendance percentage per subject. | P2 |

### Admin
| ID | Story | Priority |
|----|-------|----------|
| A-01 | As admin, I want a dashboard showing attendance rates across all courses. | P1 |
| A-02 | As admin, I want to see a list of students below 75% attendance (defaulters). | P1 |
| A-03 | As admin, I want to manage student records (add/edit/deactivate). | P1 |

---

## 6. Functional Requirements

### 6.1 Session Management
- Faculty can create a session specifying: Course, Date, Start Time, Room, Faculty Name
- System auto-generates a unique `qr_secret` per session
- QR code encodes a URL: `https://app.domain.com/attend?session={session_id}&token={qr_secret}`
- QR codes can have an optional expiry timestamp
- Sessions can be marked active/closed manually

### 6.2 QR Scan Attendance Flow
1. Student opens camera or QR scanner, scans code
2. Browser navigates to the encoded URL
3. System validates: session exists → session is active → QR not expired → student exists by `qr_token` in URL or prompts for enrollment number
4. If all valid: inserts record into `attendance_records`
5. Student sees success screen with name + timestamp
6. If already marked: shows "already recorded" screen

### 6.3 Manual Attendance (Enrollment Number)
- Faculty-facing page: search box for enrollment number
- Typeahead search returns matching students
- One-click to mark present for the active session
- Method field recorded as `manual_enrollment`

### 6.4 Attendance Dashboard
- Per-session: total enrolled vs. present count, live updating list
- Per-course: session-wise attendance trend chart
- Per-student: subject-wise attendance percentage table
- Defaulter report: students < configurable threshold (default 75%)

### 6.5 Export
- Session attendance: CSV and PDF
- Course report: Excel-compatible CSV

---

## 7. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | QR scan → attendance recorded in < 2 seconds |
| Availability | 99.5% uptime (Supabase-backed) |
| Scalability | Support up to 500 concurrent QR scans per institution |
| Security | QR tokens are UUID-based; session secrets rotate per session |
| Responsiveness | Works on 320px–4K screens |
| Browser Support | Chrome 90+, Safari 14+, Firefox 88+, Edge 90+ |
| Accessibility | WCAG 2.1 AA compliance for faculty dashboard |

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Time to mark attendance (QR) | < 5 seconds per student |
| Faculty session creation time | < 30 seconds |
| QR scan success rate | > 98% |
| System error rate | < 0.5% per session |
| Faculty adoption rate | > 80% within 4 weeks of launch |

---

## 9. Dependencies

- **Supabase** — PostgreSQL database, Auth, Realtime subscriptions
- **QR Code library** — `qrcode.js` or `react-qr-code` for generation
- **QR Scanner library** — `html5-qrcode` or `zxing` for browser scanning
- **Auth** — Supabase Auth (email/password for faculty; no auth for student scan page)

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Students share QR screenshots | Short QR expiry (15–30 min); refresh option for faculty |
| No internet in classroom | Offline-first PWA with sync queue (v2) |
| Student doesn't have smartphone | Manual enrollment number entry fallback |
| Duplicate attendance attempts | `UNIQUE(student_id, session_id)` constraint in DB |

---

## 11. Out of Scope (Future Versions)

- v2: Geo-fencing (student must be within campus WiFi/GPS boundary)
- v2: Face recognition via device camera
- v3: Multi-institution SaaS with billing
- v3: Parent/guardian portal to view attendance
