import { AlertTriangle, CheckCircle2, CircleSlash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Field, Panel } from '../components/ui'
import { markAttendanceByEnrollment } from '../services/attendanceService'
import { getSessionById, getSessionState } from '../services/sessionService'
import type { AttendanceResult, Session } from '../types/database'

const stateCopy = {
  success: 'Attendance recorded',
  duplicate: 'Already recorded',
  expired: 'QR code expired',
  closed: 'Session closed',
  invalid_session: 'Invalid session',
  student_not_found: 'Enrollment not found',
  error: 'Could not mark attendance',
} satisfies Record<AttendanceResult['status'], string>

export function AttendPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session') ?? ''
  const token = searchParams.get('token') ?? ''
  const [session, setSession] = useState<Session | null>(null)
  const [result, setResult] = useState<AttendanceResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    let isMounted = true

    getSessionById(sessionId).then((nextSession) => {
      if (isMounted) setSession(nextSession)
    })

    return () => {
      isMounted = false
    }
  }, [sessionId])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const enrollmentNumber = formData.get('enrollment')?.toString() ?? ''
    setIsSubmitting(true)

    try {
      const nextResult = await markAttendanceByEnrollment({
        sessionId,
        token,
        enrollmentNumber,
        method: 'qr_scan',
      })
      setResult(nextResult)
    } catch (caught) {
      setResult({
        status: 'error',
        message: caught instanceof Error ? caught.message : 'Could not mark attendance.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const visualState = result?.status ?? (session ? getSessionState(session) : 'invalid_session')
  const isSuccess = result?.status === 'success'
  const isDuplicate = result?.status === 'duplicate'
  const title =
    result && result.status in stateCopy
      ? stateCopy[result.status]
      : session
        ? `${session.courses?.code} Attendance`
        : 'Invalid session'
  const resultMessage = result && 'message' in result ? result.message : null

  return (
    <Panel className="mt-10 p-6 sm:p-8">
      <div className="grid gap-6 text-center">
        {isSuccess ? (
          <CheckCircle2 className="mx-auto text-success" size={72} aria-hidden="true" />
        ) : isDuplicate ? (
          <CircleSlash2 className="mx-auto text-warning" size={72} aria-hidden="true" />
        ) : (
          <AlertTriangle
            className={[
              'mx-auto',
              visualState === 'live' ? 'text-accent' : 'text-danger',
            ].join(' ')}
            size={72}
            aria-hidden="true"
          />
        )}
        <h1 className="font-mono text-4xl font-bold uppercase leading-none">{title}</h1>
        {session ? (
          <p className="font-mono text-sm font-bold uppercase text-muted">
            {session.courses?.code} / {session.room} / {session.start_time}
          </p>
        ) : null}
      </div>

      {result && 'student' in result ? (
        <div className="mt-8 border-y-4 border-ink py-6 text-center">
          <p className="font-mono text-xl font-bold uppercase">
            {result.student.full_name}
          </p>
          <p className="mt-2 font-mono text-muted">{result.student.enrollment_number}</p>
          {'record' in result && result.record ? (
            <p className="mt-2 font-mono text-sm">
              {new Date(result.record.marked_at).toLocaleString()}
            </p>
          ) : null}
        </div>
      ) : resultMessage ? (
        <p className="mt-8 border-3 border-danger p-4 font-mono font-bold text-danger">
          {resultMessage}
        </p>
      ) : null}

      {!isSuccess && !isDuplicate ? (
        <form className="mt-8 grid gap-6" onSubmit={handleSubmit}>
          <Field
            autoComplete="off"
            label="Enrollment number"
            name="enrollment"
            placeholder="2023CSE001"
            required
          />
          <Button className="w-full" disabled={!sessionId || !token || isSubmitting} type="submit">
            {isSubmitting ? 'Submitting' : 'Submit Attendance'}
          </Button>
        </form>
      ) : null}
    </Panel>
  )
}
