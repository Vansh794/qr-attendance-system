const enrollmentPatterns = [
  /\b\d{4}[A-Z]{2,5}\d{3,5}\b/i,
  /\b[A-Z]{2,5}\d{2,6}\b/i,
]

export function parseEnrollmentFromQr(rawValue: string) {
  const value = rawValue.trim()
  if (!value) return null

  const jsonEnrollment = parseJsonEnrollment(value)
  if (jsonEnrollment) return normalizeEnrollment(jsonEnrollment)

  const urlEnrollment = parseUrlEnrollment(value)
  if (urlEnrollment) return normalizeEnrollment(urlEnrollment)

  const prefixed = value.match(/^(?:ENR|ENROLLMENT|ROLL|STU|STUDENT)[:=/-]\s*(.+)$/i)
  if (prefixed?.[1]) {
    const match = findEnrollment(prefixed[1])
    if (match) return normalizeEnrollment(match)
  }

  const direct = findEnrollment(value)
  return direct ? normalizeEnrollment(direct) : null
}

function parseJsonEnrollment(value: string) {
  if (!value.startsWith('{')) return null

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>
    const candidate =
      parsed.enrollment_number ??
      parsed.enrollmentNumber ??
      parsed.enrollment ??
      parsed.roll_no ??
      parsed.rollNo
    return typeof candidate === 'string' ? candidate : null
  } catch {
    return null
  }
}

function parseUrlEnrollment(value: string) {
  try {
    const url = new URL(value)
    return (
      url.searchParams.get('enrollment') ??
      url.searchParams.get('enrollment_number') ??
      url.searchParams.get('roll') ??
      url.searchParams.get('roll_no') ??
      url.searchParams.get('student')
    )
  } catch {
    return null
  }
}

function findEnrollment(value: string) {
  for (const pattern of enrollmentPatterns) {
    const match = value.match(pattern)
    if (match?.[0]) return match[0]
  }

  return null
}

function normalizeEnrollment(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}
