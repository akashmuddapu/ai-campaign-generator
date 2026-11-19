import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ExecutiveGradeBanner from '../src/components/ExecutiveGradeBanner'
import CampaignRadarChart from '../src/components/CampaignRadarChart'
import ScoreBreakdownGrid from '../src/components/ScoreBreakdownGrid'
import PersonaImpactCard from '../src/components/PersonaImpactCard'
import PredictedPerformanceCard from '../src/components/PredictedPerformanceCard'
import ImprovementDrawerModal from '../src/components/ImprovementDrawerModal'
import CampaignReportCardPage from '../src/pages/CampaignReportCardPage'
import api from '../src/services/api'

vi.mock('../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

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

describe('Dynamic Brand Kit-Aligned CampaignReportCardPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('dynamically evaluates and displays the active Brand Kit, tones, banned words, and personas', async () => {
    const cyberBrandKit = {
      product_name: 'CyberShield Cloud',
      tagline: 'Zero Trust. Zero Breach.',
      brand_tone: 'Authoritative, Precise, Trustworthy',
      banned_words: ['cheap', 'hack-proof'],
    }
    const cyberPersonas = [
      { persona_name: 'Enterprise CISO', emotional_triggers: 'Board-level risk mitigation' },
      { persona_name: 'VP of Cloud Engineering', core_motivations: 'Zero-latency DevSecOps' },
    ]
    sessionStorage.setItem('cg_brand_kit', JSON.stringify(cyberBrandKit))
    sessionStorage.setItem('cg_personas', JSON.stringify(cyberPersonas))
    sessionStorage.setItem(
      'cg_persona_assets',
      JSON.stringify({
        'Enterprise CISO': {
          social_post: { content: { text: 'CyberShield Cloud delivers Zero Trust precision for Enterprise CISO teams.' } },
          email: { content: { subject: 'CyberShield Cloud Zero Trust', body: 'Authoritative protection.' } },
        },
      })
    )

    api.get.mockResolvedValue({ data: { campaigns: [] } })
    api.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          campaign_id: 'live-session',
          overall_score: 94,
          grade: 'A',
          launch_readiness: 'Ready to Launch',
          score_breakdown: {
            brand_consistency: 95,
            persona_relevance: 93,
            marketing_quality: 92,
            creativity: 91,
            compliance: 100,
          },
          persona_impacts: [
            { persona_id: 'p-1', persona_name: 'Enterprise CISO', relevance_score: 93, primary_trigger: 'Board-level risk mitigation' },
            { persona_id: 'p-2', persona_name: 'VP of Cloud Engineering', relevance_score: 91, primary_trigger: 'Zero-latency DevSecOps' },
          ],
          predicted_performance: {
            linkedin_engagement_rate: '5.1%',
            linkedin_benchmark: '3.8%',
            email_open_rate: '30.5%',
            email_benchmark: '21.5%',
            click_through_rate: '3.8%',
            ctr_benchmark: '2.4%',
          },
          ai_insights: {
            top_strengths: ['Strong brand alignment for CyberShield Cloud reflecting the Authoritative, Precise, Trustworthy tone guidelines.'],
            improvement_opportunities: ['A/B test an alternate hook for CyberShield Cloud.'],
            recommendations: ['CyberShield Cloud is authorized for export.'],
          },
          brand_kit_alignment: {
            product_name: 'CyberShield Cloud',
            tagline: 'Zero Trust. Zero Breach.',
            brand_tones: ['Authoritative', 'Precise', 'Trustworthy'],
            matched_tones: ['Authoritative', 'Precise', 'Trustworthy'],
            banned_words: ['cheap', 'hack-proof'],
            flagged_banned_words: [],
            product_mentioned: true,
            tagline_aligned: true,
            concept_title: 'Zero-Trust Precision',
            alignment_summary: "Verified against CyberShield Cloud's Brand Kit.",
            channel_checks: [{ channel: 'Social Post', metric: '75/280 chars', passed: true }],
          },
        },
      },
    })

    render(
      <MemoryRouter initialEntries={['/report-card']}>
        <CampaignReportCardPage user={{ id: 'u1', name: 'Demo Marketer' }} onLogout={vi.fn()} />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Brand Kit Alignment — CyberShield Cloud/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/Zero Trust\. Zero Breach\./i)).toBeInTheDocument()
    expect(screen.getByText(/✓ Authoritative/i)).toBeInTheDocument()
    expect(screen.getByText(/✓ "hack-proof" Clean/i)).toBeInTheDocument()
    expect(screen.getByText('Enterprise CISO')).toBeInTheDocument()
    expect(screen.getByText('VP of Cloud Engineering')).toBeInTheDocument()
    // Ensure static TravelMate/Student defaults never appear
    expect(screen.queryByText('Student')).not.toBeInTheDocument()
  })
})
