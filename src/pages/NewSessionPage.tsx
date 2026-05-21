import { QrCode } from 'lucide-react'
import { Button, Field, Panel, SelectField } from '../components/ui'
import { demoCourses } from '../data/demoData'

export function NewSessionPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-mono text-sm font-bold uppercase text-muted">Session setup</p>
        <h1 className="mt-2 font-mono text-5xl font-bold uppercase leading-none">
          New Session
        </h1>
      </header>

      <Panel className="mt-8 p-6 sm:p-8">
        <form className="grid gap-6">
          <SelectField label="Select course" name="course">
            {demoCourses.map((course) => (
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
          <SelectField defaultValue="30" label="QR expires in" name="expires">
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="never">Never</option>
          </SelectField>
          <Button className="mt-4 w-full" size="lg" type="submit">
            <QrCode size={24} aria-hidden="true" />
            Create Session
          </Button>
        </form>
      </Panel>
    </div>
  )
}
