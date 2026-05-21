import { getSupabaseClient, supabase } from '../lib/supabase'
import type { QrScanLog, QrScanResultStatus, QrScanSource } from '../types/database'

const scanLogStorageKey = 'qr-attendance-demo-scan-logs'

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
    const demoLog = {
      id: makeLogId(),
      ...log,
      created_at: new Date().toISOString(),
    } satisfies QrScanLog

    writeDemoScanLogs([demoLog, ...readDemoScanLogs()])
    return demoLog
  }

  const { data, error } = await getSupabaseClient()
    .from('qr_scan_logs')
    .insert(log)
    .select()
    .single()

  if (error) throw error
  return data as QrScanLog
}

function readDemoScanLogs() {
  if (typeof window === 'undefined') return []
  const stored = window.localStorage.getItem(scanLogStorageKey)
  if (!stored) return []
  return JSON.parse(stored) as QrScanLog[]
}

function writeDemoScanLogs(logs: QrScanLog[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(scanLogStorageKey, JSON.stringify(logs))
}

function makeLogId() {
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID()
  }

  return `scan-log-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
