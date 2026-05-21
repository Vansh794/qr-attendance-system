import { Save, UserPlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Field, Panel } from '../components/ui'
import { listStudents, upsertStudentByEnrollment } from '../services/studentService'
import type { Student } from '../types/database'

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [enrollmentNumber, setEnrollmentNumber] = useState('')
  const [fullName, setFullName] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    listStudents()
      .then((items) => {
        if (isMounted) setStudents(items)
      })
      .catch((caught: Error) => {
        if (isMounted) setError(caught.message)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const sortedStudents = useMemo(
    () =>
      [...students].sort((a, b) =>
        a.enrollment_number.localeCompare(b.enrollment_number),
      ),
    [students],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    setStatus(null)

    try {
      const student = await upsertStudentByEnrollment({
        enrollmentNumber,
        fullName,
      })
      setStudents((current) => {
        const exists = current.some((item) => item.id === student.id)
        return exists
          ? current.map((item) => (item.id === student.id ? student : item))
          : [student, ...current]
      })
      setEnrollmentNumber('')
      setFullName('')
      setStatus(`${student.enrollment_number} saved.`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save student.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleEdit(student: Student) {
    setEnrollmentNumber(student.enrollment_number)
    setFullName(student.full_name ?? '')
    setStatus(null)
    setError(null)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Panel className="p-6">
        <p className="font-mono text-sm font-bold uppercase text-muted">Admin</p>
        <h1 className="mt-2 font-mono text-4xl font-bold uppercase leading-none">
          Students
        </h1>
        <form className="mt-6 grid gap-5 bg-ink p-5 text-paper" onSubmit={handleSubmit}>
          <Field
            className="border-paper font-mono text-paper placeholder:text-paper/50"
            label="Enrollment number"
            name="enrollmentNumber"
            onChange={(event) => setEnrollmentNumber(event.target.value)}
            placeholder="Enrollment number"
            required
            value={enrollmentNumber}
          />
          <Field
            className="border-paper text-paper placeholder:text-paper/50"
            label="Student name"
            name="fullName"
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Student name"
            value={fullName}
          />
          <Button
            disabled={isSaving || enrollmentNumber.trim().length < 2}
            variant="inverse"
            type="submit"
          >
            <Save size={20} aria-hidden="true" />
            {isSaving ? 'Saving' : 'Save Student'}
          </Button>
        </form>
        {status ? (
          <p className="mt-4 border-3 border-success bg-surface p-3 font-mono text-sm font-bold uppercase text-success">
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 border-3 border-danger bg-paper p-3 font-mono text-sm font-bold uppercase text-danger">
            {error}
          </p>
        ) : null}
      </Panel>

      <Panel className="p-6">
        <div className="flex items-center justify-between gap-4 border-b-4 border-ink pb-4">
          <div>
            <p className="font-mono text-sm font-bold uppercase text-muted">
              Stored enrollments
            </p>
            <h2 className="mt-1 font-mono text-3xl font-bold uppercase leading-none">
              {sortedStudents.length} Students
            </h2>
          </div>
          <UserPlus size={36} aria-hidden="true" />
        </div>
        <div className="mt-6 grid gap-3">
          {sortedStudents.map((student) => (
            <button
              className="focus-brutal border-3 border-ink bg-surface p-4 text-left transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm"
              key={student.id}
              onClick={() => handleEdit(student)}
              type="button"
            >
              <p className="font-mono font-bold">{student.enrollment_number}</p>
              <p>{student.full_name ?? 'Name not added'}</p>
            </button>
          ))}
          {sortedStudents.length === 0 ? (
            <p className="border-3 border-ink bg-paper p-4 font-mono text-sm font-bold uppercase text-muted">
              No stored students yet. Scans will create enrollment records automatically.
            </p>
          ) : null}
        </div>
      </Panel>
    </div>
  )
}
