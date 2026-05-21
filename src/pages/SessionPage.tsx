import QRCode from 'react-qr-code'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Panel } from '../components/ui'
import { demoAttendanceRecords, demoSessions } from '../data/demoData'
import { buildAttendUrl } from '../lib/qr'

export function SessionPage() {
  const { sessionId } = useParams()
  const session = demoSessions.find((item) => item.id === sessionId) ?? demoSessions[0]
  const records = demoAttendanceRecords.filter((record) => record.session_id === session.id)
  const attendUrl = buildAttendUrl(session)

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Panel className="p-6">
        <div className="flex flex-col gap-4 border-b-4 border-ink pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge tone={session.is_active ? 'live' : 'closed'}>
              {session.is_active ? 'Live Session' : 'Closed Session'}
            </Badge>
            <h1 className="mt-4 font-mono text-4xl font-bold uppercase leading-none">
              {session.courses?.code} - {session.courses?.name}
            </h1>
            <p className="mt-3 font-mono text-sm text-muted">
              {session.room} / {session.start_time} / {session.faculty_name}
            </p>
          </div>
          <Button variant="danger">Close Session</Button>
        </div>

        <div className="mx-auto mt-8 max-w-[480px] border-6 border-accent bg-surface p-6 shadow-brutal">
          <p className="mb-5 text-center font-mono text-sm font-bold uppercase text-muted">
            Scan to mark attendance
          </p>
          <div className="mx-auto aspect-square w-full max-w-[400px] bg-white p-3">
            <QRCode
              bgColor="#FFFFFF"
              fgColor="#0A0A0A"
              size={400}
              style={{ height: '100%', width: '100%' }}
              value={attendUrl}
              viewBox="0 0 400 400"
            />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-4 border-ink pt-4 font-mono font-bold uppercase">
            <span>[ {records.length} ] Present</span>
            <Link className="focus-brutal text-blue underline decoration-4 underline-offset-4" to="attendance">
              Mark Manual
            </Link>
          </div>
        </div>
      </Panel>

      <Panel className="bg-ink p-5 text-paper" tone="ink">
        <div className="border-b-4 border-paper pb-4">
          <h2 className="font-mono text-xl font-bold uppercase">Live Feed</h2>
        </div>
        <ol className="mt-5 grid gap-4 font-mono text-sm">
          {records.map((record) => (
            <li className="border-b border-dashed border-paper/30 pb-3" key={record.id}>
              {new Date(record.marked_at).toLocaleTimeString()} {'  '}
              {record.students?.enrollment_number} {'  '}
              {record.students?.full_name.toUpperCase()}
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  )
}
