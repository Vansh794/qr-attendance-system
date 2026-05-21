import {
  Activity,
  Download,
  ListChecks,
  type LucideIcon,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
} from 'lucide-react'

function App() {
  const sessions = [
    {
      course: 'CSE301',
      title: 'Data Structures',
      room: 'Room 301',
      time: '09:00',
      present: 23,
      status: 'LIVE',
    },
    {
      course: 'CSE302',
      title: 'Database Systems',
      room: 'Lab 4',
      time: '11:00',
      present: 41,
      status: 'CLOSED',
    },
  ]
  const stats: Array<{
    label: string
    value: string
    icon: LucideIcon
  }> = [
    { label: 'Today Sessions', value: '04', icon: Activity },
    { label: 'Students Marked', value: '128', icon: ListChecks },
    { label: 'Average Attendance', value: '82%', icon: ShieldCheck },
    { label: 'Live Session', value: '01', icon: QrCode },
  ]

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto grid min-h-dvh max-w-[1440px] grid-cols-1 border-x-4 border-ink bg-paper lg:grid-cols-[248px_1fr]">
        <aside className="border-b-4 border-ink bg-ink p-6 text-paper lg:border-b-0 lg:border-r-4">
          <div className="font-mono text-3xl font-bold uppercase leading-none">
            QR
            <br />
            ATTEND
          </div>
          <nav
            aria-label="Primary"
            className="mt-10 grid gap-3 font-mono text-sm font-bold uppercase"
          >
            {['Dashboard', 'Sessions', 'Students', 'Reports'].map((item) => (
              <a
                className="focus-brutal border-l-4 border-transparent px-4 py-3 hover:border-accent hover:bg-accent/20"
                href="/"
                key={item}
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        <section className="p-5 sm:p-8 lg:p-10">
          <header className="flex flex-col gap-6 border-b-4 border-ink pb-8 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="font-mono text-sm font-bold uppercase text-muted">
                Faculty console
              </p>
              <h1 className="mt-2 max-w-4xl font-mono text-4xl font-bold uppercase leading-none sm:text-5xl lg:text-6xl">
                Attendance Tracker
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="focus-brutal inline-flex items-center gap-2 border-4 border-ink bg-accent px-5 py-3 font-mono font-bold uppercase text-white shadow-brutal transition hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-brutal-sm">
                <Plus size={20} aria-hidden="true" />
                New Session
              </button>
              <button className="focus-brutal inline-flex items-center gap-2 border-3 border-ink bg-surface px-5 py-3 font-mono font-bold uppercase shadow-brutal-sm transition active:translate-x-0.5 active:translate-y-0.5">
                <Search size={20} aria-hidden="true" />
                Manual Mark
              </button>
            </div>
          </header>

          <section
            className="grid gap-5 py-8 md:grid-cols-2 xl:grid-cols-4"
            aria-label="Today at a glance"
          >
            {stats.map(({ label, value, icon: Icon }) => (
              <article
                className="border-4 border-ink bg-surface p-5 shadow-brutal"
                key={String(label)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-mono text-sm font-bold uppercase text-muted">
                    {label}
                  </h2>
                  <Icon size={24} aria-hidden="true" />
                </div>
                <p className="mt-6 font-mono text-5xl font-bold leading-none">
                  {value}
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <article className="border-4 border-ink bg-surface shadow-brutal">
              <div className="flex flex-col gap-4 border-b-4 border-ink p-5 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-mono text-xl font-bold uppercase">
                  Today's Sessions
                </h2>
                <button className="focus-brutal inline-flex items-center justify-center gap-2 border-3 border-ink bg-paper px-4 py-2 font-mono text-sm font-bold uppercase">
                  <Download size={18} aria-hidden="true" />
                  Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead className="bg-ink font-mono text-xs font-bold uppercase text-paper">
                    <tr>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Session</th>
                      <th className="px-4 py-3">Room</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Present</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session, index) => (
                      <tr
                        className={index % 2 === 0 ? 'bg-surface' : 'bg-stripe'}
                        key={session.course}
                      >
                        <td className="px-4 py-4 font-mono font-bold">
                          {session.course}
                        </td>
                        <td className="px-4 py-4">{session.title}</td>
                        <td className="px-4 py-4">{session.room}</td>
                        <td className="px-4 py-4 font-mono">{session.time}</td>
                        <td className="px-4 py-4 font-mono">
                          {session.present}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex border-2 border-ink bg-accent px-2 py-1 font-mono text-xs font-bold uppercase text-white">
                            {session.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="border-4 border-ink bg-ink p-5 text-paper shadow-brutal">
              <div className="flex items-center justify-between gap-4 border-b-4 border-paper pb-4">
                <h2 className="font-mono text-xl font-bold uppercase">
                  Live Feed
                </h2>
                <span className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase">
                  <span className="h-3 w-3 bg-success" aria-hidden="true" />
                  Live
                </span>
              </div>
              <ol className="mt-5 grid gap-4 font-mono text-sm">
                {[
                  '09:23:44  2023CSE001  AARAV SHARMA',
                  '09:24:11  2023CSE002  PRIYA MEHTA',
                  '09:24:33  2023ECE001  SNEHA GUPTA',
                ].map((entry) => (
                  <li
                    className="border-b border-dashed border-paper/30 pb-3"
                    key={entry}
                  >
                    {entry}
                  </li>
                ))}
              </ol>
            </article>
          </section>
        </section>
      </div>
    </main>
  )
}

export default App
