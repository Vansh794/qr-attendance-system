import { getSupabaseClient, supabase } from '../lib/supabase'
import { isExpired } from '../lib/dates'
import { makeSecret } from '../lib/qr'
import type { Course, Session, SessionCreateInput } from '../types/database'

const coursesStorageKey = 'qr-attendance-courses'
const sessionsStorageKey = 'qr-attendance-sessions'

const sessionSelect = `
  *,
  courses (
    *,
    departments (*)
  )
`

function readLocalCourses() {
  if (typeof window === 'undefined') return []
  const stored = window.localStorage.getItem(coursesStorageKey)
  if (!stored) return []
  return JSON.parse(stored) as Course[]
}

function readLocalSessions() {
  if (typeof window === 'undefined') return []
  const stored = window.localStorage.getItem(sessionsStorageKey)
  if (!stored) return []
  return JSON.parse(stored) as Session[]
}

function writeLocalSessions(sessions: Session[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(sessionsStorageKey, JSON.stringify(sessions))
}

export async function listCourses(): Promise<Course[]> {
  if (!supabase) return readLocalCourses()

  const { data, error } = await supabase
    .from('courses')
    .select('*, departments (*)')
    .order('code')

  if (error) throw error
  return (data ?? []) as Course[]
}

export async function listSessions(): Promise<Session[]> {
  if (!supabase) return readLocalSessions()

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
  if (!supabase) return readLocalSessions().find((session) => session.id === id) ?? null

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
    const course = readLocalCourses().find((item) => item.id === input.course_id) ?? null
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
    writeLocalSessions([session, ...readLocalSessions()])
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
    writeLocalSessions(
      readLocalSessions().map((session) =>
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
