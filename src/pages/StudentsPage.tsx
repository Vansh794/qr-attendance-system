import { Panel } from '../components/ui'
import { demoStudents } from '../data/demoData'

export function StudentsPage() {
  return (
    <Panel className="p-6">
      <p className="font-mono text-sm font-bold uppercase text-muted">Admin</p>
      <h1 className="mt-2 font-mono text-4xl font-bold uppercase leading-none">
        Students
      </h1>
      <div className="mt-6 grid gap-3">
        {demoStudents.map((student) => (
          <div className="border-3 border-ink bg-surface p-4" key={student.id}>
            <p className="font-mono font-bold">{student.enrollment_number}</p>
            <p>{student.full_name}</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}
