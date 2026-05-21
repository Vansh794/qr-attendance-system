export type AttendanceMethod = 'qr_scan' | 'manual_enrollment' | 'manual_name'
export type AttendanceStatus = 'present' | 'late' | 'absent'
export type AdminRole = 'super_admin' | 'admin' | 'faculty'
export type QrScanSource = 'camera' | 'image_upload' | 'manual_entry'
export type QrScanResultStatus =
  | AttendanceResult['status']
  | 'no_active_session'
  | 'unreadable'

export type Department = {
  id: string
  name: string
  code: string
  created_at: string
}

export type Course = {
  id: string
  name: string
  code: string
  department_id: string | null
  credits: number
  created_at: string
  departments?: Department | null
}

export type Student = {
  id: string
  enrollment_number: string
  full_name: string
  email: string | null
  phone: string | null
  department_id: string | null
  semester: number | null
  batch_year: number | null
  is_active: boolean
  qr_token: string
  created_at: string
  updated_at: string
  departments?: Department | null
}

export type Session = {
  id: string
  course_id: string | null
  faculty_name: string | null
  session_date: string
  start_time: string
  end_time: string | null
  room: string | null
  qr_secret: string
  qr_expires_at: string | null
  is_active: boolean
  created_at: string
  courses?: Course | null
}

export type AttendanceRecord = {
  id: string
  student_id: string
  session_id: string
  marked_at: string
  method: AttendanceMethod
  marked_by: string
  ip_address: string | null
  device_info: string | null
  status: AttendanceStatus
  notes: string | null
  students?: Student | null
}

export type QrScanLog = {
  id: string
  session_id: string | null
  raw_payload: string
  parsed_enrollment_number: string | null
  result_status: QrScanResultStatus
  attendance_record_id: string | null
  scan_source: QrScanSource
  camera_label: string | null
  device_info: string | null
  error_message: string | null
  created_at: string
}

export type AdminUser = {
  id: string
  email: string
  full_name: string
  role: AdminRole
  is_active: boolean
  created_at: string
}

export type SessionCreateInput = {
  course_id: string
  faculty_name: string
  session_date: string
  start_time: string
  room?: string
  qr_expires_at?: string | null
}

export type AttendanceResult =
  | {
      status: 'success'
      record: AttendanceRecord
      student: Student
      session: Session
    }
  | {
      status: 'duplicate'
      record?: AttendanceRecord
      student: Student
      session: Session
      message: string
    }
  | {
      status: 'expired' | 'closed' | 'invalid_session' | 'student_not_found' | 'error'
      message: string
    }

export type AttendanceExportRow = {
  enrollmentNumber: string
  studentName: string
  email: string
  courseCode: string
  courseName: string
  sessionDate: string
  markedAt: string
  method: AttendanceMethod
  status: AttendanceStatus
}
