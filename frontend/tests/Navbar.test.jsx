import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../src/components/Navbar'

describe('Navbar Component (T013)', () => {
  it('renders brand name and shield logo', () => {
    render(
      <MemoryRouter>
        <Navbar user={null} onLogout={() => {}} />
      </MemoryRouter>
    )

    expect(screen.getByText(/CampaignGuard/i)).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('renders sign in and sign up links when unauthenticated', () => {
    render(
      <MemoryRouter>
        <Navbar user={null} onLogout={() => {}} />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Get Started/i })).toBeInTheDocument()
  })

  it('renders user name, dashboard link, and logout button when authenticated', () => {
    const handleLogout = vi.fn()
    const mockUser = { name: 'Sarah Connor', email: 'sarah@example.com' }

    render(
      <MemoryRouter>
        <Navbar user={mockUser} onLogout={handleLogout} />
      </MemoryRouter>
    )

    expect(screen.getByText('Sarah Connor')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument()
    
    const logoutBtn = screen.getByRole('button', { name: /Log Out/i })
    expect(logoutBtn).toBeInTheDocument()

    fireEvent.click(logoutBtn)
    expect(handleLogout).toHaveBeenCalledTimes(1)
  })
})
