import {
  Activity,
  Download,
  ListChecks,
  Plus,
  QrCode,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, StatBlock } from '../components/ui'
import { getAttendanceForSession } from '../services/attendanceService'
import { listSessions } from '../services/sessionService'
import { listStudents } from '../services/studentService'
import type { AttendanceRecord, Session, Student } from '../types/database'

const baseStats = [
  { label: 'Today Sessions', icon: Activity },
  { label: 'Students Marked', icon: ListChecks },
  { label: 'Average Attendance', icon: ShieldCheck },
  { label: 'Live Session', icon: QrCode },
]

export function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        const [nextSessions, nextStudents] = await Promise.all([
          listSessions(),
          listStudents(),
        ])
        const nextAttendance = (
          await Promise.all(
            nextSessions.map((session) => getAttendanceForSession(session.id)),
          )
        ).flat()

        if (!isMounted) return
        setSessions(nextSessions)
        setStudents(nextStudents)
        setAttendanceRecords(nextAttendance)
      } catch (caught) {
        if (isMounted) {
          setError(caught instanceof Error ? caught.message : 'Could not load dashboard.')
        }
      }
    }

    void loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const dashboardStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const todaySessions = sessions.filter((session) => session.session_date === today)
    const possibleMarks = sessions.length * students.length
    const averageAttendance =
      possibleMarks > 0 ? Math.round((attendanceRecords.length / possibleMarks) * 100) : 0

    return baseStats.map((stat) => {
      if (stat.label === 'Today Sessions') {
        return { ...stat, value: String(todaySessions.length).padStart(2, '0') }
      }
      if (stat.label === 'Live Session') {
        return {
          ...stat,
          value: String(sessions.filter((session) => session.is_active).length).padStart(2, '0'),
        }
      }
      if (stat.label === 'Students Marked') {
        return {
          ...stat,
          value: String(attendanceRecords.length).padStart(2, '0'),
        }
      }
      return { ...stat, value: `${averageAttendance}%` }
    })
  }, [attendanceRecords.length, sessions, students.length])

  const liveFeed = useMemo(
    () =>
      [...attendanceRecords]
        .sort((a, b) => b.marked_at.localeCompare(a.marked_at))
        .slice(0, 10),
    [attendanceRecords],
  )

  return (
    <>
      <header className="flex flex-col gap-6 border-b-4 border-ink pb-8 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="font-mono text-sm font-bold uppercase text-muted">
            Faculty console
          </p>
          <h1 className="mt-2 max-w-4xl font-mono text-4xl font-bold uppercase leading-none sm:text-5xl lg:text-6xl">
            Attendance Tracker
          </h1>
          {error ? (
            <p className="mt-4 border-3 border-danger bg-paper p-3 font-mono text-sm font-bold uppercase text-danger">
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="focus-brutal inline-flex min-h-11 items-center justify-center gap-2 border-4 border-ink bg-accent px-5 py-3 font-mono font-bold uppercase text-white shadow-brutal transition hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            to="/"
          >
            <QrCode size={20} aria-hidden="true" />
            Open Scanner
          </Link>
          <Link
            className="focus-brutal inline-flex min-h-11 items-center justify-center gap-2 border-3 border-ink bg-surface px-5 py-3 font-mono font-bold uppercase shadow-brutal-sm transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            to="/sessions/new"
          >
            <Plus size={20} aria-hidden="true" />
            New Session
          </Link>
        </div>
      </header>

      <section
        className="grid gap-5 py-8 md:grid-cols-2 xl:grid-cols-4"
        aria-label="Today at a glance"
      >
        {dashboardStats.map((stat) => (
          <StatBlock key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <article className="border-4 border-ink bg-surface shadow-brutal">
          <div className="flex flex-col gap-4 border-b-4 border-ink p-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-mono text-xl font-bold uppercase">Today's Sessions</h2>
            <Button size="sm" variant="secondary">
              <Download size={18} aria-hidden="true" />
              Export
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead className="bg-ink font-mono text-xs font-bold uppercase text-paper">
                <tr>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr
                    className={index % 2 === 0 ? 'bg-surface' : 'bg-stripe'}
                    key={session.id}
                  >
                    <td className="px-4 py-4 font-mono font-bold">
                      {session.courses?.code ?? 'NO COURSE'}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        className="focus-brutal underline decoration-4 underline-offset-4"
                        to={`/sessions/${session.id}`}
                      >
                        {session.courses?.name ?? session.session_date}
                      </Link>
                    </td>
                    <td className="px-4 py-4">{session.room ?? '-'}</td>
                    <td className="px-4 py-4 font-mono">{session.start_time}</td>
                    <td className="px-4 py-4">
                      <Badge tone={session.is_active ? 'live' : 'closed'}>
                        {session.is_active ? 'Live' : 'Closed'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sessions.length === 0 ? (
            <p className="border-t-4 border-ink p-4 font-mono text-sm font-bold uppercase text-muted">
              No sessions found. Create a class session to begin scanning ID cards.
            </p>
          ) : null}
        </article>

        <article className="border-4 border-ink bg-ink p-5 text-paper shadow-brutal">
          <div className="flex items-center justify-between gap-4 border-b-4 border-paper pb-4">
            <h2 className="font-mono text-xl font-bold uppercase">Live Feed</h2>
            <Badge tone={liveFeed.length > 0 ? 'present' : 'closed'}>Live</Badge>
          </div>
          <ol className="mt-5 grid gap-4 font-mono text-sm">
            {liveFeed.map((record) => (
              <li className="border-b border-dashed border-paper/30 pb-3" key={record.id}>
                {new Date(record.marked_at).toLocaleTimeString()} {'  '}
                {record.students?.enrollment_number ?? 'UNKNOWN'} {'  '}
                {(record.students?.full_name ?? 'Name not added').toUpperCase()}
              </li>
            ))}
          </ol>
          {liveFeed.length === 0 ? (
            <p className="mt-5 font-mono text-sm font-bold uppercase text-paper/70">
              No scans recorded yet.
            </p>
          ) : null}
        </article>
      </section>
    </>
  )
}
