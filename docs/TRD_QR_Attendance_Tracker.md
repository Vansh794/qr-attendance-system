# Technical Requirements Document (TRD)
## QR Attendance Tracker — Web Application
**Version:** 1.0.0  
**Date:** May 2026  
**Supabase Project ID:** `qwaamzrkgesiqxghisuq`  
**Supabase Project URL:** `https://qwaamzrkgesiqxghisuq.supabase.co`  
**Region:** ap-south-1 (Mumbai)

> **Correction applied after review:** The app is scanner-first. Faculty/admin users scan student ID-card QR codes, parse the enrollment number, and save the attendance record against the live class/session. The session QR-generation sections are superseded by `Product_Correction_ID_Card_QR_Scanning.md`.

---

## 1. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 + Vite | Fast dev, tree-shaking, component reuse |
| Styling | Tailwind CSS (custom config) | Utility-first; easy brutalist overrides |
| State | Zustand or React Context | Lightweight; no Redux overhead for this scope |
| Routing | React Router v6 | Client-side SPA routing |
| Backend | Supabase (PostgreSQL + Auth + Realtime) | Zero-infra, real-time out of the box |
| QR Generation | `react-qr-code` | Lightweight, SVG-based |
| QR Scanning | `html5-qrcode` | Browser-native, no native app needed |
| Export | `papaparse` (CSV) + `jspdf` + `jspdf-autotable` (PDF) | Client-side export |
| Hosting | Vercel / Netlify | Static + serverless, free tier sufficient |

---

## 2. Database Schema (Supabase — PostgreSQL)

**Project:** `qwaamzrkgesiqxghisuq` — Schema is LIVE and MIGRATED.

### 2.1 Table: `departments`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
name        TEXT NOT NULL UNIQUE          -- e.g. "Computer Science & Engineering"
code        TEXT NOT NULL UNIQUE          -- e.g. "CSE"
created_at  TIMESTAMPTZ DEFAULT now()
```

### 2.2 Table: `courses`
```sql
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
name           TEXT NOT NULL              -- e.g. "Data Structures & Algorithms"
code           TEXT NOT NULL UNIQUE       -- e.g. "CSE301"
department_id  UUID REFERENCES departments(id)
credits        INTEGER DEFAULT 3
created_at     TIMESTAMPTZ DEFAULT now()
```

### 2.3 Table: `students`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
enrollment_number TEXT NOT NULL UNIQUE    -- e.g. "2023CSE001"
full_name         TEXT NOT NULL
email             TEXT UNIQUE
phone             TEXT
department_id     UUID REFERENCES departments(id)
semester          INTEGER CHECK (1..10)
batch_year        INTEGER
is_active         BOOLEAN DEFAULT true
qr_token          TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT
created_at        TIMESTAMPTZ DEFAULT now()
updated_at        TIMESTAMPTZ DEFAULT now()
```
> `qr_token` is the student's persistent identifier encoded in their personal QR code (student ID card QR). This is separate from the session QR.

### 2.4 Table: `sessions`
```sql
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
course_id      UUID REFERENCES courses(id) ON DELETE CASCADE
faculty_name   TEXT
session_date   DATE NOT NULL DEFAULT CURRENT_DATE
start_time     TIME NOT NULL
end_time       TIME
room           TEXT
qr_secret      TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT
qr_expires_at  TIMESTAMPTZ                -- NULL = never expires
is_active      BOOLEAN DEFAULT true
created_at     TIMESTAMPTZ DEFAULT now()
```

### 2.5 Table: `attendance_records`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE
session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE
marked_at   TIMESTAMPTZ DEFAULT now()
method      TEXT CHECK IN ('qr_scan', 'manual_enrollment', 'manual_name')
marked_by   TEXT DEFAULT 'system'
ip_address  INET
device_info TEXT
status      TEXT CHECK IN ('present', 'late', 'absent') DEFAULT 'present'
notes       TEXT
UNIQUE(student_id, session_id)             -- Prevents duplicate entries
```

### 2.6 Table: `admin_users`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
email       TEXT NOT NULL UNIQUE
full_name   TEXT NOT NULL
role        TEXT CHECK IN ('super_admin', 'admin', 'faculty') DEFAULT 'faculty'
is_active   BOOLEAN DEFAULT true
created_at  TIMESTAMPTZ DEFAULT now()
```

