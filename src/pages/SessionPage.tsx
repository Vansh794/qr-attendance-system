import { Link, useParams } from 'react-router-dom'
import { ScanLine, Square, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge, Button, Panel } from '../components/ui'
import { getAttendanceForSession, subscribeToAttendance } from '../services/attendanceService'
import {
  closeSession,
  getSessionById,
  getSessionState,
} from '../services/sessionService'
import type { AttendanceRecord, Session } from '../types/database'

const statusTone = {
  live: 'live',
  closed: 'closed',
  expired: 'expired',
} as const

export function SessionPage() {
  const { sessionId } = useParams()
  const [session, setSession] = useState<Session | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    let isMounted = true

    async function loadSession() {
      setIsLoading(true)
      setError(null)

      try {
        const [nextSession, nextRecords] = await Promise.all([
          getSessionById(sessionId),
          getAttendanceForSession(sessionId),
        ])

        if (!isMounted) return
        setSession(nextSession)
        setRecords(nextRecords)
      } catch (caught) {
        if (isMounted) {
          setError(caught instanceof Error ? caught.message : 'Could not load session.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadSession()
    const unsubscribe = subscribeToAttendance(sessionId, (record) => {
      setRecords((current) =>
        current.some((item) => item.id === record.id) ? current : [record, ...current],
      )
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [sessionId])

  const state = session ? getSessionState(session) : 'closed'

  async function handleCloseSession() {
    if (!session) return
    await closeSession(session.id)
    setSession({ ...session, is_active: false, end_time: new Date().toTimeString().slice(0, 8) })
  }

  if (isLoading) {
    return (
      <Panel className="p-6">
        <p className="font-mono text-xl font-bold uppercase">Loading session</p>
      </Panel>
    )
  }

  if (error || !session) {
    return (
      <Panel className="p-6">
        <p className="font-mono text-xl font-bold uppercase text-danger">
          {error ?? 'Session not found'}
        </p>
      </Panel>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Panel className="p-6">
        <div className="flex flex-col gap-4 border-b-4 border-ink pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge tone={statusTone[state]}>
              {state === 'live' ? 'Live Session' : state}
            </Badge>
            <h1 className="mt-4 font-mono text-4xl font-bold uppercase leading-none">
              {session.courses?.code} - {session.courses?.name}
            </h1>
            <p className="mt-3 font-mono text-sm text-muted">
              {session.room} / {session.start_time} / {session.faculty_name}
            </p>
          </div>
          <Button onClick={handleCloseSession} variant="danger">
            <Square size={18} aria-hidden="true" />
            Close Session
          </Button>
        </div>

        <div
          className={[
            'mx-auto mt-8 max-w-[560px] border-6 bg-surface p-6 shadow-brutal',
            state === 'live' ? 'border-accent' : 'border-danger',
          ].join(' ')}
        >
          <div className="grid gap-5 text-center">
            <ScanLine className="mx-auto text-accent" size={88} aria-hidden="true" />
            <h2 className="font-mono text-3xl font-bold uppercase leading-none">
              Scan Student ID Cards
            </h2>
            <p className="font-mono text-sm font-bold uppercase text-muted">
              Records save against this class
            </p>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-4 border-ink pt-4 font-mono font-bold uppercase">
            <span>[ {records.length} ] Present</span>
            <span>{session.qr_expires_at ? new Date(session.qr_expires_at).toLocaleTimeString() : 'No expiry'}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              className="focus-brutal inline-flex min-h-11 items-center justify-center gap-2 border-4 border-ink bg-accent px-5 py-3 font-mono font-bold uppercase text-white shadow-brutal"
              to={`/sessions/${session.id}/scanner`}
            >
              <ScanLine size={18} aria-hidden="true" />
              Open Scanner
            </Link>
            <Link
              className="focus-brutal inline-flex min-h-11 items-center justify-center gap-2 border-3 border-ink bg-surface px-5 py-3 font-mono font-bold uppercase shadow-brutal-sm"
              to="attendance"
            >
              <UserPlus size={18} aria-hidden="true" />
              Mark Manual
            </Link>
          </div>
        </div>
      </Panel>

      <Panel className="bg-ink p-5 text-paper" tone="ink">
        <div className="border-b-4 border-paper pb-4">
          <h2 className="font-mono text-xl font-bold uppercase">
            Live - {records.length} Present
          </h2>
        </div>
        <ol className="mt-5 grid max-h-[640px] gap-4 overflow-y-auto font-mono text-sm">
          {records.map((record) => (
            <li className="border-b border-dashed border-paper/30 pb-3" key={record.id}>
              {new Date(record.marked_at).toLocaleTimeString()} {'  '}
              {record.students?.enrollment_number} {'  '}
              {(record.students?.full_name ?? 'Name not added').toUpperCase()}
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  )
}
