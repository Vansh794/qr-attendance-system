import { Building2, GraduationCap, ListChecks, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Panel, StatBlock } from '../components/ui'
import { demoCourses, demoDepartments, demoStudents } from '../data/demoData'
import { listSessions } from '../services/sessionService'
import type { Session } from '../types/database'

export function AdminPage() {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    listSessions().then(setSessions)
  }, [])

  return (
    <div className="grid gap-6">
      <Panel className="p-6">
        <p className="font-mono text-sm font-bold uppercase text-muted">Admin</p>
        <h1 className="mt-2 font-mono text-4xl font-bold uppercase leading-none">
          Institution Overview
        </h1>
      </Panel>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" aria-label="Admin overview">
        <StatBlock icon={Building2} label="Departments" value={String(demoDepartments.length)} />
        <StatBlock icon={GraduationCap} label="Courses" value={String(demoCourses.length)} />
        <StatBlock icon={Users} label="Students" value={String(demoStudents.length)} />
        <StatBlock icon={ListChecks} label="Sessions" value={String(sessions.length)} />
      </section>
    </div>
  )
}