### 2.7 Database Indexes
```sql
idx_students_enrollment    ON students(enrollment_number)
idx_students_qr_token      ON students(qr_token)
idx_attendance_session     ON attendance_records(session_id)
idx_attendance_student     ON attendance_records(student_id)
idx_attendance_marked_at   ON attendance_records(marked_at)
idx_sessions_date          ON sessions(session_date)
idx_sessions_course        ON sessions(course_id)
```

### 2.8 Views
**`attendance_summary`** — Pre-computed attendance % per student per course  
**`todays_attendance`** — All attendance records for today with joined student + session data

---

## 3. API Design (Supabase Client)

All data access uses the Supabase JS SDK (`@supabase/supabase-js`). No custom REST API needed in v1.

### 3.1 Environment Variables
```env
VITE_SUPABASE_URL=https://qwaamzrkgesiqxghisuq.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key_from_supabase_dashboard>
```

### 3.2 Key Queries

#### Create a Session
```javascript
const { data, error } = await supabase
  .from('sessions')
  .insert({
    course_id,
    faculty_name,
    session_date,
    start_time,
    room,
    qr_expires_at: expiresAt  // null if no expiry
  })
  .select()
  .single();
```

#### Validate + Mark Attendance via QR Scan
```javascript
// Step 1: Validate session
const { data: session } = await supabase
  .from('sessions')
  .select('*')
  .eq('id', sessionId)
  .eq('qr_secret', qrSecret)
  .eq('is_active', true)
  .single();

// Step 2: Check expiry
if (session.qr_expires_at && new Date(session.qr_expires_at) < new Date()) {
  throw new Error('QR_EXPIRED');
}

// Step 3: Resolve student by qr_token (if embedded) or enrollment_number
const { data: student } = await supabase
  .from('students')
  .select('id, full_name, enrollment_number')
  .eq('qr_token', studentQrToken)
  .eq('is_active', true)
  .single();

// Step 4: Insert attendance (upsert to handle retries gracefully)
const { data, error } = await supabase
  .from('attendance_records')
  .upsert({
    student_id: student.id,
    session_id: session.id,
    method: 'qr_scan',
    status: 'present',
    device_info: navigator.userAgent
  }, { onConflict: 'student_id,session_id', ignoreDuplicates: true })
  .select();
```

#### Manual Attendance by Enrollment Number
```javascript
// Search student
const { data: students } = await supabase
  .from('students')
  .select('id, full_name, enrollment_number, department_id')
  .ilike('enrollment_number', `%${searchQuery}%`)
  .eq('is_active', true)
  .limit(10);

// Mark attendance
const { error } = await supabase
  .from('attendance_records')
  .upsert({
    student_id: selectedStudent.id,
    session_id: activeSessionId,
    method: 'manual_enrollment',
    marked_by: currentFacultyEmail,
    status: 'present'
  }, { onConflict: 'student_id,session_id', ignoreDuplicates: true });
```

#### Real-time Attendance Feed
```javascript
const channel = supabase
  .channel(`session-${sessionId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'attendance_records',
    filter: `session_id=eq.${sessionId}`
  }, (payload) => {
    // Update live count + list
    dispatch({ type: 'ADD_ATTENDANCE', payload });
  })
  .subscribe();
```

#### Get Attendance Summary for a Session
```javascript
const { data } = await supabase
  .from('attendance_records')
  .select(`
    id, marked_at, method, status,
    students (full_name, enrollment_number, semester)
  `)
  .eq('session_id', sessionId)
  .order('marked_at', { ascending: true });
```

---

## 4. Application Routes

```
/                          → Landing / Login
/login                     → Faculty login (Supabase Auth)
/dashboard                 → Faculty home — active sessions, today's stats
/sessions/new              → Create new session form
/sessions/:id              → Session view — QR code display + live attendance list
/sessions/:id/attendance   → Manual attendance marking panel
/attend                    → Student-facing QR scan landing page (public, no auth)
                             Query params: ?session=<id>&token=<qr_secret>
