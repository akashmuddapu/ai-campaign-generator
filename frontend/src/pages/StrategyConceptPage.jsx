import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Plane,
  Thermometer,
  Coffee,
  Rocket,
  User,
  Users,
  Zap,
  Shield,
  Cpu,
  Target,
  Compass,
  Lightbulb,
  Award,
  Layers,
  Heart,
  Palette,
  Building2,
} from 'lucide-react'
import api from '../services/api'
import SidebarLayout from '../components/SidebarLayout'
import LoadingIndicator from '../components/LoadingIndicator'
import { unlockStep, setUnlockedStep, resetWizardSession } from '../utils/wizardProgress'

// Dynamically resolve persona icon from role/name
function getPersonaIcon(name, idx) {
  const n = (name || '').toLowerCase()
  if (n.includes('student') || n.includes('academic') || n.includes('school') || n.includes('learn')) return GraduationCap
  if (n.includes('ciso') || n.includes('security') || n.includes('guardrail') || n.includes('compliance')) return Shield
  if (n.includes('cto') || n.includes('engineer') || n.includes('tech') || n.includes('dev') || n.includes('cloud')) return Cpu
  if (n.includes('executive') || n.includes('director') || n.includes('founder') || n.includes('leader')) return Building2
  if (n.includes('professional') || n.includes('working') || n.includes('manager') || n.includes('specialist')) return Briefcase
  if (n.includes('travel') || n.includes('commut') || n.includes('nomad')) return Plane
  if (n.includes('health') || n.includes('wellness') || n.includes('athlete') || n.includes('fitness')) return Heart
  if (n.includes('creative') || n.includes('design') || n.includes('artist') || n.includes('writer')) return Palette
  const genericList = [User, Users, Sparkles, Target, Award]
  return genericList[idx % genericList.length] || User
}

function getPersonaColor(idx) {
  const colors = [
    'bg-purple-100 text-purple-700',
    'bg-indigo-100 text-indigo-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
  ]
  return colors[idx % colors.length]
}

// Dynamically resolve concept icon based on concept direction and product details
function getConceptIcon(concept, brandKit, idx) {
  const title = (concept?.title || '').toLowerCase()
  const angle = (concept?.angle || '').toLowerCase()
  const hook = (concept?.hook || '').toLowerCase()
  const keyMsg = (concept?.key_message || '').toLowerCase()
  const prod = (brandKit?.product_name || '').toLowerCase()
  const desc = (brandKit?.product_description || '').toLowerCase()
  const combined = `${title} ${angle} ${hook} ${keyMsg}`
  const isBeverage = /mug|coffee|drink|tea|sip|beverage|temperature|brew|thermos|flask/i.test(`${prod} ${desc}`)

  // 1. Tech / Security / Cloud / Guardrail
  if (/security|guardrail|shield|protect|defen|compliance|audit|cyber|cloud|zero-trust|threat|resilien/i.test(combined)) {
    return Shield
  }
  if (/code|api|server|cpu|infra|system|terminal|developer/i.test(combined)) {
    return Cpu
  }

  // 2. Focus / Flow State / Study / Productivity / Mind
  if (/flow state|focus|study|academ|lecture|mind|learn|brain|intellect|concentrat/i.test(combined)) {
    return Target
  }

  // 3. Aesthetic / Design / Premium / Luxury / Excellence
  if (/aesthetic|design|style|elegance|craft|art|creative|visual/i.test(combined)) {
    return Sparkles
  }

  // 4. Energy / Velocity / Speed / Scale / Rocket
  if (/rocket|launch|velocity|speed|accelerat|scale|fast|momentum|surge/i.test(combined)) {
    return Rocket
  }
  if (/energy|power|boost|zap|fuel|stamina|dynam/i.test(combined)) {
    return Zap
  }

  // 5. Beverage / Thermal (ONLY if the product itself is actually a beverage/mug!)
  if (isBeverage) {
    if (/temperature|thermal|hot|cold|degree/i.test(combined)) return Thermometer
    if (/sip|coffee|brew|ritual|roast|cup|drink/i.test(combined)) return Coffee
  }

  // 6. Travel / Movement / Exploration
  if (/travel|journey|nomad|road|transit|commute|adventure|global|move/i.test(combined)) {
    return Compass
  }

  // 7. Leadership / Benchmark / Advantage / Standard / Quality
  if (/advantage|benchmark|leader|standard|trust|verifi|excellence|mastery/i.test(combined)) {
    return Award
  }

  // 8. Reliable Generic Modern Icons for any campaign direction
  const genericIcons = [Sparkles, Target, Zap, Rocket, Compass, Lightbulb, Award, Layers]
  return genericIcons[idx % genericIcons.length] || Sparkles
}

