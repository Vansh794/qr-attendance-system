import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, ChartNoAxesColumn, LayoutDashboard, Users } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Sessions', href: '/sessions/new', icon: BookOpen },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Reports', href: '/admin/reports', icon: ChartNoAxesColumn },
]

export function AppShell() {
  return (
    <div className="mx-auto grid min-h-dvh max-w-[1440px] grid-cols-1 border-x-4 border-ink bg-paper lg:grid-cols-[248px_1fr]">
      <aside className="border-b-4 border-ink bg-ink p-6 text-paper lg:border-b-0 lg:border-r-4">
        <NavLink
          className="focus-brutal inline-block font-mono text-3xl font-bold uppercase leading-none"
          to="/dashboard"
        >
          QR
          <br />
          Attend
        </NavLink>
        <nav
          aria-label="Primary"
          className="mt-10 grid gap-3 font-mono text-sm font-bold uppercase"
        >
          {navItems.map(({ label, href, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                [
                  'focus-brutal inline-flex items-center gap-3 border-l-4 px-4 py-3',
                  isActive
                    ? 'border-accent bg-accent/20'
                    : 'border-transparent hover:border-accent hover:bg-accent/20',
                ].join(' ')
              }
              key={href}
              to={href}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 p-5 sm:p-8 lg:p-10">
        <Outlet />
      </section>
    </div>
  )
}