/admin                     → Admin dashboard — aggregate stats
/admin/students            → Student management (CRUD)
/admin/reports             → Attendance reports + exports
/admin/courses             → Course & department management
```

---

## 5. QR Code Specification

### Session QR (displayed by faculty)
- **Encodes:** `https://<domain>/attend?session=<session_uuid>&token=<qr_secret>`
- **Refresh:** Faculty can regenerate `qr_secret` mid-session (invalidates old scans)
- **Display size:** 400×400px minimum for projector visibility
- **Error correction:** Level H (30%) for reliability

### Student ID QR (on student ID card — future feature)
- **Encodes:** `qr_token` field from `students` table
- **Format:** `STU:<qr_token>`

### QR Expiry Logic
```javascript
// Computed on server/client before insert
if (session.qr_expires_at) {
  const now = new Date();
  const expiry = new Date(session.qr_expires_at);
  if (now > expiry) return { error: 'Session QR has expired' };
}
```

---

## 6. Authentication & Authorization

| Role | Auth Method | Access |
|------|-------------|--------|
| Student (scan) | None — public route | `/attend` only |
| Faculty | Supabase Auth (email/password) | `/dashboard`, `/sessions/*` |
| Admin | Supabase Auth (email/password) | All routes |

**Row Level Security (RLS):** Disabled in development. Enable for production using policies:
- Faculty can only read/write their own sessions
- Admin can read everything
- Public (`anon` role) can only INSERT into `attendance_records` with valid session token

---

## 7. Realtime Architecture

Supabase Realtime WebSocket is used for live attendance updates on the session page.

```
Faculty Browser ←──── WebSocket ←─── Supabase Realtime
                                           ↑
Student Browser ──── HTTP POST ──→ Supabase DB (INSERT)
                                           │
                                     triggers realtime
                                       broadcast
```

---

## 8. Export Implementation

### CSV Export
```javascript
import Papa from 'papaparse';

const csv = Papa.unparse(attendanceData.map(r => ({
  'Enrollment No': r.students.enrollment_number,
  'Name': r.students.full_name,
  'Marked At': new Date(r.marked_at).toLocaleString(),
  'Method': r.method,
  'Status': r.status
})));

const blob = new Blob([csv], { type: 'text/csv' });
saveAs(blob, `attendance-${sessionId}.csv`);
```

### PDF Export
```javascript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const doc = new jsPDF();
doc.text(`Session Report — ${courseName}`, 14, 20);
autoTable(doc, {
  head: [['Enrollment', 'Name', 'Time', 'Method', 'Status']],
  body: rows,
  startY: 30
});
doc.save(`attendance-${sessionId}.pdf`);
```

---

## 9. Performance Considerations

- Supabase `anon` key scoped to INSERT only on `attendance_records` for student-facing routes (no data leakage)
- Debounced search (300ms) on enrollment number input
- Realtime channel unsubscribed on component unmount
- QR code rendered as SVG (no canvas repaints)
- Lazy load admin/report pages with `React.lazy()`

---

## 10. Deployment Checklist

- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel/Netlify env vars
- [ ] Enable RLS on `attendance_records` and `sessions` before going live
- [ ] Set up Supabase Auth with email confirmations disabled (institution use)
- [ ] Configure custom domain (optional)
- [ ] Test QR scan on iOS Safari and Android Chrome
- [ ] Verify Realtime works behind institution firewall (may need WebSocket fallback)
- [ ] Set `qr_expires_at` default to `now() + 30 minutes` in session creation form

---

## 11. Supabase Project Details

| Property | Value |
|----------|-------|
| Project Name | qr-attendance-tracker |
| Project ID | `qwaamzrkgesiqxghisuq` |
| Region | ap-south-1 (Mumbai) |
| Database | PostgreSQL 15 |
| Realtime | Enabled |
| Auth | Enabled |
| Migrations Applied | `initial_schema` (full schema + seed data) |
| Seeded Departments | CSE, ECE, ME, CE, MBA |
| Seeded Courses | CSE301, CSE302, CSE303, CSE304, ECE301 |
| Seeded Students | 5 sample students |
