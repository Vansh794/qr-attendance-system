import { CheckCircle2 } from 'lucide-react'
import { Button, Field, Panel } from '../components/ui'

export function AttendPage() {
  return (
    <Panel className="mt-10 p-6 sm:p-8">
      <div className="grid gap-6 text-center">
        <CheckCircle2 className="mx-auto text-success" size={72} aria-hidden="true" />
        <h1 className="font-mono text-4xl font-bold uppercase leading-none">
          Mark Attendance
        </h1>
      </div>
      <form className="mt-8 grid gap-6">
        <Field
          autoComplete="off"
          label="Enrollment number"
          name="enrollment"
          placeholder="2023CSE001"
        />
        <Button className="w-full" type="submit">
          Submit Attendance
        </Button>
      </form>
    </Panel>
  )
}
