import { LogIn } from 'lucide-react'
import { Button, Field, Panel } from '../components/ui'

export function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper p-5 text-ink">
      <Panel className="w-full max-w-lg p-8">
        <p className="font-mono text-sm font-bold uppercase text-muted">QR Attend</p>
        <h1 className="mt-3 border-b-4 border-ink pb-6 font-mono text-4xl font-bold uppercase leading-none">
          Faculty Login
        </h1>
        <form className="mt-8 grid gap-6">
          <Field autoComplete="email" label="Email" name="email" type="email" />
          <Field
            autoComplete="current-password"
            label="Password"
            name="password"
            type="password"
          />
          <Button className="mt-4 w-full" type="submit">
            <LogIn size={20} aria-hidden="true" />
            Login
          </Button>
        </form>
      </Panel>
    </main>
  )
}
