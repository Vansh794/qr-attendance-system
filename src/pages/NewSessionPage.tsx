import { QrCode } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Field, Panel, SelectField } from '../components/ui'
import { minutesFromNow } from '../lib/dates'
import { createSession, listCourses } from '../services/sessionService'
import type { Course } from '../types/database'

export function NewSessionPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [courseId, setCourseId] = useState('')
  const [expiresIn, setExpiresIn] = useState('30')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    listCourses()
      .then((items) => {
        if (!isMounted) return
        setCourses(items)
        setCourseId(items[0]?.id ?? '')
      })
      .catch((caught: Error) => {
        if (isMounted) setError(caught.message)
      })

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const expiry = formData.get('expires')?.toString() ?? '30'

    try {
      const session = await createSession({
        course_id: formData.get('course')?.toString() ?? courseId,
        faculty_name: formData.get('faculty')?.toString() ?? '',
        session_date: formData.get('date')?.toString() ?? new Date().toISOString().slice(0, 10),
        start_time: formData.get('start_time')?.toString() ?? '09:00',
        room: formData.get('room')?.toString() ?? '',
        qr_expires_at: expiry === 'never' ? null : minutesFromNow(Number(expiry)),
      })
      navigate(`/sessions/${session.id}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create session.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-mono text-sm font-bold uppercase text-muted">Session setup</p>
        <h1 className="mt-2 font-mono text-5xl font-bold uppercase leading-none">
          New Session
        </h1>
      </header>

      <Panel className="mt-8 p-6 sm:p-8">
        <form className="grid gap-6" onSubmit={handleSubmit}>
          <SelectField
            label="Select course"
            name="course"
            onChange={(event) => setCourseId(event.target.value)}
            required
            value={courseId}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </SelectField>
          <Field defaultValue="Dr. Rajesh Kumar" label="Faculty name" name="faculty" />
          <Field
            defaultValue={new Date().toISOString().slice(0, 10)}
            label="Date"
            name="date"
            type="date"
          />
          <Field defaultValue="09:00" label="Start time" name="start_time" type="time" />
          <Field defaultValue="Room 301" label="Room / lab" name="room" />
          <SelectField
            label="QR expires in"
            name="expires"
            onChange={(event) => setExpiresIn(event.target.value)}
            value={expiresIn}
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="never">Never</option>
          </SelectField>
          {error ? (
            <p className="border-3 border-danger p-3 font-mono text-sm font-bold text-danger">
              {error}
            </p>
          ) : null}
          <Button className="mt-4 w-full" disabled={isSaving || !courseId} size="lg" type="submit">
            <QrCode size={24} aria-hidden="true" />
            {isSaving ? 'Creating' : 'Create Session'}
          </Button>
        </form>
      </Panel>
    </div>
  )
}
