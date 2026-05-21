import { clsx } from 'clsx'
import type { HTMLAttributes } from 'react'

type BadgeTone = 'live' | 'closed' | 'expired' | 'present' | 'late' | 'absent' | 'neutral'

const tones: Record<BadgeTone, string> = {
  live: 'border-ink bg-accent text-white',
  closed: 'border-ink bg-ink text-paper',
  expired: 'border-danger bg-danger text-white',
  present: 'border-success bg-success text-white',
  late: 'border-warning bg-warning text-ink',
  absent: 'border-danger bg-danger text-white',
  neutral: 'border-muted bg-surface text-ink',
}

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={clsx(
        'inline-flex border-2 px-2 py-1 font-mono text-xs font-bold uppercase',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
