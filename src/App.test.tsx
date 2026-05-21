import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  it('renders the scanner-first landing page', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: /id card qr scanner/i }, { timeout: 5000 }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /start scanner/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/scanned students/i)).toBeInTheDocument()
  })
})
