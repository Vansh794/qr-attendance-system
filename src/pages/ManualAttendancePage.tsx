import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Badge, Button, Field, Panel } from '../components/ui'
import { markAttendanceByEnrollment } from '../services/attendanceService'
import { getSessionById } from '../services/sessionService'
import { searchStudents } from '../services/studentService'
import type { AttendanceResult, Session, Student } from '../types/database'

export function ManualAttendancePage() {
  const { sessionId } = useParams()
  const [session, setSession] = useState<Session | null>(null)
  const [query, setQuery] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [result, setResult] = useState<AttendanceResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    getSessionById(sessionId).then(setSession)
  }, [sessionId])

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSearching(true)
    setResult(null)

    try {
      const matches = await searchStudents(query)
      setStudents(matches)
    } finally {
      setIsSearching(false)
    }
  }

  async function handleMark(student: Student) {
    if (!session) return
    setMarkingId(student.id)

    try {
      const nextResult = await markAttendanceByEnrollment({
        sessionId: session.id,
        token: session.qr_secret,
        enrollmentNumber: student.enrollment_number,
        method: 'manual_enrollment',
      })
      setResult(nextResult)
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <Panel className="p-6">
      <header className="border-b-4 border-ink pb-5">
        <p className="font-mono text-sm font-bold uppercase text-muted">Manual fallback</p>
        <h1 className="mt-2 font-mono text-4xl font-bold uppercase leading-none">
          Enrollment Search
        </h1>
        {session ? (
          <p className="mt-3 font-mono text-sm text-muted">
            {session.courses?.code} / {session.room} / {session.start_time}
          </p>
        ) : null}
      </header>

      <form className="mt-6 grid gap-4 bg-ink p-6 text-paper" onSubmit={handleSearch}>
        <Field
          className="border-paper text-2xl text-paper placeholder:text-paper/50"
          label="Search by enrollment number"
          name="enrollment"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enrollment number"
          value={query}
        />
        <Button disabled={isSearching || query.trim().length < 2} variant="inverse" type="submit">
          <Search size={20} aria-hidden="true" />
          {isSearching ? 'Searching' : 'Search'}
        </Button>
      </form>

      {result ? (
        <div className="mt-6 border-3 border-ink bg-paper p-4 font-mono font-bold">
          {'student' in result ? (
            <>
              <Badge tone={result.status === 'success' ? 'present' : 'late'}>
                {result.status}
              </Badge>
              <p className="mt-3">
                {result.student.enrollment_number} / {result.student.full_name ?? 'Name not added'}
              </p>
            </>
          ) : (
            <p className="text-danger">{result.message}</p>
          )}
        </div>
      ) : null}

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
            {students.map((student, index) => (
              <tr className={index % 2 === 0 ? 'bg-surface' : 'bg-stripe'} key={student.id}>
                <td className="px-4 py-4 font-mono font-bold">{student.enrollment_number}</td>
                <td className="px-4 py-4">{student.full_name ?? 'Name not added'}</td>
                <td className="px-4 py-4 font-mono">{student.semester}</td>
                <td className="px-4 py-4">
                  <Button
                    disabled={markingId === student.id}
                    onClick={() => void handleMark(student)}
                    size="sm"
                    variant="secondary"
                  >
                    {markingId === student.id ? 'Marking' : 'Mark Present'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 ? (
          <p className="border-x-4 border-b-4 border-ink p-4 font-mono text-sm font-bold uppercase text-muted">
            Search to load matching students
          </p>
        ) : null}
      </div>
    </Panel>
  )
}
