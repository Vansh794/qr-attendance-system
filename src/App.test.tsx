import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the faculty dashboard shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /attendance tracker/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /new session/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('CSE301')).toBeInTheDocument()
  })
})
