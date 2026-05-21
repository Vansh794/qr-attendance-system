import { useEffect, useState } from 'react'
import { Panel } from '../components/ui'
import { listCourses } from '../services/sessionService'
import type { Course } from '../types/database'

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    listCourses()
      .then((items) => {
        if (isMounted) setCourses(items)
      })
      .catch((caught: Error) => {
        if (isMounted) setError(caught.message)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Panel className="p-6">
      <p className="font-mono text-sm font-bold uppercase text-muted">Admin</p>
      <h1 className="mt-2 font-mono text-4xl font-bold uppercase leading-none">
        Courses
      </h1>
      {error ? (
        <p className="mt-4 border-3 border-danger bg-paper p-3 font-mono text-sm font-bold uppercase text-danger">
          {error}
        </p>
      ) : null}
      <div className="mt-6 grid gap-3">
        {courses.map((course) => (
          <div className="border-3 border-ink bg-surface p-4" key={course.id}>
            <p className="font-mono font-bold">{course.code}</p>
            <p>{course.name}</p>
          </div>
        ))}
        {courses.length === 0 && !error ? (
          <p className="border-3 border-ink bg-paper p-4 font-mono text-sm font-bold uppercase text-muted">
            No courses found in Supabase yet.
          </p>
        ) : null}
      </div>
    </Panel>
  )
}
