import { Outlet } from 'react-router-dom'

export function PublicShell() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto min-h-dvh max-w-3xl border-x-4 border-ink bg-paper p-5 sm:p-8">
        <Outlet />
      </div>
    </main>
  )
}
