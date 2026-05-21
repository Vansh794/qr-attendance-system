import type { AttendanceRecord, Course, Department, Session, Student } from '../types/database'

const now = new Date()
const today = now.toISOString().slice(0, 10)
const expires = new Date(now.getTime() + 30 * 60 * 1000).toISOString()

export const demoDepartments: Department[] = [
  {
    id: 'dept-cse',
    name: 'Computer Science & Engineering',
    code: 'CSE',
    created_at: now.toISOString(),
  },
  {
    id: 'dept-ece',
    name: 'Electronics & Communication Engineering',
    code: 'ECE',
    created_at: now.toISOString(),
  },
]

export const demoCourses: Course[] = [
  {
    id: 'course-cse301',
    name: 'Data Structures & Algorithms',
    code: 'CSE301',
    department_id: 'dept-cse',
    credits: 3,
    created_at: now.toISOString(),
    departments: demoDepartments[0],
  },
  {
    id: 'course-cse302',
    name: 'Database Management Systems',
    code: 'CSE302',
    department_id: 'dept-cse',
    credits: 4,
    created_at: now.toISOString(),
    departments: demoDepartments[0],
  },
  {
    id: 'course-ece301',
    name: 'Digital Signal Processing',
    code: 'ECE301',
    department_id: 'dept-ece',
    credits: 3,
    created_at: now.toISOString(),
    departments: demoDepartments[1],
  },
]

export const demoStudents: Student[] = [
  {
    id: 'student-aarav',
    enrollment_number: '2023CSE001',
    full_name: 'Aarav Sharma',
    email: 'aarav.sharma@example.edu',
    phone: null,
    department_id: 'dept-cse',
    semester: 5,
    batch_year: 2023,
    is_active: true,
    qr_token: 'stu-aarav-token',
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    departments: demoDepartments[0],
  },
  {
    id: 'student-priya',
    enrollment_number: '2023CSE002',
    full_name: 'Priya Mehta',
    email: 'priya.mehta@example.edu',
    phone: null,
    department_id: 'dept-cse',
    semester: 5,
    batch_year: 2023,
    is_active: true,
    qr_token: 'stu-priya-token',
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    departments: demoDepartments[0],
  },
  {
    id: 'student-sneha',
    enrollment_number: '2023ECE001',
    full_name: 'Sneha Gupta',
    email: 'sneha.gupta@example.edu',
    phone: null,
    department_id: 'dept-ece',
    semester: 5,
    batch_year: 2023,
    is_active: true,
    qr_token: 'stu-sneha-token',
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    departments: demoDepartments[1],
  },
]

export const demoSessions: Session[] = [
  {
    id: 'session-live-cse301',
    course_id: 'course-cse301',
    faculty_name: 'Dr. Rajesh Kumar',
    session_date: today,
    start_time: '09:00',
    end_time: null,
    room: 'Room 301',
    qr_secret: 'demo-session-secret',
    qr_expires_at: expires,
    is_active: true,
    created_at: now.toISOString(),
    courses: demoCourses[0],
  },
  {
    id: 'session-closed-cse302',
    course_id: 'course-cse302',
    faculty_name: 'Dr. Ananya Rao',
    session_date: today,
    start_time: '11:00',
    end_time: '11:50',
    room: 'Lab 4',
    qr_secret: 'closed-session-secret',
    qr_expires_at: now.toISOString(),
    is_active: false,
    created_at: now.toISOString(),
    courses: demoCourses[1],
  },
]

export const demoAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'attendance-aarav',
    student_id: 'student-aarav',
    session_id: 'session-live-cse301',
    marked_at: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
    method: 'qr_scan',
    marked_by: 'system',
    ip_address: null,
    device_info: 'Demo browser',
    status: 'present',
    notes: null,
    students: demoStudents[0],
  },
  {
    id: 'attendance-priya',
    student_id: 'student-priya',
    session_id: 'session-live-cse301',
    marked_at: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
    method: 'manual_enrollment',
    marked_by: 'faculty@example.edu',
    ip_address: null,
    device_info: 'Demo browser',
    status: 'present',
    notes: null,
    students: demoStudents[1],
  },
]
