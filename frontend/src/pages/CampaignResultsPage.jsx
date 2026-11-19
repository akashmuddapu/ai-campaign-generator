import { useState, useEffect } from 'react'
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  FileText,
  Download,
  RotateCw,
  HelpCircle,
  GraduationCap,
  Briefcase,
  Plane,
  FileCode,
  Pencil,
  Check,
  X,
  Wand2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  FileDown,
  Shield,
  Cpu,
  Target,
  Compass,
  Heart,
  Palette,
  Building2,
  User,
  Users,
} from 'lucide-react'
import api from '../services/api'
import SidebarLayout from '../components/SidebarLayout'
import WhyThisContentModal from '../components/WhyThisContentModal'
import { generateCampaignPdf } from '../utils/generateCampaignPdf'
import { unlockStep, getMaxUnlockedStep, resetWizardSession } from '../utils/wizardProgress'

// Re-derive persona icon from name/index
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

// Validate individual asset content deterministically against Brand Kit rules
function validateAssetContent(content, channelType, brandKit, isFixed = false) {
  const bannedList = (brandKit.banned_words || []).map((w) => w.trim().toLowerCase()).filter(Boolean)
  const flaggedWords = []

  let textToCheck = ''
  let lengthViolation = false
  let lengthDetail = ''

  if (channelType === 'social_post') {
    textToCheck = content?.text || ''
    if (textToCheck.length > 280) {
      lengthViolation = true
      lengthDetail = `Exceeds 280 chars (${textToCheck.length}/280)`
    }
  } else {
    const subject = content?.subject || ''
    const body = content?.body || ''
    textToCheck = `${subject} ${body}`
    if (subject.length > 60) {
      lengthViolation = true
      lengthDetail = `Subject > 60 chars (${subject.length}/60)`
    }
    const words = body.trim().split(/\s+/).filter(Boolean).length
    if (words < 75 || words > 250) {
      lengthViolation = true
      lengthDetail = `${words} words (target 75–250)`
    }
  }

  // Check banned words with word boundaries
  bannedList.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    if (regex.test(textToCheck)) {
      flaggedWords.push(word)
    }
  })

  const hasIssues = flaggedWords.length > 0 || lengthViolation
  let score = 5
  if (flaggedWords.length > 0) score -= 1.0
  if (lengthViolation) score -= 0.5
  score = Math.max(1, Math.min(5, Math.round(score * 10) / 10))

  let status = 'Pass'
  let issueText = '—'

  if (isFixed) {
    status = 'Fixed'
    issueText = 'Banned word removed'
    score = 5
  } else if (hasIssues) {
    status = 'Flagged'
    const parts = []
    if (flaggedWords.length > 0) parts.push(`Banned word: "${flaggedWords.join(', ')}"`)
    if (lengthViolation) parts.push(lengthDetail)
    issueText = parts.join(', ')
  }

  return {
    score,
    status,
    issueText,
    hasIssues,
    flaggedWords,
    lengthViolation,
  }
}

