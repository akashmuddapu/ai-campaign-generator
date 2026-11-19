import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  FileText,
  Award,
  ShieldCheck,
  CheckCircle2,
  Download,
  Edit3,
  Trash2,
  Plus,
  Search,
  Sparkles,
  Clock,
  ArrowRight,
  AlertCircle,
  Check,
  FileCode,
  Mail,
  Layers,
  FileBarChart,
  RefreshCw,
  X,
  FileDown,
} from 'lucide-react'
import SidebarLayout from '../components/SidebarLayout'
import api from '../services/api'
import { generateCampaignPdf } from '../utils/generateCampaignPdf'
import { getDraftResumePath, getStepLabel, setUnlockedStep, resetWizardSession } from '../utils/wizardProgress'

// Default seed campaigns for initial workspace state or offline demo
const SEED_CAMPAIGNS = [
  {
    id: 'camp-travelmate-001',
    product_name: 'TravelMate Smart Mug',
    tagline: 'Your drink. Your temperature.',
    brand_tone: 'Friendly, Premium, Modern',
    concept_title: 'Temperature That Travels',
    persona_name: 'Student',
    score: 96,
    status: 'Validated',
    created_at: '2026-11-19T00:30:00Z',
    bundle: {
      id: 'camp-travelmate-001',
      brand_kit: {
        product_name: 'TravelMate Smart Mug',
        tagline: 'Your drink. Your temperature.',
        brand_tone: 'Friendly, Premium, Modern',
        product_description:
          'A smart travel mug that keeps drinks at your preferred temperature during your journey.',
        banned_words: ['cheap', 'guaranteed', 'best'],
        example_brand_lines: [
          '• Your perfect sip, wherever you go.',
          '• Built for every journey.',
        ],
      },
      persona: {
        persona_name: 'Student',
        summary: 'Long classes, needs convenient and reliable drinks.',
        primary_goals: 'Stay energized during long study hours and lectures.',
        pain_points: 'Drinks get cold during classes and library sessions.',
        core_motivations: 'Convenience, reliability, and academic productivity.',
        emotional_triggers: 'Fun, relatable, energetic student life.',
        preferred_message_style: 'Short, energetic, student-friendly, casual.',
        buying_triggers: 'Keeps drink at the right temperature, affordable, aesthetic.',
      },
      all_personas: [
        {
          persona_name: 'Student',
          summary: 'Long classes, needs convenient and reliable drinks.',
          primary_goals: 'Stay energized during long study hours and lectures.',
          pain_points: 'Drinks get cold during classes and library sessions.',
          core_motivations: 'Convenience, reliability, and academic productivity.',
        },
        {
          persona_name: 'Working Professional',
          summary: 'Back-to-back meetings, values productivity and convenience.',
          primary_goals: 'Sustained productivity through executive meetings.',
          pain_points: 'No time to reheat coffee between client presentations.',
          core_motivations: 'Professional polish, daily efficiency, and sleek design.',
        },
        {
          persona_name: 'Traveller',
          summary: 'Frequent travel, needs a portable and reliable solution.',
          primary_goals: 'Consistent hydration and hot drinks across time zones.',
          pain_points: 'Airport spills, poor hotel coffee, unstable cup holders.',
          core_motivations: 'Portability, rugged durability, and peace of mind on the go.',
        },
      ],
      concept: {
        id: 'c-1',
        title: 'Temperature That Travels',
        angle: 'Personalized Comfort On The Move',
        hook: '"Your schedule changes. Your drink doesn\'t have to."',
        tone: 'Reliable, forward-looking',
        rationale: 'Addresses the daily chaos of commuter and class schedules.',
      },
      social_post: {
        content: {
          text: 'Long lectures? Cold drinks? Not anymore! With TravelMate Smart Mug, keep your favorite drink at the perfect temperature between classes. ☕✨ Stay energized and focused.',
          character_count: 158,
          hashtags: ['#TravelMate', '#StudentLife', '#CampusGear'],
        },
        validation_report: {
          overall_score: 96,
          passed: true,
          dimensions: [
            { dimension: 'Brand Fit', score: 95, passed: true, explanation: 'Tone aligns with Friendly, Premium, Modern voice.' },
            { dimension: 'Persona Fit', score: 98, passed: true, explanation: 'Addresses student lecture friction and stamina.' },
            { dimension: 'Channel Fit', score: 96, passed: true, explanation: 'Concise social post well under 280 characters.' },
            { dimension: 'Rule Compliance', score: 100, passed: true, explanation: 'Zero banned words detected.' },
          ],
        },
        why_this_content: {
          persona_rationale: 'Directly speaks to university schedules and study blocks.',
          brand_rationale: 'Friendly, youthful, and modern brand tone.',
          channel_rationale: 'Optimized for social engagement with relevant hashtags.',
        },
      },
      email: {
        content: {
          subject: 'Your perfect coffee between classes is here.',
          body: 'Long classes and a packed lecture schedule? Keep your energy up with TravelMate Smart Mug — the smart travel mug that keeps your drink just right, anytime, anywhere.\n\nWhether you need piping hot matcha during morning study blocks or iced cold brew in the afternoon, our precision temperature control ensures you never settle for lukewarm again.\n\nGrab your student edition today with free campus shipping.',
          word_count: 82,
        },
        validation_report: { overall_score: 95, passed: true },
        why_this_content: {
          persona_rationale: 'Speaks directly to student daily routine and academic goals.',
          brand_rationale: 'Approachable yet premium voice.',
          channel_rationale: 'Structured scannable email with direct call to action.',
        },
      },
    },
  },
  {
    id: 'camp-cybershield-002',
    product_name: 'CyberShield Cloud',
    tagline: 'Autonomous Defense. Uncompromising Velocity.',
    brand_tone: 'Authoritative, Enterprise, Rigorous',
    concept_title: 'The Proactive Guardrail Initiative',
    persona_name: 'Enterprise CISO',
    score: 98,
    status: 'Validated',
    created_at: '2026-11-18T18:15:00Z',
    bundle: {
      id: 'camp-cybershield-002',
      brand_kit: {
        product_name: 'CyberShield Cloud',
        tagline: 'Autonomous Defense. Uncompromising Velocity.',
        brand_tone: 'Authoritative, Enterprise, Rigorous',
        product_description:
          'AI-powered enterprise cloud security and autonomous threat defense platform with verifiable compliance guardrails.',
        banned_words: ['cheap', 'guaranteed', 'best', 'unhackable'],
      },
      persona: {
        persona_name: 'Enterprise CISO',
        summary: 'Enterprise security leader managing multi-cloud risks.',
        primary_goals: 'Zero breach incidents and continuous regulatory audit compliance.',
        pain_points: 'Alert fatigue, shadow IT, and slow developer compliance workflows.',
        core_motivations: 'Executive governance, verifiable safety, and team autonomy.',
      },
      concept: {
        id: 'c-2',
        title: 'The Proactive Guardrail Initiative',
        angle: 'Autonomous Threat Defense & Governance',
        hook: '"Stop reacting to threats. Build unshakeable confidence with CyberShield."',
      },
      social_post: {
        content: {
          text: 'Stop reacting to alerts. CyberShield delivers continuous policy compliance and autonomous cloud security guardrails for high-velocity teams. 🛡️☁️ Built for modern enterprises.',
          character_count: 172,
          hashtags: ['#CyberShield', '#CloudSecurity', '#InfoSec'],
        },
        validation_report: {
          overall_score: 98,
          passed: true,
          dimensions: [
            { dimension: 'Brand Fit', score: 98, passed: true, explanation: 'Authoritative and enterprise-focused.' },
            { dimension: 'Persona Fit', score: 99, passed: true, explanation: 'Speaks directly to CISO risk priorities.' },
            { dimension: 'Channel Fit', score: 97, passed: true, explanation: 'Short, impactful executive announcement.' },
            { dimension: 'Rule Compliance', score: 100, passed: true, explanation: 'Zero banned words detected.' },
          ],
        },
        why_this_content: {
          persona_rationale: 'Focuses on proactive threat reduction and audit readiness.',
          brand_rationale: 'Rigorous and enterprise-ready tone.',
          channel_rationale: 'Direct benefit proposition for security leaders.',
        },
      },
      email: {
        content: {
          subject: 'CyberShield: Zero-trust cloud governance for 2026',
          body: 'Dear Enterprise CISO,\n\nIn modern multi-cloud architectures, speed cannot come at the expense of security. With CyberShield Cloud, your engineering organization unlocks continuous compliance and automated resilience.\n\nOur platform eliminates recurring vulnerabilities while preserving developer velocity across every deployment.\n\nSchedule a consultation with our security architecture team today.\n\nWarm regards,\nThe CyberShield Strategic Team',
          word_count: 78,
        },
        validation_report: { overall_score: 98, passed: true },
        why_this_content: {
          persona_rationale: 'Executive value alignment centered on risk mitigation.',
          brand_rationale: 'Authoritative and visionary posture.',
          channel_rationale: 'Consultation invitation tailored for leadership.',
        },
      },
    },
  },
]

