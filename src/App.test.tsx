import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  it('renders the faculty dashboard shell', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: /attendance tracker/i }, { timeout: 5000 }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /new session/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('CSE301')).toBeInTheDocument()
  })
})
