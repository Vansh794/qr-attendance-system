import { Building2, GraduationCap, ListChecks, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Panel, StatBlock } from '../components/ui'
import { listCourses, listSessions } from '../services/sessionService'
import { listStudents } from '../services/studentService'
import type { Course, Session, Student } from '../types/database'

export function AdminPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    Promise.all([listSessions(), listCourses(), listStudents()])
      .then(([nextSessions, nextCourses, nextStudents]) => {
        if (!isMounted) return
        setSessions(nextSessions)
        setCourses(nextCourses)
        setStudents(nextStudents)
      })
      .catch((caught: Error) => {
        if (isMounted) setError(caught.message)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const departmentCount = useMemo(() => {
    const departments = new Set(
      courses
        .map((course) => course.departments?.id ?? course.department_id)
        .filter(Boolean),
    )
    return departments.size
  }, [courses])

  return (
    <div className="grid gap-6">
      <Panel className="p-6">
        <p className="font-mono text-sm font-bold uppercase text-muted">Admin</p>
        <h1 className="mt-2 font-mono text-4xl font-bold uppercase leading-none">
          Institution Overview
        </h1>
        {error ? (
          <p className="mt-4 border-3 border-danger bg-paper p-3 font-mono text-sm font-bold uppercase text-danger">
            {error}
          </p>
        ) : null}
      </Panel>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" aria-label="Admin overview">
        <StatBlock icon={Building2} label="Departments" value={String(departmentCount)} />
        <StatBlock icon={GraduationCap} label="Courses" value={String(courses.length)} />
        <StatBlock icon={Users} label="Students" value={String(students.length)} />
        <StatBlock icon={ListChecks} label="Sessions" value={String(sessions.length)} />
      </section>
    </div>
  )
}
