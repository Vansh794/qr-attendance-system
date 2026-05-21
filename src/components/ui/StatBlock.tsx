import type { LucideIcon } from 'lucide-react'

export function StatBlock({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) {
  return (
    <article className="border-4 border-ink bg-surface p-5 shadow-brutal">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-mono text-sm font-bold uppercase text-muted">{label}</h2>
        <Icon size={24} aria-hidden="true" />
      </div>
      <p className="mt-6 font-mono text-5xl font-bold leading-none">{value}</p>
    </article>
  )
}
