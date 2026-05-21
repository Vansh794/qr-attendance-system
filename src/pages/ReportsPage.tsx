import { Download, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge, Button, Panel, SelectField } from '../components/ui'
import {
  downloadSessionCsv,
  downloadSessionPdf,
  getSessionReport,
  listDefaulters,
  type DefaulterRow,
  type SessionReport,
} from '../services/reportService'
import { listSessions } from '../services/sessionService'
import type { Session } from '../types/database'

export function ReportsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionId, setSessionId] = useState('')
  const [report, setReport] = useState<SessionReport | null>(null)
  const [defaulters, setDefaulters] = useState<DefaulterRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadInitialData() {
      try {
        const [nextSessions, nextDefaulters] = await Promise.all([
          listSessions(),
          listDefaulters(),
        ])
        if (!isMounted) return
        setSessions(nextSessions)
        setSessionId(nextSessions[0]?.id ?? '')
        setDefaulters(nextDefaulters)
      } catch (caught) {
        if (isMounted) {
          setError(caught instanceof Error ? caught.message : 'Could not load reports.')
        }
      }
    }

    void loadInitialData()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!sessionId) return
    getSessionReport(sessionId)
      .then(setReport)
      .catch((caught: Error) => setError(caught.message))
  }, [sessionId])

  return (
    <div className="grid gap-6">
      <Panel className="p-6">
        <div className="flex flex-col gap-4 border-b-4 border-ink pb-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="font-mono text-sm font-bold uppercase text-muted">Admin reports</p>
            <h1 className="mt-2 font-mono text-4xl font-bold uppercase leading-none">
              Attendance Reports
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={!report}
              onClick={() => report && downloadSessionCsv(report)}
              variant="secondary"
            >
              <Download size={18} aria-hidden="true" />
              Export CSV
            </Button>
            <Button
              disabled={!report}
              onClick={() => report && downloadSessionPdf(report)}
              variant="secondary"
            >
              <FileText size={18} aria-hidden="true" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="mt-6 max-w-xl">
          <SelectField
            label="Select session"
            name="session"
            onChange={(event) => setSessionId(event.target.value)}
            value={sessionId}
          >
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.courses?.code} / {session.session_date} / {session.start_time}
              </option>
            ))}
          </SelectField>
        </div>

        {error ? (
          <p className="mt-6 border-3 border-danger p-4 font-mono font-bold text-danger">
            {error}
          </p>
        ) : null}

        {report ? (
          <div className="mt-6 grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border-3 border-ink bg-paper p-4">
                <p className="font-mono text-xs font-bold uppercase text-muted">Present</p>
                <p className="mt-2 font-mono text-4xl font-bold">{report.presentCount}</p>
              </div>
              <div className="border-3 border-ink bg-paper p-4">
                <p className="font-mono text-xs font-bold uppercase text-muted">Absent</p>
                <p className="mt-2 font-mono text-4xl font-bold">{report.absentCount}</p>
              </div>
              <div className="border-3 border-ink bg-paper p-4">
                <p className="font-mono text-xs font-bold uppercase text-muted">Total</p>
                <p className="mt-2 font-mono text-4xl font-bold">{report.totalStudents}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="bg-ink font-mono text-xs font-bold uppercase text-paper">
                  <tr>
                    <th className="px-4 py-3">Enrollment</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Marked At</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row, index) => (
                    <tr
                      className={index % 2 === 0 ? 'bg-surface' : 'bg-stripe'}
                      key={`${row.enrollmentNumber}-${row.markedAt}`}
                    >
                      <td className="px-4 py-4 font-mono font-bold">
                        {row.enrollmentNumber}
                      </td>
                      <td className="px-4 py-4">{row.studentName}</td>
                      <td className="px-4 py-4 font-mono">
                        {new Date(row.markedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 font-mono">{row.method}</td>
                      <td className="px-4 py-4">
                        <Badge tone="present">{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Panel>

      <Panel className="p-6">
        <div className="border-b-4 border-ink pb-4">
          <p className="font-mono text-sm font-bold uppercase text-muted">Threshold 75%</p>
          <h2 className="mt-2 font-mono text-3xl font-bold uppercase leading-none">
            Defaulter List
          </h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {defaulters.map((row) => (
            <article className="border-3 border-danger bg-surface p-4" key={row.enrollmentNumber}>
              <Badge tone="absent">{row.percentage}%</Badge>
              <p className="mt-4 font-mono font-bold">{row.enrollmentNumber}</p>
              <p>{row.studentName}</p>
              <p className="mt-2 font-mono text-sm text-muted">
                {row.attended} / {row.total} sessions
              </p>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  )
}