export default function StrategyConceptPage({ user, onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlDraftId = searchParams.get('draft_id')
  const urlStepParam = searchParams.get('step')

  // Draft ID passed from URL, route state, or sessionStorage
  const [draftId, setDraftId] = useState(() => {
    if (urlDraftId) return urlDraftId
    if (location.state?.draft_id) return location.state.draft_id
    try { return sessionStorage.getItem('cg_draft_id') || null } catch { return null }
  })

  // Retrieve state or use rich fallbacks (with sessionStorage refresh resilience)
  const [brand_kit, setBrandKit] = useState(() =>
    location.state?.brand_kit ||
    (() => {
      try {
        const s = sessionStorage.getItem('cg_brand_kit')
        return s ? JSON.parse(s) : null
      } catch {
        return null
      }
    })() || {
      product_name: 'TravelMate Smart Mug',
      product_description: 'A smart travel mug that keeps drinks at your preferred temperature during your journey.',
      brand_tone: 'Friendly, Premium, Modern',
      tagline: 'Your drink. Your temperature.',
      banned_words: ['cheap', 'guaranteed', 'best'],
    }
  )

  const [rawPersonas, setRawPersonas] = useState(() =>
    location.state?.all_personas ||
    (() => {
      try {
        const s = sessionStorage.getItem('cg_personas')
        return s ? JSON.parse(s) : null
      } catch {
        return null
      }
    })() || [
      { persona_name: 'Student' },
      { persona_name: 'Working Professional' },
      { persona_name: 'Traveller' },
    ]
  )

  // Personas from route state have NO icon/color (stripped before navigate).
  // Re-derive them here by name/index so History API serialization never fails.
  const all_personas = rawPersonas.map((p, idx) => ({
    ...p,
    icon: getPersonaIcon(p.persona_name, idx),
    color: getPersonaColor(idx),
  }))

  const [activePersonaTab, setActivePersonaTab] = useState(
    location.state?.persona?.persona_name || all_personas[0]?.persona_name || 'Student'
  )

  // Sub-step: 'dna' (Step 2 of 5) or 'concepts' (Step 3 of 5)
  const [subStep, setSubStep] = useState(urlStepParam === 'concepts' ? 'concepts' : 'dna')

  // Sync subStep whenever URL ?step=... changes (e.g. clicking sidebar step link)
  useEffect(() => {
    if (urlStepParam === 'concepts') {
      setSubStep('concepts')
    } else if (urlStepParam === 'dna') {
      setSubStep('dna')
    }
  }, [urlStepParam])

  const [personaDnaState, setPersonaDnaState] = useState(() => {
    if (location.state?.persona_dna) return location.state.persona_dna
    try {
      const s = sessionStorage.getItem('cg_persona_dna')
      if (s) return JSON.parse(s)
    } catch {}
    return null
  })

  const persona_dna = personaDnaState || {
    persona_name: activePersonaTab,
    audience_summary: `Audience strategy and key insights for ${activePersonaTab} messaging.`,
    core_value_angle: 'Keep your favorite drink ready between classes.',
    tone_vector: 'Short, energetic, student-friendly, casual',
    primary_hook: 'Keep your favorite drink ready between classes.',
    psychological_drivers: ['Convenience & reliability', 'Academic stamina', 'Relatability'],
    differentiation_strategy: 'Position as essential daily study gear.',
  }

  // 3 Concepts matching Image 1 Screen 4
  const [concepts, setConcepts] = useState(() => {
    if (location.state?.concepts) return location.state.concepts
    try {
      const s = sessionStorage.getItem('cg_concepts')
      if (s) {
        const parsed = JSON.parse(s)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return [
      {
        id: 'c-1',
        title: 'Temperature That Travels',
        angle: 'Personalized Comfort On The Move',
        key_message: 'Your perfect drink wherever you go.',
        hook: '"Your schedule changes. Your drink doesn\'t have to."',
        tone: 'Reliable, forward-looking',
        rationale: 'Addresses the daily chaos of commuter and class schedules.',
      },
      {
        id: 'c-2',
        title: 'Your Perfect Sip',
        angle: 'Mindful Morning Ritual',
        key_message: 'Personalized comfort in every sip.',
        hook: '"Because every journey deserves the perfect sip."',
        tone: 'Warm, refined, mindful',
        rationale: 'Focuses on the sensorial experience of hot beverages.',
      },
      {
        id: 'c-3',
        title: 'Never Settle for Lukewarm',
        angle: 'Peak Productivity Gear',
        key_message: 'Keep your drink at the ideal temperature, always.',
        hook: '"Hot or cold, just the way you like it."',
        tone: 'Energetic, bold, decisive',
        rationale: 'Appeals to high-intensity performers who refuse compromises.',
      },
    ]
  })

  const [selectedConceptIndex, setSelectedConceptIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [draftSaved, setDraftSaved] = useState(false)

  // Hydrate full draft from backend when resuming via ?draft_id=...
  useEffect(() => {
    if (!urlDraftId) return
    setDraftId(urlDraftId)
    api
      .get(`/campaigns/${urlDraftId}`)
      .then((res) => {
        const bundle = res.data?.campaign || res.data
        if (!bundle) return
        if (bundle.brand_kit && Object.keys(bundle.brand_kit).length > 0) {
          setBrandKit(bundle.brand_kit)
          try { sessionStorage.setItem('cg_brand_kit', JSON.stringify(bundle.brand_kit)) } catch {}
        }
        const pList =
          Array.isArray(bundle.all_personas) && bundle.all_personas.length > 0
            ? bundle.all_personas
            : bundle.persona?.persona_name
            ? [bundle.persona]
            : null
        if (pList) {
          setRawPersonas(pList)
          setActivePersonaTab(bundle.persona?.persona_name || pList[0].persona_name)
          try { sessionStorage.setItem('cg_personas', JSON.stringify(pList)) } catch {}
        }
        if (bundle.persona_dna) {
          setPersonaDnaState(bundle.persona_dna)
          try { sessionStorage.setItem('cg_persona_dna', JSON.stringify(bundle.persona_dna)) } catch {}
        }
        if (Array.isArray(bundle.concepts) && bundle.concepts.length > 0) {
          setConcepts(bundle.concepts)
          try { sessionStorage.setItem('cg_concepts', JSON.stringify(bundle.concepts)) } catch {}
          if (bundle.concept?.title) {
            const cIdx = bundle.concepts.findIndex((c) => c.title === bundle.concept.title)
            if (cIdx >= 0) setSelectedConceptIndex(cIdx)
          }
        }
        try { sessionStorage.setItem('cg_draft_id', urlDraftId) } catch {}
        const targetStep = bundle.current_step || (urlStepParam === 'concepts' ? 3 : 2)
        setUnlockedStep(Math.max(targetStep, urlStepParam === 'concepts' ? 3 : 2))
      })
      .catch(() => {})
  }, [urlDraftId])

  const selectedConcept = concepts[selectedConceptIndex] || concepts[0]
  const currentPersona = all_personas.find((p) => p.persona_name === activePersonaTab) || all_personas[0]

  // ─── Draft save helper ───────────────────────────────────────────────────
  const saveDraft = async ({ step, extraFields = {} } = {}) => {
    const userId = user?.id || localStorage.getItem('cg_user_id')
    if (!userId) return null
    try {
      const serializablePersonas = all_personas.map(({ icon: _i, color: _c, ...rest }) => rest)
      const { icon: _ci, color: _cc, ...serializablePersona } = currentPersona
      const cleanConcepts = concepts.map(({ icon: _i, ...rest }) => rest)
      const res = await api.post('/campaigns/draft', {
        draft_id: draftId || undefined,
        user_id: userId,
        current_step: step,
        brand_kit,
        all_personas: serializablePersonas,
        persona: serializablePersona,
        persona_dna: persona_dna,
        concepts: cleanConcepts,
        ...extraFields,
      })
      const savedId = res.data?.draft_id
      if (savedId) {
        setDraftId(savedId)
        try { sessionStorage.setItem('cg_draft_id', savedId) } catch {}
        const draftData = res.data?.campaign
        if (draftData) window.dispatchEvent(new CustomEvent('cg_draft_saved', { detail: draftData }))
      }
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 2000)
      return savedId
    } catch {
      return null
    }
  }

  // Save draft & reset wizard/sidebar back to Home
  const handleSaveDraftAndReset = async (stepNum) => {
    await saveDraft({
      step: stepNum,
      extraFields: stepNum === 3 ? { concept: selectedConcept } : {},
    })
    resetWizardSession()
    navigate('/dashboard', {
      state: {
        draftSavedNotice: `Draft "${brand_kit.product_name || 'Campaign'}" saved at Step ${stepNum} of 5. Resume anytime from Previous Campaigns or Campaign History.`,
      },
    })
  }

  const handleGenerateAssets = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Strip icon/color (React components) before sending to API and before navigate
      // eslint-disable-next-line no-unused-vars
      const { icon: _ci, color: _cc, ...serializablePersona } = currentPersona
      const serializablePersonas = all_personas.map(({ icon: _i, color: _c, ...rest }) => rest)
      const { icon: _selIcon, ...serializableConcept } = selectedConcept || {}
      const userId = user?.id || localStorage.getItem('cg_user_id')

      const response = await api.post('/campaigns/generate-assets', {
        brand_kit,
        persona: serializablePersona,
        all_personas: serializablePersonas,
        selected_concept: serializableConcept,
        user_id: userId,
        draft_id: draftId || undefined,
      })

      const createdCampaign = response.data
      const assets = createdCampaign?.assets || {}

      // Invalidate sidebar cache so the new campaign is fetched fresh
      if (userId) {
        try {
          sessionStorage.removeItem(`cg_campaign_history_${userId}`)
          sessionStorage.removeItem('cg_campaign_history')
        } catch {}
      }

      // Persist across browser refresh/tab changes
      try {
        sessionStorage.setItem('cg_brand_kit', JSON.stringify(brand_kit))
        sessionStorage.setItem('cg_selected_concept', JSON.stringify(serializableConcept))
        sessionStorage.setItem('cg_personas', JSON.stringify(serializablePersonas))
        if (createdCampaign?.id) {
          sessionStorage.setItem('cg_active_campaign_id', createdCampaign.id)
          // Remove draft key once campaign is fully generated
          sessionStorage.removeItem('cg_draft_id')
        }
      } catch {
        // Ignore storage errors in restricted contexts
      }

      // Unlock Step 4 (Campaign Assets) in sidebar!
      unlockStep(4)

      // Broadcast event so SidebarLayout immediately replaces the draft with the finalized campaign
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('cg_campaign_created', {
            detail: { ...createdCampaign, replaced_draft_id: draftId },
          })
        )
      }

      navigate('/results?tab=assets', {
        state: {
          brand_kit,
          persona: serializablePersona,
          all_personas: serializablePersonas,
          selected_concept: serializableConcept,
          assets,
          campaign_id: createdCampaign?.id,
          draft_id: draftId,
        },
      })
    } catch (err) {
      setError(err.message || 'Failed to generate campaign assets.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarLayout
      user={user}
      onLogout={onLogout}
      currentStep={subStep === 'dna' ? 'Step 2 of 5' : 'Step 3 of 5'}
      campaignName={brand_kit.product_name?.split(' ')[0] || 'TravelMate'}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ─── SCREEN 3: Persona DNA (Strategy — Single-Page Vertical Scroll) ─── */}
        {subStep === 'dna' && (
          <div className="space-y-6">
            {/* Sticky Top Header with Title + Fixed Action Buttons at Top */}
            <div className="sticky top-0 z-30 -mx-4 px-4 pt-6 pb-4 bg-[#F6F7FB] border-b border-slate-200 shadow-[0_4px_12px_-2px_rgba(15,23,42,0.05)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                    Persona DNA — Audience Strategy
                  </h1>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap">
                    {all_personas.length} {all_personas.length === 1 ? 'Persona' : 'Personas'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI-generated marketing strategy for each persona — scroll down to review all segments one by one
                </p>
              </div>

              {/* Action Buttons Fixed at Top */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    navigate(draftId ? `/generator?draft_id=${draftId}` : '/generator', {
                      state: {
                        brand_kit,
                        all_personas: all_personas.map(({ icon: _i, color: _c, ...rest }) => rest),
                      },
                    })
                  }
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Step 1: Brand Kit</span>
                </button>

                {draftSaved && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 animate-pulse whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Draft saved
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveDraftAndReset(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const savedId = await saveDraft({ step: 3 })
                    unlockStep(3)
                    const nextParams = { step: 'concepts' }
                    if (savedId || draftId) nextParams.draft_id = savedId || draftId
                    setSearchParams(nextParams)
                    setSubStep('concepts')
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-purple-200 cursor-pointer whitespace-nowrap"
                >
                  <span>Next: Campaign Concepts</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* All Personas Stacked Vertically One by One */}
            <div className="space-y-6">
              {all_personas.map((personaItem, idx) => {
                const PersonaIcon = personaItem.icon || getPersonaIcon(personaItem.persona_name, idx)
                const colorClass = personaItem.color || getPersonaColor(idx)
                const recommendedHook =
                  idx === 0 && persona_dna?.primary_hook
                    ? persona_dna.primary_hook
                    : personaItem.summary ||
                      personaItem.primary_goals ||
                      `Experience ${brand_kit.product_name || 'our solution'} tailored specifically for ${personaItem.persona_name}.`

                return (
                  <div
                    key={personaItem.persona_name || idx}
                    className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-7 shadow-xs space-y-5"
                  >
                    {/* Persona Title Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center font-bold shadow-xs shrink-0`}>
                          <PersonaIcon className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-base font-black text-slate-900 truncate">
                            {personaItem.persona_name} — Persona DNA
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Audience strategy and psychological insights for campaign messaging
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                        Persona {idx + 1} of {all_personas.length}
                      </span>
                    </div>

                    {/* 6 Grid Tiles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Goal</span>
                        <p className="text-xs text-slate-800 font-medium">
                          {personaItem.primary_goals || 'Stay energized and productive throughout daily routine'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Pain Point</span>
                        <p className="text-xs text-slate-800 font-medium">
                          {personaItem.pain_points || 'Inconvenient, unreliable options during busy schedules'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Motivation</span>
                        <p className="text-xs text-slate-800 font-medium">
                          {personaItem.core_motivations || 'Convenience, reliability, and high daily performance'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Emotional Trigger</span>
                        <p className="text-xs text-slate-800 font-medium">
                          {personaItem.emotional_triggers || 'Comfort, confidence, and seamless daily workflow'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Preferred Message</span>
                        <p className="text-xs text-slate-800 font-medium">
                          {personaItem.preferred_message_style || 'Clear, benefit-driven, relatable, and modern'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Buying Trigger</span>
                        <p className="text-xs text-slate-800 font-medium">
                          {personaItem.buying_triggers || 'Proven quality, reliability, and sleek design'}
                        </p>
                      </div>
                    </div>

                    {/* Recommended Marketing Angle Banner */}
                    <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 block">
                          Recommended Marketing Angle
                        </span>
                        <span className="text-xs font-semibold text-purple-800">
                          "{recommendedHook}"
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── SCREEN 4: Campaign Concepts ─────────────────────────────────── */}
        {subStep === 'concepts' && (
          <div className="space-y-6">
            {/* Sticky Top Header with Title + Fixed Action Buttons at Top */}
            <div className="sticky top-0 z-30 -mx-4 px-4 pt-6 pb-4 bg-[#F6F7FB] border-b border-slate-200 shadow-[0_4px_12px_-2px_rgba(15,23,42,0.05)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Campaign Concepts
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select 1 of 3 AI-generated strategic campaign directions
                </p>
              </div>

              {/* Action Buttons Fixed at Top */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const nextParams = { step: 'dna' }
                    if (draftId) nextParams.draft_id = draftId
                    setSearchParams(nextParams)
                    setSubStep('dna')
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Step 2: Persona Strategy</span>
                </button>

                {draftSaved && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 animate-pulse whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Draft saved
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveDraftAndReset(3)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAssets}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-purple-200 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <span>{isLoading ? 'Generating Assets...' : 'Generate Campaign Assets'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* 3 Concept Cards matching Image 1 Screen 4 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {concepts.map((concept, idx) => {
                const isSelected = selectedConceptIndex === idx
                const Icon = getConceptIcon(concept, brand_kit, idx)

                return (
                  <div
                    key={concept.id || idx}
                    onClick={() => setSelectedConceptIndex(idx)}
                    className={`relative p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'border-purple-600 bg-white shadow-md shadow-purple-500/5 ring-2 ring-purple-600/20'
                        : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Top Radio & Icon */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-purple-700 bg-purple-700 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        {concept.title}
                      </h3>
                    </div>

                    {/* Key Message */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Key Message
                      </span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {concept.key_message || concept.angle}
                      </p>
                    </div>

                    {/* Hook */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Hook
                      </span>
                      <p className="text-xs italic text-slate-600 leading-relaxed font-normal">
                        {concept.hook}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── SCREEN 5: Generating Campaign Progress Bar matching Image 1 Screen 5 ─ */}
        {isLoading && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95">
              {/* Glowing Purple AI Chip matching Image 1 */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-400/50 animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Building your campaign...
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Creating personalized marketing assets for each persona
                </p>
              </div>

              {/* Dynamic Checklist steps matching Image 2 */}
              <div className="text-left space-y-2.5 text-xs font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-60 overflow-y-auto">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Campaign concept selected — {selectedConcept?.title || 'Selected Concept'}</span>
                </div>
                {all_personas.map((p, pIdx) => (
                  <div key={p.persona_name || pIdx} className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Generating strategy for {p.persona_name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-purple-700 font-bold animate-pulse">
                  <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin shrink-0" />
                  <span>Creating social posts and emails...</span>
                </div>
              </div>

              {/* Progress bar matching Image 1 (72%) */}
              <div className="space-y-1">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2.5 rounded-full w-[72%] transition-all duration-500" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 block text-right">72%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}
