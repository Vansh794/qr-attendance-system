import { env } from './env'
import type { Session } from '../types/database'

export function buildAttendUrl(session: Pick<Session, 'id' | 'qr_secret'>) {
  const url = new URL('/attend', env.appBaseUrl)
  url.searchParams.set('session', session.id)
  url.searchParams.set('token', session.qr_secret)
  return url.toString()
}

export function makeSecret() {
  if ('crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
