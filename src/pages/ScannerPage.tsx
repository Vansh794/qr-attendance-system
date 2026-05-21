import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Camera, Keyboard, ScanLine, Square, UserCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Badge, Button, Field, Panel, SelectField } from '../components/ui'
import {
  getAttendanceForSession,
  markAttendanceByEnrollment,
} from '../services/attendanceService'
import { listActiveSessions } from '../services/sessionService'
import { parseEnrollmentFromQr } from '../lib/studentQr'
import type { AttendanceRecord, AttendanceResult, Session } from '../types/database'

const scannerElementId = 'student-id-card-qr-scanner'

type ScanMessage =
  | {
      tone: 'success' | 'warning' | 'danger'
      title: string
      detail: string
      result?: AttendanceResult
    }
  | null

export function ScannerPage() {
  const [searchParams] = useSearchParams()
  const requestedSessionId = searchParams.get('session')
  const [activeSessions, setActiveSessions] = useState<Session[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [message, setMessage] = useState<ScanMessage>(null)
  const [manualEnrollment, setManualEnrollment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isScannerRunning, setIsScannerRunning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const processingRef = useRef(false)
  const lastScanRef = useRef({ value: '', scannedAt: 0 })

  const selectedSession = useMemo(
    () => activeSessions.find((session) => session.id === selectedSessionId) ?? null,
    [activeSessions, selectedSessionId],
  )

  useEffect(() => {
    let isMounted = true

    async function loadSessions() {
      setIsLoading(true)
      const sessions = await listActiveSessions()

      if (!isMounted) return
      setActiveSessions(sessions)
      setSelectedSessionId(
        sessions.some((session) => session.id === requestedSessionId)
          ? (requestedSessionId ?? '')
          : (sessions[0]?.id ?? ''),
      )
      setIsLoading(false)
    }

    void loadSessions()
    return () => {
      isMounted = false
    }
  }, [requestedSessionId])

  useEffect(() => {
    if (!selectedSessionId) return
    let isMounted = true

    getAttendanceForSession(selectedSessionId).then((nextRecords) => {
      if (isMounted) setRecords(nextRecords)
    })

    return () => {
      isMounted = false
    }
  }, [selectedSessionId])

  const markScannedEnrollment = useCallback(
    async (rawQrValue: string) => {
      if (!selectedSession) {
        setMessage({
          tone: 'danger',
          title: 'No active class',
          detail: 'Start or select a live class before scanning ID cards.',
        })
        return
      }

      const enrollmentNumber = parseEnrollmentFromQr(rawQrValue)
      if (!enrollmentNumber) {
        setMessage({
          tone: 'danger',
          title: 'Unreadable ID QR',
          detail: 'The QR payload did not contain an enrollment number.',
        })
        return
      }

      const result = await markAttendanceByEnrollment({
        sessionId: selectedSession.id,
        token: selectedSession.qr_secret,
        enrollmentNumber,
        method: 'qr_scan',
      })

      const nextRecords = await getAttendanceForSession(selectedSession.id)
      setRecords(nextRecords)

      if (result.status === 'success') {
        setMessage({
          tone: 'success',
          title: 'Saved to current class',
          detail: `${result.student.enrollment_number} / ${result.student.full_name}`,
          result,
        })
        return
      }

      if (result.status === 'duplicate') {
        setMessage({
          tone: 'warning',
          title: 'Already marked',
          detail: `${result.student.enrollment_number} / ${result.student.full_name}`,
          result,
        })
        return
      }

      setMessage({
        tone: 'danger',
        title: 'Scan rejected',
        detail: result.message,
        result,
      })
    },
    [selectedSession],
  )

  const handleDecodedQr = useCallback(
    (decodedText: string) => {
      const now = Date.now()
      const duplicateBurst =
        lastScanRef.current.value === decodedText &&
        now - lastScanRef.current.scannedAt < 2500

      if (processingRef.current || duplicateBurst) return

      processingRef.current = true
      lastScanRef.current = { value: decodedText, scannedAt: now }

      void markScannedEnrollment(decodedText).finally(() => {
        window.setTimeout(() => {
          processingRef.current = false
        }, 900)
      })
    },
    [markScannedEnrollment],
  )

  async function startScanner() {
    if (scannerRef.current || isScannerRunning) return

    try {
      const scanner = new Html5Qrcode(scannerElementId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      })

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const edge = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72)
            return { width: edge, height: edge }
          },
        },
        handleDecodedQr,
        () => undefined,
      )
      scannerRef.current = scanner
      setIsScannerRunning(true)
    } catch (caught) {
      scannerRef.current?.clear()
      scannerRef.current = null
      setIsScannerRunning(false)
      setMessage({
        tone: 'danger',
        title: 'Camera unavailable',
        detail: caught instanceof Error ? caught.message : 'Could not start scanner.',
      })
    }
  }

  async function stopScanner() {
    const scanner = scannerRef.current
    if (!scanner) return

    if (scanner.isScanning) {
      await scanner.stop()
    }
    scanner.clear()
    scannerRef.current = null
    setIsScannerRunning(false)
  }

  async function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await markScannedEnrollment(manualEnrollment)
    setManualEnrollment('')
  }

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current
      if (!scanner) return
      if (scanner.isScanning) {
        void scanner.stop().then(() => scanner.clear())
      } else {
        scanner.clear()
      }
    }
  }, [])

  const resultTone = message?.tone === 'success' ? 'present' : message?.tone === 'warning' ? 'late' : 'absent'
  const visibleRecords = selectedSessionId ? records : []

  return (
    <div className="grid gap-6">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-mono text-sm font-bold uppercase text-muted">Primary attendance flow</p>
        <h1 className="mt-2 font-mono text-4xl font-bold uppercase leading-none sm:text-6xl">
          ID Card QR Scanner
        </h1>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Panel className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 border-b-4 border-ink pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full max-w-xl">
              <SelectField
                disabled={activeSessions.length === 0}
                label="Current class"
                name="session"
                onChange={(event) => setSelectedSessionId(event.target.value)}
                value={selectedSessionId}
              >
                {activeSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.courses?.code} / {session.room} / {session.start_time}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button disabled={!selectedSession || isScannerRunning} onClick={() => void startScanner()}>
                <Camera size={20} aria-hidden="true" />
                Start Scanner
              </Button>
              <Button disabled={!isScannerRunning} onClick={() => void stopScanner()} variant="secondary">
                <Square size={18} aria-hidden="true" />
                Stop
              </Button>
            </div>
          </div>

          {activeSessions.length === 0 && !isLoading ? (
            <div className="mt-6 border-3 border-danger bg-paper p-4 font-mono font-bold uppercase text-danger">
              No live class. <Link className="underline decoration-4 underline-offset-4" to="/sessions/new">Create session</Link>
            </div>
          ) : null}

          <div className="relative mt-6 overflow-hidden border-6 border-accent bg-ink p-3 shadow-brutal">
            <div
              className="min-h-[320px] bg-ink"
              id={scannerElementId}
            />
            {!isScannerRunning ? (
              <div className="pointer-events-none absolute inset-3 grid place-items-center bg-surface text-center font-mono font-bold uppercase text-muted">
                <div className="grid gap-3 p-6">
                  <ScanLine className="mx-auto text-accent" size={64} aria-hidden="true" />
                  <span>Scanner idle</span>
                </div>
              </div>
            ) : null}
          </div>

          <form className="mt-6 grid gap-4 bg-ink p-5 text-paper" onSubmit={handleManualSubmit}>
            <Field
              className="border-paper text-paper placeholder:text-paper/50"
              label="Manual enrollment fallback"
              name="manualEnrollment"
              onChange={(event) => setManualEnrollment(event.target.value)}
              placeholder="2023CSE001"
              value={manualEnrollment}
            />
            <Button disabled={!selectedSession || manualEnrollment.trim().length < 2} variant="inverse" type="submit">
              <Keyboard size={20} aria-hidden="true" />
              Save Enrollment
            </Button>
          </form>
        </Panel>

        <Panel className="p-5">
          <div className="border-b-4 border-ink pb-4">
            <p className="font-mono text-sm font-bold uppercase text-muted">Current class</p>
            <h2 className="mt-2 font-mono text-3xl font-bold uppercase leading-none">
              {selectedSession?.courses?.code ?? 'No live session'}
            </h2>
            {selectedSession ? (
              <p className="mt-3 font-mono text-sm text-muted">
                {selectedSession.room} / {selectedSession.start_time} / {selectedSession.faculty_name}
              </p>
            ) : null}
          </div>

          {message ? (
            <div className="mt-5 border-3 border-ink bg-paper p-4">
              <Badge tone={resultTone}>{message.title}</Badge>
              <p className="mt-3 font-mono text-sm font-bold uppercase">{message.detail}</p>
            </div>
          ) : null}

          <div className="mt-6 flex items-center justify-between border-b-4 border-ink pb-3">
            <h2 className="font-mono text-xl font-bold uppercase">Scanned Students</h2>
            <span className="font-mono text-2xl font-bold">{visibleRecords.length}</span>
          </div>
          <ol className="mt-5 grid max-h-[420px] gap-3 overflow-y-auto font-mono text-sm">
            {visibleRecords.map((record) => (
              <li className="border-3 border-ink bg-surface p-3" key={record.id}>
                <div className="flex items-center gap-2">
                  <UserCheck size={18} aria-hidden="true" />
                  <span className="font-bold">{record.students?.enrollment_number}</span>
                </div>
                <p className="mt-1">{record.students?.full_name}</p>
                <p className="mt-1 text-xs text-muted">
                  {new Date(record.marked_at).toLocaleTimeString()} / {record.method}
                </p>
              </li>
            ))}
          </ol>
        </Panel>
      </section>
    </div>
  )
}
