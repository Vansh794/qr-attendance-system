import { Download } from 'lucide-react'
import { Badge, Button, Panel } from '../components/ui'
import { demoAttendanceRecords } from '../data/demoData'

export function ReportsPage() {
  return (
    <Panel className="p-6">
      <div className="flex flex-col gap-4 border-b-4 border-ink pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-sm font-bold uppercase text-muted">Admin reports</p>
          <h1 className="mt-2 font-mono text-4xl font-bold uppercase leading-none">
            Attendance Reports
          </h1>
        </div>
        <Button variant="secondary">
          <Download size={18} aria-hidden="true" />
          Export CSV
        </Button>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
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
            {demoAttendanceRecords.map((record, index) => (
              <tr className={index % 2 === 0 ? 'bg-surface' : 'bg-stripe'} key={record.id}>
                <td className="px-4 py-4 font-mono font-bold">
                  {record.students?.enrollment_number}
                </td>
                <td className="px-4 py-4">{record.students?.full_name}</td>
                <td className="px-4 py-4 font-mono">
                  {new Date(record.marked_at).toLocaleString()}
                </td>
                <td className="px-4 py-4 font-mono">{record.method}</td>
                <td className="px-4 py-4">
                  <Badge tone="present">{record.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