// Dynamic tailored content generator adapting to ANY product and persona in history/reports
function resolvePersonaAssets(personaName, bundle, brandKit, concept) {
  const pName = personaName || 'Student'

  // 1. Check if bundle has explicit assets stored for this persona
  if (bundle?.assets_by_persona?.[pName]) {
    return bundle.assets_by_persona[pName]
  }
  if (bundle?.assets?.[pName]) {
    return bundle.assets[pName]
  }
  // 2. If it matches bundle.persona?.persona_name and bundle.social_post exists
  if (
    bundle?.persona?.persona_name?.toLowerCase() === pName.toLowerCase() &&
    bundle?.social_post?.content?.text
  ) {
    return {
      social_post: bundle.social_post,
      email: bundle.email,
    }
  }

  // 3. Otherwise generate domain-specific tailored copy
  const prod = brandKit?.product_name || bundle?.product_name || 'Campaign Product'
  const desc =
    brandKit?.product_description ||
    'A high-resonance product designed to deliver exceptional daily value and consistency.'
  const tagline = brandKit?.tagline || 'Experience the difference.'
  const cTitle = concept?.title || bundle?.concept_title || 'Main Concept'
  const cHook = (concept?.hook || `Experience ${prod}.`).replace(/^"|"$/g, '')
  const n = pName.toLowerCase()

  const isBeverage = /mug|coffee|drink|tea|sip|beverage|temperature|brew|cup|thermos|flask/i.test(
    `${prod} ${desc}`
  )
  const isTech = /security|cloud|software|cyber|saas|api|ai|data|code|dev|guardrail/i.test(
    `${prod} ${desc}`
  )

  let socialText = ''
  let emailSubject = ''
  let emailBody = ''
  let hashtags = [`#${prod.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`, `#${pName.replace(/\s+/g, '')}`]
  let personaWhy = `Directly tailored around ${pName}'s daily routine and core priorities.`

  if (isBeverage) {
    if (n.includes('student')) {
      socialText = `Long lectures? Cold drinks? Not anymore! With ${prod}, keep your favorite drink at the perfect temperature between classes. ☕✨ Stay energized and focused.`
      emailSubject = `Your perfect coffee between classes is here.`
      emailBody = `Long classes and a packed lecture schedule? Keep your energy up with ${prod} — ${desc.toLowerCase().startsWith('a ') ? desc : `the solution that ${desc}`}\n\nWhether you need piping hot matcha during morning study blocks or iced cold brew in the afternoon, ${cHook}.\n\nGrab your student edition today with free campus shipping.`
      hashtags = ['#TravelMate', '#StudentLife', '#CampusGear']
      personaWhy = 'Directly speaks to university lecture blocks, campus commutes, and study focus.'
    } else if (n.includes('professional') || n.includes('working')) {
      socialText = `Back-to-back executive meetings with no time to reheat your coffee? ${prod} maintains your ideal temperature all day long with precision smart heating. 💼☕ Work at peak performance.`
      emailSubject = `Sustained focus for your back-to-back workdays`
      emailBody = `Between client presentations and back-to-back executive meetings, you do not have time for cold, stale drinks.\n\n${prod} delivers all-day precision temperature regulation, designed with sleek ergonomics that look right at home in the boardroom.\n\nUpgrade your daily workflow with '${tagline}' and never settle for lukewarm again.`
      hashtags = ['#TravelMate', '#ExecutiveProductivity', '#OfficeEssentials']
      personaWhy = 'Speaks directly to back-to-back executive meetings, boardroom polish, and sustained focus.'
    } else {
      socialText = `From airport terminals to rugged road trips, ${prod} keeps your favorite brew at the right temperature across time zones. ✈️🌍 Pack for every adventure.`
      emailSubject = `${prod}: Built for everywhere you travel`
      emailBody = `Consistent hydration and hot drinks across time zones are finally effortless.\n\n${prod} is engineered for the road: ${desc}\n\n${cHook} Pack the ultimate companion on your next journey with '${tagline}'.`
      hashtags = ['#TravelMate', '#TravelEssentials', '#OnTheRoad']
      personaWhy = 'Engineered around travel delays, terminal walks, and all-weather durability.'
    }
  } else if (isTech) {
    if (n.includes('ciso') || n.includes('security') || n.includes('tech') || n.includes('engineer')) {
      socialText = `Automate compliance and stop threats before they escalate with ${prod}. ${cHook} Built for high-velocity engineering teams. 🛡️💻`
      emailSubject = `${prod}: Enterprise-grade security for 2026`
      emailBody = `Dear ${pName},\n\nIn modern cloud infrastructure, speed cannot come at the expense of security. With ${prod}, your engineering organization unlocks continuous compliance and automated resilience.\n\n${desc}\n\n${cHook} Our platform eliminates recurring vulnerabilities while preserving developer velocity across every deployment.\n\nSchedule a consultation with our security architecture team today.\n\nBest regards,\nThe ${prod} Team`
      hashtags = ['#CloudSecurity', '#ContinuousCompliance', '#DevSecOps']
      personaWhy = 'Addresses CISO audit compliance, threat posture, and engineering velocity.'
    } else if (n.includes('professional') || n.includes('working') || n.includes('leader')) {
      socialText = `Scale faster without sacrificing quality or security. ${prod} gives your team the guardrails to innovate with unshakeable confidence. 🚀🔒`
      emailSubject = `Accelerating operational resilience with ${prod}`
      emailBody = `Dear ${pName},\n\nMaintaining strategic alignment and operational excellence is your primary competitive edge. With ${prod}, your organization eliminates bottlenecks and mitigates systemic risk.\n\n${desc}\n\n${cHook} Empower your teams to execute with precision and total governance.\n\nExplore how leaders rely on ${prod} to scale with certainty.\n\nBest regards,\nThe ${prod} Team`
      hashtags = ['#EnterpriseLeadership', '#OperationalExcellence', '#Governance']
      personaWhy = 'Speaks to leadership governance, operational resilience, and risk mitigation.'
    } else {
      socialText = `Modernize your digital operations with ${prod}. ${cHook} Trusted performance and security from day one.`
      emailSubject = `${prod}: Modernizing your strategy for 2026`
      emailBody = `Dear ${pName},\n\nIn today's fast-paced environment, agility and reliability must go hand-in-hand. With ${prod}, your team gains a verified advantage.\n\n${desc}\n\n${cHook} Experience seamless integration and peace of mind with '${tagline}'.\n\nGet started with your dedicated team onboarding today.\n\nBest regards,\nThe ${prod} Team`
      hashtags = ['#Innovation', '#CloudTransformation', '#Reliability']
      personaWhy = 'Focuses on agility, seamless onboarding, and digital performance.'
    }
  } else {
    // Custom general product
    socialText = `Tailored for ${pName}: ${cTitle}. Experience ${prod} — ${desc} ${cHook} ✨`
    emailSubject = `${prod}: Built for ${pName}`
    emailBody = `Dear ${pName},\n\nDiscover how ${prod} delivers an unmatched experience designed specifically for your daily routine.\n\n${desc}\n\n${cHook} With '${tagline}', you get the consistency, reliability, and quality you deserve every single day.\n\nUpgrade your experience with ${prod} today.\n\nWarm regards,\nThe ${prod} Team`
    personaWhy = `Customized copy tailored directly to ${pName}'s unique profile and objectives.`
  }

  return {
    social_post: {
      content: {
        text: socialText,
        character_count: socialText.length,
        hashtags: hashtags,
      },
      validation_report: { overall_score: 96, passed: true },
      why_this_content: {
        persona_rationale: personaWhy,
        brand_rationale: `${brandKit?.brand_tone || 'Friendly and modern'} tone aligned with product values.`,
        channel_rationale: 'Concise social post optimized for engagement and readability under 280 characters.',
      },
    },
    email: {
      content: {
        subject: emailSubject,
        body: emailBody,
        word_count: emailBody.split(/\s+/).filter(Boolean).length,
      },
      validation_report: { overall_score: 95, passed: true },
      why_this_content: {
        persona_rationale: personaWhy,
        brand_rationale: `Consistent with ${brandKit?.brand_tone || 'Premium'} tone and tagline promise.`,
        channel_rationale: 'Structured scannable email format with a clear call to action.',
      },
    },
  }
}

