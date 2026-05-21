import { demoStudents } from '../data/demoData'
import { supabase } from '../lib/supabase'
import type { Student } from '../types/database'

export async function searchStudents(query: string): Promise<Student[]> {
  const normalized = query.trim()
  if (normalized.length < 2) return []

  if (!supabase) {
    const lower = normalized.toLowerCase()
    return demoStudents.filter(
      (student) =>
        student.enrollment_number.toLowerCase().includes(lower) ||
        student.full_name.toLowerCase().includes(lower),
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
  if (!supabase) {
    return (
      demoStudents.find(
        (student) =>
          student.enrollment_number.toLowerCase() ===
          enrollmentNumber.trim().toLowerCase(),
      ) ?? null
    )
  }

  const { data, error } = await supabase
    .from('students')
    .select('*, departments (*)')
    .eq('enrollment_number', enrollmentNumber.trim())
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  return data as Student | null
}
