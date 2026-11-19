import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ExecutiveGradeBanner from '../src/components/ExecutiveGradeBanner'
import CampaignRadarChart from '../src/components/CampaignRadarChart'
import ScoreBreakdownGrid from '../src/components/ScoreBreakdownGrid'
import PersonaImpactCard from '../src/components/PersonaImpactCard'
import PredictedPerformanceCard from '../src/components/PredictedPerformanceCard'
import ImprovementDrawerModal from '../src/components/ImprovementDrawerModal'

describe('Campaign Report Card Components', () => {
  it('renders ExecutiveGradeBanner with overall score, grade, and readiness status', () => {
    const handleImprove = vi.fn()
    render(
      <ExecutiveGradeBanner
        overallScore={96}
        grade="A+"
        launchReadiness="Ready to Launch"
        onImproveClick={handleImprove}
      />
    )

    expect(screen.getByText('96')).toBeInTheDocument()
    expect(screen.getByText('Grade: A+')).toBeInTheDocument()
    expect(screen.getByText('Ready to Launch')).toBeInTheDocument()

    const btn = screen.getByRole('button', { name: /Improve Campaign/i })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(handleImprove).toHaveBeenCalledTimes(1)
  })

  it('renders CampaignRadarChart with all 5 category dimensions', () => {
    const scores = {
      brand_consistency: 95,
      persona_relevance: 98,
      marketing_quality: 94,
      creativity: 90,
      compliance: 96,
    }

    render(<CampaignRadarChart scores={scores} />)
    expect(screen.getByText(/5-Dimension Balance Radar/i)).toBeInTheDocument()
    expect(screen.getByText('Brand Consistency')).toBeInTheDocument()
    expect(screen.getByText('Persona Relevance')).toBeInTheDocument()
    expect(screen.getByText('Marketing Quality')).toBeInTheDocument()
    expect(screen.getByText('Creativity')).toBeInTheDocument()
    expect(screen.getByText('Compliance')).toBeInTheDocument()
  })

  it('renders ScoreBreakdownGrid with all 5 category cards', () => {
    const scores = {
      brand_consistency: 92,
      persona_relevance: 95,
      marketing_quality: 90,
      creativity: 88,
      compliance: 96,
    }

    render(<ScoreBreakdownGrid scores={scores} />)
    expect(screen.getByText('Brand Consistency')).toBeInTheDocument()
    expect(screen.getByText('Persona Relevance')).toBeInTheDocument()
    expect(screen.getByText('Marketing Quality')).toBeInTheDocument()
    expect(screen.getByText('Creativity')).toBeInTheDocument()
    expect(screen.getByText('Compliance')).toBeInTheDocument()
  })

  it('renders PersonaImpactCard with persona name and primary trigger', () => {
    const personas = [
      {
        persona_id: 'p-1',
        persona_name: 'College Student',
        relevance_score: 96,
        primary_trigger: 'Convenience between study sessions',
      },
    ]

    render(<PersonaImpactCard personas={personas} />)
    expect(screen.getByText('College Student')).toBeInTheDocument()
    expect(screen.getByText('Fit: 96%')).toBeInTheDocument()
    expect(screen.getByText(/"Convenience between study sessions"/i)).toBeInTheDocument()
  })

  it('renders PredictedPerformanceCard with channel forecast metrics', () => {
    const perf = {
      linkedin_engagement_rate: '5.2%',
      email_open_rate: '31.4%',
      click_through_rate: '3.9%',
    }

    render(<PredictedPerformanceCard performance={perf} />)
    expect(screen.getByText('5.2%')).toBeInTheDocument()
    expect(screen.getByText('31.4%')).toBeInTheDocument()
    expect(screen.getByText('3.9%')).toBeInTheDocument()
  })

  it('renders ImprovementDrawerModal and fires apply callback', () => {
    const handleClose = vi.fn()
    const handleApply = vi.fn()
    const suggestions = [
      {
        channel: 'email',
        persona_name: 'Student',
        current_issue: 'Subject line too long',
        suggested_action: 'Shorten to 40 characters',
        projected_score_boost: '+3 pts',
      },
    ]

    render(
      <ImprovementDrawerModal
        isOpen={true}
        onClose={handleClose}
        suggestions={suggestions}
        onApplyImprovements={handleApply}
      />
    )

    expect(screen.getByText(/Improve Campaign & Re-score/i)).toBeInTheDocument()
    expect(screen.getByText('Subject line too long')).toBeInTheDocument()
    expect(screen.getByText('Shorten to 40 characters')).toBeInTheDocument()

    const applyBtn = screen.getByRole('button', { name: /Apply Improvements/i })
    fireEvent.click(applyBtn)
    expect(handleApply).toHaveBeenCalledTimes(1)
  })
})