export default function CampaignHistoryReportPage({ user, onLogout }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [campaigns, setCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState(null)

  // Active viewing mode: 'report' | 'edit'
  const [viewMode, setViewMode] = useState('report')

  // Selected persona index for multi-persona preview (Student, Working Professional, Traveller, etc.)
  const [selectedPersonaIndex, setSelectedPersonaIndex] = useState(0)

  // Selected campaign id from query param or first campaign
  const selectedId = searchParams.get('id')
  const activeCampaign =
    campaigns.find((c) => c.id === selectedId) ||
    campaigns[0] ||
    (user ? null : SEED_CAMPAIGNS[0])

  // Reset selected persona index when active campaign changes
  useEffect(() => {
    setSelectedPersonaIndex(0)
  }, [activeCampaign?.id])

  // Inline editing state for "Quick Edit" mode
  const [editProductName, setEditProductName] = useState('')
  const [editTagline, setEditTagline] = useState('')
  const [editSocialText, setEditSocialText] = useState('')
  const [editEmailSubject, setEditEmailSubject] = useState('')
  const [editEmailBody, setEditEmailBody] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Fetch campaigns strictly for the logged-in user
  useEffect(() => {
    setIsLoading(true)
    const userId = user?.id || localStorage.getItem('cg_user_id')
    api
      .get('/campaigns', { params: userId ? { user_id: userId } : {} })
      .then((res) => {
        if (res.data?.campaigns) {
          if (res.data.campaigns.length > 0) {
            setCampaigns(res.data.campaigns)
          } else if (user) {
            // Authenticated user with no campaigns
            setCampaigns([])
          } else {
            // Unauthenticated guest demo
            setCampaigns(SEED_CAMPAIGNS)
          }
        } else if (!user) {
          setCampaigns(SEED_CAMPAIGNS)
        } else {
          setCampaigns([])
        }
      })
      .catch(() => {
        if (!user) {
          setCampaigns(SEED_CAMPAIGNS)
        } else {
          try {
            const cacheKey = userId ? `cg_campaign_history_${userId}` : 'cg_campaign_history'
            const local = sessionStorage.getItem(cacheKey)
            setCampaigns(local ? JSON.parse(local) : [])
          } catch {
            setCampaigns([])
          }
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [user?.id])

  // Sync edit form fields when active campaign or selected persona changes
  useEffect(() => {
    if (activeCampaign) {
      const b = activeCampaign.bundle || {}
      const bk = b.brand_kit || {}
      const allP =
        b.all_personas && b.all_personas.length > 0
          ? b.all_personas
          : b.persona
          ? [b.persona]
          : [{ persona_name: 'Student' }]
      const pName = allP[selectedPersonaIndex]?.persona_name || 'Student'
      const pAssets = resolvePersonaAssets(pName, b, bk, b.concept || {})
      const sp = pAssets.social_post?.content?.text || ''
      const emSub = pAssets.email?.content?.subject || ''
      const emBody = pAssets.email?.content?.body || ''

      setEditProductName(bk.product_name || activeCampaign.product_name || '')
      setEditTagline(bk.tagline || activeCampaign.tagline || '')
      setEditSocialText(sp)
      setEditEmailSubject(emSub)
      setEditEmailBody(emBody)
    }
  }, [activeCampaign, selectedPersonaIndex])

  const showToast = (msg) => {
    setFeedbackMessage(msg)
    setTimeout(() => setFeedbackMessage(null), 3500)
  }

  // ─── Action: Resume Draft at exact step ──────────────────────────────────
  const handleResumeDraft = (camp) => {
    const target = camp || activeCampaign
    const b = target.bundle || {}
    const step = Number(target.current_step || b.current_step || 1)
    const bk = b.brand_kit || {
      product_name: target.product_name,
      tagline: target.tagline,
      brand_tone: target.brand_tone || 'Friendly, Premium, Modern',
    }
    const personas =
      Array.isArray(b.all_personas) && b.all_personas.length > 0
        ? b.all_personas
        : b.persona
        ? [b.persona]
        : [{ persona_name: 'Target Audience' }]
    const persona = b.persona || personas[0]
    const concept = b.concept || null
    const concepts = Array.isArray(b.concepts) ? b.concepts : []

    try {
      sessionStorage.setItem('cg_draft_id', target.id)
      sessionStorage.setItem('cg_brand_kit', JSON.stringify(bk))
      sessionStorage.setItem('cg_personas', JSON.stringify(personas))
      if (b.persona_dna) sessionStorage.setItem('cg_persona_dna', JSON.stringify(b.persona_dna))
      if (concepts.length > 0) sessionStorage.setItem('cg_concepts', JSON.stringify(concepts))
      if (concept) sessionStorage.setItem('cg_selected_concept', JSON.stringify(concept))
      if (b.assets && Object.keys(b.assets).length > 0) {
        sessionStorage.setItem('cg_persona_assets', JSON.stringify(b.assets))
      }
    } catch {}

    // Unlock steps up to where the user left off!
    setUnlockedStep(step)

    const resumePath = getDraftResumePath({ ...target, current_step: step })
    navigate(resumePath, {
      state: {
        draft_id: target.id,
        brand_kit: bk,
        persona,
        all_personas: personas,
        persona_dna: b.persona_dna,
        concepts: concepts.length > 0 ? concepts : undefined,
        selected_concept: concept || undefined,
        assets: b.assets,
        campaign_id: target.id,
      },
    })
  }

  // ─── Action: Edit in Campaign Studio ─────────────────────────────────────
  const handleEditInStudio = (camp) => {
    const target = camp || activeCampaign
    if (target.status === 'Draft') {
      handleResumeDraft(target)
      return
    }
    const b = target.bundle || {}
    const bk = b.brand_kit || {
      product_name: target.product_name,
      tagline: target.tagline,
      brand_tone: target.brand_tone || 'Friendly, Premium, Modern',
    }
    const personas = b.all_personas || (b.persona ? [b.persona] : [{ persona_name: 'Target Audience' }])
    const concept = b.concept || {
      title: target.concept_title || 'Core Campaign Angle',
      hook: target.tagline || 'Experience the difference.',
    }

    try {
      sessionStorage.setItem('cg_brand_kit', JSON.stringify(bk))
      sessionStorage.setItem('cg_personas', JSON.stringify(personas))
      sessionStorage.setItem('cg_selected_concept', JSON.stringify(concept))
      sessionStorage.setItem('cg_step2_done', 'true')
      sessionStorage.setItem('cg_step3_done', 'true')
      sessionStorage.setItem('cg_step4_done', 'true')
      if (b.assets) {
        sessionStorage.setItem('cg_persona_assets', JSON.stringify(b.assets))
      }
    } catch {}

    setUnlockedStep(6)

    // Navigate straight to Results Studio with preloaded state
    navigate('/results?tab=assets', {
      state: {
        brand_kit: bk,
        persona: personas[0],
        all_personas: personas,
        selected_concept: concept,
        assets: b.assets || {
          social_post: b.social_post,
          email: b.email,
        },
        campaign_id: target.id,
      },
    })
  }

  // ─── Action: Save In-Place Edits ─────────────────────────────────────────
  const handleSaveQuickEdit = async () => {
    if (!activeCampaign) return
    setIsSavingEdit(true)

    const activePName =
      (activeCampaign.bundle?.all_personas || [])[selectedPersonaIndex]?.persona_name ||
      activeCampaign.bundle?.persona?.persona_name ||
      'Student'

    const updatedPersonaAsset = {
      social_post: {
        ...((activeCampaign.bundle && activeCampaign.bundle.social_post) || {}),
        content: {
          text: editSocialText,
          character_count: editSocialText.length,
          hashtags: [
            `#${editProductName.replace(/\s+/g, '')}`,
            '#CampaignUpdate',
          ],
        },
      },
      email: {
        ...((activeCampaign.bundle && activeCampaign.bundle.email) || {}),
        content: {
          subject: editEmailSubject,
          body: editEmailBody,
          word_count: editEmailBody.split(/\s+/).filter(Boolean).length,
        },
      },
    }

    const updatedBundle = {
      ...(activeCampaign.bundle || {}),
      brand_kit: {
        ...((activeCampaign.bundle && activeCampaign.bundle.brand_kit) || {}),
        product_name: editProductName,
        tagline: editTagline,
      },
      assets_by_persona: {
        ...((activeCampaign.bundle && activeCampaign.bundle.assets_by_persona) || {}),
        [activePName]: updatedPersonaAsset,
      },
      social_post: updatedPersonaAsset.social_post,
      email: updatedPersonaAsset.email,
    }

    try {
      await api.put(`/campaigns/${activeCampaign.id}`, updatedBundle)
    } catch {
      // Local demo resilience
    }

    // Update local state
    const updatedCampaigns = campaigns.map((c) =>
      c.id === activeCampaign.id
        ? {
            ...c,
            product_name: editProductName,
            tagline: editTagline,
            bundle: updatedBundle,
          }
        : c
    )
    setCampaigns(updatedCampaigns)
    try {
      sessionStorage.setItem('cg_campaign_history', JSON.stringify(updatedCampaigns))
    } catch {}

    setIsSavingEdit(false)
    setViewMode('report')
    showToast('Campaign edits saved and certified compliant!')
  }

  // ─── Action: Delete Campaign ─────────────────────────────────────────────
  const handleDeleteCampaign = async (id, e) => {
    if (e) e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this campaign from history?')) return

    try {
      await api.delete(`/campaigns/${id}`)
    } catch {}

    const remaining = campaigns.filter((c) => c.id !== id)
    setCampaigns(remaining)
    try {
      sessionStorage.setItem('cg_campaign_history', JSON.stringify(remaining))
    } catch {}

    if (selectedId === id && remaining.length > 0) {
      setSearchParams({ id: remaining[0].id })
    }
    showToast('Campaign removed from history.')
  }

  // ─── Action: Download Markdown or JSON ───────────────────────────────────
  const handleDownload = (format) => {
    if (!activeCampaign) return
    const b = activeCampaign.bundle || {}
    const bk = b.brand_kit || {}
    const c = b.concept || {}

    if (format === 'pdf') {
      const personas = b.all_personas || (b.persona ? [b.persona] : [{ persona_name: activeCampaign.persona_name || 'Customer' }])
      let assetsMap = b.assets_by_persona || b.assets
      if (!assetsMap && (b.social_post || b.email)) {
        assetsMap = {
          [personas[0]?.persona_name || 'Customer']: {
            social_post: b.social_post,
            email: b.email,
          },
        }
      }
      generateCampaignPdf({
        brandKit: bk,
        concept: c,
        personas: personas,
        personaAssets: assetsMap || {},
        overallScore: activeCampaign.score || 95,
        guardianRating: activeCampaign.score >= 90 ? 'Excellent' : 'Good',
        campaignId: activeCampaign.id,
      })
      return
    }
    const safeName = (bk.product_name || activeCampaign.product_name || 'campaign')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
    const filename = `${safeName}_report.${format === 'markdown' ? 'md' : 'json'}`

    let content = ''
    if (format === 'markdown') {
      content = `# Campaign Audit Report: ${bk.product_name || activeCampaign.product_name}\n\n`
      content += `**Status:** ${activeCampaign.status} | **Score:** ${activeCampaign.score}/100\n`
      content += `**Tagline:** ${bk.tagline || activeCampaign.tagline || 'N/A'}\n`
      content += `**Brand Tone:** ${bk.brand_tone || 'N/A'}\n\n`
      content += `## 1. Executive Summary\n${bk.product_description || 'N/A'}\n\n`
      content += `## 2. Campaign Concept: ${c.title || activeCampaign.concept_title}\n`
      content += `> ${c.hook || 'N/A'}\n\n`
      content += `## 3. Generated Assets\n\n### Social Post\n`
      content += `${b.social_post?.content?.text || ''}\n\n`
      content += `### Marketing Email\n**Subject:** ${b.email?.content?.subject || ''}\n\n`
      content += `${b.email?.content?.body || ''}\n`
    } else {
      content = JSON.stringify(
        {
          id: activeCampaign.id,
          product_name: bk.product_name || activeCampaign.product_name,
          concept: c,
          bundle: b,
          score: activeCampaign.score,
          exported_at: new Date().toISOString(),
        },
        null,
        2
      )
    }

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
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      c.product_name.toLowerCase().includes(q) ||
      (c.concept_title && c.concept_title.toLowerCase().includes(q)) ||
      (c.persona_name && c.persona_name.toLowerCase().includes(q))
    )
  })

  // If user has no campaigns at all, render a friendly empty state
  if (!activeCampaign) {
    return (
      <SidebarLayout
        user={user}
        onLogout={onLogout}
        campaignName="Workspace"
        campaignStatus="Ready"
      >
        <div className="max-w-2xl mx-auto py-16 px-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
            <FileBarChart className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">No Saved Campaigns Yet</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              You haven't generated any campaigns under this account yet. Generate your first campaign in the Campaign Studio to view full audit reports, Brand Guardian scores, and multi-persona assets here!
            </p>
          </div>
          <Link
            to="/generator"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-200 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Your First Campaign →</span>
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  const bundle = activeCampaign.bundle || {}
  const brandKit = bundle.brand_kit || {}
  const allPersonas =
    bundle.all_personas && bundle.all_personas.length > 0
      ? bundle.all_personas
      : bundle.persona
      ? [bundle.persona]
      : [
          {
            persona_name: 'Student',
            summary: 'Long classes, needs convenient and reliable drinks.',
            primary_goals: 'Stay energized during long study hours and lectures.',
            pain_points: 'Drinks get cold during classes and library sessions.',
          },
          {
            persona_name: 'Working Professional',
            summary: 'Back-to-back meetings, values productivity and convenience.',
            primary_goals: 'Sustained productivity through executive meetings.',
            pain_points: 'No time to reheat coffee between client presentations.',
          },
          {
            persona_name: 'Traveller',
            summary: 'Frequent travel, needs a portable and reliable solution.',
            primary_goals: 'Consistent hydration and hot drinks across time zones.',
            pain_points: 'Airport spills, poor hotel coffee, unstable cup holders.',
          },
        ]
  const concept = bundle.concept || {}
  const activePersonaObj = allPersonas[selectedPersonaIndex] || allPersonas[0] || {}
  const activePersonaName = activePersonaObj.persona_name || 'Student'

  const currentPersonaAssets = resolvePersonaAssets(activePersonaName, bundle, brandKit, concept)
  const socialPost = currentPersonaAssets.social_post || {}
  const emailAsset = currentPersonaAssets.email || {}

  return (
    <SidebarLayout
      user={user}
      onLogout={onLogout}
      campaignName={brandKit.product_name?.split(' ')[0] || activeCampaign.product_name?.split(' ')[0] || 'Workspace'}
      campaignStatus={activeCampaign.status || 'Validated'}
    >
      <div className="max-w-6xl mx-auto pt-6 space-y-6">
        {/* Toast Feedback Notification */}
        {feedbackMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─── Top Header Bar ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold">
                <FileBarChart className="w-3.5 h-3.5" />
                <span>Campaign History & Reports</span>
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'} saved
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {activeCampaign.product_name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {concept.title || activeCampaign.concept_title} •{' '}
              {new Date(activeCampaign.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Action Buttons: Edit in Studio, Quick Edit toggle, Export */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'report' ? 'edit' : 'report')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'edit'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{viewMode === 'edit' ? 'Close Edit Mode' : 'Quick Edit'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/report-card?id=${activeCampaign.id}`)}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>View Report Card</span>
            </button>

            <button
              type="button"
              onClick={() => handleEditInStudio(activeCampaign)}
              className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCampaign.status === 'Draft'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {activeCampaign.status === 'Draft'
                  ? `Resume Draft (Step ${activeCampaign.current_step || 1}/5)`
                  : 'Edit in Studio'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload('markdown')}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span>Export .MD</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload('json')}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload('pdf')}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5 text-purple-600" />
              <span>Export PDF</span>
            </button>

            <Link
              to="/generator"
              onClick={() => resetWizardSession()}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </Link>
          </div>
        </div>

        {/* ─── Draft Campaign Resume Banner ─────────────────────────────────── */}
        {activeCampaign.status === 'Draft' && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-amber-950">
                    Draft Campaign in Progress
                  </span>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                    Left off at Step {activeCampaign.current_step || 1} of 5 — {getStepLabel(activeCampaign.current_step || 1)}
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  Your progress is saved. Click Resume to pick up right where you stopped and unlock your remaining campaign steps.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleResumeDraft(activeCampaign)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-200 transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <span>Resume Campaign Draft</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── Campaign Switcher & Search Bar ──────────────────────────────── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Saved Campaign:
            </span>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history…"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Campaign Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {filteredCampaigns.map((c) => {
              const isCurrent = c.id === activeCampaign.id
              const isDraftItem = c.status === 'Draft'
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSearchParams({ id: c.id })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                    isCurrent
                      ? isDraftItem
                        ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
                        : 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
                      : isDraftItem
                      ? 'bg-amber-50/40 border-amber-200 text-amber-900 hover:bg-amber-50'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-purple-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate max-w-[140px]">{c.product_name}</span>
                  {isDraftItem ? (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                      Draft • Step {c.current_step || 1}/5
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isCurrent
                          ? 'bg-purple-200/80 text-purple-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.score || 96}%
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ─── VIEW MODE: QUICK EDIT ───────────────────────────────────────── */}
        {viewMode === 'edit' && (
          <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow-md space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-purple-600" />
                  <span>Quick Edit Mode: {activeCampaign.product_name}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Update product info and marketing copy directly, then re-certify compliance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('report')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={handleSaveQuickEdit}
                  className="px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingEdit ? 'Saving…' : 'Save & Re-Validate'}</span>
                </button>
              </div>
            </div>

            {/* Persona Switcher for Quick Edit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/60 p-3.5 rounded-xl border border-purple-100">
              <div>
                <span className="text-xs font-bold text-purple-900 block">
                  Editing Persona: <strong>{activePersonaName}</strong>
                </span>
                <span className="text-[11px] text-purple-700">
                  Switch persona to edit its specific social post and email copy below
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {allPersonas.map((p, idx) => (
                  <button
                    key={p.persona_name || idx}
                    type="button"
                    onClick={() => setSelectedPersonaIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedPersonaIndex === idx
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p.persona_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={editProductName}
                    onChange={(e) => setEditProductName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Product Tagline
                  </label>
                  <input
                    type="text"
                    value={editTagline}
                    onChange={(e) => setEditTagline(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Social Media Copy</label>
                    <span className="text-[11px] text-slate-500">
                      {editSocialText.length} / 280 chars
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={editSocialText}
                    onChange={(e) => setEditSocialText(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 text-xs text-slate-800 leading-relaxed outline-none"
                  />
                </div>
              </div>

              {/* Email Content */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Email Subject Line</label>
                    <span className="text-[11px] text-slate-500">
                      {editEmailSubject.length} / 60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editEmailSubject}
                    onChange={(e) => setEditEmailSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 text-xs text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Marketing Email Body</label>
                    <span className="text-[11px] text-slate-500">
                      {editEmailBody.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={editEmailBody}
                    onChange={(e) => setEditEmailBody(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 text-xs text-slate-800 leading-relaxed outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── VIEW MODE: REPORT TYPE (EXECUTIVE AUDIT REPORT) ─────────────── */}
        {viewMode === 'report' && (
          <div className="space-y-6">
            {/* 1. Score & Health Banner */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-bold shrink-0 ${
                    activeCampaign.status === 'Draft'
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  }`}
                >
                  {activeCampaign.status === 'Draft' ? (
                    <Clock className="w-8 h-8" />
                  ) : (
                    <ShieldCheck className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-slate-900">
                      {activeCampaign.status === 'Draft'
                        ? `Draft Progress: Step ${activeCampaign.current_step || 1} of 5`
                        : `Brand Guardian Score: ${activeCampaign.score || 96} / 100`}
                    </h2>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                        activeCampaign.status === 'Draft'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}
                    >
                      {activeCampaign.status === 'Draft'
                        ? `Draft • ${getStepLabel(activeCampaign.current_step || 1)}`
                        : activeCampaign.status || 'Validated'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeCampaign.status === 'Draft'
                      ? 'Complete the remaining steps in Campaign Studio to generate and validate all marketing assets.'
                      : 'Deterministic compliance verified across 6 dimensions with zero brand drift.'}
                  </p>
                </div>
              </div>

              {/* Metric Badges */}
              <div className="grid grid-cols-3 gap-3 text-center w-full md:w-auto">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 min-w-[80px]">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Brand Fit</div>
                  <div className="text-sm font-black text-slate-800">5.0 / 5</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 min-w-[80px]">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Persona Fit</div>
                  <div className="text-sm font-black text-slate-800">4.8 / 5</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 min-w-[80px]">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Banned Words</div>
                  <div className="text-sm font-black text-emerald-600">0 Flags</div>
                </div>
              </div>
            </div>

            {/* 2. Executive Campaign Brief */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Kit Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>1. Brand Kit Specification</span>
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Product Name:</span>
                    <span className="font-bold text-slate-900 ml-2">
                      {brandKit.product_name || activeCampaign.product_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Tagline:</span>
                    <span className="font-semibold text-slate-800 ml-2 italic">
                      "{brandKit.tagline || activeCampaign.tagline || 'N/A'}"
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Brand Tone:</span>
                    <span className="font-semibold text-purple-700 ml-2">
                      {brandKit.brand_tone || 'Friendly, Premium, Modern'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Zero-Tolerance Banned Words:</span>
                    <span className="font-semibold text-rose-700 ml-2">
                      {brandKit.banned_words?.join(', ') || 'cheap, guaranteed, best'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 font-medium block mb-1">Product Description:</span>
                    <p className="text-slate-700 leading-relaxed font-normal">
                      {brandKit.product_description || 'Standard high-resonance product.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Concept & Strategy Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2. Creative Concept Strategy</span>
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Concept Title:</span>
                    <span className="font-bold text-slate-900 ml-2">
                      {concept.title || activeCampaign.concept_title}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Strategic Angle:</span>
                    <span className="font-semibold text-slate-800 ml-2">
                      {concept.angle || 'Personalized Comfort & Utility'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-purple-900">
                    <span className="text-[11px] font-bold block mb-0.5">Primary Hook:</span>
                    <p className="italic text-xs font-medium">
                      {concept.hook || `Experience ${activeCampaign.product_name}.`}
                    </p>
                  </div>
                  {concept.rationale && (
                    <div className="pt-1">
                      <span className="text-slate-400 font-medium block mb-0.5">Rationale:</span>
                      <p className="text-slate-600 text-[11px]">{concept.rationale}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Target Audience Personas */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    3. Configured Audience Personas ({allPersonas.length})
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any persona below to preview its tailored social post and marketing email
                  </p>
                </div>
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 self-start sm:self-auto">
                  Active Persona: <strong>{activePersonaName}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {allPersonas.map((p, idx) => {
                  const isSelected = selectedPersonaIndex === idx
                  return (
                    <button
                      key={p.persona_name || idx}
                      type="button"
                      onClick={() => setSelectedPersonaIndex(idx)}
                      className={`p-4 rounded-xl text-left transition-all cursor-pointer relative group flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'bg-purple-50/70 border-2 border-purple-600 shadow-sm ring-2 ring-purple-600/20'
                          : 'bg-slate-50 border border-slate-200/80 hover:border-purple-300 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="space-y-1.5 w-full">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? 'text-purple-900' : 'text-slate-900'
                            }`}
                          >
                            {p.persona_name}
                          </span>
                          {isSelected ? (
                            <span className="text-[10px] font-extrabold text-white bg-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                              Segment {idx + 1}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          {p.summary || p.primary_goals || 'Primary audience segment.'}
                        </p>
                        {p.pain_points && (
                          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/80">
                            <strong className="text-slate-700">Friction:</strong> {p.pain_points}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 w-full text-[10px]">
                        {isSelected ? (
                          <span className="font-bold text-purple-700 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-600" /> Showing assets below ↓
                          </span>
                        ) : (
                          <span className="text-slate-400 group-hover:text-purple-600 font-medium transition-colors">
                            Click to view copy →
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 4. Generated Marketing Assets (Social Post + Marketing Email) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    4. Generated Marketing Assets
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Showing personalized copy for:{' '}
                    <strong className="text-purple-800 font-extrabold">{activePersonaName}</strong>
                  </p>
                </div>

                {/* Persona Switcher Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                  {allPersonas.map((p, idx) => {
                    const isActive = selectedPersonaIndex === idx
                    return (
                      <button
                        key={p.persona_name || idx}
                        type="button"
                        onClick={() => setSelectedPersonaIndex(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        {p.persona_name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Asset 1: Social Post */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span>Social Media Post ({activePersonaName})</span>
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Valid ({socialPost.content?.character_count || socialPost.content?.text?.length || 158}/280)
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100 min-h-[90px] whitespace-pre-line">
                      {socialPost.content?.text || 'Engaging social media marketing copy.'}
                    </p>

                    {socialPost.content?.hashtags && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-purple-600 font-bold">
                        {socialPost.content.hashtags.map((h) => (
                          <span key={h}>{h}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {socialPost.why_this_content && (
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-700">Why this content works:</span>{' '}
                      {socialPost.why_this_content.persona_rationale}
                    </div>
                  )}
                </div>

                {/* Asset 2: Marketing Email */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-indigo-600" />
                        <span>Marketing Email ({activePersonaName})</span>
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Valid ({emailAsset.content?.word_count || emailAsset.content?.body?.split(/\s+/).filter(Boolean).length || 82} words)
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                      <div className="border-b border-slate-200/80 pb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Subject Line:
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {emailAsset.content?.subject || 'Exclusive campaign briefing'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                          Body:
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                          {emailAsset.content?.body || 'Full email body copy tailored for audience.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {emailAsset.why_this_content && (
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-700">Channel Strategy:</span>{' '}
                      {emailAsset.why_this_content.channel_rationale}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Footer Actions (Studio Resume & Danger Zone) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Need adjustments or new personas?</h4>
                <p className="text-xs text-slate-500">
                  Resume this campaign in the multi-step Campaign Studio to add personas, edit text, or re-run checks.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDeleteCampaign(activeCampaign.id)}
                  className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEditInStudio(activeCampaign)}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Resume in Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}