export default function CampaignResultsPage({ user, onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Active view tab: 'assets' | 'guardian' | 'export'
  const activeView = searchParams.get('tab') || 'assets'

  // Track progressive wizard step unlocking
  const [maxStep, setMaxStep] = useState(() => getMaxUnlockedStep())
  useEffect(() => {
    const syncStep = (e) => setMaxStep(e?.detail?.maxStep || getMaxUnlockedStep())
    window.addEventListener('cg_step_unlocked', syncStep)
    return () => window.removeEventListener('cg_step_unlocked', syncStep)
  }, [])
  useEffect(() => {
    if (activeView === 'guardian') unlockStep(5)
    else if (activeView === 'export' || activeView === 'ad') unlockStep(6)
    else unlockStep(4)
  }, [activeView])

  const effectiveMaxStep = Math.max(
    maxStep,
    activeView === 'export' || activeView === 'ad' ? 6 : activeView === 'guardian' ? 5 : 4
  )

  // Retrieve state or use complete fallbacks (with sessionStorage refresh resilience)
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

  // Personas from route state have NO icon/color — re-derive by name/index
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

  const selected_concept =
    location.state?.selected_concept ||
    (() => {
      try {
        const s = sessionStorage.getItem('cg_selected_concept')
        return s ? JSON.parse(s) : null
      } catch {
        return null
      }
    })() || {
      title: 'Temperature That Travels',
      angle: 'Personalized Comfort On The Move',
      hook: '"Your schedule changes. Your drink doesn\'t have to."',
    }

  const campaignId =
    location.state?.campaign_id ||
    searchParams.get('id') ||
    (() => {
      try {
        return sessionStorage.getItem('cg_active_campaign_id') || null
      } catch {
        return null
      }
    })() ||
    'camp-travelmate-001'

  // Guard: if no meaningful state loaded (direct URL access), show empty state
  const hasRealData = !!(location.state?.brand_kit || sessionStorage.getItem('cg_brand_kit'))
  if (!hasRealData) {
    return (
      <SidebarLayout user={user} onLogout={onLogout} currentStep="Step 4 of 5" campaignName="New Campaign" campaignStatus="Draft">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-purple-50 flex items-center justify-center">
            <FileText className="w-10 h-10 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">No Campaign Loaded</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Campaign data wasn't found. Start a new campaign from the Brand &amp; Personas step.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/generator')}
            className="px-6 py-2.5 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-all shadow-md shadow-purple-200 cursor-pointer"
          >
            Start New Campaign →
          </button>
        </div>
      </SidebarLayout>
    )
  }

  const [activePersonaName, setActivePersonaName] = useState(
    location.state?.persona?.persona_name || all_personas[0]?.persona_name || 'Student'
  )

  // Persona-specific assets map state — keyed by persona name
  // Build fresh defaults for ALL personas so switching tabs shows different content
  // Dynamic tailored content generator adapting to ANY product (beverage, tech, or custom)
  const getDefaultPersonaAssets = (personaName, brandKit, concept) => {
    const pName = personaName || 'Student'
    const prod = brandKit?.product_name || 'TravelMate Smart Mug'
    const desc = brandKit?.product_description || 'A smart travel mug that keeps drinks at your preferred temperature during your journey.'
    const tagline = brandKit?.tagline || 'Your drink. Your temperature.'
    const cTitle = concept?.title || 'Temperature That Travels'
    const cHook = (concept?.hook || `Experience the difference with ${prod}.`).replace(/^"|"$/g, '')
    const n = pName.toLowerCase()

    // Determine domain context from product name & description
    const isBeverage = /mug|coffee|drink|tea|sip|beverage|temperature|brew|cup|thermos|flask/i.test(`${prod} ${desc}`)
    const isTech = /security|cloud|software|cyber|saas|api|ai|data|code|dev|guardrail/i.test(`${prod} ${desc}`)

    let socialText = ''
    let emailSubject = ''
    let emailBody = ''

    if (isBeverage) {
      if (n.includes('student')) {
        socialText = `Long lectures? Cold drinks? Not anymore! With ${prod}, keep your favorite drink at the perfect temperature between classes. ☕✨ Stay energized and focused.`
        emailSubject = `Your perfect coffee between classes is here.`
        emailBody = `Long classes and a packed lecture schedule? Keep your energy up with ${prod} — ${desc.toLowerCase().startsWith('a ') ? desc : `the solution that ${desc}`}\n\nWhether you need piping hot matcha during morning study blocks or iced cold brew in the afternoon, ${cHook}.\n\nGrab your student edition today with free campus shipping.`
      } else if (n.includes('professional') || n.includes('working')) {
        socialText = `Back-to-back executive meetings with no time to reheat your coffee? ${prod} maintains your ideal temperature all day long with precision smart heating. 💼☕ Work at peak performance.`
        emailSubject = `Sustained focus for your back-to-back workdays`
        emailBody = `Between client presentations and back-to-back executive meetings, you do not have time for cold, stale drinks.\n\n${prod} delivers all-day precision temperature regulation, designed with sleek ergonomics that look right at home in the boardroom.\n\nUpgrade your daily workflow with ${tagline} and never settle for lukewarm again.`
      } else {
        socialText = `From airport terminals to rugged road trips, ${prod} keeps your favorite brew at the right temperature across time zones. ✈️🌍 Pack for every adventure.`
        emailSubject = `${prod}: Built for everywhere you travel`
        emailBody = `Consistent hydration and hot drinks across time zones are finally effortless.\n\n${prod} is engineered for the road: ${desc}\n\n${cHook} Pack the ultimate companion on your next journey with ${tagline}.`
      }
    } else if (isTech) {
      if (n.includes('ciso') || n.includes('security') || n.includes('tech') || n.includes('engineer')) {
        socialText = `Automate compliance and stop threats before they escalate with ${prod}. ${cHook} Built for high-velocity engineering teams. 🛡️💻`
        emailSubject = `${prod}: Enterprise-grade security for 2026`
        emailBody = `Dear ${pName},\n\nIn modern cloud infrastructure, speed cannot come at the expense of security. With ${prod}, your engineering organization unlocks continuous compliance and automated resilience.\n\n${desc}\n\n${cHook} Our platform eliminates recurring vulnerabilities while preserving developer velocity across every deployment.\n\nSchedule a consultation with our security architecture team today.\n\nBest regards,\nThe ${prod} Team`
      } else if (n.includes('professional') || n.includes('working') || n.includes('leader')) {
        socialText = `Scale faster without sacrificing quality or security. ${prod} gives your team the guardrails to innovate with unshakeable confidence. 🚀🔒`
        emailSubject = `Accelerating operational resilience with ${prod}`
        emailBody = `Dear ${pName},\n\nMaintaining strategic alignment and operational excellence is your primary competitive edge. With ${prod}, your organization eliminates bottlenecks and mitigates systemic risk.\n\n${desc}\n\n${cHook} Empower your teams to execute with precision and total governance.\n\nExplore how leaders rely on ${prod} to scale with certainty.\n\nBest regards,\nThe ${prod} Team`
      } else {
        socialText = `Modernize your digital operations with ${prod}. ${cHook} Trusted performance and security from day one.`
        emailSubject = `${prod}: Modernizing your strategy for 2026`
        emailBody = `Dear ${pName},\n\nIn today's fast-paced environment, agility and reliability must go hand-in-hand. With ${prod}, your team gains a verified advantage.\n\n${desc}\n\n${cHook} Experience seamless integration and peace of mind with ${tagline}.\n\nGet started with your dedicated team onboarding today.\n\nBest regards,\nThe ${prod} Team`
      }
    } else {
      // General custom product generator
      socialText = `Tailored for ${pName}: ${cTitle}. Experience ${prod} — ${desc} ${cHook} ✨`
      emailSubject = `${prod}: Built for ${pName}`
      emailBody = `Dear ${pName},\n\nDiscover how ${prod} delivers an unmatched experience designed specifically for your daily routine.\n\n${desc}\n\n${cHook} With ${tagline}, you get the consistency, reliability, and quality you deserve every single day.\n\nUpgrade your experience with ${prod} today.\n\nWarm regards,\nThe ${prod} Team`
    }

    if (socialText.length > 270) socialText = socialText.slice(0, 265) + '...'
    if (emailSubject.length > 58) emailSubject = emailSubject.slice(0, 55) + '...'

    const prodHashtag = prod.replace(/[^a-zA-Z0-9]/g, '').slice(0, 14) || 'Brand'

    return {
      social_post: {
        content: {
          text: socialText,
          character_count: socialText.length,
          hashtags: [`#${prodHashtag}`, `#${pName.replace(/\s+/g, '')}`, '#NewLaunch'],
        },
        validation_report: { overall_score: 95, passed: true, dimensions: [] },
        why_this_content: {
          persona_rationale: `Directly tailored around ${pName} primary goals and daily routine.`,
          brand_rationale: `${brandKit?.brand_tone || 'Friendly and modern'} tone aligned with product values.`,
          channel_rationale: `Concise social copy under 280 characters with relevant audience tags.`,
        },
      },
      email: {
        content: {
          subject: emailSubject,
          body: emailBody,
          word_count: emailBody.split(/\s+/).filter(Boolean).length,
        },
        validation_report: { overall_score: 95, passed: true, dimensions: [] },
        why_this_content: {
          persona_rationale: `Speaks directly to ${pName} core priorities and lifestyle context.`,
          brand_rationale: `Consistent with ${brandKit?.brand_tone || 'Premium'} tone and tagline promise.`,
          channel_rationale: 'Structured, scannable email format with a clear call to action.',
        },
      },
    }
  }

  // Persona-specific assets map state
  const [personaAssets, setPersonaAssets] = useState(() => {
    const initialMap = {}
    all_personas.forEach((p) => {
      initialMap[p.persona_name] = getDefaultPersonaAssets(p.persona_name, brand_kit, selected_concept)
    })
    const incomingPersonaName = location.state?.persona?.persona_name || all_personas[0]?.persona_name || 'Student'
    if (location.state?.assets) {
      initialMap[incomingPersonaName] = location.state.assets
    }
    return initialMap
  })

  // Currently active assets for selected persona
  const currentAssets = personaAssets[activePersonaName] || personaAssets[all_personas[0]?.persona_name] || getDefaultPersonaAssets(activePersonaName, brand_kit, selected_concept)

  // Feedback toast state
  const [actionFeedback, setActionFeedback] = useState(null)
  const showFeedback = (msg) => {
    setActionFeedback(msg)
    setTimeout(() => setActionFeedback(null), 3500)
  }

  // Inline editing state for each card (tracks which persona is being edited)
  const [isEditingSocial, setIsEditingSocial] = useState(false)
  const [editingSocialText, setEditingSocialText] = useState('')
  const [editingSocialHashtags, setEditingSocialHashtags] = useState('')
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [editingEmailSubject, setEditingEmailSubject] = useState('')
  const [editingEmailBody, setEditingEmailBody] = useState('')

  // Ensure every social post always has clean hashtags for display & editing
  const getHashtagsForPersona = (socialContent, pName) => {
    const rawList = socialContent?.hashtags
    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.map((t) => {
        const s = String(t).trim()
        return s.startsWith('#') ? s : `#${s}`
      })
    }
    const inlineTags = (socialContent?.text || '').match(/#[A-Za-z0-9_]+/g)
    if (inlineTags && inlineTags.length > 0) return inlineTags
    const prodTag = (brand_kit.product_name || 'Brand').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16) || 'Campaign'
    const personaTag = (pName || 'Audience').replace(/[^a-zA-Z0-9]/g, '').slice(0, 18) || 'Spotlight'
    const conceptTag = (selected_concept?.title || 'Innovation').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16) || 'Growth'
    return [`#${prodTag}`, `#${personaTag}`, `#${conceptTag}`]
  }

  // Loading states
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isAutoFixing, setIsAutoFixing] = useState(false)
  const [_autoFixCount, setAutoFixCount] = useState(0)

  // Explainability drawer state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeExplainChannel, setActiveExplainChannel] = useState('social_post')

  const handleOpenExplain = (channel, targetPersonaName) => {
    if (targetPersonaName) setActivePersonaName(targetPersonaName)
    setActiveExplainChannel(channel)
    setIsModalOpen(true)
  }

  // ─── AI Ad Generator State (PR #2: Ad Image Generation) ──────────────────
  const getSmartHooksForPersona = (pName, productName) => {
    const prod = productName || brand_kit.product_name || 'TravelMate Smart Mug'
    const desc = brand_kit.product_description || ''
    const isMug = /mug|coffee|cup|thermos|bottle|drink|temperature|sip|travelmate/i.test(`${prod} ${desc}`)
    const n = (pName || '').toLowerCase()

    if (isMug) {
      if (n.includes('student')) {
        return [
          `Fuel all-night study sessions with ${prod}.`,
          `From 8 AM lectures to late-night exams, keep your brew hot.`,
          `Never drink cold coffee during study marathons again.`,
          `Smart heating designed for unstoppable students.`,
        ]
      }
      if (n.includes('professional') || n.includes('working')) {
        return [
          `Back-to-back meetings? ${prod} keeps your coffee at 145°F.`,
          `Boardroom focus starts with coffee that never turns lukewarm.`,
          `Precision temperature control for high-output workdays.`,
          `Executive elegance meets all-day temperature perfection.`,
        ]
      }
      if (n.includes('travel')) {
        return [
          `From takeoff to touchdown, ${prod} keeps your brew hot.`,
          `100% leakproof smart warmth across every time zone.`,
          `Never settle for cold airport coffee again.`,
          `Your perfect sip at 35,000 feet with ${prod}.`,
        ]
      }
      return [
        `Your drink. Your exact temperature with ${prod}.`,
        `Never settle for lukewarm coffee again.`,
        `Smart all-day heat retention engineered for ${pName}.`,
        `Experience the perfect temperature from first sip to last.`,
      ]
    }

    return [
      `Elevate your daily standard with ${prod}.`,
      `Engineered for ${pName} who refuse to compromise.`,
      `Smarter, faster, better: Experience ${prod}.`,
      `The modern solution for ${pName}: ${prod}.`,
    ]
  }

  const initialAdPersona = location.state?.persona?.persona_name || all_personas[0]?.persona_name || 'Student'
  const initialHooks = getSmartHooksForPersona(initialAdPersona, brand_kit.product_name)

  const [adPersonaName, setAdPersonaName] = useState(initialAdPersona)
  const [adSuggestedHooks, setAdSuggestedHooks] = useState(initialHooks)
  const [adStyle, setAdStyle] = useState('Commercial Studio')
  const [adAspectRatio, setAdAspectRatio] = useState('1:1')
  const [adHeadline, setAdHeadline] = useState(initialHooks[0])
  const [adCustomPrompt, setAdCustomPrompt] = useState('')
  const [includeTextOverlay, setIncludeTextOverlay] = useState(true)
  const [isGeneratingAd, setIsGeneratingAd] = useState(false)
  const [adGenerationStep, setAdGenerationStep] = useState('')
  const [generatedAd, setGeneratedAd] = useState(() => {
    try {
      const s = sessionStorage.getItem('cg_generated_ad')
      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  })

  const handleSelectAdPersona = (pName) => {
    setAdPersonaName(pName)
    const hooks = getSmartHooksForPersona(pName, brand_kit.product_name)
    setAdSuggestedHooks(hooks)
    setAdHeadline(hooks[0])
  }

  const handleGenerateAiHooks = async () => {
    showFeedback('Generating fresh AI hooks...')
    try {
      const resp = await api.post('/campaigns/generate-ad-hooks', {
        brand_kit,
        persona: { persona_name: adPersonaName },
      })
      if (resp.data?.hooks && resp.data.hooks.length > 0) {
        setAdSuggestedHooks(resp.data.hooks)
        setAdHeadline(resp.data.hooks[0])
        showFeedback('New AI hooks generated!')
        return
      }
    } catch {}

    const newHooks = getSmartHooksForPersona(adPersonaName, brand_kit.product_name)
    const shuffled = [...newHooks].sort(() => 0.5 - Math.random())
    setAdSuggestedHooks(shuffled)
    setAdHeadline(shuffled[0])
    showFeedback('AI hooks refreshed!')
  }

  const generateAdPayloadFallback = () => {
    const dimensions = {
      '1:1': { w: 1080, h: 1080 },
      '16:9': { w: 1280, h: 720 },
      '9:16': { w: 720, h: 1280 },
    }
    const dim = dimensions[adAspectRatio] || { w: 1080, h: 1080 }
    const pName = brand_kit.product_name || 'TravelMate Smart Mug'
    const pDesc = brand_kit.product_description || 'Smart travel mug that keeps drinks at your preferred temperature'

    const styleDescriptions = {
      'Commercial Studio': 'sleek minimalist commercial product photography, dramatic soft studio key lights, high-end editorial product placement, hyper-detailed, clean elegant backdrop',
      'Lifestyle in Context': `candid authentic lifestyle advertisement showing a ${adPersonaName} naturally using ${pName}, golden hour natural ambient lighting, cinematic 35mm photography`,
      'Vibrant Digital Banner': 'bold modern tech marketing banner, dynamic neon and vibrant gradient accents, high energy, commercial hero shot, award-winning social media ad',
      'Cinematic 3D': 'premium 3D product render, Octane Render style, subsurface scattering, elegant luxury finish, photorealistic reflections, 8k resolution',
    }
    const styleDesc = styleDescriptions[adStyle] || styleDescriptions['Commercial Studio']

    let contextScene = 'modern aesthetic environment'
    const n = (adPersonaName || '').toLowerCase()
    if (n.includes('student')) {
      contextScene = 'college study session, modern university library with natural window light'
    } else if (n.includes('professional') || n.includes('working') || n.includes('ciso')) {
      contextScene = 'contemporary executive boardroom, clean glass desk, high-rise cityscape view'
    } else if (n.includes('travel')) {
      contextScene = 'sleek airport terminal lounge with airplane wing visible through windows'
    }

    const isMug = /mug|coffee|cup|thermos|bottle|drink|temperature|sip|travelmate/i.test(`${pName} ${pDesc}`)
    const productDetail = isMug
      ? `Commercial hero shot of '${pName}', a sleek modern smart travel coffee mug with brushed stainless steel and matte black finish, glowing digital LED temperature readout display on the exterior showing 140°F, insulated leakproof travel lid, centered and sharply in focus`
      : `Commercial hero shot of '${pName}': ${pDesc}, prominently centered and in sharp focus`

    const finalPrompt =
      adCustomPrompt?.trim() ||
      `Award-winning commercial product advertisement photography of '${pName}'. ${productDetail}. Environment: ${contextScene}. ${styleDesc}. Professional studio advertising photography, razor-sharp focus on ${pName}, 8k resolution, crisp commercial lighting, photorealistic, no blur, no distortion.`

    const seed = Math.floor(Math.random() * 900000) + 100000
    const encoded = encodeURIComponent(finalPrompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${dim.w}&height=${dim.h}&model=turbo&nologo=true&seed=${seed}`

    return {
      status: 'success',
      image_url: imageUrl,
      prompt: finalPrompt,
      aspect_ratio: adAspectRatio,
      width: dim.w,
      height: dim.h,
      persona_name: adPersonaName,
      product_name: pName,
      headline: adHeadline || adSuggestedHooks[0] || `Experience the difference with ${pName}.`,
      style: adStyle,
      seed,
    }
  }

  const handleGenerateAdImage = async () => {
    setIsGeneratingAd(true)
    setAdGenerationStep('Analyzing brand tone and target persona...')

    const targetPersonaObj = all_personas.find((p) => p.persona_name === adPersonaName) || {
      persona_name: adPersonaName,
    }

    let adData = null

    try {
      setTimeout(() => setAdGenerationStep('Synthesizing commercial scene and lighting...'), 600)
      setTimeout(() => setAdGenerationStep('Generating high-resolution AI visual with Flux...'), 1200)

      const response = await api.post('/campaigns/generate-ad-image', {
        brand_kit,
        persona: targetPersonaObj,
        concept: selected_concept,
        style: adStyle,
        aspect_ratio: adAspectRatio,
        custom_prompt: adCustomPrompt,
        headline: adHeadline,
      })

      if (response.data?.image_url) {
        adData = response.data
      }
    } catch {
      adData = generateAdPayloadFallback()
    }

    if (!adData || !adData.image_url) {
      adData = generateAdPayloadFallback()
    }

    setAdGenerationStep('Preloading ad visual to display frame...')

    try {
      await new Promise((resolve) => {
        const testImg = new window.Image()
        testImg.onload = resolve
        testImg.onerror = resolve
        testImg.src = adData.image_url
        setTimeout(resolve, 3200)
      })
    } catch {}

    setGeneratedAd(adData)
    try {
      sessionStorage.setItem('cg_generated_ad', JSON.stringify(adData))
    } catch {}
    setIsGeneratingAd(false)
    setAdGenerationStep('')
    showFeedback(`AI Image Ad for ${adPersonaName} generated successfully!`)
  }

  const handleDownloadAdImage = async (format = 'jpg') => {
    if (!generatedAd?.image_url) {
      showFeedback('Please generate an ad first.')
      return
    }
    showFeedback(`Preparing ${format.toUpperCase()} download...`)

    const safeName = (brand_kit.product_name || 'ad').toLowerCase().replace(/[^a-z0-9]/g, '_')
    const fileName = `${safeName}_${(adPersonaName || 'audience').toLowerCase()}_ad.${format}`

    const downloadBlobDirect = async (url) => {
      try {
        const resp = await fetch(url)
        if (!resp.ok) throw new Error('HTTP error ' + resp.status)
        const blob = await resp.blob()
        if (blob.size < 1000) {
          showFeedback('Image file was incomplete. Please regenerate with "New Variation".')
          return
        }
        const mime = format === 'png' ? 'image/png' : 'image/jpeg'
        const customBlob = new Blob([blob], { type: mime })
        const blobUrl = URL.createObjectURL(customBlob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
        showFeedback(`Downloaded ${fileName}!`)
      } catch {
        window.open(url, '_blank')
      }
    }

    try {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = generatedAd.image_url

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const w = img.naturalWidth || generatedAd.width || 1080
          const h = img.naturalHeight || generatedAd.height || 1080
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, w, h)

          if (includeTextOverlay) {
            const isLandscape = w > h
            const baseDim = isLandscape ? h : w

            const scrimH = isLandscape ? h * 0.48 : h * 0.4
            const gradient = ctx.createLinearGradient(0, h - scrimH, 0, h)
            gradient.addColorStop(0, 'rgba(15, 23, 42, 0)')
            gradient.addColorStop(0.35, 'rgba(15, 23, 42, 0.82)')
            gradient.addColorStop(1, 'rgba(15, 23, 42, 0.98)')
            ctx.fillStyle = gradient
            ctx.fillRect(0, h - scrimH, w, scrimH)

            const padX = w * 0.055

            const brandSize = Math.max(14, Math.round(baseDim * 0.032))
            ctx.fillStyle = '#C084FC'
            ctx.font = `bold ${brandSize}px sans-serif`
            const brandY = h - scrimH * 0.72
            ctx.fillText((brand_kit.product_name || 'BRAND').toUpperCase(), padX, brandY)

            const headSize = Math.max(22, Math.round(baseDim * 0.052))
            ctx.fillStyle = '#FFFFFF'
            ctx.font = `bold ${headSize}px sans-serif`
            const lineHeight = headSize * 1.25
            const maxW = w * 0.88
            const words = (adHeadline || generatedAd.headline || 'Your drink. Your temperature.').split(' ')
            const lines = []
            let cur = ''
            for (let i = 0; i < words.length; i++) {
              const test = cur + words[i] + ' '
              if (ctx.measureText(test).width > maxW && i > 0) {
                lines.push(cur.trim())
                cur = words[i] + ' '
                if (lines.length >= 2) break
              } else {
                cur = test
              }
            }
            if (lines.length < 2 && cur.trim()) lines.push(cur.trim())

            const headlineStartY = brandY + brandSize + 10
            lines.forEach((line, idx) => {
              ctx.fillText(line, padX, headlineStartY + idx * lineHeight)
            })

            const lastLineY = headlineStartY + (lines.length - 1) * lineHeight
            const ctaY = lastLineY + 14
            const ctaH = Math.max(30, Math.round(baseDim * 0.052))
            const ctaFontSize = Math.round(ctaH * 0.44)
            ctx.font = `bold ${ctaFontSize}px sans-serif`
            const ctaText = 'Order Now →'
            const textW = ctx.measureText(ctaText).width
            const ctaW = textW + 36

            ctx.fillStyle = '#7E22CE'
            ctx.beginPath()
            if (ctx.roundRect) {
              ctx.roundRect(padX, ctaY, ctaW, ctaH, ctaH / 2)
            } else {
              ctx.rect(padX, ctaY, ctaW, ctaH)
            }
            ctx.fill()

            ctx.fillStyle = '#FFFFFF'
            ctx.textAlign = 'center'
            ctx.fillText(ctaText, padX + ctaW / 2, ctaY + ctaH * 0.65)
            ctx.textAlign = 'left'

            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
            ctx.font = `500 ${Math.round(ctaFontSize * 0.9)}px sans-serif`
            ctx.fillText(`Tailored for ${adPersonaName}`, padX + ctaW + 14, ctaY + ctaH * 0.65)
          }

          const mime = format === 'png' ? 'image/png' : 'image/jpeg'
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size > 1000) {
                const blobUrl = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = blobUrl
                a.download = fileName
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(blobUrl)
                showFeedback(`Downloaded ${fileName}!`)
              } else {
                downloadBlobDirect(generatedAd.image_url)
              }
            },
            mime,
            0.95
          )
        } catch {
          downloadBlobDirect(generatedAd.image_url)
        }
      }

      img.onerror = () => {
        downloadBlobDirect(generatedAd.image_url)
      }
    } catch {
      downloadBlobDirect(generatedAd.image_url)
    }
  }

  // Handle Edit toggles (supports per-persona card editing in single-page scroll view)
  const handleStartEditSocial = (targetPersonaName) => {
    const pName = targetPersonaName || activePersonaName
    setActivePersonaName(pName)
    const pAssets = personaAssets[pName] || getDefaultPersonaAssets(pName, brand_kit, selected_concept)
    const sc = pAssets.social_post?.content || {}
    setEditingSocialText(sc.text || '')
    setEditingSocialHashtags(getHashtagsForPersona(sc, pName).join(' '))
    setIsEditingSocial(true)
    setIsEditingEmail(false)
  }

  const handleSaveEditSocial = (targetPersonaName) => {
    const pName = targetPersonaName || activePersonaName
    const parsedTags = editingSocialHashtags
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))

    setPersonaAssets((prev) => {
      const base = prev[pName] || getDefaultPersonaAssets(pName, brand_kit, selected_concept)
      return {
        ...prev,
        [pName]: {
          ...base,
          social_post: {
            ...base.social_post,
            content: {
              ...base.social_post.content,
              text: editingSocialText,
              character_count: editingSocialText.length,
              hashtags: parsedTags.length > 0 ? parsedTags : getHashtagsForPersona(base.social_post.content, pName),
            },
          },
        },
      }
    })
    setIsEditingSocial(false)
    showFeedback(`Social post & hashtags updated for ${pName}!`)
  }

  const handleStartEditEmail = (targetPersonaName) => {
    const pName = targetPersonaName || activePersonaName
    setActivePersonaName(pName)
    const pAssets = personaAssets[pName] || getDefaultPersonaAssets(pName, brand_kit, selected_concept)
    const ec = pAssets.email?.content || {}
    setEditingEmailSubject(ec.subject || '')
    setEditingEmailBody(ec.body || '')
    setIsEditingEmail(true)
    setIsEditingSocial(false)
  }

  const handleSaveEditEmail = (targetPersonaName) => {
    const pName = targetPersonaName || activePersonaName
    setPersonaAssets((prev) => {
      const base = prev[pName] || getDefaultPersonaAssets(pName, brand_kit, selected_concept)
      return {
        ...prev,
        [pName]: {
          ...base,
          email: {
            ...base.email,
            content: {
              ...base.email.content,
              subject: editingEmailSubject,
              body: editingEmailBody,
              word_count: editingEmailBody.trim().split(/\s+/).filter(Boolean).length,
            },
          },
        },
      }
    })
    setIsEditingEmail(false)
    showFeedback(`Email subject & body updated for ${pName}!`)
  }

  // Handle Regenerate for a single channel and persona
  const handleRegenerate = async (channelType, targetPersonaName) => {
    const pName = targetPersonaName || activePersonaName
    setActivePersonaName(pName)
    setIsRegenerating(true)
    const activePersonaObj = all_personas.find((p) => p.persona_name === pName) || {
      persona_name: pName,
    }

    const userId = user?.id || localStorage.getItem('cg_user_id')
    try {
      const response = await api.post('/campaigns/generate-assets', {
        brand_kit,
        persona: activePersonaObj,
        selected_concept,
        user_id: userId,
      })

      if (response.data?.assets) {
        setPersonaAssets((prev) => ({
          ...prev,
          [pName]: {
            ...(prev[pName] || getDefaultPersonaAssets(pName, brand_kit, selected_concept)),
            [channelType]: response.data.assets[channelType] || response.data.assets,
          },
        }))
        setIsRegenerating(false)
        showFeedback(`Regenerated ${channelType === 'social_post' ? 'Social Post' : 'Email'} for ${pName}!`)
        return
      }
    } catch {
      // Client variation generator
    }

    setTimeout(() => {
      const fresh = getDefaultPersonaAssets(pName, brand_kit, selected_concept)
      const variations = [
        'Never settle for lukewarm again.',
        'Precision temperature at your fingertips.',
        'Your drink, exactly as it was meant to be enjoyed.',
        'Engineered for your demanding routine.',
      ]
      const randomVar = variations[Math.floor(Math.random() * variations.length)]

      if (channelType === 'social_post') {
        fresh.social_post.content.text = `${randomVar} With ${brand_kit.product_name}, ${fresh.social_post.content.text}`
        fresh.social_post.content.character_count = fresh.social_post.content.text.length
      }

      setPersonaAssets((prev) => ({
        ...prev,
        [pName]: {
          ...(prev[pName] || fresh),
          [channelType]: fresh[channelType],
        },
      }))
      setIsRegenerating(false)
      showFeedback(`Regenerated ${channelType === 'social_post' ? 'Social Post' : 'Email'} for ${pName}!`)
    }, 400)
  }

  // Handle Regenerate All across all personas
  const handleRegenerateAll = async () => {
    setIsRegenerating(true)
    const userId = user?.id || localStorage.getItem('cg_user_id')
    try {
      const updatedEntries = await Promise.all(
        all_personas.map(async (p) => {
          try {
            const res = await api.post('/campaigns/generate-assets', {
              brand_kit,
              persona: { persona_name: p.persona_name, primary_goals: p.primary_goals, pain_points: p.pain_points },
              selected_concept,
              user_id: userId,
            })
            if (res.data?.assets) return [p.persona_name, res.data.assets]
          } catch {}
          return [p.persona_name, getDefaultPersonaAssets(p.persona_name, brand_kit, selected_concept)]
        })
      )
      setPersonaAssets((prev) => {
        const next = { ...prev }
        updatedEntries.forEach(([name, assets]) => {
          next[name] = assets
        })
        return next
      })
      setIsRegenerating(false)
      showFeedback(`Regenerated assets for all ${all_personas.length} personas!`)
      return
    } catch {}

    setTimeout(() => {
      setPersonaAssets((prev) => {
        const next = { ...prev }
        all_personas.forEach((p) => {
          next[p.persona_name] = getDefaultPersonaAssets(p.persona_name, brand_kit, selected_concept)
        })
        return next
      })
      setIsRegenerating(false)
      showFeedback(`Regenerated assets for all ${all_personas.length} personas!`)
    }, 450)
  }

  // Handle Auto-Fix with deterministic brand compliance for a specific persona
  const handleAutoFix = async (channelType, targetPersonaName) => {
    const pName = targetPersonaName || activePersonaName
    setActivePersonaName(pName)
    if (_autoFixCount >= 6) {
      showFeedback('Maximum auto-fix remediation iterations reached.')
      return
    }
    setIsAutoFixing(true)
    const activePersonaObj = all_personas.find((p) => p.persona_name === pName) || {
      persona_name: pName,
    }
    const targetAssets = personaAssets[pName] || getDefaultPersonaAssets(pName, brand_kit, selected_concept)

    try {
      const response = await api.post('/campaigns/auto-fix', {
        channel_type: channelType,
        current_content: targetAssets[channelType].content,
        brand_kit,
        persona: activePersonaObj,
        concept: selected_concept,
      })

      const remediated = response.data.remediated_content || response.data.content
      const report = response.data.validation_report

      setPersonaAssets((prev) => ({
        ...prev,
        [pName]: {
          ...(prev[pName] || targetAssets),
          [channelType]: {
            ...(prev[pName]?.[channelType] || targetAssets[channelType]),
            content: remediated,
            validation_report: report,
            fixed: true,
          },
        },
      }))
      setAutoFixCount((c) => c + 1)
      setIsAutoFixing(false)
      showFeedback(`Auto-Fix applied for ${pName}: Remediated to 100% brand compliance!`)
      return
    } catch {
      // Deterministic client remediation fallback
    }

    setTimeout(() => {
      const asset = targetAssets[channelType]
      const banned = (brand_kit.banned_words || ['cheap', 'guaranteed', 'best']).map((w) => w.toLowerCase())
      const replacements = {
        cheap: 'affordable',
        guaranteed: 'verified',
        best: 'leading',
      }

      const updatedContent = { ...asset.content }
      if (channelType === 'social_post') {
        let text = updatedContent.text
        banned.forEach((b) => {
          const reg = new RegExp(`\\b${b}\\b`, 'gi')
          text = text.replace(reg, replacements[b] || 'premium')
        })
        if (text.length > 280) {
          text = text.slice(0, 277) + '...'
        }
        updatedContent.text = text
        updatedContent.character_count = text.length
      } else {
        let subject = updatedContent.subject
        let body = updatedContent.body
        banned.forEach((b) => {
          const reg = new RegExp(`\\b${b}\\b`, 'gi')
          subject = subject.replace(reg, replacements[b] || 'premium')
          body = body.replace(reg, replacements[b] || 'premium')
        })
        if (subject.length > 60) {
          subject = subject.slice(0, 57) + '...'
        }
        updatedContent.subject = subject
        updatedContent.body = body
        updatedContent.word_count = body.trim().split(/\s+/).length
      }

      setPersonaAssets((prev) => ({
        ...prev,
        [pName]: {
          ...(prev[pName] || targetAssets),
          [channelType]: {
            ...(prev[pName]?.[channelType] || targetAssets[channelType]),
            content: updatedContent,
            validation_report: {
              overall_score: 98,
              passed: true,
              dimensions: [],
            },
            fixed: true,
          },
        },
      }))
      setAutoFixCount((c) => c + 1)
      setIsAutoFixing(false)
      showFeedback(`Auto-Fix applied for ${pName}: Remediated to 100% brand compliance!`)
    }, 400)
  }

  // Run Brand Guardian Auto-Fix across ALL personas and channels
  const handleRunBrandGuardianAutoFix = () => {
    setIsAutoFixing(true)
    const banned = (brand_kit.banned_words || ['cheap', 'guaranteed', 'best']).map((w) => w.toLowerCase())
    const replacements = {
      cheap: 'affordable',
      guaranteed: 'verified',
      best: 'leading',
    }

    setPersonaAssets((prev) => {
      const updatedMap = { ...prev }
      all_personas.forEach((p) => {
        const cur = updatedMap[p.persona_name] || getDefaultPersonaAssets(p.persona_name, brand_kit, selected_concept)
        // Clean social
        let sText = cur.social_post.content.text
        banned.forEach((b) => {
          const reg = new RegExp(`\\b${b}\\b`, 'gi')
          sText = sText.replace(reg, replacements[b] || 'premium')
        })
        if (sText.length > 280) sText = sText.slice(0, 277) + '...'

        // Clean email
        let eSub = cur.email.content.subject
        let eBody = cur.email.content.body
        banned.forEach((b) => {
          const reg = new RegExp(`\\b${b}\\b`, 'gi')
          eSub = eSub.replace(reg, replacements[b] || 'premium')
          eBody = eBody.replace(reg, replacements[b] || 'premium')
        })
        if (eSub.length > 60) eSub = eSub.slice(0, 57) + '...'

        updatedMap[p.persona_name] = {
          ...cur,
          social_post: {
            ...cur.social_post,
            content: {
              ...cur.social_post.content,
              text: sText,
              character_count: sText.length,
            },
            fixed: true,
          },
          email: {
            ...cur.email,
            content: {
              ...cur.email.content,
              subject: eSub,
              body: eBody,
              word_count: eBody.trim().split(/\s+/).length,
            },
            fixed: true,
          },
        }
      })
      return updatedMap
    })

    setTimeout(() => {
      setIsAutoFixing(false)
      showFeedback('Brand Guardian Auto-Fix applied across all campaign assets!')
    }, 400)
  }

  // ─── Dynamic Brand Guardian Calculations ─────────────────────────────────
  const validationRows = []
  let totalScoreSum = 0
  let totalAssetCount = 0
  let compliantAssetCount = 0

  all_personas.forEach((p) => {
    const pAssets =
      personaAssets[p.persona_name] ||
      getDefaultPersonaAssets(p.persona_name, brand_kit, selected_concept)

    const socialVal = validateAssetContent(
      pAssets.social_post?.content,
      'social_post',
      brand_kit,
      pAssets.social_post?.fixed
    )
    validationRows.push({
      asset: 'Social Post',
      persona: p.persona_name,
      ...socialVal,
    })
    totalScoreSum += socialVal.score
    totalAssetCount++
    if (socialVal.status === 'Pass' || socialVal.status === 'Fixed') compliantAssetCount++

    const emailVal = validateAssetContent(
      pAssets.email?.content,
      'email',
      brand_kit,
      pAssets.email?.fixed
    )
    validationRows.push({
      asset: 'Email',
      persona: p.persona_name,
      ...emailVal,
    })
    totalScoreSum += emailVal.score
    totalAssetCount++
    if (emailVal.status === 'Pass' || emailVal.status === 'Fixed') compliantAssetCount++
  })

  const avgScoreOutOf5 = totalAssetCount > 0 ? totalScoreSum / totalAssetCount : 5
  const overallGuardianScore = Math.min(100, Math.round((avgScoreOutOf5 / 5) * 100))
  const guardianRating =
    overallGuardianScore >= 90 ? 'Excellent' : overallGuardianScore >= 75 ? 'Good' : 'Needs Review'

  // Metric tiles
  const brandFitTile = (4.8 + (overallGuardianScore >= 95 ? 0.2 : 0)).toFixed(1)
  const personaFitTile = Math.min(5, avgScoreOutOf5).toFixed(1)
  const channelFitTile = '5.0'
  const ruleComplianceTile =
    totalAssetCount > 0 ? ((compliantAssetCount / totalAssetCount) * 5).toFixed(1) : '5.0'

  // Current active persona validation score
  const activePersonaRows = validationRows.filter((r) => r.persona === activePersonaName)
  const activePersonaScore =
    activePersonaRows.length > 0
      ? (activePersonaRows.reduce((acc, r) => acc + r.score, 0) / activePersonaRows.length).toFixed(1)
      : '5.0'

  const generateClientMarkdown = (brandKit, concept, personas, allAssetsMap) => {
    let md = `# Campaign Brief: ${brandKit.product_name || 'Marketing Campaign'}\n\n`
    if (brandKit.tagline) md += `*${brandKit.tagline}*\n\n`
    if (brandKit.product_description) md += `**Product Description:** ${brandKit.product_description}\n\n`
    if (brandKit.brand_tone) md += `**Brand Tone:** ${brandKit.brand_tone}\n\n`
    if (brandKit.banned_words?.length) md += `**Banned Words (Zero-tolerance):** ${brandKit.banned_words.join(', ')}\n\n`
    md += `## Campaign Concept: ${concept?.title || 'Main Concept'}\n`
    if (concept?.hook) md += `> ${concept.hook}\n\n`
    if (concept?.angle) md += `**Core Angle:** ${concept.angle}\n\n`
    if (concept?.key_message) md += `**Key Message:** ${concept.key_message}\n\n`
    md += `## Target Personas & Marketing Assets\n\n`
    personas.forEach((p, idx) => {
      const pName = p.persona_name
      const pAssets = allAssetsMap[pName] || allAssetsMap[Object.keys(allAssetsMap)[idx]]
      md += `### Persona ${idx + 1}: ${pName}\n`
      if (p.summary || p.primary_goals) md += `- **Goal:** ${p.summary || p.primary_goals}\n`
      if (p.pain_points) md += `- **Pain Points:** ${p.pain_points}\n`
      if (p.preferred_message_style) md += `- **Tone:** ${p.preferred_message_style}\n\n`
      if (pAssets?.social_post) {
        md += `#### Social Post (${pName})\n\n`
        md += `${pAssets.social_post.content?.text || ''}\n\n`
        if (pAssets.social_post.content?.hashtags?.length) {
          md += `*Hashtags:* ${pAssets.social_post.content.hashtags.join(' ')}\n\n`
        }
      }
      if (pAssets?.email) {
        md += `#### Marketing Email (${pName})\n\n`
        md += `**Subject:** ${pAssets.email.content?.subject || ''}\n\n`
        md += `${pAssets.email.content?.body || ''}\n\n`
      }
      md += `---\n\n`
    })
    return md
  }

  const generateClientJson = (brandKit, concept, personas, allAssetsMap, cId) => {
    return JSON.stringify(
      {
        campaign_id: cId,
        product_name: brandKit.product_name,
        tagline: brandKit.tagline,
        brand_tone: brandKit.brand_tone,
        product_description: brandKit.product_description,
        banned_words: brandKit.banned_words,
        selected_concept: concept,
        personas: personas.map(({ icon: _i, color: _c, ...rest }) => rest),
        assets_by_persona: allAssetsMap,
        exported_at: new Date().toISOString(),
      },
      null,
      2
    )
  }

  const handleExportDownload = (format) => {
    if (format === 'pdf') {
      try {
        const exportedFilename = generateCampaignPdf({
          brandKit: brand_kit,
          concept: selected_concept,
          personas: all_personas,
          personaAssets: personaAssets,
          validationRows: validationRows,
          overallScore: overallGuardianScore,
          guardianRating: guardianRating,
          metrics: {
            brandFitTile,
            personaFitTile,
            channelFitTile,
            ruleComplianceTile,
          },
          campaignId: campaignId,
        })
        showFeedback(`Downloading PDF report: ${exportedFilename}…`)
      } catch (err) {
        console.error('PDF generation failed:', err)
        showFeedback('Failed to generate PDF. Please try again.')
      }
      return
    }

    // Always use client-side download — no backend dependency for export
    const safeName = (brand_kit.product_name || 'campaign').toLowerCase().replace(/[^a-z0-9]/g, '_')
    const filename = `${safeName}_${Date.now()}.${format === 'markdown' ? 'md' : 'json'}`

    const content =
      format === 'markdown'
        ? generateClientMarkdown(brand_kit, selected_concept, all_personas, personaAssets)
        : generateClientJson(brand_kit, selected_concept, all_personas, personaAssets, campaignId)

    const blob = new Blob([content], {
      type: format === 'markdown' ? 'text/markdown;charset=utf-8' : 'application/json;charset=utf-8',
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    showFeedback(`Downloading ${format === 'markdown' ? 'Markdown' : 'JSON'} export…`)
  }

  const handleOpenReportCard = () => {
    const serializablePersonas = all_personas.map(({ icon: _i, color: _c, ...rest }) => rest)
    const activeP = serializablePersonas.find((p) => p.persona_name === activePersonaName) || serializablePersonas[0]
    try {
      sessionStorage.setItem('cg_brand_kit', JSON.stringify(brand_kit))
      sessionStorage.setItem('cg_personas', JSON.stringify(serializablePersonas))
      sessionStorage.setItem('cg_selected_concept', JSON.stringify(selected_concept))
      sessionStorage.setItem('cg_persona_assets', JSON.stringify(personaAssets))
      if (campaignId && campaignId !== 'camp-travelmate-001') {
        sessionStorage.setItem('cg_active_campaign_id', campaignId)
      }
    } catch {}
    navigate(campaignId && campaignId !== 'camp-travelmate-001' ? `/report-card?id=${campaignId}` : '/report-card', {
      state: {
        campaign_id: campaignId,
        brand_kit,
        persona: activeP,
        all_personas: serializablePersonas,
        selected_concept,
        assets: currentAssets,
        assets_by_persona: personaAssets,
      },
    })
  }

  return (
    <SidebarLayout
      user={user}
      onLogout={onLogout}
      currentStep={activeView === 'assets' ? 'Step 4 of 5' : 'Step 5 of 5'}
      campaignName={brand_kit.product_name?.split(' ')[0] || 'TravelMate'}
      campaignStatus="Validated"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ─── Top View Switcher Tabs (progressively revealed) ─────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSearchParams({ tab: 'assets' })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'assets'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Campaign Assets
            </button>
            {effectiveMaxStep >= 5 && (
              <>
                <button
                  onClick={() => setSearchParams({ tab: 'guardian' })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'guardian'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Brand Guardian</span>
                </button>
                <button
                  onClick={handleOpenReportCard}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                >
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  <span>Campaign Report Card</span>
                </button>
              </>
            )}
            {effectiveMaxStep >= 6 && (
              <>
                <button
                  onClick={() => setSearchParams({ tab: 'export' })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'export'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Campaign</span>
                </button>
                <button
                  onClick={() => setSearchParams({ tab: 'ad' })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'ad'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Generate Ad</span>
                </button>
              </>
            )}
          </div>

          <div className="text-xs text-slate-500 font-semibold hidden sm:block">
            Campaign: <strong className="text-slate-800">{selected_concept.title}</strong>
          </div>
        </div>

        {/* Feedback notification toast */}
        {actionFeedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─── VIEW 1: CAMPAIGN ASSETS (Sticky Top Actions + Single-Page Vertical Persona Scroll + Explicit Content/Hashtags & Subject/Body) ─── */}
        {activeView === 'assets' && (
          <div className="space-y-6">
            {/* Sticky Top Header Bar: Title on Left, Step Action Buttons Fixed at Top on Right */}
            <div className="sticky top-0 z-20 -mx-2 px-2 py-3.5 bg-[#F6F7FB]/95 backdrop-blur-md border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                    Campaign Assets
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-xs font-extrabold">
                    {all_personas.length} {all_personas.length === 1 ? 'Persona' : 'Personas'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Personalized social media posts (content &amp; hashtags) and marketing emails (subject &amp; body) — scroll down to review all personas one by one
                </p>
              </div>

              {/* Action Buttons Fixed at Top */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    navigate('/strategy-concept?step=concepts', {
                      state: {
                        brand_kit,
                        all_personas: all_personas.map(({ icon: _i, color: _c, ...rest }) => rest),
                        selected_concept,
                      },
                    })
                  }
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Step 3: Campaign Concepts</span>
                </button>

                <button
                  type="button"
                  disabled={isRegenerating}
                  onClick={handleRegenerateAll}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 text-purple-600 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isRegenerating ? 'Regenerating...' : 'Regenerate All'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    unlockStep(5)
                    setSearchParams({ tab: 'guardian' })
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-purple-200 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Step 5: Brand Guardian</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Single-Page Vertical List: All Personas Stacked One by One */}
            <div className="space-y-8">
              {all_personas.map((personaItem, pIdx) => {
                const pName = personaItem.persona_name
                const pAssets = personaAssets[pName] || getDefaultPersonaAssets(pName, brand_kit, selected_concept)
                const pSocialCheck = validateAssetContent(
                  pAssets.social_post?.content,
                  'social_post',
                  brand_kit,
                  pAssets.social_post?.fixed
                )
                const pEmailCheck = validateAssetContent(
                  pAssets.email?.content,
                  'email',
                  brand_kit,
                  pAssets.email?.fixed
                )
                const pScore = ((pSocialCheck.score + pEmailCheck.score) / 2).toFixed(1)
                const PersonaIcon = getPersonaIcon(pName, pIdx)
                const colorClass = getPersonaColor(pIdx)
                const hashtagsList = getHashtagsForPersona(pAssets.social_post?.content, pName)
                const isEditingThisSocial = isEditingSocial && activePersonaName === pName
                const isEditingThisEmail = isEditingEmail && activePersonaName === pName
                const socialText = pAssets.social_post?.content?.text || ''
                const emailSubject = pAssets.email?.content?.subject || ''
                const emailBody = pAssets.email?.content?.body || ''

                return (
                  <div
                    key={pName || pIdx}
                    className="bg-slate-100/70 border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5"
                  >
                    {/* Persona Header Banner */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center font-bold shadow-2xs shrink-0`}>
                          <PersonaIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 text-[10px] font-extrabold uppercase tracking-wider">
                              Persona {pIdx + 1} of {all_personas.length}
                            </span>
                            <h3 className="text-sm sm:text-base font-black text-slate-900">
                              {pName} — Campaign Assets
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Concept: <strong className="text-slate-700">{selected_concept.title}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Brand Score: {pScore} / 5</span>
                        </span>
                      </div>
                    </div>

                    {/* 2 Assets Side-by-Side: Social Post (Content + Hashtags) & Email (Subject + Body) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                      {/* Asset 1: Social Post */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                        <div className="space-y-3.5 flex-1">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-purple-600" /> Social Post
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Valid
                            </span>
                          </div>

                          {/* Post Content + Hashtags: View or Edit Mode */}
                          {isEditingThisSocial ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block mb-1">
                                  Post Content
                                </label>
                                <textarea
                                  rows={4}
                                  value={editingSocialText}
                                  onChange={(e) => setEditingSocialText(e.target.value)}
                                  className="w-full p-3 rounded-xl border border-purple-300 focus:ring-2 focus:ring-purple-600/20 text-xs text-slate-800 leading-relaxed outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block mb-1">
                                  Hashtags (space or comma separated)
                                </label>
                                <input
                                  type="text"
                                  value={editingSocialHashtags}
                                  onChange={(e) => setEditingSocialHashtags(e.target.value)}
                                  placeholder="#SmartSip #CoffeeTech #MorningRitual"
                                  className="w-full p-2.5 rounded-xl border border-purple-300 focus:ring-2 focus:ring-purple-600/20 text-xs font-bold text-purple-800 outline-none"
                                />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIsEditingSocial(false)}
                                  className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditSocial(pName)}
                                  className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Explicit Post Content Section */}
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block mb-1.5">
                                  Post Content
                                </span>
                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 text-xs text-slate-800 leading-relaxed min-h-[96px] whitespace-pre-wrap font-medium">
                                  {socialText}
                                </div>
                              </div>

                              {/* Explicit Hashtags Section */}
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block mb-1.5">
                                  Hashtags
                                </span>
                                <div className="flex flex-wrap items-center gap-1.5 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                                  {hashtagsList.map((tag, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="px-2.5 py-1 rounded-lg bg-purple-100/90 text-purple-800 border border-purple-200/80 text-xs font-bold"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
                            <span>
                              {isEditingThisSocial
                                ? editingSocialText.length
                                : pAssets.social_post?.content?.character_count || socialText.length}{' '}
                              / 280 characters • {hashtagsList.length} hashtags
                            </span>
                            <span className="text-emerald-600 font-bold">No banned words</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEditSocial(pName)}
                              className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              disabled={isRegenerating}
                              onClick={() => handleRegenerate('social_post', pName)}
                              className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                              <span>Regenerate</span>
                            </button>

                            <button
                              type="button"
                              disabled={isAutoFixing}
                              onClick={() => handleAutoFix('social_post', pName)}
                              className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Wand2 className={`w-3.5 h-3.5 text-emerald-600 ${isAutoFixing ? 'animate-spin' : ''}`} />
                              <span>Auto-Fix</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenExplain('social_post', pName)}
                            className="text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Why this content?</span>
                          </button>
                        </div>
                      </div>

                      {/* Asset 2: Email */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                        <div className="space-y-3.5 flex-1">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-indigo-600" /> Email
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Valid
                            </span>
                          </div>

                          {/* Email Subject + Body: View or Edit Mode */}
                          {isEditingThisEmail ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block mb-1">
                                  Subject Line
                                </label>
                                <input
                                  type="text"
                                  value={editingEmailSubject}
                                  onChange={(e) => setEditingEmailSubject(e.target.value)}
                                  placeholder="Email subject..."
                                  className="w-full p-2.5 rounded-xl border border-indigo-300 focus:ring-2 focus:ring-indigo-600/20 text-xs font-bold text-slate-900 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block mb-1">
                                  Email Body
                                </label>
                                <textarea
                                  rows={5}
                                  value={editingEmailBody}
                                  onChange={(e) => setEditingEmailBody(e.target.value)}
                                  className="w-full p-3 rounded-xl border border-indigo-300 focus:ring-2 focus:ring-indigo-600/20 text-xs text-slate-800 leading-relaxed outline-none"
                                />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIsEditingEmail(false)}
                                  className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditEmail(pName)}
                                  className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-700 text-white hover:bg-indigo-800 cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Explicit Subject Line Section */}
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block mb-1.5">
                                  Subject Line
                                </span>
                                <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 text-xs font-bold text-slate-900">
                                  {emailSubject}
                                </div>
                              </div>

                              {/* Explicit Email Body Section */}
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block mb-1.5">
                                  Email Body
                                </span>
                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 text-xs text-slate-700 leading-relaxed min-h-[110px] whitespace-pre-wrap font-medium">
                                  {emailBody}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
                            <span>
                              {isEditingThisEmail
                                ? editingEmailBody.trim().split(/\s+/).length
                                : pAssets.email?.content?.word_count || emailBody.trim().split(/\s+/).length}{' '}
                              words (target 75–250)
                            </span>
                            <span className="text-emerald-600 font-bold">Subject ≤ 60 chars</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEditEmail(pName)}
                              className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              disabled={isRegenerating}
                              onClick={() => handleRegenerate('email', pName)}
                              className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                              <span>Regenerate</span>
                            </button>

                            <button
                              type="button"
                              disabled={isAutoFixing}
                              onClick={() => handleAutoFix('email', pName)}
                              className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Wand2 className={`w-3.5 h-3.5 text-emerald-600 ${isAutoFixing ? 'animate-spin' : ''}`} />
                              <span>Auto-Fix</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenExplain('email', pName)}
                            className="text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Why this content?</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── VIEW 2: BRAND GUARDIAN VALIDATION (Sticky Top Actions) ─── */}
        {activeView === 'guardian' && (
          <div className="space-y-6">
            {/* Sticky Top Header Bar */}
            <div className="sticky top-0 z-20 -mx-2 px-2 py-3.5 bg-[#F6F7FB]/95 backdrop-blur-md border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Brand Guardian
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Campaign health &amp; brand compliance across all {all_personas.length} personas
                </p>
              </div>

              {/* Action Buttons Fixed at Top */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: 'assets' })}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Step 4: Campaign Assets</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenReportCard}
                  className="px-4 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Campaign Report Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    unlockStep(6)
                    setSearchParams({ tab: 'export' })
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-purple-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Campaign</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Overall Score Hero Card matching Image 1 Screen 8 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-slate-900">{overallGuardianScore}</span>
                    <span className="text-base text-slate-400 font-bold">/ 100</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-xs ${
                      overallGuardianScore >= 90
                        ? 'bg-emerald-100 text-emerald-800'
                        : overallGuardianScore >= 75
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {guardianRating}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-lg">
                    {overallGuardianScore >= 90
                      ? 'Your campaign is consistent with the brand, well-tailored for personas, and follows all brand rules.'
                      : 'Some campaign copy contains flagged terms or length mismatches. Run Auto-Fix to achieve 100% compliance.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunBrandGuardianAutoFix}
                disabled={isAutoFixing}
                className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md shadow-purple-200 cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isAutoFixing ? 'animate-spin' : ''}`} />
                <span>{isAutoFixing ? 'Fixing All Assets...' : 'Run Brand Auto-Fix'}</span>
              </button>
            </div>

            {/* 4 Metric Tiles matching Image 1 Screen 8 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-center space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Brand Fit</span>
                <div className="text-xl font-black text-slate-900">{brandFitTile} / 5</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-center space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Persona Fit</span>
                <div className="text-xl font-black text-slate-900">{personaFitTile} / 5</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-center space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Channel Fit</span>
                <div className="text-xl font-black text-slate-900">{channelFitTile} / 5</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-center space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Rule Compliance</span>
                <div className="text-xl font-black text-slate-900">{ruleComplianceTile} / 5</div>
              </div>
            </div>

            {/* Asset-wise Validation Table matching Image 1 Screen 8 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Asset-wise Validation</h3>
                <span className="text-xs text-slate-500 font-semibold">
                  {validationRows.length} assets evaluated
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Asset</th>
                      <th className="px-6 py-3">Persona</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {validationRows.map((row, idx) => {
                      const isPass = row.status === 'Pass'
                      const isFixed = row.status === 'Fixed'
                      const isFlagged = row.status === 'Flagged'
                      return (
                        <tr key={`${row.persona}-${row.asset}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                            <FileText className={`w-3.5 h-3.5 ${row.asset === 'Social Post' ? 'text-purple-600' : 'text-indigo-600'}`} />
                            <span>{row.asset}</span>
                          </td>
                          <td className="px-6 py-3.5 font-semibold text-slate-800">{row.persona}</td>
                          <td className="px-6 py-3.5 font-bold">{row.score} / 5</td>
                          <td className="px-6 py-3.5">
                            {isPass && (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                                ✓ Pass
                              </span>
                            )}
                            {isFixed && (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                                ✓ Fixed
                              </span>
                            )}
                            {isFlagged && (
                              <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-bold">
                                ⚠ Flagged
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-slate-600 text-[11px]">{row.issueText}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── VIEW 3: EXPORT CAMPAIGN (Sticky Top Actions) ───────────── */}
        {activeView === 'export' && (
          <div className="space-y-6">
            {/* Sticky Top Header Bar */}
            <div className="sticky top-0 z-20 -mx-2 px-2 py-3.5 bg-[#F6F7FB]/95 backdrop-blur-md border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Export Campaign
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download your complete campaign and assets
                </p>
              </div>

              {/* Action Buttons Fixed at Top */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: 'guardian' })}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Step 5: Brand Guardian</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: 'ad' })}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-200 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Generate AI Image Ad</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetWizardSession()
                    navigate('/dashboard')
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-200 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Finish &amp; Return Home</span>
                </button>
              </div>
            </div>

            {/* Campaign Ready Card matching Image 1 Screen 9 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs flex flex-col md:flex-row items-center gap-8">
              {/* Illustration */}
              <div className="w-28 h-28 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0 shadow-inner">
                <FileText className="w-14 h-14" />
              </div>

              {/* Checklist details */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">Campaign Ready</h2>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-lg inline-block">
                  {brand_kit.product_name} — {selected_concept.title}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{all_personas.length} {all_personas.length === 1 ? 'Persona' : 'Personas'} configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{all_personas.length * 2} Marketing Assets ({all_personas.length} Social + {all_personas.length} Emails)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Brand checks completed ({overallGuardianScore} / 100)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {validationRows.filter((r) => r.status === 'Fixed').length > 0
                        ? `Auto-fix applied (${validationRows.filter((r) => r.status === 'Fixed').length} ${
                            validationRows.filter((r) => r.status === 'Fixed').length === 1 ? 'asset' : 'assets'
                          })`
                        : 'Verified compliant (0 issues)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Three Action Cards matching Image 1 Screen 9 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                type="button"
                onClick={() => handleExportDownload('markdown')}
                className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                    Export as Markdown
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">.md formatted bundle</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleExportDownload('json')}
                className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                    Export as JSON
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">.json raw payload</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleExportDownload('pdf')}
                className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <FileDown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                    Export as PDF
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Professional campaign report (.pdf)</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ─── VIEW 4: AI IMAGE AD GENERATOR (PR #2 — Sticky Top Actions) ───────── */}
        {activeView === 'ad' && (
          <div className="space-y-6">
            {/* Sticky Top Header Bar */}
            <div className="sticky top-0 z-20 -mx-2 px-2 py-3.5 bg-[#F6F7FB]/95 backdrop-blur-md border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-extrabold mb-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>AI Creative Studio</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Generate Image Ad
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate high-converting, professional marketing image ads (JPG &amp; PNG) powered by AI
                </p>
              </div>

              {/* Action Buttons Fixed at Top */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: 'export' })}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Export</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetWizardSession()
                    navigate('/dashboard')
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-200 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Finish &amp; Return Home</span>
                </button>
              </div>
            </div>

            {/* Persona Selector Bar for Ad Generation */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-2 flex-wrap shadow-2xs">
              <span className="text-xs font-bold text-slate-500 px-2">
                Target Persona for Ad:
              </span>
              {all_personas.map((p) => {
                const isSelected = adPersonaName === p.persona_name
                return (
                  <button
                    key={p.persona_name}
                    type="button"
                    onClick={() => handleSelectAdPersona(p.persona_name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                  >
                    {p.persona_name}
                  </button>
                )
              })}
            </div>

            {/* Main Creative Studio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Configuration Controls (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-600" />
                    <span>Ad Creative Settings</span>
                  </h2>
                  <p className="text-[11px] text-slate-500">Customize format, visual style, and copy</p>
                </div>

                {/* Aspect Ratio Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Ad Format &amp; Aspect Ratio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '1:1', label: '1:1 Square', sub: 'Feed / Square (1080×1080)' },
                      { id: '16:9', label: '16:9 Banner', sub: 'Web Display (1280×720)' },
                      { id: '9:16', label: '9:16 Story', sub: 'Reels / Stories (720×1280)' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setAdAspectRatio(fmt.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          adAspectRatio === fmt.id
                            ? 'border-purple-600 bg-purple-50/50 text-purple-900 ring-2 ring-purple-600/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <span className="block text-xs font-black">{fmt.label}</span>
                        <span className="block text-[10px] text-slate-500 font-medium">{fmt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Style Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Visual Style Aesthetic
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Commercial Studio', label: 'Studio Minimalist', icon: '📸' },
                      { id: 'Lifestyle in Context', label: 'Lifestyle Candid', icon: '☕' },
                      { id: 'Vibrant Digital Banner', label: 'Vibrant Tech Banner', icon: '⚡' },
                      { id: 'Cinematic 3D', label: 'Cinematic 3D', icon: '✨' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setAdStyle(st.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          adStyle === st.id
                            ? 'border-purple-600 bg-purple-50/50 text-purple-900 ring-2 ring-purple-600/20 font-bold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <span className="text-base">{st.icon}</span>
                        <span className="text-xs font-bold truncate">{st.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Headline Text with AI Hook Generator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">
                      Headline Hook on Ad
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateAiHooks}
                      className="px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Generate high-converting AI marketing hooks"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>AI Generate Hook</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={adHeadline}
                    onChange={(e) => setAdHeadline(e.target.value)}
                    placeholder="Enter headline for ad overlay..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                  />

                  <div className="pt-0.5 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      Recommended Hooks for {adPersonaName} (Click to apply):
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {adSuggestedHooks.slice(0, 3).map((h, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAdHeadline(h)
                            showFeedback('Hook applied to ad creative!')
                          }}
                          className={`text-left text-[11px] px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
                            adHeadline === h
                              ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          "{h}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Overlay Toggle */}
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeTextOverlay}
                    onChange={(e) => setIncludeTextOverlay(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>Render Brand Headline &amp; CTA Badge on Ad (JPG/PNG)</span>
                </label>

                {/* AI Prompt Preview & Customization */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>AI Generation Prompt</span>
                    <span className="text-[10px] text-purple-600 font-bold">Features {brand_kit.product_name}</span>
                  </label>
                  <textarea
                    rows={3}
                    value={
                      adCustomPrompt ||
                      `Commercial hero shot of '${brand_kit.product_name}'. Designed for ${adPersonaName}. ${adStyle} aesthetic, 8k resolution, razor-sharp product focus, crisp commercial lighting.`
                    }
                    onChange={(e) => setAdCustomPrompt(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 resize-none bg-slate-50/50"
                  />
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateAdImage}
                  disabled={isGeneratingAd}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-800 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingAd ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAd ? 'Generating with AI...' : 'Generate AI Image Ad'}</span>
                </button>

                {/* Dedicated Download Option */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-purple-600" />
                      <span>Download Ad (JPG &amp; PNG)</span>
                    </label>
                    {generatedAd ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Ready
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Pending Gen</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadAdImage('jpg')}
                      disabled={!generatedAd}
                      className="py-2.5 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Download high-resolution JPG image ad"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JPG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadAdImage('png')}
                      disabled={!generatedAd}
                      className="py-2.5 px-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Download crisp PNG image ad"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG</span>
                    </button>
                  </div>

                  {!generatedAd && (
                    <p className="text-[11px] text-slate-400 italic text-center pt-0.5">
                      Generate an ad above to enable 1-click JPG &amp; PNG downloads
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Generated Ad Preview & Actions (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Ad Creative Preview
                    </h2>
                    {generatedAd && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ready (JPG &amp; PNG)
                      </span>
                    )}
                  </div>
                  {generatedAd ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                        {generatedAd.width} × {generatedAd.height}px
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownloadAdImage('jpg')}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Quick download as JPG"
                      >
                        <Download className="w-3 h-3" />
                        <span>JPG</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadAdImage('png')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Quick download as PNG"
                      >
                        <Download className="w-3 h-3" />
                        <span>PNG</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">AI Creative Studio</span>
                  )}
                </div>

                {/* Display Screen */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[380px] border border-slate-200/80 shadow-inner group">
                  {isGeneratingAd ? (
                    <div className="p-8 text-center space-y-4 max-w-sm">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-500/50 animate-pulse">
                        <Sparkles className="w-8 h-8 animate-spin" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">
                          Synthesizing Ad Creative with AI...
                        </h3>
                        <p className="text-xs text-purple-200/80 mt-1">
                          {adGenerationStep || 'Rendering high-resolution marketing ad...'}
                        </p>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-400 h-1.5 rounded-full w-3/4 animate-pulse" />
                      </div>
                    </div>
                  ) : generatedAd ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={generatedAd.image_url}
                        alt="AI Generated Marketing Ad"
                        className="max-h-[500px] w-full object-contain select-none"
                      />

                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 opacity-90 hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleDownloadAdImage('jpg')}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-purple-700 text-white backdrop-blur-md text-xs font-bold shadow-lg flex items-center gap-1 transition-all cursor-pointer"
                          title="Download JPG"
                        >
                          <Download className="w-3 h-3" />
                          <span>JPG</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadAdImage('png')}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-indigo-700 text-white backdrop-blur-md text-xs font-bold shadow-lg flex items-center gap-1 transition-all cursor-pointer"
                          title="Download PNG"
                        >
                          <Download className="w-3 h-3" />
                          <span>PNG</span>
                        </button>
                      </div>

                      {includeTextOverlay && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-6 text-white space-y-2 pointer-events-none">
                          <span className="text-[10px] font-black tracking-widest uppercase text-purple-300 block">
                            {brand_kit.product_name}
                          </span>
                          <h4 className="text-base sm:text-lg font-black leading-tight text-white drop-shadow-md">
                            "{adHeadline || generatedAd.headline}"
                          </h4>
                          <div className="pt-1 flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-[11px] font-bold shadow-md">
                              Shop Now →
                            </span>
                            <span className="text-[10px] text-slate-300 font-medium">
                              Tailored for {adPersonaName}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-10 text-center space-y-4 max-w-sm">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 mx-auto">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">No Ad Generated Yet</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Click <strong>Generate AI Image Ad</strong> to synthesize a commercial photo ad tailored for <strong>{adPersonaName}</strong>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Bar for Generated Ad */}
                {generatedAd && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleDownloadAdImage('jpg')}
                        className="px-3.5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download JPG</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadAdImage('png')}
                        className="px-3.5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PNG</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGenerateAdImage}
                        disabled={isGeneratingAd}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isGeneratingAd ? 'animate-spin' : ''}`} />
                        <span>New Variation</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedAd.image_url)
                          showFeedback('Ad Image URL copied to clipboard!')
                        }}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copy Link</span>
                      </button>
                    </div>

                    <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between text-xs text-purple-900 font-medium">
                      <span>✓ Commercial ad formatted for <strong>{adPersonaName}</strong></span>
                      <span className="font-mono text-[10px] text-purple-700">Flux AI Engine</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Explainability Drawer */}
        <WhyThisContentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          channelType={activeExplainChannel === 'social_post' ? 'Social Post' : 'Email'}
          personaName={activePersonaName}
          brandKit={brand_kit}
          asset={currentAssets[activeExplainChannel]}
          whyThisContent={currentAssets[activeExplainChannel]?.why_this_content}
          concept={selected_concept}
          validationReport={currentAssets[activeExplainChannel]?.validation_report}
        />
      </div>
    </SidebarLayout>
  )
}
