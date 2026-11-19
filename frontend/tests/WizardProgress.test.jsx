import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SidebarLayout from '../src/components/SidebarLayout'
import { unlockStep, resetWizardSession, setUnlockedStep } from '../src/utils/wizardProgress'
import api from '../src/services/api'

vi.mock('../src/services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { campaigns: [] } })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}))

describe('Progressive Sidebar Step Visibility & Draft Reset', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('hides Steps 2-5 and Export initially on Home / Step 1', () => {
    render(
      <MemoryRouter initialEntries={['/generator']}>
        <SidebarLayout user={{ id: 'u1', name: 'Test User', email: 'test@example.com' }} currentStep="Step 1 of 5">
          <div>Step 1 Content</div>
        </SidebarLayout>
      </MemoryRouter>
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Brand & Personas')).toBeInTheDocument()
    expect(screen.getByText('Campaign History')).toBeInTheDocument()

    // Locked steps must be invisible until unlocked
    expect(screen.queryByText('Persona Strategy')).not.toBeInTheDocument()
    expect(screen.queryByText('Campaign Concepts')).not.toBeInTheDocument()
    expect(screen.queryByText('Campaign Assets')).not.toBeInTheDocument()
    expect(screen.queryByText('Brand Guardian')).not.toBeInTheDocument()
    expect(screen.queryByText('Export')).not.toBeInTheDocument()
  })

  it('progressively reveals steps as user advances and resets on Save Draft', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <SidebarLayout user={{ id: 'u1', name: 'Test User', email: 'test@example.com' }}>
          <div>Home Content</div>
        </SidebarLayout>
      </MemoryRouter>
    )

    // Step 2 unlocked
    act(() => {
      unlockStep(2)
    })
    expect(screen.getByText('Persona Strategy')).toBeInTheDocument()
    expect(screen.queryByText('Campaign Concepts')).not.toBeInTheDocument()

    // Step 3 unlocked
    act(() => {
      unlockStep(3)
    })
    expect(screen.getByText('Campaign Concepts')).toBeInTheDocument()
    expect(screen.queryByText('Campaign Assets')).not.toBeInTheDocument()

    // Save Draft resets progress back to Step 1
    act(() => {
      resetWizardSession()
    })
    expect(screen.getByText('Brand & Personas')).toBeInTheDocument()
    expect(screen.queryByText('Persona Strategy')).not.toBeInTheDocument()
    expect(screen.queryByText('Campaign Concepts')).not.toBeInTheDocument()

    // Resuming a draft at Step 4 unlocks Steps 1-4
    act(() => {
      setUnlockedStep(4)
    })
    expect(screen.getByText('Persona Strategy')).toBeInTheDocument()
    expect(screen.getByText('Campaign Concepts')).toBeInTheDocument()
    expect(screen.getByText('Campaign Assets')).toBeInTheDocument()
    expect(screen.queryByText('Brand Guardian')).not.toBeInTheDocument()
  })
})
