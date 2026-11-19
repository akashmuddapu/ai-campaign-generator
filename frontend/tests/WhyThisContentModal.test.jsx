import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import WhyThisContentModal from '../src/components/WhyThisContentModal'

describe('WhyThisContentModal Component (T047)', () => {
  it('does not render when isOpen is false', () => {
    render(<WhyThisContentModal isOpen={false} onClose={vi.fn()} asset={null} />)
    expect(screen.queryByText(/Why This Content\?/i)).not.toBeInTheDocument()
  })

  it('renders persona, brand, and channel business rationales when open', () => {
    const mockAsset = {
      channel_type: 'social_post',
      content: { headline: 'Stop Breaches Before They Start' },
      why_this_content: {
        persona_reasoning: 'Targets the CISO fear of uncontained lateral movement.',
        brand_reasoning: 'Reflects the Authoritative brand tone with precise terminology.',
        channel_reasoning: 'Short, punchy structure optimized for social feed scanning.'
      }
    }

    render(<WhyThisContentModal isOpen={true} onClose={vi.fn()} asset={mockAsset} />)

    expect(screen.getByText(/Why This Content\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Targets the CISO fear/i)).toBeInTheDocument()
    expect(screen.getByText(/Reflects the Authoritative brand tone/i)).toBeInTheDocument()
    expect(screen.getByText(/Short, punchy structure optimized/i)).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', () => {
    const handleClose = vi.fn()
    const mockAsset = {
      channel_type: 'social_post',
      why_this_content: { persona_reasoning: 'Reasoning' }
    }

    render(<WhyThisContentModal isOpen={true} onClose={handleClose} asset={mockAsset} />)

    const closeBtn = screen.getByRole('button', { name: /Close/i })
    fireEvent.click(closeBtn)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
