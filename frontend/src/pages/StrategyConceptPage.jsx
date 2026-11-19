import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
  Zap,
} from 'lucide-react'
import api from '../services/api'
import SidebarLayout from '../components/SidebarLayout'
import LoadingIndicator from '../components/LoadingIndicator'

// Re-derive persona icon from name/index (never store React components in route state)
function getPersonaIcon(name, idx) {
  const n = (name || '').toLowerCase()
  if (n.includes('student')) return GraduationCap
  if (n.includes('professional') || n.includes('working')) return Briefcase
  if (n.includes('travel')) return Plane
  return [GraduationCap, Briefcase, Plane][idx % 3] || User
}
function getPersonaColor(idx) {
  return ['bg-amber-100 text-amber-700', 'bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700'][idx % 3]
}

export default function StrategyConceptPage({ user, onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()

  // Retrieve state or use rich fallbacks (with sessionStorage refresh resilience)
  const brand_kit =
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

  // Personas from route state have NO icon/color (stripped before navigate).
  // Re-derive them here by name/index so History API serialization never fails.
  const all_personas = (
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
  ).map((p, idx) => ({ ...p, icon: getPersonaIcon(p.persona_name, idx), color: getPersonaColor(idx) }))

  const [activePersonaTab, setActivePersonaTab] = useState(
    location.state?.persona?.persona_name || all_personas[0]?.persona_name || 'Student'
  )

  // Sub-step: 'dna' (Step 2 of 5) or 'concepts' (Step 3 of 5)
  const [subStep, setSubStep] = useState('dna')

  const persona_dna = location.state?.persona_dna || {
    persona_name: activePersonaTab,
    audience_summary: `Audience strategy and key insights for ${activePersonaTab} messaging.`,
    core_value_angle: 'Keep your favorite drink ready between classes.',
    tone_vector: 'Short, energetic, student-friendly, casual',
    primary_hook: 'Keep your favorite drink ready between classes.',
    psychological_drivers: ['Convenience & reliability', 'Academic stamina', 'Relatability'],
    differentiation_strategy: 'Position as essential daily study gear.',
  }

  // 3 Concepts matching Image 1 Screen 4
  const concepts = location.state?.concepts || [
    {
      id: 'c-1',
      icon: Thermometer,
      title: 'Temperature That Travels',
      angle: 'Personalized Comfort On The Move',
      key_message: 'Your perfect drink wherever you go.',
      hook: '"Your schedule changes. Your drink doesn\'t have to."',
      tone: 'Reliable, forward-looking',
      rationale: 'Addresses the daily chaos of commuter and class schedules.',
    },
    {
      id: 'c-2',
      icon: Coffee,
      title: 'Your Perfect Sip',
      angle: 'Mindful Morning Ritual',
      key_message: 'Personalized comfort in every sip.',
      hook: '"Because every journey deserves the perfect sip."',
      tone: 'Warm, refined, mindful',
      rationale: 'Focuses on the sensorial experience of hot beverages.',
    },
    {
      id: 'c-3',
      icon: Rocket,
      title: 'Never Settle for Lukewarm',
      angle: 'Peak Productivity Gear',
      key_message: 'Keep your drink at the ideal temperature, always.',
      hook: '"Hot or cold, just the way you like it."',
      tone: 'Energetic, bold, decisive',
      rationale: 'Appeals to high-intensity performers who refuse compromises.',
    },
  ]

  const [selectedConceptIndex, setSelectedConceptIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const selectedConcept = concepts[selectedConceptIndex] || concepts[0]
  const currentPersona = all_personas.find((p) => p.persona_name === activePersonaTab) || all_personas[0]

  const handleGenerateAssets = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Strip icon/color (React components) before sending to API and before navigate
      // eslint-disable-next-line no-unused-vars
      const { icon: _ci, color: _cc, ...serializablePersona } = currentPersona
      const serializablePersonas = all_personas.map(({ icon: _i, color: _c, ...rest }) => rest)
      const userId = user?.id || localStorage.getItem('cg_user_id')

      const response = await api.post('/campaigns/generate-assets', {
        brand_kit,
        persona: serializablePersona,
        all_personas: serializablePersonas,
        selected_concept: selectedConcept,
        user_id: userId,
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
        sessionStorage.setItem('cg_selected_concept', JSON.stringify(selectedConcept))
        sessionStorage.setItem('cg_personas', JSON.stringify(serializablePersonas))
        if (createdCampaign?.id) {
          sessionStorage.setItem('cg_active_campaign_id', createdCampaign.id)
        }
      } catch {
        // Ignore storage errors in restricted contexts
      }

      // Broadcast event so SidebarLayout immediately updates its list without page reload
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cg_campaign_created', { detail: createdCampaign }))
      }

      navigate('/results', {
        state: {
          brand_kit,
          persona: serializablePersona,
          all_personas: serializablePersonas,
          selected_concept: selectedConcept,
          assets,
          campaign_id: createdCampaign?.id,
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
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── SCREEN 3: Persona DNA (Strategy) ────────────────────────────── */}
        {subStep === 'dna' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Persona DNA — Audience Strategy
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI-generated marketing strategy for each persona
                </p>
              </div>

              {/* Persona Switcher Tabs matching Image 1 Screen 3 */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                {all_personas.map((p) => {
                  const isActive = activePersonaTab === p.persona_name
                  return (
                    <button
                      key={p.persona_name}
                      type="button"
                      onClick={() => setActivePersonaTab(p.persona_name)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p.persona_name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Persona DNA Card matching Image 1 Screen 3 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
              {/* Persona Title Header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shadow-xs">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    {activePersonaTab} Persona DNA
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Audience strategy and key insights for campaign messaging
                  </p>
                </div>
              </div>

              {/* 6 Grid Tiles matching Image 1 Screen 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Goal</span>
                  <p className="text-xs text-slate-800 font-medium">
                    {currentPersona.primary_goals || 'Stay energized during long study hours'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Pain Point</span>
                  <p className="text-xs text-slate-800 font-medium">
                    {currentPersona.pain_points || 'Drinks get cold during classes'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Motivation</span>
                  <p className="text-xs text-slate-800 font-medium">
                    {currentPersona.core_motivations || 'Convenience & reliability'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Emotional Trigger</span>
                  <p className="text-xs text-slate-800 font-medium">
                    {currentPersona.emotional_triggers || 'Fun, relatable, energetic'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Preferred Message</span>
                  <p className="text-xs text-slate-800 font-medium">
                    {currentPersona.preferred_message_style || 'Short, energetic, student-friendly'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Buying Trigger</span>
                  <p className="text-xs text-slate-800 font-medium">
                    {currentPersona.buying_triggers || 'Keeps drink at the right temperature'}
                  </p>
                </div>
              </div>

              {/* Recommended Marketing Angle Banner matching Image 1 */}
              <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 block">
                    Recommended Marketing Angle
                  </span>
                  <span className="text-xs font-semibold text-purple-800">
                    "{persona_dna.primary_hook || 'Keep your favorite drink ready between classes.'}"
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/generator')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubStep('concepts')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-purple-200 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SCREEN 4: Campaign Concepts ─────────────────────────────────── */}
        {subStep === 'concepts' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200/80 pb-4">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Campaign Concepts
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                AI-generated strategic campaign directions
              </p>
            </div>

            {/* 3 Concept Cards matching Image 1 Screen 4 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {concepts.map((concept, idx) => {
                const isSelected = selectedConceptIndex === idx
                const Icon = idx === 0 ? Thermometer : idx === 1 ? Coffee : Rocket

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

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setSubStep('dna')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateAssets}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-purple-200 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Generating Assets...' : 'Generate Campaign Assets'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
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

              {/* Checklist steps */}
              <div className="text-left space-y-2.5 text-xs font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Campaign concept selected — {selectedConcept.title}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Generating strategy for Student</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Generating strategy for Working Professional</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Generating strategy for Traveller</span>
                </div>
                <div className="flex items-center gap-2 text-purple-700 font-bold animate-pulse">
                  <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
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
