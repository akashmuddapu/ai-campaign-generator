import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingIndicator from '../src/components/LoadingIndicator'

describe('LoadingIndicator Component (T014)', () => {
  it('renders default message when no custom message provided', () => {
    render(<LoadingIndicator />)
    expect(screen.getByText(/Generating brand-safe campaign/i)).toBeInTheDocument()
  })

  it('renders custom stage message when provided', () => {
    const customStage = 'Analyzing Persona DNA & Resonance Factors...'
    render(<LoadingIndicator message={customStage} />)
    expect(screen.getByText(customStage)).toBeInTheDocument()
  })

  it('renders sub-message or tip if supplied', () => {
    render(
      <LoadingIndicator 
        message="Evaluating Brand Guardian..." 
        subtext="Running deterministic length and banned-word scanner" 
      />
    )
    expect(screen.getByText(/Evaluating Brand Guardian/i)).toBeInTheDocument()
    expect(screen.getByText(/Running deterministic length and banned-word scanner/i)).toBeInTheDocument()
  })
})
