import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  type CameraDevice,
} from 'html5-qrcode'
import { Camera, ImageUp, Keyboard, ScanLine, Square, UserCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Badge, Button, Field, Panel, SelectField } from '../components/ui'
import {
  getAttendanceForSession,
  markAttendanceByEnrollment,
} from '../services/attendanceService'
import { recordQrScanLog, updateQrScanLog } from '../services/scanLogService'
import { listActiveSessions } from '../services/sessionService'
import { parseEnrollmentFromQr } from '../lib/studentQr'
import type {
  AttendanceRecord,
  AttendanceResult,
  QrScanLog,
  QrScanResultStatus,
  QrScanSource,
  Session,
} from '../types/database'

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
  const { sessionId: routeSessionId } = useParams()
  const [searchParams] = useSearchParams()
  const requestedSessionId = routeSessionId ?? searchParams.get('session')
  const isSessionScannerRoute = Boolean(routeSessionId)
  const [activeSessions, setActiveSessions] = useState<Session[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [message, setMessage] = useState<ScanMessage>(null)
  const [manualEnrollment, setManualEnrollment] = useState('')
  const [cameraDevices, setCameraDevices] = useState<CameraDevice[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState('')
  const [lastRawScan, setLastRawScan] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isScanningFile, setIsScanningFile] = useState(false)
  const [isScannerRunning, setIsScannerRunning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const processingRef = useRef(false)
  const lastScanRef = useRef({ value: '', scannedAt: 0 })
  const autoStartSessionRef = useRef<string | null>(null)

  const selectedSession = useMemo(
    () => activeSessions.find((session) => session.id === selectedSessionId) ?? null,
    [activeSessions, selectedSessionId],
  )
  const selectedCameraLabel = useMemo(
    () =>
      cameraDevices.find((camera) => camera.id === selectedCameraId)?.label ??
      null,
    [cameraDevices, selectedCameraId],
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
          : routeSessionId
            ? ''
            : (sessions[0]?.id ?? ''),
      )
      setIsLoading(false)
    }

    void loadSessions()
    return () => {
      isMounted = false
    }
  }, [requestedSessionId, routeSessionId])

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
    async (rawQrValue: string, scanSource: QrScanSource = 'camera') => {
      let scanLog: QrScanLog | null = null
      const enrollmentNumber = parseEnrollmentFromQr(rawQrValue)

      const persistInitialScanLog = async (sessionId: string | null) => {
        try {
          scanLog = await recordQrScanLog({
            sessionId,
            rawPayload: rawQrValue,
            parsedEnrollmentNumber: enrollmentNumber,
            resultStatus: 'received',
            scanSource,
            cameraLabel: scanSource === 'camera' ? selectedCameraLabel : null,
          })
        } catch {
          scanLog = null
        }
      }

      const finalizeScanLog = async ({
        sessionId,
        parsedEnrollmentNumber,
        resultStatus,
        attendanceRecordId,
        errorMessage,
      }: {
        sessionId: string | null
        parsedEnrollmentNumber: string | null
        resultStatus: QrScanResultStatus
        attendanceRecordId?: string | null
        errorMessage?: string | null
      }) => {
        try {
          if (scanLog) {
            await updateQrScanLog(scanLog.id, {
              sessionId,
              parsedEnrollmentNumber,
              resultStatus,
              attendanceRecordId,
              cameraLabel: scanSource === 'camera' ? selectedCameraLabel : null,
              errorMessage,
            })
          } else {
            await recordQrScanLog({
              sessionId,
              rawPayload: rawQrValue,
              parsedEnrollmentNumber,
              resultStatus,
              attendanceRecordId,
              scanSource,
              cameraLabel: scanSource === 'camera' ? selectedCameraLabel : null,
              errorMessage,
            })
          }
          return null
        } catch (caught) {
          return caught instanceof Error ? caught.message : 'QR scan log was not stored.'
        }
      }

      await persistInitialScanLog(selectedSession?.id ?? null)

      if (!selectedSession) {
        const logError = await finalizeScanLog({
          sessionId: null,
          parsedEnrollmentNumber: enrollmentNumber,
          resultStatus: 'no_active_session',
          errorMessage: 'No active class selected.',
        })
        setMessage({
          tone: 'danger',
          title: 'No active class',
          detail: logError
            ? `Start or select a live class before scanning ID cards. Scan log failed: ${logError}`
            : 'Start or select a live class before scanning ID cards. Raw QR stored.',
        })
        return
      }

      if (!enrollmentNumber) {
        const logError = await finalizeScanLog({
          sessionId: selectedSession.id,
          parsedEnrollmentNumber: null,
          resultStatus: 'unreadable',
          errorMessage: 'QR payload did not contain an enrollment number.',
        })
        setMessage({
          tone: 'danger',
          title: 'Unreadable ID QR',
          detail: logError
            ? `The QR payload did not contain an enrollment number. Scan log failed: ${logError}`
            : 'The QR payload did not contain an enrollment number. Raw QR stored.',
        })
        return
      }

      let result: AttendanceResult

      try {
        result = await markAttendanceByEnrollment({
          sessionId: selectedSession.id,
          token: selectedSession.qr_secret,
          enrollmentNumber,
          method: 'qr_scan',
        })
      } catch (caught) {
        const errorMessage =
          caught instanceof Error ? caught.message : 'Attendance could not be saved.'
        const logError = await finalizeScanLog({
          sessionId: selectedSession.id,
          parsedEnrollmentNumber: enrollmentNumber,
          resultStatus: 'error',
          errorMessage,
        })
        setMessage({
          tone: 'danger',
          title: 'Scan storage failed',
          detail: logError
            ? `${errorMessage} Scan log failed: ${logError}`
            : `${errorMessage} Raw QR stored for audit.`,
        })
        return
      }

      const attendanceRecordId = 'record' in result ? (result.record?.id ?? null) : null
      const resultMessage = 'message' in result ? result.message : null
      const logError = await finalizeScanLog({
        sessionId: selectedSession.id,
        parsedEnrollmentNumber: enrollmentNumber,
        resultStatus: result.status,
        attendanceRecordId,
        errorMessage:
          result.status === 'success' || result.status === 'duplicate'
            ? null
            : resultMessage,
      })
      const logSuffix = logError
        ? ` Scan log failed: ${logError}`
        : ' Raw QR stored.'

      void getAttendanceForSession(selectedSession.id)
        .then(setRecords)
        .catch(() => undefined)

      if (result.status === 'success') {
        setMessage({
          tone: 'success',
          title: 'Saved to current class',
          detail: `${result.student.enrollment_number} / ${result.student.full_name ?? 'Name not added'}.${logSuffix}`,
          result,
        })
        return
      }

      if (result.status === 'duplicate') {
        setMessage({
          tone: 'warning',
          title: 'Already marked',
          detail: `${result.student.enrollment_number} / ${result.student.full_name ?? 'Name not added'}.${logSuffix}`,
          result,
        })
        return
      }

      setMessage({
        tone: 'danger',
        title: 'Scan rejected',
        detail: `${result.message}${logSuffix}`,
        result,
      })
    },
    [selectedCameraLabel, selectedSession],
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
      setLastRawScan(decodedText)

      void markScannedEnrollment(decodedText, 'camera').finally(() => {
        window.setTimeout(() => {
          processingRef.current = false
        }, 900)
      })
    },
    [markScannedEnrollment],
  )

  const startScanner = useCallback(async () => {
    if (scannerRef.current || isScannerRunning) return

    let scanner: Html5Qrcode | null = null

    try {
      scanner = new Html5Qrcode(scannerElementId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      })
      const cameras =
        cameraDevices.length > 0
          ? cameraDevices
          : await Html5Qrcode.getCameras().catch(() => [])
      const preferredCamera =
        cameras.find((camera) => camera.id === selectedCameraId) ??
        cameras.find((camera) => /back|rear|environment/i.test(camera.label)) ??
        cameras[0]

      if (cameras.length > 0) {
        setCameraDevices(cameras)
        setSelectedCameraId(preferredCamera?.id ?? '')
      }

      await scanner.start(
        preferredCamera?.id ?? { facingMode: 'environment' },
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
      setMessage({
        tone: 'success',
        title: 'Scanner running',
        detail: preferredCamera?.label || 'Camera preview is active.',
      })
    } catch (caught) {
      scanner?.clear()
      scannerRef.current = null
      setIsScannerRunning(false)
      setMessage({
        tone: 'danger',
        title: 'Camera unavailable',
        detail: caught instanceof Error ? caught.message : 'Could not start scanner.',
      })
    }
  }, [cameraDevices, handleDecodedQr, isScannerRunning, selectedCameraId])

  useEffect(() => {
    if (!isSessionScannerRoute || !selectedSession || isScannerRunning) return
    if (autoStartSessionRef.current === selectedSession.id) return

    autoStartSessionRef.current = selectedSession.id
    void startScanner()
  }, [isScannerRunning, isSessionScannerRoute, selectedSession, startScanner])

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

  async function handleFileScan(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIsScanningFile(true)

    try {
      if (scannerRef.current) {
        await stopScanner()
      }

      const scanner = new Html5Qrcode(scannerElementId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      })
      scannerRef.current = scanner
      const decodedText = await scanner.scanFile(file, true)
      setLastRawScan(decodedText)
      await markScannedEnrollment(decodedText, 'image_upload')
      scanner.clear()
      scannerRef.current = null
    } catch (caught) {
      scannerRef.current?.clear()
      scannerRef.current = null
      setMessage({
        tone: 'danger',
        title: 'Image scan failed',
        detail:
          caught instanceof Error
            ? caught.message
            : 'The uploaded image did not contain a readable QR code.',
      })
    } finally {
      setIsScanningFile(false)
    }
  }

  async function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await markScannedEnrollment(manualEnrollment, 'manual_entry')
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

          {cameraDevices.length > 0 ? (
            <div className="mt-5 max-w-xl">
              <SelectField
                disabled={isScannerRunning}
                label="Camera device"
                name="camera"
                onChange={(event) => setSelectedCameraId(event.target.value)}
                value={selectedCameraId}
              >
                {cameraDevices.map((camera, index) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </SelectField>
            </div>
          ) : null}

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
            {!isScannerRunning && !isScanningFile ? (
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
              placeholder="Enrollment number"
              value={manualEnrollment}
            />
            <Button disabled={!selectedSession || manualEnrollment.trim().length < 2} variant="inverse" type="submit">
              <Keyboard size={20} aria-hidden="true" />
              Save Enrollment
            </Button>
          </form>

          <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 border-3 border-ink bg-surface px-5 py-3 font-mono font-bold uppercase text-ink shadow-brutal-sm">
            <ImageUp size={20} aria-hidden="true" />
            {isScanningFile ? 'Scanning Image' : 'Scan QR Image'}
            <input
              accept="image/*"
              className="sr-only"
              disabled={isScanningFile}
              onChange={(event) => void handleFileScan(event)}
              type="file"
            />
          </label>
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

          {lastRawScan ? (
            <div className="mt-5 border-3 border-ink bg-surface p-4">
              <p className="font-mono text-xs font-bold uppercase text-muted">Last raw QR</p>
              <p className="mt-2 break-all font-mono text-sm">{lastRawScan}</p>
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
                <p className="mt-1">{record.students?.full_name ?? 'Name not added'}</p>
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
