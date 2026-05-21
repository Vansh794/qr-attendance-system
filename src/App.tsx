import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layouts/AppShell'
import { PublicShell } from './layouts/PublicShell'
import { AdminPage } from './pages/AdminPage'
import { AttendPage } from './pages/AttendPage'
import { CoursesPage } from './pages/CoursesPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ManualAttendancePage } from './pages/ManualAttendancePage'
import { NewSessionPage } from './pages/NewSessionPage'
import { ReportsPage } from './pages/ReportsPage'
import { SessionPage } from './pages/SessionPage'
import { StudentsPage } from './pages/StudentsPage'

function App() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route path="/attend" element={<AttendPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route index element={<Navigate replace to="/dashboard" />} />
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
  )
}

export default App
