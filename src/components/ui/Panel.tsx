import { clsx } from 'clsx'
import type { HTMLAttributes } from 'react'

type PanelTone = 'paper' | 'surface' | 'ink'

const tones: Record<PanelTone, string> = {
  paper: 'bg-paper text-ink',
  surface: 'bg-surface text-ink',
  ink: 'bg-ink text-paper',
}

export function Panel({
  tone = 'surface',
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { tone?: PanelTone }) {
  return (
    <section
      className={clsx('border-4 border-ink shadow-brutal', tones[tone], className)}
      {...props}
    />
  )
}
