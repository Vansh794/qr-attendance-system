import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Panel } from './components/ui'
import { AppShell } from './layouts/AppShell'
import { PublicShell } from './layouts/PublicShell'

const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })),
)
const AttendPage = lazy(() =>
  import('./pages/AttendPage').then((module) => ({ default: module.AttendPage })),
)
const CoursesPage = lazy(() =>
  import('./pages/CoursesPage').then((module) => ({ default: module.CoursesPage })),
)
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const ManualAttendancePage = lazy(() =>
  import('./pages/ManualAttendancePage').then((module) => ({
    default: module.ManualAttendancePage,
  })),
)
const NewSessionPage = lazy(() =>
  import('./pages/NewSessionPage').then((module) => ({ default: module.NewSessionPage })),
)
const ReportsPage = lazy(() =>
  import('./pages/ReportsPage').then((module) => ({ default: module.ReportsPage })),
)
const ScannerPage = lazy(() =>
  import('./pages/ScannerPage').then((module) => ({ default: module.ScannerPage })),
)
const SessionPage = lazy(() =>
  import('./pages/SessionPage').then((module) => ({ default: module.SessionPage })),
)
const StudentsPage = lazy(() =>
  import('./pages/StudentsPage').then((module) => ({ default: module.StudentsPage })),
)

function App() {
  return (
    <Suspense
      fallback={
        <Panel className="m-5 p-6">
          <p className="font-mono text-xl font-bold uppercase">Loading</p>
        </Panel>
      }
    >
      <Routes>
        <Route element={<PublicShell />}>
          <Route path="/attend" element={<AttendPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppShell />}>
          <Route index element={<ScannerPage />} />
          <Route path="/scanner" element={<Navigate replace to="/" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sessions/new" element={<NewSessionPage />} />
          <Route path="/sessions/:sessionId" element={<SessionPage />} />
          <Route
            path="/sessions/:sessionId/attendance"
            element={<ManualAttendancePage />}
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/students" element={<StudentsPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/courses" element={<CoursesPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
