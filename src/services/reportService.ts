import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'
import { demoStudents } from '../data/demoData'
import { getAttendanceForSession } from './attendanceService'
import { getSessionById, listSessions } from './sessionService'
import type { AttendanceExportRow } from '../types/database'

export type SessionReport = {
  sessionId: string
  title: string
  courseCode: string
  courseName: string
  totalStudents: number
  presentCount: number
  absentCount: number
  rows: AttendanceExportRow[]
}

export type DefaulterRow = {
  enrollmentNumber: string
  studentName: string
  attended: number
  total: number
  percentage: number
}

export async function getSessionReport(sessionId: string): Promise<SessionReport> {
  const session = await getSessionById(sessionId)
  if (!session) throw new Error('Session not found')

  const records = await getAttendanceForSession(sessionId)
  const rows = records.map((record) => ({
    enrollmentNumber: record.students?.enrollment_number ?? '',
    studentName: record.students?.full_name ?? '',
    email: record.students?.email ?? '',
    courseCode: session.courses?.code ?? '',
    courseName: session.courses?.name ?? '',
    sessionDate: session.session_date,
    markedAt: record.marked_at,
    method: record.method,
    status: record.status,
  }))

  return {
    sessionId,
    title: `${session.courses?.code ?? 'SESSION'} ${session.session_date}`,
    courseCode: session.courses?.code ?? '',
    courseName: session.courses?.name ?? '',
    totalStudents: demoStudents.length,
    presentCount: rows.length,
    absentCount: Math.max(demoStudents.length - rows.length, 0),
    rows,
  }
}

export async function listDefaulters(threshold = 75): Promise<DefaulterRow[]> {
  const sessions = await listSessions()
  const attendanceBySession = await Promise.all(
    sessions.map((session) => getAttendanceForSession(session.id)),
  )
  const total = Math.max(sessions.length, 1)

  return demoStudents
    .map((student) => {
      const attended = attendanceBySession.filter((records) =>
        records.some((record) => record.student_id === student.id),
      ).length
      const percentage = Math.round((attended / total) * 100)

      return {
        enrollmentNumber: student.enrollment_number,
        studentName: student.full_name,
        attended,
        total,
        percentage,
      }
    })
    .filter((row) => row.percentage < threshold)
}

export function downloadSessionCsv(report: SessionReport) {
  const csv = Papa.unparse(
    report.rows.map((row) => ({
      'Enrollment No': row.enrollmentNumber,
      Name: row.studentName,
      Email: row.email,
      Course: `${row.courseCode} - ${row.courseName}`,
      'Session Date': row.sessionDate,
      'Marked At': new Date(row.markedAt).toLocaleString(),
      Method: row.method,
      Status: row.status,
    })),
  )

  downloadBlob(
    new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    `attendance-${report.sessionId}.csv`,
  )
}

export function downloadSessionPdf(report: SessionReport) {
  const doc = new jsPDF()
  doc.setFont('helvetica', 'bold')
  doc.text(`Session Report - ${report.courseCode}`, 14, 18)
  doc.setFont('helvetica', 'normal')
  doc.text(`${report.courseName} / ${report.presentCount} present`, 14, 28)

  autoTable(doc, {
    head: [['Enrollment', 'Name', 'Marked At', 'Method', 'Status']],
    body: report.rows.map((row) => [
      row.enrollmentNumber,
      row.studentName,
      new Date(row.markedAt).toLocaleString(),
      row.method,
      row.status,
    ]),
    startY: 36,
  })

  doc.save(`attendance-${report.sessionId}.pdf`)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
