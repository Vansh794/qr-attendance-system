export function makeSecret() {
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
