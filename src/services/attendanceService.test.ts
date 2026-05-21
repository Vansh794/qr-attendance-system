import { beforeEach, describe, expect, it } from 'vitest'
import { markAttendanceByEnrollment } from './attendanceService'
import type { Session } from '../types/database'

const liveSession: Session = {
  id: 'session-live',
  course_id: null,
  faculty_name: 'Faculty',
  session_date: new Date().toISOString().slice(0, 10),
  start_time: '09:00',
  end_time: null,
  room: 'Room 1',
  qr_secret: 'live-session-secret',
  qr_expires_at: null,
  is_active: true,
  created_at: new Date().toISOString(),
  courses: null,
}

const closedSession: Session = {
  ...liveSession,
  id: 'session-closed',
  qr_secret: 'closed-session-secret',
  is_active: false,
}

describe('markAttendanceByEnrollment', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem(
      'qr-attendance-sessions',
      JSON.stringify([liveSession, closedSession]),
    )
  })

  it('records attendance once and treats retries as duplicates', async () => {
    const first = await markAttendanceByEnrollment({
      sessionId: 'session-live',
      token: 'live-session-secret',
      enrollmentNumber: '2025CSE101',
    })

    expect(first.status).toBe('success')

    const second = await markAttendanceByEnrollment({
      sessionId: 'session-live',
      token: 'live-session-secret',
      enrollmentNumber: '2025CSE101',
    })

    expect(second.status).toBe('duplicate')
  })

  it('rejects invalid session tokens', async () => {
    const result = await markAttendanceByEnrollment({
      sessionId: 'session-live',
      token: 'wrong-token',
      enrollmentNumber: '2025CSE101',
    })

    expect(result.status).toBe('invalid_session')
  })

  it('rejects closed sessions before marking attendance', async () => {
    const result = await markAttendanceByEnrollment({
      sessionId: 'session-closed',
      token: 'closed-session-secret',
      enrollmentNumber: '2025CSE101',
    })

    expect(result.status).toBe('closed')
  })
})
