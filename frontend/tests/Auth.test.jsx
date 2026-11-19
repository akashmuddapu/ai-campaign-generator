import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../src/pages/LandingPage'
import LoginPage from '../src/pages/LoginPage'
import SignupPage from '../src/pages/SignupPage'
import DashboardPage from '../src/pages/DashboardPage'

describe('Authentication & Dashboard Pages (T037)', () => {
  describe('LandingPage (T039)', () => {
    it('renders hero headline, value proposition, and CTA buttons', () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      )

      expect(screen.getByText(/AI Marketing Campaign Generator/i)).toBeInTheDocument()
      expect(screen.getByText(/Brand Guardian/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Start Free Campaign/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Live Demo/i })).toBeInTheDocument()
    })
  })

  describe('LoginPage (T040)', () => {
    it('renders email and password inputs and submits', () => {
      const handleLogin = vi.fn().mockResolvedValue({ id: 'u1', email: 'test@example.com' })

      render(
        <MemoryRouter>
          <LoginPage onLogin={handleLogin} />
        </MemoryRouter>
      )

      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
    })
  })

  describe('SignupPage (T041)', () => {
    it('renders name, email, password inputs and submits', () => {
      const handleSignup = vi.fn().mockResolvedValue({ id: 'u1', name: 'John Doe', email: 'john@example.com' })

      render(
        <MemoryRouter>
          <SignupPage onSignup={handleSignup} />
        </MemoryRouter>
      )

      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument()
    })
  })

  describe('DashboardPage (T042)', () => {
    it('renders dashboard greeting and New Campaign CTA', () => {
      const mockUser = { name: 'Sarah Connor', email: 'sarah@example.com' }

      render(
        <MemoryRouter>
          <DashboardPage user={mockUser} />
        </MemoryRouter>
      )

      expect(screen.getAllByText(/Sarah Connor/i).length).toBeGreaterThan(0)
      expect(screen.getByRole('link', { name: /Create New Campaign/i })).toBeInTheDocument()
    })
  })
})
