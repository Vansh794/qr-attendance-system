import { describe, expect, it } from 'vitest'
import { parseEnrollmentFromQr } from './studentQr'

describe('parseEnrollmentFromQr', () => {
  it('parses direct enrollment numbers', () => {
    expect(parseEnrollmentFromQr('2025CSE101')).toBe('2025CSE101')
  })

  it('parses prefixed ID-card payloads', () => {
    expect(parseEnrollmentFromQr('ENR: 2025cse102')).toBe('2025CSE102')
    expect(parseEnrollmentFromQr('STU/2025ECE101')).toBe('2025ECE101')
  })

  it('parses URLs and JSON payloads', () => {
    expect(parseEnrollmentFromQr('https://id.example.edu/card?enrollment=2025CSE101')).toBe(
      '2025CSE101',
    )
    expect(parseEnrollmentFromQr('{"enrollment_number":"2025ECE101"}')).toBe(
      '2025ECE101',
    )
  })

  it('returns null for unrelated QR values', () => {
    expect(parseEnrollmentFromQr('library-pass')).toBeNull()
  })
})
