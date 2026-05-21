import { clsx } from 'clsx'
import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function Field({ label, error, className, id, ...props }: FieldProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <label className="grid gap-2" htmlFor={inputId}>
      <span className="font-mono text-xs font-bold uppercase text-muted">{label}</span>
      <input
        className={clsx(
          'focus-brutal min-h-12 border-0 border-b-4 border-ink bg-transparent px-0 py-3 text-base outline-none placeholder:text-muted focus:border-accent',
          className,
        )}
        id={inputId}
        {...props}
      />
      {error ? <span className="font-mono text-sm font-bold text-danger">{error}</span> : null}
    </label>
  )
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
}

export function SelectField({
  label,
  error,
  className,
  id,
  children,
  ...props
}: SelectFieldProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <label className="grid gap-2" htmlFor={inputId}>
      <span className="font-mono text-xs font-bold uppercase text-muted">{label}</span>
      <select
        className={clsx(
          'focus-brutal min-h-12 border-0 border-b-4 border-ink bg-transparent px-0 py-3 text-base outline-none focus:border-accent',
          className,
        )}
        id={inputId}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="font-mono text-sm font-bold text-danger">{error}</span> : null}
    </label>
  )
}
