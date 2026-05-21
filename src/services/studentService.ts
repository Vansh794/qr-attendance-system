import { getSupabaseClient, supabase } from '../lib/supabase'
import type { Student } from '../types/database'

const studentsStorageKey = 'qr-attendance-students'

type StudentUpsertInput = {
  enrollmentNumber: string
  fullName?: string
}

export async function listStudents(): Promise<Student[]> {
  if (!supabase) return readLocalStudents()

  const { data, error } = await supabase
    .from('students')
    .select('*, departments (*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Student[]
}

export async function searchStudents(query: string): Promise<Student[]> {
  const normalized = query.trim()
  if (normalized.length < 2) return []

  if (!supabase) {
    const lower = normalized.toLowerCase()
    return readLocalStudents().filter(
      (student) =>
        student.enrollment_number.toLowerCase().includes(lower) ||
        (student.full_name ?? '').toLowerCase().includes(lower),
    )
  }

  const { data, error } = await supabase
    .from('students')
    .select('*, departments (*)')
    .eq('is_active', true)
    .or(`enrollment_number.ilike.%${normalized}%,full_name.ilike.%${normalized}%`)
    .limit(10)

  if (error) throw error
  return (data ?? []) as Student[]
}

export async function getStudentByEnrollment(
  enrollmentNumber: string,
): Promise<Student | null> {
  const normalized = normalizeEnrollment(enrollmentNumber)

  if (!supabase) {
    return (
      readLocalStudents().find(
        (student) => student.enrollment_number.toLowerCase() === normalized.toLowerCase(),
      ) ?? null
    )
  }

  const { data, error } = await supabase
    .from('students')
    .select('*, departments (*)')
    .eq('enrollment_number', normalized)
    .maybeSingle()

  if (error) throw error
  return data as Student | null
}

export async function ensureStudentByEnrollment(enrollmentNumber: string): Promise<Student> {
  const existing = await getStudentByEnrollment(enrollmentNumber)
  if (existing) return existing

  return upsertStudentByEnrollment({
    enrollmentNumber,
  })
}

export async function upsertStudentByEnrollment({
  enrollmentNumber,
  fullName,
}: StudentUpsertInput): Promise<Student> {
  const normalized = normalizeEnrollment(enrollmentNumber)
  const cleanName = fullName?.trim()

  if (!normalized) throw new Error('Enrollment number is required.')

  if (!supabase) {
    const current = readLocalStudents()
    const existing = current.find(
      (student) => student.enrollment_number.toLowerCase() === normalized.toLowerCase(),
    )

    const nextStudent: Student = existing
      ? {
          ...existing,
          full_name: cleanName || existing.full_name,
          updated_at: new Date().toISOString(),
        }
      : {
          id: makeLocalId('student'),
          enrollment_number: normalized,
          full_name: cleanName || null,
          email: null,
          phone: null,
          department_id: null,
          semester: null,
          batch_year: null,
          is_active: true,
          qr_token: makeLocalId('qr-token'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

    writeLocalStudents(
      existing
        ? current.map((student) => (student.id === existing.id ? nextStudent : student))
        : [nextStudent, ...current],
    )
    return nextStudent
  }

  const existing = await getStudentByEnrollment(normalized)
  if (existing) {
    if (!cleanName) return existing

    const { data, error } = await getSupabaseClient()
      .from('students')
      .update({
        full_name: cleanName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('*, departments (*)')
      .single()

    if (error) throw error
    return data as Student
  }

  const { data, error } = await getSupabaseClient()
    .from('students')
    .insert({
      enrollment_number: normalized,
      full_name: cleanName || null,
      is_active: true,
    })
    .select('*, departments (*)')
    .single()

  if (error?.code === '23505') {
    const duplicate = await getStudentByEnrollment(normalized)
    if (duplicate) return duplicate
  }

  if (error) throw error
  return data as Student
}

function readLocalStudents() {
  if (typeof window === 'undefined') return []
  const stored = window.localStorage.getItem(studentsStorageKey)
  if (!stored) return []
  return JSON.parse(stored) as Student[]
}

function writeLocalStudents(students: Student[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(studentsStorageKey, JSON.stringify(students))
}

function normalizeEnrollment(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

function makeLocalId(prefix: string) {
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID()
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
