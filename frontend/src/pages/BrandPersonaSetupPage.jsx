import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Plus,
  X,
  Zap,
  AlertCircle,
  Pencil,
  Trash2,
  Sparkles,
  RefreshCw,
  Shield,
  Cpu,
  Heart,
  Palette,
  Building2,
  GraduationCap,
  Briefcase,
  Plane,
  User,
} from 'lucide-react'
import api from '../services/api'
import SidebarLayout from '../components/SidebarLayout'
import LoadingIndicator from '../components/LoadingIndicator'
import { unlockStep, setUnlockedStep, resetWizardSession } from '../utils/wizardProgress'

// Illustrated Persona Avatar supporting diverse domains
function PersonaAvatar({ name, className = 'w-11 h-11' }) {
  const n = (name || '').toLowerCase()
  if (n.includes('student') || n.includes('academic') || n.includes('school')) {
    return (
      <div className={`${className} rounded-full overflow-hidden bg-amber-100/70 border border-amber-200 shrink-0 flex items-center justify-center shadow-xs`}>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <circle cx="32" cy="32" r="32" fill="#FEF3C7" />
          <path d="M18 28 C18 16 46 16 46 28 C46 38 42 46 42 46 L22 46 C22 46 18 38 18 28 Z" fill="#1E293B" />
          <path d="M16 58 C16 48 24 44 32 44 C40 44 48 48 48 58 Z" fill="#F59E0B" />
          <rect x="28" y="36" width="8" height="9" fill="#FCD34D" rx="2" />
          <ellipse cx="32" cy="28" rx="10" ry="11" fill="#FDE68A" />
          <path d="M22 24 C26 20 38 18 42 24 C40 20 34 18 22 24 Z" fill="#1E293B" />
          <circle cx="28" cy="27" r="1.3" fill="#1E293B" />
          <circle cx="36" cy="27" r="1.3" fill="#1E293B" />
          <path d="M30 32 Q32 34 34 32" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M20 28 A12 12 0 0 1 44 28" stroke="#3B82F6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <rect x="18" y="24" width="4" height="8" rx="2" fill="#1D4ED8" />
          <rect x="42" y="24" width="4" height="8" rx="2" fill="#1D4ED8" />
        </svg>
      </div>
    )
  }
  if (n.includes('ciso') || n.includes('security') || n.includes('guardrail') || n.includes('compliance')) {
    return (
      <div className={`${className} rounded-full overflow-hidden bg-purple-100 border border-purple-200 shrink-0 flex items-center justify-center text-purple-700 shadow-xs`}>
        <Shield className="w-5 h-5 fill-purple-200 text-purple-700" />
      </div>
    )
  }
  if (n.includes('cto') || n.includes('engineer') || n.includes('tech') || n.includes('dev') || n.includes('cloud')) {
    return (
      <div className={`${className} rounded-full overflow-hidden bg-indigo-100 border border-indigo-200 shrink-0 flex items-center justify-center text-indigo-700 shadow-xs`}>
        <Cpu className="w-5 h-5 text-indigo-700" />
      </div>
    )
  }
  if (n.includes('health') || n.includes('wellness') || n.includes('athlete') || n.includes('fitness')) {
    return (
      <div className={`${className} rounded-full overflow-hidden bg-emerald-100 border border-emerald-200 shrink-0 flex items-center justify-center text-emerald-700 shadow-xs`}>
        <Heart className="w-5 h-5 fill-emerald-200 text-emerald-700" />
      </div>
    )
  }
  if (n.includes('creative') || n.includes('design') || n.includes('artist') || n.includes('writer')) {
    return (
      <div className={`${className} rounded-full overflow-hidden bg-fuchsia-100 border border-fuchsia-200 shrink-0 flex items-center justify-center text-fuchsia-700 shadow-xs`}>
        <Palette className="w-5 h-5 text-fuchsia-700" />
      </div>
    )
  }
  if (n.includes('professional') || n.includes('working') || n.includes('executive') || n.includes('manager') || n.includes('founder')) {
    return (
      <div className={`${className} rounded-full overflow-hidden bg-blue-100/70 border border-blue-200 shrink-0 flex items-center justify-center shadow-xs`}>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <circle cx="32" cy="32" r="32" fill="#DBEAFE" />
          <path d="M16 58 C16 48 24 44 32 44 C40 44 48 48 48 58 Z" fill="#2563EB" />
          <polygon points="32,49 27,44 37,44" fill="#EFF6FF" />
          <rect x="28" y="35" width="8" height="9" fill="#FCD34D" rx="2" />
          <ellipse cx="32" cy="27" rx="10" ry="11" fill="#FDE68A" />
          <path d="M21 24 C21 17 43 17 43 24 C40 18 36 17 32 17 C26 17 23 20 21 24 Z" fill="#0F172A" />
          <circle cx="28" cy="27" r="1.3" fill="#0F172A" />
          <circle cx="36" cy="27" r="1.3" fill="#0F172A" />
          <path d="M30 32 Q32 34 34 32" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    )
  }
  if (n.includes('travel') || n.includes('commut') || n.includes('nomad')) {
    return (
      <div className={`${className} rounded-full overflow-hidden bg-rose-100/70 border border-rose-200 shrink-0 flex items-center justify-center shadow-xs`}>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <circle cx="32" cy="32" r="32" fill="#FFE4E6" />
          <path d="M20 30 C20 20 44 20 44 30 C44 40 42 46 42 46 L22 46 Z" fill="#78350F" />
          <path d="M16 58 C16 48 24 44 32 44 C40 44 48 48 48 58 Z" fill="#0284C7" />
          <rect x="28" y="36" width="8" height="9" fill="#FCD34D" rx="2" />
          <ellipse cx="32" cy="28" rx="10" ry="11" fill="#FDE68A" />
          <circle cx="28" cy="28" r="1.3" fill="#1E293B" />
          <circle cx="36" cy="28" r="1.3" fill="#1E293B" />
          <path d="M30 33 Q32 35 34 33" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <ellipse cx="32" cy="21" rx="19" ry="5" fill="#D97706" />
          <path d="M23 21 C23 14 41 14 41 21 Z" fill="#B45309" />
          <ellipse cx="32" cy="21" rx="9" ry="2" fill="#78350F" opacity="0.3" />
        </svg>
      </div>
    )
  }
  return (
    <div className={`${className} rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
      {name ? name.charAt(0).toUpperCase() : 'U'}
    </div>
  )
}

// Generate high-resonance customer personas dynamically based on product domain
export function derivePersonasForProduct(productName, productDescription = '') {
  const text = `${productName} ${productDescription}`.toLowerCase()

  // 1. Cybersecurity / IT / Cloud / SaaS / Dev / Guardrail
  if (/security|cyber|cloud|saas|guardrail|compliance|devops|threat|software|api|server|network/i.test(text)) {
    return [
      {
        persona_name: 'Enterprise CISO',
        summary: 'Security executive managing multi-cloud compliance and threat defense.',
        primary_goals: 'Zero data breaches, automated compliance audit readiness, board-level risk transparency.',
        pain_points: 'Alert fatigue, shadow IT, fragmented security tooling, developer friction.',
        core_motivations: 'Executive governance, systemic resilience, and proactive threat mitigation.',
        emotional_triggers: 'Reputational risk, audit failure, disruption to business continuity.',
        preferred_message_style: 'Empirical, authoritative, risk-quantified, high-level.',
        buying_triggers: 'SOC2/ISO27001 compliance, verifiable audit logging, enterprise SSO.',
      },
      {
        persona_name: 'Startup CTO & Engineering Lead',
        summary: 'Technical leader balancing engineering velocity with code safety.',
        primary_goals: 'Rapid product shipping with continuous automated guardrails.',
        pain_points: 'Manual security reviews slowing sprint velocity, lack of dedicated SecOps.',
        core_motivations: 'Developer velocity, modern cloud-native architecture, investor readiness.',
        emotional_triggers: 'Engineering bottlenecks, slow deployment cycles, developer pushback.',
        preferred_message_style: 'Developer-first, pragmatic, concise, transparent.',
        buying_triggers: 'One-click CI/CD integration, developer CLI, instant self-serve onboarding.',
      },
      {
        persona_name: 'SecOps & Compliance Specialist',
        summary: 'Practitioner responsible for daily policy enforcement and incident response.',
        primary_goals: 'Streamlined incident triage and continuous policy automation.',
        pain_points: 'False positive fatigue, slow remediation workflows, manual spreadsheet audits.',
        core_motivations: 'Actionable alerts, automated remediation, clean compliance reports.',
        emotional_triggers: 'Late night incident pages, audit panic, unmanageable ticket queues.',
        preferred_message_style: 'Direct, workflow-focused, technical, solution-oriented.',
        buying_triggers: 'Automated remediation scripts, real-time Slack/PagerDuty alerts.',
      },
    ]
  }

  // 2. Health / Fitness / Wellness / Nutrition
  if (/fitness|wellness|health|nutrition|workout|gym|running|supplement|diet|wearable/i.test(text)) {
    return [
      {
        persona_name: 'Mindful Wellness Enthusiast',
        summary: 'Health-conscious individual prioritizing daily vitality and clean routines.',
        primary_goals: 'Nourishing physical energy, balancing stress, sustaining natural focus.',
        pain_points: 'Midday fatigue, synthetic ingredients, inconsistent daily habits.',
        core_motivations: 'Holistic health, clean ingredients, mindful living.',
        emotional_triggers: 'Burnout, guilt from unhealthy shortcuts, craving calm vitality.',
        preferred_message_style: 'Warm, uplifting, sensorial, authentic.',
        buying_triggers: 'Organic certification, clean label, proven natural ingredients.',
      },
      {
        persona_name: 'High-Performance Athlete',
        summary: 'Goal-driven performer tracking measurable gains and peak recovery.',
        primary_goals: 'Maximizing workout performance, rapid muscle recovery, stamina.',
        pain_points: 'Plateaus, delayed recovery, injury risks, inaccurate tracking.',
        core_motivations: 'Measurable athletic progress, competitive edge, peak fitness.',
        emotional_triggers: 'Frustration with lack of progress, passion for discipline.',
        preferred_message_style: 'Data-driven, motivational, sharp, high-energy.',
        buying_triggers: 'Clinical studies, performance metrics, durability.',
      },
      {
        persona_name: 'Busy Working Professional',
        summary: 'Corporate professional balancing long work hours with healthy living.',
        primary_goals: 'Convenient healthy habits that fit tightly into packed schedules.',
        pain_points: 'Lack of time for prep, sedentary desk hours, afternoon energy slumps.',
        core_motivations: 'Efficiency, sustained workday stamina, stress relief.',
        emotional_triggers: 'Guilt over neglected health, desire to feel vibrant.',
        preferred_message_style: 'Practical, crisp, time-saving, encouraging.',
        buying_triggers: 'Quick preparation, portable design, seamless daily integration.',
      },
    ]
  }

  // 3. Beverage / Mug / Coffee / Tea
  if (/mug|coffee|tea|drink|sip|beverage|temperature|brew|flask|thermos/i.test(text)) {
    return [
      {
        persona_name: 'Student',
        summary: 'Long lectures and study blocks, needs convenient and reliable drinks.',
        primary_goals: 'Stay energized during long study hours and lectures.',
        pain_points: 'Drinks get cold during classes and library sessions.',
        core_motivations: 'Convenience, reliability, and academic productivity.',
        emotional_triggers: 'Fun, relatable, energetic student life.',
        preferred_message_style: 'Short, energetic, student-friendly, casual.',
        buying_triggers: 'Keeps drink at right temperature, affordable, aesthetic.',
      },
      {
        persona_name: 'Working Professional',
        summary: 'Back-to-back executive meetings, values productivity and convenience.',
        primary_goals: 'Sustained productivity through back-to-back executive meetings.',
        pain_points: 'No time to reheat coffee between client presentations.',
        core_motivations: 'Professional polish, daily efficiency, and sleek design.',
        emotional_triggers: 'Frustration with lukewarm coffee, focus on high output.',
        preferred_message_style: 'Crisp, benefit-driven, modern, executive.',
        buying_triggers: 'All-day precision temperature battery, leakproof design.',
      },
      {
        persona_name: 'Traveller & Commuter',
        summary: 'Frequent travel and commutes, needs a portable and rugged solution.',
        primary_goals: 'Consistent hydration and hot drinks across time zones and commutes.',
        pain_points: 'Airport spills, poor hotel coffee, unstable car cup holders.',
        core_motivations: 'Portability, rugged durability, and peace of mind on the go.',
        emotional_triggers: 'Wanderlust, comfort of familiar beverages anywhere.',
        preferred_message_style: 'Adventurous, practical, uplifting, compact.',
        buying_triggers: 'Compact fit for travel bags, long battery life.',
      },
    ]
  }

  // 4. Productivity / Stationery / Creative / Office / Hardware
  if (/pen|pencil|paper|desk|notep|office|hardware|monitor|chair|organizer|tool/i.test(text)) {
    return [
      {
        persona_name: 'Creative Professional & Designer',
        summary: 'Visual thinker who values tactile craftsmanship and aesthetic excellence.',
        primary_goals: 'Effortless ideation, tactile precision, and a clean creative workspace.',
        pain_points: 'Clunky tools, poor ergonomics, aesthetic clutter, low-durability gear.',
        core_motivations: 'Artistic expression, seamless tactile flow, premium aesthetics.',
        emotional_triggers: 'Pride in craftsmanship, joy of uninhibited creative flow.',
        preferred_message_style: 'Aesthetic, sensory, elegant, design-forward.',
        buying_triggers: 'Precision build quality, sustainable materials, minimalist design.',
      },
      {
        persona_name: 'Deep-Work Knowledge Worker',
        summary: 'Researcher or engineer who values distraction-free focus and durability.',
        primary_goals: 'Sustained deep work blocks and frictionless daily organization.',
        pain_points: 'Digital distractions, hand fatigue, cheap tools breaking.',
        core_motivations: 'Intellectual output, reliable durability, minimalist setup.',
        emotional_triggers: 'Satisfaction of focused progress, disdain for gimmicks.',
        preferred_message_style: 'Clear, understated, utility-focused, refined.',
        buying_triggers: 'Ergonomic certification, lifetime durability, thoughtful details.',
      },
      {
        persona_name: 'University Student & Researcher',
        summary: 'Intensive note-taker balancing coursework and long research sessions.',
        primary_goals: 'Fast, fatigue-free writing and reliable daily note organization.',
        pain_points: 'Smudging, uncomfortable grip, high cost of specialty refills.',
        core_motivations: 'Academic stamina, clean study notes, affordable reliability.',
        emotional_triggers: 'Academic achievement, reliable study companion.',
        preferred_message_style: 'Relatable, encouraging, student-friendly, practical.',
        buying_triggers: 'Affordable price point, long-lasting refills, smooth performance.',
      },
    ]
  }

  // 5. General Consumer / Modern Brand Fallback
  const safeProd = productName || 'Product'
  return [
    {
      persona_name: 'Discerning Quality Seeker',
      summary: `Values premium reliability and thoughtful design in everyday products like ${safeProd}.`,
      primary_goals: `Invest in reliable solutions that deliver consistent everyday satisfaction with ${safeProd}.`,
      pain_points: 'Cheap alternatives that break easily, overcomplicated features, disappointing quality.',
      core_motivations: 'Long-term value, dependable craftsmanship, elevated daily experience.',
      emotional_triggers: 'Satisfaction of making smart purchasing decisions, pride in quality.',
      preferred_message_style: 'Authentic, premium, clear, benefit-focused.',
      buying_triggers: 'Verified reviews, quality guarantee, durable construction.',
    },
    {
      persona_name: 'High-Pace Modern Professional',
      summary: `Busy individual seeking efficiency, convenience, and modern aesthetics with ${safeProd}.`,
      primary_goals: `Save time, streamline daily routines, and enjoy modern convenience.`,
      pain_points: 'Wasted time, clumsy user experiences, lack of seamless portability.',
      core_motivations: 'Efficiency, modern lifestyle, daily ease.',
      emotional_triggers: 'Relief from friction, feeling capable and organized.',
      preferred_message_style: 'Direct, crisp, modern, benefit-oriented.',
      buying_triggers: 'Time-saving features, seamless setup, sleek design.',
    },
    {
      persona_name: 'Value & Lifestyle Enthusiast',
      summary: `Community-focused customer inspired by innovative, well-designed brands.`,
      primary_goals: `Find smart, stylish products that fit their personal lifestyle and values.`,
      pain_points: 'Overpriced luxury without substance, bland legacy options.',
      core_motivations: 'Smart value, relatable branding, positive everyday lifestyle.',
      emotional_triggers: 'Excitement of discovering a great product, sharing recommendations.',
      preferred_message_style: 'Engaging, friendly, vibrant, inspirational.',
      buying_triggers: 'Transparent pricing, relatable story, strong community feedback.',
    },
  ]
}

export default function BrandPersonaSetupPage({ user, onLogout }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlDraftId = searchParams.get('draft_id')

  // ─── State ───────────────────────────────────────────────────────────────
  const [draftId, setDraftId] = useState(() => {
    if (urlDraftId) return urlDraftId
    try { return sessionStorage.getItem('cg_draft_id') || null } catch { return null }
  })
  const [productName, setProductName] = useState('TravelMate Smart Mug')
  const [productDescription, setProductDescription] = useState(
    'A smart travel mug that keeps drinks at your preferred temperature during your journey.'
  )
  const [brandTones, setBrandTones] = useState(['Friendly', 'Premium', 'Modern'])
  const [newToneInput, setNewToneInput] = useState('')
  const [tagline, setTagline] = useState('Your drink. Your temperature.')
  const [bannedWords, setBannedWords] = useState(['Cheap', 'Guaranteed', 'Best'])
  const [newBannedInput, setNewBannedInput] = useState('')
  const [exampleBrandLines, setExampleBrandLines] = useState(
    '• Your perfect sip, wherever you go.\n• Built for every journey.'
  )

  // Personas List (default 3 personas matching Image 1)
  const [personas, setPersonas] = useState([
    {
      persona_name: 'Student',
      summary: 'Long classes, needs convenient and reliable drinks.',
      primary_goals: 'Stay energized during long study hours and lectures.',
      pain_points: 'Drinks get cold during classes and library sessions.',
      core_motivations: 'Convenience, reliability, and academic productivity.',
      emotional_triggers: 'Fun, relatable, energetic student life.',
      preferred_message_style: 'Short, energetic, student-friendly, casual.',
      buying_triggers: 'Keeps drink at the right temperature, affordable, aesthetic.',
    },
    {
      persona_name: 'Working Professional',
      summary: 'Back-to-back meetings, values productivity and convenience.',
      primary_goals: 'Sustained productivity through back-to-back executive meetings.',
      pain_points: 'No time to reheat coffee between client presentations.',
      core_motivations: 'Professional polish, daily efficiency, and sleek design.',
      emotional_triggers: 'Frustration with lukewarm coffee, focus on high output.',
      preferred_message_style: 'Crisp, benefit-driven, modern, executive.',
      buying_triggers: 'All-day precision temperature battery, leakproof design.',
    },
    {
      persona_name: 'Traveller',
      summary: 'Frequent travel, needs a portable and reliable solution.',
      primary_goals: 'Consistent hydration and hot drinks across time zones and commutes.',
      pain_points: 'Airport spills, poor hotel coffee, unstable car cup holders.',
      core_motivations: 'Portability, rugged durability, and peace of mind on the go.',
      emotional_triggers: 'Wanderlust, comfort of familiar beverages anywhere.',
      preferred_message_style: 'Adventurous, practical, uplifting, compact.',
      buying_triggers: 'Compact fit for travel bags, long battery life.',
    },
  ])

  const [selectedPersonaIndex, setSelectedPersonaIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuggestingPersonas, setIsSuggestingPersonas] = useState(false)
  const [error, setError] = useState(null)
  const [presets, setPresets] = useState([])
  const [draftSaved, setDraftSaved] = useState(false)

  // ─── Draft save helper ───────────────────────────────────────────────────
  const saveDraft = async ({ step = 1, brandKit, serializablePersonas, extraFields = {} } = {}) => {
    const userId = user?.id || localStorage.getItem('cg_user_id')
    if (!userId) return null
    try {
      const res = await api.post('/campaigns/draft', {
        draft_id: draftId || undefined,
        user_id: userId,
        current_step: step,
        brand_kit: brandKit,
        all_personas: serializablePersonas,
        persona: serializablePersonas[selectedPersonaIndex] || serializablePersonas[0],
        ...extraFields,
      })
      const newId = res.data?.draft_id || res.data?.campaign?.id
      if (newId) {
        setDraftId(newId)
        try { sessionStorage.setItem('cg_draft_id', newId) } catch {}
        const draftData = res.data?.campaign
        if (draftData) {
          window.dispatchEvent(new CustomEvent('cg_draft_saved', { detail: draftData }))
        }
      }
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 2000)
      return newId
    } catch {
      return null
    }
  }

  // Automatically suggest personas tailored to the current product
  const handleAutoSuggestPersonas = async () => {
    setIsSuggestingPersonas(true)
    try {
      const res = await api.post('/campaigns/suggest-personas', {
        product_name: productName,
        product_description: productDescription,
        brand_tone: brandTones.join(', '),
      })
      if (res.data?.personas && Array.isArray(res.data.personas) && res.data.personas.length > 0) {
        const tailored = res.data.personas.map((p) => ({
          ...p,
          summary: p.summary || p.primary_goals,
        }))
        setPersonas(tailored)
        setSelectedPersonaIndex(0)
        try {
          sessionStorage.setItem('cg_personas', JSON.stringify(tailored))
        } catch {}
        return
      }
    } catch {
      // Fall through to client heuristic
    } finally {
      setIsSuggestingPersonas(false)
    }

    const derived = derivePersonasForProduct(productName, productDescription)
    setPersonas(derived)
    setSelectedPersonaIndex(0)
    try {
      sessionStorage.setItem('cg_personas', JSON.stringify(derived))
    } catch {}
  }

  // Detect if current personas don't match the entered product domain
  const currentPersonasMismatch = (() => {
    const isBeverageProduct = /mug|coffee|tea|drink|sip|beverage|temperature|brew|thermos|flask/i.test(
      `${productName} ${productDescription}`
    )
    const hasBeveragePersonas = personas.some((p) =>
      /drinks get cold|reheat coffee|poor hotel coffee|lukewarm coffee|smart travel mug/i.test(
        `${p.summary} ${p.primary_goals} ${p.pain_points} ${p.buying_triggers}`
      )
    )
    return !isBeverageProduct && hasBeveragePersonas
  })()

  // Edit Persona Modal State
  const [editingPersonaIndex, setEditingPersonaIndex] = useState(null)
  const [editPersonaForm, setEditPersonaForm] = useState(null)

  const handleStartEditPersona = (idx, e) => {
    if (e) e.stopPropagation()
    setEditingPersonaIndex(idx)
    setEditPersonaForm({ ...personas[idx] })
  }

  const handleSavePersonaEdit = () => {
    if (editingPersonaIndex === null || !editPersonaForm) return
    const updated = [...personas]
    updated[editingPersonaIndex] = {
      ...editPersonaForm,
      // Keep summary and primary_goals synchronized if user edited either
      summary: editPersonaForm.summary || editPersonaForm.primary_goals,
      primary_goals: editPersonaForm.primary_goals || editPersonaForm.summary,
    }
    setPersonas(updated)
    setEditingPersonaIndex(null)
    setEditPersonaForm(null)
  }

  const handleCancelPersonaEdit = () => {
    setEditingPersonaIndex(null)
    setEditPersonaForm(null)
  }

  // Add new customer persona
  const handleAddNewPersona = () => {
    const newIdx = personas.length
    const newPersona = {
      persona_name: `Audience Segment ${newIdx + 1}`,
      summary: 'Target audience goals, lifestyle context, and beverage needs.',
      primary_goals: 'Consistency, reliability, and satisfaction throughout daily routine.',
      pain_points: 'Lack of convenient, temperature-controlled options on the move.',
      core_motivations: 'Quality, efficiency, and seamless product experience.',
      emotional_triggers: 'Comfort, elevated lifestyle, and high productivity.',
      preferred_message_style: 'Friendly, modern, and engaging.',
      buying_triggers: 'Reliable thermal retention, durable build, and sleek aesthetic.',
    }
    const updated = [...personas, newPersona]
    setPersonas(updated)
    setSelectedPersonaIndex(newIdx)
    setEditingPersonaIndex(newIdx)
    setEditPersonaForm({ ...newPersona })
  }

  // Delete customer persona with minimum 1 safeguard
  const handleDeletePersona = (idx, e) => {
    if (e) e.stopPropagation()
    if (personas.length <= 1) {
      setError('You must retain at least 1 customer persona for campaign synthesis.')
      setTimeout(() => setError(null), 3000)
      return
    }
    const updated = personas.filter((_, i) => i !== idx)
    setPersonas(updated)
    if (selectedPersonaIndex >= updated.length) {
      setSelectedPersonaIndex(Math.max(0, updated.length - 1))
    } else if (selectedPersonaIndex === idx) {
      setSelectedPersonaIndex(0)
    }
  }

  // Hydrate from draft_id URL param (when resuming a draft) or sessionStorage
  useEffect(() => {
    const hydrateFromBundle = (bundle) => {
      if (!bundle) return
      const bk = bundle.brand_kit || {}
      if (bk.product_name) setProductName(bk.product_name)
      if (bk.product_description) setProductDescription(bk.product_description)
      if (bk.brand_tone) {
        const tones = Array.isArray(bk.brand_tone)
          ? bk.brand_tone
          : String(bk.brand_tone).split(',').map((t) => t.trim()).filter(Boolean)
        if (tones.length > 0) setBrandTones(tones)
      }
      if (bk.tagline !== undefined) setTagline(bk.tagline)
      if (Array.isArray(bk.banned_words)) setBannedWords(bk.banned_words)
      if (Array.isArray(bk.example_brand_lines)) {
        setExampleBrandLines(
          bk.example_brand_lines.map((l) => (l.startsWith('•') ? l : `• ${l}`)).join('\n')
        )
      }
      const pList =
        Array.isArray(bundle.all_personas) && bundle.all_personas.length > 0
          ? bundle.all_personas
          : bundle.persona && bundle.persona.persona_name
          ? [bundle.persona]
          : null
      if (pList) {
        setPersonas(pList)
        if (bundle.persona?.persona_name) {
          const idx = pList.findIndex((p) => p.persona_name === bundle.persona.persona_name)
          if (idx >= 0) setSelectedPersonaIndex(idx)
        }
      }
      try {
        if (bundle.id) sessionStorage.setItem('cg_draft_id', bundle.id)
        if (bk.product_name) sessionStorage.setItem('cg_brand_kit', JSON.stringify(bk))
        if (pList) sessionStorage.setItem('cg_personas', JSON.stringify(pList))
        if (bundle.persona_dna) sessionStorage.setItem('cg_persona_dna', JSON.stringify(bundle.persona_dna))
        if (Array.isArray(bundle.concepts) && bundle.concepts.length > 0) {
          sessionStorage.setItem('cg_concepts', JSON.stringify(bundle.concepts))
        }
      } catch {}
      setUnlockedStep(bundle.current_step || 1)
    }

    if (urlDraftId) {
      setDraftId(urlDraftId)
      api
        .get(`/campaigns/${urlDraftId}`)
        .then((res) => {
          const bundle = res.data?.campaign || res.data
          hydrateFromBundle(bundle)
        })
        .catch(() => {})
      return
    }

    try {
      const savedBk = sessionStorage.getItem('cg_brand_kit')
      if (savedBk) {
        const bk = JSON.parse(savedBk)
        if (bk.product_name) setProductName(bk.product_name)
        if (bk.product_description) setProductDescription(bk.product_description)
        if (bk.brand_tone) setBrandTones(bk.brand_tone.split(',').map((t) => t.trim()).filter(Boolean))
        if (bk.tagline !== undefined) setTagline(bk.tagline)
        if (Array.isArray(bk.banned_words)) setBannedWords(bk.banned_words)
        if (Array.isArray(bk.example_brand_lines)) {
          setExampleBrandLines(
            bk.example_brand_lines.map((l) => (l.startsWith('•') ? l : `• ${l}`)).join('\n')
          )
        }
      }
      const savedPersonas = sessionStorage.getItem('cg_personas')
      if (savedPersonas) {
        const parsedP = JSON.parse(savedPersonas)
        if (Array.isArray(parsedP) && parsedP.length > 0) {
          setPersonas(parsedP)
        }
      }
    } catch {
      // ignore
    }
  }, [urlDraftId])

  // Load presets on mount
  useEffect(() => {
    api.get('/presets')
      .then((res) => {
        if (res.data?.presets) {
          setPresets(res.data.presets)
        }
      })
      .catch(() => {})
  }, [])

  const handleApplyPreset = (preset) => {
    if (!preset) return
    const bk = preset.brand_kit
    setProductName(bk.product_name || '')
    setProductDescription(bk.product_description || '')
    const tones = bk.brand_tone ? bk.brand_tone.split(',').map((t) => t.trim()) : ['Premium']
    setBrandTones(tones)
    setTagline(bk.tagline || '')
    setBannedWords(bk.banned_words || [])
    setExampleBrandLines(
      Array.isArray(bk.example_brand_lines)
        ? bk.example_brand_lines.map((l) => `• ${l}`).join('\n')
        : bk.example_brand_lines || ''
    )
    let newPersonas = (preset.personas && preset.personas.length > 0)
      ? preset.personas.map((p) => ({
          ...p,
          summary: p.summary || p.primary_goals,
        }))
      : derivePersonasForProduct(bk.product_name || '', bk.product_description || '')
    setPersonas(newPersonas)
    setSelectedPersonaIndex(0)

    try {
      sessionStorage.setItem('cg_brand_kit', JSON.stringify({
        product_name: bk.product_name || '',
        product_description: bk.product_description || '',
        brand_tone: tones.join(', '),
        tagline: bk.tagline || '',
        banned_words: bk.banned_words || [],
        example_brand_lines: Array.isArray(bk.example_brand_lines) ? bk.example_brand_lines : [],
      }))
      sessionStorage.setItem('cg_personas', JSON.stringify(newPersonas))
    } catch {
      // ignore
    }
  }

  const addTone = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault()
      if (newToneInput.trim() && !brandTones.includes(newToneInput.trim())) {
        setBrandTones([...brandTones, newToneInput.trim()])
        setNewToneInput('')
      }
    }
  }

  const removeTone = (tone) => {
    setBrandTones(brandTones.filter((t) => t !== tone))
  }

  const addBannedWord = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault()
      if (newBannedInput.trim() && !bannedWords.includes(newBannedInput.trim())) {
        setBannedWords([...bannedWords, newBannedInput.trim()])
        setNewBannedInput('')
      }
    }
  }

  const removeBannedWord = (word) => {
    setBannedWords(bannedWords.filter((w) => w !== word))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const brandKit = {
      product_name: productName,
      product_description: productDescription,
      brand_tone: brandTones.join(', '),
      tagline,
      banned_words: bannedWords,
      example_brand_lines: exampleBrandLines.split('\n').filter((l) => l.trim()),
    }

    const currentPersona = personas[selectedPersonaIndex]

    try {
      // Strip non-serializable React component refs (icon, color) before API calls
      // eslint-disable-next-line no-unused-vars
      const { icon: _icon, color: _color, ...serializableCurrentPersona } = currentPersona

      // Step 1: Synthesize Persona DNA
      const dnaRes = await api.post('/campaigns/persona-dna', {
        brand_kit: brandKit,
        persona: serializableCurrentPersona,
      })
      const personaDna = dnaRes.data.persona_dna

      // Step 2: Generate 3 Campaign Concepts
      const conceptsRes = await api.post('/campaigns/concepts', {
        brand_kit: brandKit,
        persona_dna: personaDna,
      })
      const concepts = conceptsRes.data.concepts

      // Strip icon/color from all personas before passing through History API
      // (React component refs are not structured-cloneable)
      const serializablePersonas = personas.map((p) => {
        // eslint-disable-next-line no-unused-vars
        const { icon: _i, color: _c, ...rest } = p
        return rest
      })

      // Persist across browser refresh/tab changes
      try {
        sessionStorage.setItem('cg_brand_kit', JSON.stringify(brandKit))
        sessionStorage.setItem('cg_personas', JSON.stringify(serializablePersonas))
        sessionStorage.setItem('cg_persona_dna', JSON.stringify(personaDna))
        sessionStorage.setItem('cg_concepts', JSON.stringify(concepts))
      } catch {
        // Ignore storage errors in restricted contexts
      }

      // Auto-save draft at step 2 (after DNA + concepts generated) and unlock Step 2 in sidebar
      const resolvedDraftId = await saveDraft({ step: 2, brandKit, serializablePersonas, extraFields: { persona_dna: personaDna, concepts } })
      unlockStep(2)

      // Navigate to Step 2 (Persona Strategy)
      const nextDraftParam = resolvedDraftId || draftId
      navigate(nextDraftParam ? `/strategy-concept?step=dna&draft_id=${nextDraftParam}` : '/strategy-concept?step=dna', {
        state: {
          brand_kit: brandKit,
          persona: serializableCurrentPersona,
          all_personas: serializablePersonas,
          persona_dna: personaDna,
          concepts,
          draft_id: nextDraftParam,
        },
      })
    } catch (err) {
      setError(err.message || 'Failed to synthesize Persona DNA and concepts.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarLayout user={user} onLogout={onLogout} currentStep="Step 1 of 5" campaignName={productName.split(' ')[0] || 'TravelMate'}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Sticky Top Header Bar: Title & Presets on Left, Save Draft & Next Step Buttons Fixed at Top on Right */}
        <div className="sticky top-0 z-30 -mx-4 px-4 pt-6 pb-4 bg-[#F6F7FB] border-b border-slate-200 shadow-[0_4px_12px_-2px_rgba(15,23,42,0.05)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                Brand Kit &amp; Personas
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Define your brand, product and target audiences
              </p>
            </div>

            {/* 1-Click Preset Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                Sample Presets:
              </span>
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>{preset.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons Fixed at Top */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {draftSaved && (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Draft saved
              </span>
            )}
            <button
              type="button"
              disabled={isLoading}
              onClick={async () => {
                const bk = {
                  product_name: productName,
                  product_description: productDescription,
                  brand_tone: brandTones.join(', '),
                  tagline,
                  banned_words: bannedWords,
                  example_brand_lines: exampleBrandLines.split('\n').filter((l) => l.trim()),
                }
                const sp = personas.map(({ icon: _i, color: _c, ...rest }) => rest)
                await saveDraft({ step: 1, brandKit: bk, serializablePersonas: sp })
                resetWizardSession()
                navigate('/dashboard', {
                  state: {
                    draftSavedNotice: `Draft "${productName || 'Campaign'}" saved at Step 1 of 5. You can resume anytime from Previous Campaigns or Campaign History.`,
                  },
                })
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 shadow-2xs"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-purple-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Synthesizing...' : 'Next Step: Persona Strategy'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─── Left Column: Brand Kit Form ───────────────────────────────── */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Brand Kit</h2>
              <p className="text-[11px] text-slate-500">Core product identity and tone rules</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. TravelMate Smart Mug"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Product Description *
              </label>
              <textarea
                required
                rows={3}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Describe your product's core utility, audience, and differentiator..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all"
              />
            </div>

            {/* Brand Tone Tag Badges matching Image 1 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Brand Tone *
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                {brandTones.map((tone) => (
                  <span
                    key={tone}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-white text-purple-800 border border-purple-200 shadow-2xs"
                  >
                    <span>{tone}</span>
                    <button
                      type="button"
                      onClick={() => removeTone(tone)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newToneInput}
                  onChange={(e) => setNewToneInput(e.target.value)}
                  onKeyDown={addTone}
                  placeholder="+ Add tone and press Enter"
                  className="px-2 py-1 text-xs text-slate-800 outline-none bg-transparent flex-1 min-w-[140px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Your drink. Your temperature."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all"
              />
            </div>

            {/* Banned Words Tag Badges matching Image 1 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Banned Words
                </label>
                <span className="text-[11px] font-semibold text-rose-600">Zero-tolerance</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border border-rose-200/80 bg-rose-50/30">
                {bannedWords.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-white text-rose-800 border border-rose-200 shadow-2xs"
                  >
                    <span>{word}</span>
                    <button
                      type="button"
                      onClick={() => removeBannedWord(word)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newBannedInput}
                  onChange={(e) => setNewBannedInput(e.target.value)}
                  onKeyDown={addBannedWord}
                  placeholder="+ Add prohibited term and press Enter"
                  className="px-2 py-1 text-xs text-slate-800 outline-none bg-transparent flex-1 min-w-[160px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Example Brand Lines
              </label>
              <textarea
                rows={2}
                value={exampleBrandLines}
                onChange={(e) => setExampleBrandLines(e.target.value)}
                placeholder="• Your perfect sip, wherever you go.&#10;• Built for every journey."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          {/* ─── Right Column: Customer Personas (3) matching Image 1 ─────── */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Customer Personas ({personas.length})
                  </h2>
                  <p className="text-[11px] text-slate-500">Select active audience for campaign synthesis</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoSuggestPersonas}
                    disabled={isSuggestingPersonas}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-102 active:scale-98 disabled:opacity-50"
                    title="Automatically generate tailored customer personas for this product"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isSuggestingPersonas ? 'animate-spin' : ''}`} />
                    <span>{isSuggestingPersonas ? 'Generating...' : '✨ Suggest Personas'}</span>
                  </button>

                  {/* Add Persona Button (+) */}
                  <button
                    type="button"
                    onClick={handleAddNewPersona}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
                    title="Add new customer persona"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Mismatch Alert & Quick Fix */}
              {currentPersonasMismatch && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="text-[11px] leading-tight">Current personas don't match {productName || 'your product'}.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoSuggestPersonas}
                    disabled={isSuggestingPersonas}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    {isSuggestingPersonas ? 'Updating...' : '✨ Auto-Update'}
                  </button>
                </div>
              )}

              {/* Persona Cards List matching Image 1 */}
              <div className="space-y-3">
                {personas.map((p, idx) => {
                  const isSelected = selectedPersonaIndex === idx
                  return (
                    <div
                      key={p.persona_name || idx}
                      onClick={() => setSelectedPersonaIndex(idx)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group relative ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-1 ring-purple-600/20'
                          : 'border-slate-200/90 hover:border-purple-200 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <PersonaAvatar name={p.persona_name} className="w-12 h-12" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {p.persona_name}
                            </h4>
                            {isSelected && (
                              <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full shrink-0">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                            {p.summary || p.primary_goals}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons: [Edit] and [Delete] */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          title={`Edit ${p.persona_name} Persona`}
                          aria-label={`Edit ${p.persona_name}`}
                          onClick={(e) => handleStartEditPersona(idx, e)}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-100/70 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {personas.length > 1 && (
                          <button
                            type="button"
                            title={`Delete ${p.persona_name} Persona`}
                            aria-label={`Delete ${p.persona_name}`}
                            onClick={(e) => handleDeletePersona(idx, e)}
                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </form>

        {/* ─── Edit Customer Persona Modal ─────────────────────────────────── */}
        {editingPersonaIndex !== null && editPersonaForm && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <PersonaAvatar name={editPersonaForm.persona_name} className="w-9 h-9" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Edit Customer Persona
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Customize target audience parameters for campaign synthesis
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelPersonaEdit}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Persona Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPersonaForm.persona_name}
                    onChange={(e) =>
                      setEditPersonaForm({ ...editPersonaForm, persona_name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Summary / Goal *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPersonaForm.summary || editPersonaForm.primary_goals}
                    onChange={(e) =>
                      setEditPersonaForm({
                        ...editPersonaForm,
                        summary: e.target.value,
                        primary_goals: e.target.value,
                      })
                    }
                    placeholder="e.g. Long classes, needs convenient and reliable drinks."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pain Points
                  </label>
                  <textarea
                    rows={2}
                    value={editPersonaForm.pain_points || ''}
                    onChange={(e) =>
                      setEditPersonaForm({ ...editPersonaForm, pain_points: e.target.value })
                    }
                    placeholder="What challenges do they face?"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Core Motivations & Buying Triggers
                  </label>
                  <textarea
                    rows={2}
                    value={editPersonaForm.buying_triggers || editPersonaForm.core_motivations || ''}
                    onChange={(e) =>
                      setEditPersonaForm({
                        ...editPersonaForm,
                        buying_triggers: e.target.value,
                        core_motivations: e.target.value,
                      })
                    }
                    placeholder="What drives their purchase decisions?"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Message Style
                  </label>
                  <input
                    type="text"
                    value={editPersonaForm.preferred_message_style || ''}
                    onChange={(e) =>
                      setEditPersonaForm({
                        ...editPersonaForm,
                        preferred_message_style: e.target.value,
                      })
                    }
                    placeholder="e.g. Short, energetic, student-friendly, casual"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancelPersonaEdit}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePersonaEdit}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white cursor-pointer transition-colors shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
            <LoadingIndicator
              stageMessage="Synthesizing Persona DNA & Audience Strategy..."
              subMessage="Analyzing psychological drivers, pain points, and brand alignment..."
            />
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}
