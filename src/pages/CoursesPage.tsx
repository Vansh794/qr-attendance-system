import { Panel } from '../components/ui'
import { demoCourses } from '../data/demoData'

export function CoursesPage() {
  return (
    <Panel className="p-6">
      <p className="font-mono text-sm font-bold uppercase text-muted">Admin</p>
      <h1 className="mt-2 font-mono text-4xl font-bold uppercase leading-none">
        Courses
      </h1>
      <div className="mt-6 grid gap-3">
        {demoCourses.map((course) => (
          <div className="border-3 border-ink bg-surface p-4" key={course.id}>
            <p className="font-mono font-bold">{course.code}</p>
            <p>{course.name}</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}
