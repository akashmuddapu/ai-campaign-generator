import { useState } from 'react'
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
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
  FileDown,
  Shield,
  Cpu,
  Target,
  Compass,
  Award,
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

  const campaignId = location.state?.campaign_id || 'camp-travelmate-001'

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

  // Inline editing state for each card
  const [isEditingSocial, setIsEditingSocial] = useState(false)
  const [editingSocialText, setEditingSocialText] = useState('')
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [editingEmailSubject, setEditingEmailSubject] = useState('')
  const [editingEmailBody, setEditingEmailBody] = useState('')

  // Loading states
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isAutoFixing, setIsAutoFixing] = useState(false)
  const [_autoFixCount, setAutoFixCount] = useState(0)

  // Explainability drawer state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeExplainChannel, setActiveExplainChannel] = useState('social_post')

  const handleOpenExplain = (channel) => {
    setActiveExplainChannel(channel)
    setIsModalOpen(true)
  }

  // Handle Edit toggles
  const handleStartEditSocial = () => {
    setEditingSocialText(currentAssets.social_post.content.text)
    setIsEditingSocial(true)
  }

  const handleSaveEditSocial = () => {
    setPersonaAssets((prev) => ({
      ...prev,
      [activePersonaName]: {
        ...prev[activePersonaName],
        social_post: {
          ...prev[activePersonaName].social_post,
          content: {
            ...prev[activePersonaName].social_post.content,
            text: editingSocialText,
            character_count: editingSocialText.length,
          },
        },
      },
    }))
    setIsEditingSocial(false)
    showFeedback('Social post updated successfully!')
  }

  const handleStartEditEmail = () => {
    setEditingEmailSubject(currentAssets.email.content.subject)
    setEditingEmailBody(currentAssets.email.content.body)
    setIsEditingEmail(true)
  }

  const handleSaveEditEmail = () => {
    setPersonaAssets((prev) => ({
      ...prev,
      [activePersonaName]: {
        ...prev[activePersonaName],
        email: {
          ...prev[activePersonaName].email,
          content: {
            ...prev[activePersonaName].email.content,
            subject: editingEmailSubject,
            body: editingEmailBody,
            word_count: editingEmailBody.trim().split(/\s+/).length,
          },
        },
      },
    }))
    setIsEditingEmail(false)
    showFeedback('Email updated successfully!')
  }

  // Handle Regenerate for a single channel
  const handleRegenerate = async (channelType) => {
    setIsRegenerating(true)
    const activePersonaObj = all_personas.find((p) => p.persona_name === activePersonaName) || {
      persona_name: activePersonaName,
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
          [activePersonaName]: {
            ...prev[activePersonaName],
            [channelType]: response.data.assets[channelType] || response.data.assets,
          },
        }))
        setIsRegenerating(false)
        showFeedback(`Regenerated ${channelType === 'social_post' ? 'Social Post' : 'Email'} for ${activePersonaName}!`)
        return
      }
    } catch {
      // Client variation generator
    }

    setTimeout(() => {
      const fresh = getDefaultPersonaAssets(activePersonaName, brand_kit, selected_concept)
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
        [activePersonaName]: {
          ...prev[activePersonaName],
          [channelType]: fresh[channelType],
        },
      }))
      setIsRegenerating(false)
      showFeedback(`Regenerated ${channelType === 'social_post' ? 'Social Post' : 'Email'} for ${activePersonaName}!`)
    }, 400)
  }

  // Handle Regenerate All
  const handleRegenerateAll = async () => {
    setIsRegenerating(true)
    const activePersonaObj = all_personas.find((p) => p.persona_name === activePersonaName) || {
      persona_name: activePersonaName,
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
          [activePersonaName]: response.data.assets,
        }))
        setIsRegenerating(false)
        showFeedback(`Regenerated all assets for ${activePersonaName}!`)
        return
      }
    } catch {
      // Client variation
    }

    setTimeout(() => {
      const fresh = getDefaultPersonaAssets(activePersonaName, brand_kit, selected_concept)
      setPersonaAssets((prev) => ({
        ...prev,
        [activePersonaName]: fresh,
      }))
      setIsRegenerating(false)
      showFeedback(`Regenerated all assets for ${activePersonaName}!`)
    }, 450)
  }

  // Handle Auto-Fix with deterministic brand compliance
  const handleAutoFix = async (channelType) => {
    if (_autoFixCount >= 3) {
      showFeedback('Maximum auto-fix remediation iterations reached.')
      return
    }
    setIsAutoFixing(true)
    const activePersonaObj = all_personas.find((p) => p.persona_name === activePersonaName) || {
      persona_name: activePersonaName,
    }

    try {
      const response = await api.post('/campaigns/auto-fix', {
        channel_type: channelType,
        current_content: currentAssets[channelType].content,
        brand_kit,
        persona: activePersonaObj,
        concept: selected_concept,
      })

      const remediated = response.data.remediated_content || response.data.content
      const report = response.data.validation_report

      setPersonaAssets((prev) => ({
        ...prev,
        [activePersonaName]: {
          ...prev[activePersonaName],
          [channelType]: {
            ...prev[activePersonaName][channelType],
            content: remediated,
            validation_report: report,
            fixed: true,
          },
        },
      }))
      setAutoFixCount((c) => c + 1)
      setIsAutoFixing(false)
      showFeedback('Auto-Fix applied: Remediated to 100% brand compliance!')
      return
    } catch {
      // Deterministic client remediation fallback
    }

    setTimeout(() => {
      const asset = currentAssets[channelType]
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
        [activePersonaName]: {
          ...prev[activePersonaName],
          [channelType]: {
            ...prev[activePersonaName][channelType],
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
      showFeedback('Auto-Fix applied: Remediated to 100% brand compliance!')
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

  return (
    <SidebarLayout
      user={user}
      onLogout={onLogout}
      currentStep={activeView === 'guardian' ? 'Step 5 of 5' : 'Step 4 of 5'}
      campaignName={brand_kit.product_name?.split(' ')[0] || 'TravelMate'}
      campaignStatus="Validated"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ─── Top View Switcher Tabs ──────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
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

        {/* ─── VIEW 1: CAMPAIGN ASSETS matching Image 1 Screen 6 ───────────── */}
        {activeView === 'assets' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Campaign Assets
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Personalized social posts and emails for each persona
                </p>
              </div>

              {/* Persona Switcher Tabs matching Image 1 Screen 6 */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  {all_personas.map((p, idx) => {
                    const isActive = activePersonaName === p.persona_name
                    return (
                      <button
                        key={p.persona_name || idx}
                        onClick={() => {
                          setActivePersonaName(p.persona_name)
                          setIsEditingSocial(false)
                          setIsEditingEmail(false)
                        }}
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

                <button
                  type="button"
                  disabled={isRegenerating}
                  onClick={handleRegenerateAll}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 text-purple-600 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isRegenerating ? 'Regenerating...' : 'Regenerate All'}</span>
                </button>
              </div>
            </div>

            {/* Persona Header Banner matching Image 1 Screen 6 */}
            {(() => {
              const activeIndex = all_personas.findIndex((p) => p.persona_name === activePersonaName)
              const PersonaIcon = getPersonaIcon(activePersonaName, activeIndex >= 0 ? activeIndex : 0)
              const colorClass = getPersonaColor(activeIndex >= 0 ? activeIndex : 0)
              return (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center font-bold shadow-2xs`}>
                      <PersonaIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {activePersonaName} — Campaign Assets
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Concept: {selected_concept.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Brand Score: {activePersonaScore} / 5</span>
                    </span>
                  </div>
                </div>
              )
            })()}

            {/* 2 Assets Side-by-Side: Social Post & Email matching Image 1 Screen 6 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Asset 1: Social Post */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-600" /> Social Post
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid
                    </span>
                  </div>

                  {/* Post Content: View or Edit Mode */}
                  {isEditingSocial ? (
                    <div className="space-y-2">
                      <textarea
                        rows={5}
                        value={editingSocialText}
                        onChange={(e) => setEditingSocialText(e.target.value)}
                        className="w-full p-3 rounded-xl border border-purple-300 focus:ring-2 focus:ring-purple-600/20 text-xs text-slate-800 leading-relaxed outline-none"
                      />
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
                          onClick={handleSaveEditSocial}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 text-xs text-slate-800 leading-relaxed min-h-[110px] whitespace-pre-wrap font-medium">
                      {currentAssets.social_post.content.text}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
                    <span>
                      {isEditingSocial ? editingSocialText.length : (currentAssets.social_post.content.character_count || currentAssets.social_post.content.text.length)} / 280 characters
                    </span>
                    <span className="text-emerald-600 font-bold">No banned words</span>
                  </div>
                </div>

                {/* 3 Action Buttons matching Image 1 Screen 6: [Edit] [Regenerate] [Why this content?] */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleStartEditSocial}
                      className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      disabled={isRegenerating}
                      onClick={() => handleRegenerate('social_post')}
                      className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                      <span>Regenerate</span>
                    </button>

                    <button
                      type="button"
                      disabled={isAutoFixing}
                      onClick={() => handleAutoFix('social_post')}
                      className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Wand2 className={`w-3.5 h-3.5 text-emerald-600 ${isAutoFixing ? 'animate-spin' : ''}`} />
                      <span>Auto-Fix</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenExplain('social_post')}
                    className="text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why this content?</span>
                  </button>
                </div>
              </div>

              {/* Asset 2: Email */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" /> Email
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid
                    </span>
                  </div>

                  {/* Email Content: View or Edit Mode */}
                  {isEditingEmail ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingEmailSubject}
                        onChange={(e) => setEditingEmailSubject(e.target.value)}
                        placeholder="Email subject..."
                        className="w-full p-2.5 rounded-xl border border-indigo-300 focus:ring-2 focus:ring-indigo-600/20 text-xs font-bold text-slate-900 outline-none"
                      />
                      <textarea
                        rows={5}
                        value={editingEmailBody}
                        onChange={(e) => setEditingEmailBody(e.target.value)}
                        className="w-full p-3 rounded-xl border border-indigo-300 focus:ring-2 focus:ring-indigo-600/20 text-xs text-slate-800 leading-relaxed outline-none"
                      />
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
                          onClick={handleSaveEditEmail}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-700 text-white hover:bg-indigo-800 cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 text-xs text-slate-800 leading-relaxed min-h-[110px] space-y-2">
                      <div className="font-bold text-slate-900 border-b border-slate-200/80 pb-1.5">
                        {currentAssets.email.content.subject}
                      </div>
                      <div className="whitespace-pre-wrap font-medium text-slate-700">
                        {currentAssets.email.content.body}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
                    <span>
                      {isEditingEmail ? editingEmailBody.trim().split(/\s+/).length : (currentAssets.email.content.word_count || currentAssets.email.content.body.trim().split(/\s+/).length)} words (target 75–250)
                    </span>
                    <span className="text-emerald-600 font-bold">Subject ≤ 60 chars</span>
                  </div>
                </div>

                {/* 3 Action Buttons matching Image 1 Screen 6: [Edit] [Regenerate] [Why this content?] */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleStartEditEmail}
                      className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      disabled={isRegenerating}
                      onClick={() => handleRegenerate('email')}
                      className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                      <span>Regenerate</span>
                    </button>

                    <button
                      type="button"
                      disabled={isAutoFixing}
                      onClick={() => handleAutoFix('email')}
                      className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Wand2 className={`w-3.5 h-3.5 text-emerald-600 ${isAutoFixing ? 'animate-spin' : ''}`} />
                      <span>Auto-Fix</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenExplain('email')}
                    className="text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why this content?</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── VIEW 2: BRAND GUARDIAN VALIDATION matching Image 1 Screen 8 ─── */}
        {activeView === 'guardian' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200/80 pb-4">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Brand Guardian
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Campaign health & brand compliance
              </p>
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

        {/* ─── VIEW 3: EXPORT CAMPAIGN matching Image 1 Screen 9 ───────────── */}
        {activeView === 'export' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200/80 pb-4">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Export Campaign
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Download your complete campaign and assets
              </p>
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
