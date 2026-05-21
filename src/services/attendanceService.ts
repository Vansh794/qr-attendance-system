import { isExpired } from '../lib/dates'
import { getSupabaseClient, supabase } from '../lib/supabase'
import { getSessionById } from './sessionService'
import { ensureStudentByEnrollment } from './studentService'
import type { AttendanceRecord, AttendanceResult, Student } from '../types/database'

const storageKey = 'qr-attendance-records'

function readLocalAttendance() {
  if (typeof window === 'undefined') return []
  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return []
  return JSON.parse(stored) as AttendanceRecord[]
}

function writeLocalAttendance(records: AttendanceRecord[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, JSON.stringify(records))
}

function makeLocalRecord(sessionId: string, student: Student, method: AttendanceRecord['method']) {
  return {
    id: `attendance-${sessionId}-${student.id}`,
    student_id: student.id,
    session_id: sessionId,
    marked_at: new Date().toISOString(),
    method,
    marked_by: method === 'qr_scan' ? 'system' : 'faculty',
    ip_address: null,
    device_info: typeof navigator === 'undefined' ? null : navigator.userAgent,
    status: 'present',
    notes: null,
    students: student,
  } satisfies AttendanceRecord
}

export async function getAttendanceForSession(
  sessionId: string,
): Promise<AttendanceRecord[]> {
  if (!supabase) {
    return readLocalAttendance().filter((record) => record.session_id === sessionId)
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*, students (*, departments (*))')
    .eq('session_id', sessionId)
    .order('marked_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as AttendanceRecord[]
}

export async function markAttendanceByEnrollment({
  sessionId,
  token,
  enrollmentNumber,
  method = 'qr_scan',
}: {
  sessionId: string
  token: string
  enrollmentNumber: string
  method?: AttendanceRecord['method']
}): Promise<AttendanceResult> {
  const session = await getSessionById(sessionId)

  if (!session || session.qr_secret !== token) {
    return { status: 'invalid_session', message: 'Invalid class session.' }
  }

  if (!session.is_active) {
    return { status: 'closed', message: 'This session is closed.' }
  }

  if (isExpired(session.qr_expires_at)) {
    return { status: 'expired', message: 'This class session has expired.' }
  }

  const student = await ensureStudentByEnrollment(enrollmentNumber)

  if (!supabase) {
    const records = readLocalAttendance()
    const duplicate = records.find(
      (record) => record.session_id === sessionId && record.student_id === student.id,
    )

    if (duplicate) {
      return {
        status: 'duplicate',
        message: 'Attendance already recorded.',
        record: duplicate,
        student,
        session,
      }
    }

    const record = makeLocalRecord(sessionId, student, method)
    writeLocalAttendance([record, ...records])
    return { status: 'success', record, student, session }
  }

  const { data, error } = await getSupabaseClient()
    .from('attendance_records')
    .insert({
      student_id: student.id,
      session_id: session.id,
      method,
      status: 'present',
      device_info: typeof navigator === 'undefined' ? null : navigator.userAgent,
      marked_by: method === 'qr_scan' ? 'system' : 'faculty',
    })
    .select('*, students (*, departments (*))')
    .single()

  if (error?.code === '23505') {
    const { data: existingRecord } = await supabase
      .from('attendance_records')
      .select('*, students (*, departments (*))')
      .eq('student_id', student.id)
      .eq('session_id', session.id)
      .maybeSingle()

    return {
      status: 'duplicate',
      message: 'Attendance already recorded.',
      record: (existingRecord as AttendanceRecord | null) ?? undefined,
      student,
      session,
    }
  }

  if (error) return { status: 'error', message: error.message }

  return {
    status: 'success',
    record: data as AttendanceRecord,
    student,
    session,
  }
}

export function subscribeToAttendance(
  sessionId: string,
  onInsert: (record: AttendanceRecord) => void,
) {
  if (!supabase) return () => undefined

  const channel = supabase
    .channel(`session-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'attendance_records',
        filter: `session_id=eq.${sessionId}`,
      },
      async (payload) => {
        const id = payload.new.id as string
        const { data } = await supabase
          .from('attendance_records')
          .select('*, students (*, departments (*))')
          .eq('id', id)
          .single()

        if (data) onInsert(data as AttendanceRecord)
      },
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
