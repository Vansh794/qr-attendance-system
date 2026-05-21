import { beforeEach, describe, expect, it } from 'vitest'
import { markAttendanceByEnrollment } from './attendanceService'

describe('markAttendanceByEnrollment', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('records attendance once and treats retries as duplicates', async () => {
    const first = await markAttendanceByEnrollment({
      sessionId: 'session-live-cse301',
      token: 'demo-session-secret',
      enrollmentNumber: '2023ECE001',
    })

    expect(first.status).toBe('success')

    const second = await markAttendanceByEnrollment({
      sessionId: 'session-live-cse301',
      token: 'demo-session-secret',
      enrollmentNumber: '2023ECE001',
    })

    expect(second.status).toBe('duplicate')
  })

  it('rejects invalid session tokens', async () => {
    const result = await markAttendanceByEnrollment({
      sessionId: 'session-live-cse301',
      token: 'wrong-token',
      enrollmentNumber: '2023ECE001',
    })

    expect(result.status).toBe('invalid_session')
  })

  it('rejects closed sessions before marking attendance', async () => {
    const result = await markAttendanceByEnrollment({
      sessionId: 'session-closed-cse302',
      token: 'closed-session-secret',
      enrollmentNumber: '2023ECE001',
    })

    expect(result.status).toBe('closed')
  })
})
