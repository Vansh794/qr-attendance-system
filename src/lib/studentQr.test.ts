import { describe, expect, it } from 'vitest'
import { parseEnrollmentFromQr } from './studentQr'

describe('parseEnrollmentFromQr', () => {
  it('parses direct enrollment numbers', () => {
    expect(parseEnrollmentFromQr('2023CSE001')).toBe('2023CSE001')
  })

  it('parses prefixed ID-card payloads', () => {
    expect(parseEnrollmentFromQr('ENR: 2023cse002')).toBe('2023CSE002')
    expect(parseEnrollmentFromQr('STU/2023ECE001')).toBe('2023ECE001')
  })

  it('parses URLs and JSON payloads', () => {
    expect(parseEnrollmentFromQr('https://id.example.edu/card?enrollment=2023CSE001')).toBe(
      '2023CSE001',
    )
    expect(parseEnrollmentFromQr('{"enrollment_number":"2023ECE001"}')).toBe(
      '2023ECE001',
    )
  })

  it('returns null for unrelated QR values', () => {
    expect(parseEnrollmentFromQr('library-pass')).toBeNull()
  })
})
