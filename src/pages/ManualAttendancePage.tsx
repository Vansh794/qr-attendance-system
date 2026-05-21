import { Search } from 'lucide-react'
import { Button, Field, Panel } from '../components/ui'
import { demoStudents } from '../data/demoData'

export function ManualAttendancePage() {
  return (
    <Panel className="p-6">
      <header className="border-b-4 border-ink pb-5">
        <p className="font-mono text-sm font-bold uppercase text-muted">Manual fallback</p>
        <h1 className="mt-2 font-mono text-4xl font-bold uppercase leading-none">
          Enrollment Search
        </h1>
      </header>
      <form className="mt-6 grid gap-4 bg-ink p-6 text-paper">
        <Field
          className="border-paper text-2xl text-paper placeholder:text-paper/50"
          label="Search by enrollment number"
          name="enrollment"
          placeholder="2023CSE001"
        />
        <Button variant="inverse" type="submit">
          <Search size={20} aria-hidden="true" />
          Search
        </Button>
      </form>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead className="bg-ink font-mono text-xs font-bold uppercase text-paper">
            <tr>
              <th className="px-4 py-3">Enrollment</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Semester</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {demoStudents.map((student, index) => (
              <tr className={index % 2 === 0 ? 'bg-surface' : 'bg-stripe'} key={student.id}>
                <td className="px-4 py-4 font-mono font-bold">{student.enrollment_number}</td>
                <td className="px-4 py-4">{student.full_name}</td>
                <td className="px-4 py-4 font-mono">{student.semester}</td>
                <td className="px-4 py-4">
                  <Button size="sm" variant="secondary">
                    Mark Present
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
