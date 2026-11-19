import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PresetSelector from '../src/components/PresetSelector'
import BrandGuardianBadge from '../src/components/BrandGuardianBadge'
import ValidationReportCard from '../src/components/ValidationReportCard'
import AssetCard from '../src/components/AssetCard'

describe('User Story 1 Components (T016)', () => {
  describe('PresetSelector (T019)', () => {
    it('renders preset options and triggers onSelect when clicked', () => {
      const handleSelect = vi.fn()
      const samplePresets = [
        {
          id: 'preset_b2b',
          name: 'CyberShield Cloud',
          category: 'B2B Tech',
          brand_kit: { product_name: 'CyberShield', brand_tone: 'Authoritative' },
          personas: [{ persona_name: 'Enterprise CISO' }]
        },
        {
          id: 'preset_b2c',
          name: 'ZenBrew Organic Tea',
          category: 'B2C Consumer',
          brand_kit: { product_name: 'ZenBrew', brand_tone: 'Friendly' },
          personas: [{ persona_name: 'Mindful Millennial' }]
        }
      ]

      render(<PresetSelector presets={samplePresets} onSelect={handleSelect} />)

      expect(screen.getByText('CyberShield Cloud')).toBeInTheDocument()
      expect(screen.getByText('ZenBrew Organic Tea')).toBeInTheDocument()

      const b2bBtn = screen.getByText('CyberShield Cloud')
      fireEvent.click(b2bBtn)

      expect(handleSelect).toHaveBeenCalledWith(samplePresets[0])
    })
  })

  describe('BrandGuardianBadge (T025)', () => {
    it('renders green pass badge for score >= 85', () => {
      render(<BrandGuardianBadge score={92} status="pass" />)
      expect(screen.getByText('92/100')).toBeInTheDocument()
      expect(screen.getByText(/PASS/i)).toBeInTheDocument()
    })

    it('renders amber warning badge for score between 70 and 84', () => {
      render(<BrandGuardianBadge score={78} status="warning" />)
      expect(screen.getByText('78/100')).toBeInTheDocument()
      expect(screen.getByText(/WARNING/i)).toBeInTheDocument()
    })

    it('renders red fail badge for score < 70', () => {
      render(<BrandGuardianBadge score={55} status="fail" />)
      expect(screen.getByText('55/100')).toBeInTheDocument()
      expect(screen.getByText(/FAIL/i)).toBeInTheDocument()
    })
  })

  describe('ValidationReportCard (T025)', () => {
    it('renders all 6 validation dimensions and itemized violations', () => {
      const mockReport = {
        overall_score: 65,
        status: 'fail',
        dimensions: {
          brand_fit: { score: 80, status: 'pass' },
          persona_fit: { score: 75, status: 'warning' },
          channel_fit: { score: 90, status: 'pass' },
          rule_compliance: { score: 60, status: 'fail' },
          length_check: { passed: false, current: 310, limit: 280, unit: 'chars' },
          banned_words_check: { passed: false, flagged_words: ['cheap', 'guarantee'] }
        },
        violations: [
          'Exceeds channel limit: 310/280 characters',
          'Contains banned words: cheap, guarantee'
        ],
        diagnostic_reasoning: 'Content is engaging but severely violates length limits and banned terminology.'
      }

      render(<ValidationReportCard report={mockReport} />)

      expect(screen.getByText(/Brand Fit/i)).toBeInTheDocument()
      expect(screen.getByText(/Persona Fit/i)).toBeInTheDocument()
      expect(screen.getByText(/Channel Fit/i)).toBeInTheDocument()
      expect(screen.getByText(/Length Check/i)).toBeInTheDocument()
      expect(screen.getByText('Banned Words')).toBeInTheDocument()
      expect(screen.getByText(/Contains banned words: cheap, guarantee/i)).toBeInTheDocument()
    })
  })

  describe('AssetCard (T024)', () => {
    it('renders social post asset details and character count', () => {
      const mockAsset = {
        channel_type: 'social_post',
        content: {
          headline: 'Stop Breaches Before They Start',
          body: 'Automate threat containment with zero-day accuracy.',
          hashtags: ['#CyberSecurity', '#InfoSec'],
          visual_suggestion: 'Shield with neon data pulse'
        },
        validation_report: {
          overall_score: 95,
          status: 'pass',
          dimensions: {},
          violations: []
        }
      }

      render(<AssetCard asset={mockAsset} onAutoFix={vi.fn()} onExplain={vi.fn()} />)

      expect(screen.getByText('Stop Breaches Before They Start')).toBeInTheDocument()
      expect(screen.getByText(/Automate threat containment/i)).toBeInTheDocument()
      expect(screen.getByText('#CyberSecurity')).toBeInTheDocument()
    })

    it('shows Auto-Fix button when asset has violations', () => {
      const handleAutoFix = vi.fn()
      const mockAsset = {
        channel_type: 'social_post',
        content: {
          headline: 'Cheap Hack For Instant Security',
          body: 'Our cheap hack will guarantee 100% security forever with zero effort.',
          hashtags: ['#SecOps'],
          visual_suggestion: 'Broken padlock'
        },
        validation_report: {
          overall_score: 60,
          status: 'fail',
          violations: ['Contains banned word: cheap', 'Contains banned word: guarantee']
        }
      }

      render(<AssetCard asset={mockAsset} onAutoFix={handleAutoFix} onExplain={vi.fn()} />)

      const autoFixBtn = screen.getByRole('button', { name: /Auto-Fix/i })
      expect(autoFixBtn).toBeInTheDocument()

      fireEvent.click(autoFixBtn)
      expect(handleAutoFix).toHaveBeenCalledTimes(1)
    })
  })
})
