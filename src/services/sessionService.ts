import { demoCourses, demoSessions } from '../data/demoData'
import { getSupabaseClient, supabase } from '../lib/supabase'
import { isExpired } from '../lib/dates'
import { makeSecret } from '../lib/qr'
import type { Course, Session, SessionCreateInput } from '../types/database'

const sessionSelect = `
  *,
  courses (
    *,
    departments (*)
  )
`

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
  if (!supabase) return demoSessions

  const { data, error } = await supabase
    .from('sessions')
    .select(sessionSelect)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Session[]
}

export async function getSessionById(id: string): Promise<Session | null> {
  if (!supabase) return demoSessions.find((session) => session.id === id) ?? null

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
    return {
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
    }
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
  if (!supabase) return

  const { error } = await supabase
    .from('sessions')
    .update({ is_active: false, end_time: new Date().toTimeString().slice(0, 8) })
    .eq('id', id)

  if (error) throw error
}

export async function refreshSessionSecret(id: string): Promise<Session> {
  const qrSecret = makeSecret()

  if (!supabase) {
    const session = await getSessionById(id)
    if (!session) throw new Error('Session not found')
    return { ...session, qr_secret: qrSecret }
  }

  const { data, error } = await supabase
    .from('sessions')
    .update({ qr_secret: qrSecret })
    .eq('id', id)
    .select(sessionSelect)
    .single()

  if (error) throw error
  return data as Session
}

export function getSessionState(session: Session) {
  if (!session.is_active) return 'closed'
  if (isExpired(session.qr_expires_at)) return 'expired'
  return 'live'
}
