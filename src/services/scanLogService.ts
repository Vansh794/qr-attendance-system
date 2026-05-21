import { getSupabaseClient, supabase } from '../lib/supabase'
import type { QrScanLog, QrScanResultStatus, QrScanSource } from '../types/database'

const scanLogStorageKey = 'qr-attendance-scan-logs'

export type QrScanLogInput = {
  sessionId: string | null
  rawPayload: string
  parsedEnrollmentNumber: string | null
  resultStatus: QrScanResultStatus
  attendanceRecordId?: string | null
  scanSource: QrScanSource
  cameraLabel?: string | null
  errorMessage?: string | null
}

type QrScanLogUpdateInput = Partial<
  Pick<
    QrScanLogInput,
    | 'sessionId'
    | 'parsedEnrollmentNumber'
    | 'resultStatus'
    | 'attendanceRecordId'
    | 'cameraLabel'
    | 'errorMessage'
  >
>

export async function recordQrScanLog(input: QrScanLogInput): Promise<QrScanLog> {
  const log = {
    session_id: input.sessionId,
    raw_payload: input.rawPayload,
    parsed_enrollment_number: input.parsedEnrollmentNumber,
    result_status: input.resultStatus,
    attendance_record_id: input.attendanceRecordId ?? null,
    scan_source: input.scanSource,
    camera_label: input.cameraLabel ?? null,
    device_info: typeof navigator === 'undefined' ? null : navigator.userAgent,
    error_message: input.errorMessage ?? null,
  }

  if (!supabase) {
    const localLog = {
      id: makeLogId(),
      ...log,
      created_at: new Date().toISOString(),
    } satisfies QrScanLog

    writeLocalScanLogs([localLog, ...readLocalScanLogs()])
    return localLog
  }

  const { data, error } = await getSupabaseClient()
    .from('qr_scan_logs')
    .insert(log)
    .select()
    .single()

  if (error) throw error
  return data as QrScanLog
}

export async function updateQrScanLog(
  id: string,
  input: QrScanLogUpdateInput,
): Promise<QrScanLog> {
  const update = {
    ...(input.sessionId !== undefined ? { session_id: input.sessionId } : {}),
    ...(input.parsedEnrollmentNumber !== undefined
      ? { parsed_enrollment_number: input.parsedEnrollmentNumber }
      : {}),
    ...(input.resultStatus !== undefined ? { result_status: input.resultStatus } : {}),
    ...(input.attendanceRecordId !== undefined
      ? { attendance_record_id: input.attendanceRecordId }
      : {}),
    ...(input.cameraLabel !== undefined ? { camera_label: input.cameraLabel } : {}),
    ...(input.errorMessage !== undefined ? { error_message: input.errorMessage } : {}),
  }

  if (!supabase) {
    const logs = readLocalScanLogs()
    const existing = logs.find((log) => log.id === id)
    if (!existing) throw new Error('QR scan log not found.')

    const nextLog = { ...existing, ...update } satisfies QrScanLog
    writeLocalScanLogs(logs.map((log) => (log.id === id ? nextLog : log)))
    return nextLog
  }

  const { data, error } = await getSupabaseClient()
    .from('qr_scan_logs')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as QrScanLog
}

function readLocalScanLogs() {
  if (typeof window === 'undefined') return []
  const stored = window.localStorage.getItem(scanLogStorageKey)
  if (!stored) return []
  return JSON.parse(stored) as QrScanLog[]
}

function writeLocalScanLogs(logs: QrScanLog[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(scanLogStorageKey, JSON.stringify(logs))
}

function makeLogId() {
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID()
  }

  return `scan-log-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
