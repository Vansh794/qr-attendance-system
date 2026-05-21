import { demoCourses, demoSessions } from '../data/demoData'
import { getSupabaseClient, supabase } from '../lib/supabase'
import { isExpired } from '../lib/dates'
import { makeSecret } from '../lib/qr'
import type { Course, Session, SessionCreateInput } from '../types/database'

const demoSessionStorageKey = 'qr-attendance-demo-sessions'

const sessionSelect = `
  *,
  courses (
    *,
    departments (*)
  )
`

function readDemoSessions() {
  if (typeof window === 'undefined') return demoSessions
  const stored = window.localStorage.getItem(demoSessionStorageKey)
  if (!stored) return demoSessions
  return JSON.parse(stored) as Session[]
}

function writeDemoSessions(sessions: Session[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(demoSessionStorageKey, JSON.stringify(sessions))
}

export async function listCourses(): Promise<Course[]> {
  if (!supabase) return demoCourses

  const { data, error } = await supabase
    .from('courses')
    .select('*, departments (*)')
    .order('code')

  if (error) throw error
  return (data ?? []) as Course[]
}

export async function listSessions(): Promise<Session[]> {
  if (!supabase) return readDemoSessions()

  const { data, error } = await supabase
    .from('sessions')
    .select(sessionSelect)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Session[]
}

export async function listActiveSessions(): Promise<Session[]> {
  const sessions = await listSessions()
  return sessions
    .filter((session) => getSessionState(session) === 'live')
    .sort((a, b) => `${b.session_date}T${b.start_time}`.localeCompare(`${a.session_date}T${a.start_time}`))
}

export async function getSessionById(id: string): Promise<Session | null> {
  if (!supabase) return readDemoSessions().find((session) => session.id === id) ?? null

  const { data, error } = await supabase
    .from('sessions')
    .select(sessionSelect)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as Session | null
}

export async function createSession(input: SessionCreateInput): Promise<Session> {
  if (!supabase) {
    const course = demoCourses.find((item) => item.id === input.course_id) ?? demoCourses[0]
    const session = {
      id: makeSecret(),
      course_id: input.course_id,
      faculty_name: input.faculty_name,
      session_date: input.session_date,
      start_time: input.start_time,
      end_time: null,
      room: input.room ?? null,
      qr_secret: makeSecret(),
      qr_expires_at: input.qr_expires_at ?? null,
      is_active: true,
      created_at: new Date().toISOString(),
      courses: course,
    } satisfies Session
    writeDemoSessions([session, ...readDemoSessions()])
    return session
  }

  const { data, error } = await getSupabaseClient()
    .from('sessions')
    .insert({
      ...input,
      room: input.room ?? null,
      qr_expires_at: input.qr_expires_at ?? null,
    })
    .select(sessionSelect)
    .single()

  if (error) throw error
  return data as Session
}

export async function closeSession(id: string): Promise<void> {
  if (!supabase) {
    writeDemoSessions(
      readDemoSessions().map((session) =>
        session.id === id
          ? { ...session, is_active: false, end_time: new Date().toTimeString().slice(0, 8) }
          : session,
      ),
    )
    return
  }

  const { error } = await supabase
    .from('sessions')
    .update({ is_active: false, end_time: new Date().toTimeString().slice(0, 8) })
    .eq('id', id)

  if (error) throw error
}

export function getSessionState(session: Session) {
  if (!session.is_active) return 'closed'
  if (isExpired(session.qr_expires_at)) return 'expired'
  return 'live'
}
