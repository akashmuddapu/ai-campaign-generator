import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  RefreshCw,
  Download,
  ShieldCheck,
  Zap,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Mail,
  FileCode,
  Layers,
  Cpu,
  Lock,
  Globe,
  Code2,
  Share2,
  Copy,
} from 'lucide-react'

const DEMO_PRESETS = {
  travelmate: {
    id: 'travelmate',
    name: 'TravelMate Smart Mug',
    category: 'Consumer Hardware',
    tagline: 'Your drink. Your temperature.',
    tone: 'Friendly, Premium, Modern',
    concept: 'Temperature That Travels',
    conceptHook: '"Your schedule changes. Your drink doesn\'t have to."',
    bannedWords: ['cheap', 'guaranteed', 'best'],
    personas: [
      {
        name: 'Student',
        role: 'College Student (Long study sessions)',
        social: 'Long lectures? Cold drinks? Not anymore! With TravelMate, keep your favorite brew at the perfect temperature between classes. ☕✨ Stay energized and focused.',
        socialTags: ['#TravelMate', '#StudentLife', '#CampusGear'],
        emailSubject: 'Your perfect coffee between classes is here ☕',
        emailBody: 'Between 8 AM lectures and marathon study sessions, cold coffee is the enemy of productivity. TravelMate keeps your drink hot for up to 12 hours so you can conquer finals without leaving the library. Grab student edition shipping today.',
        score: 96,
        personaFit: 98,
        brandFit: 95,
      },
      {
        name: 'Working Professional',
        role: 'Executive / Tech Lead (Back-to-back meetings)',
        social: 'Back-to-back executive meetings with no time to reheat coffee? TravelMate maintains your ideal temperature all day long with precision smart heating. 💼☕',
        socialTags: ['#TravelMate', '#ExecutiveGear', '#Productivity'],
        emailSubject: 'Sustained focus for your back-to-back workdays',
        emailBody: 'Your schedule doesn\'t stop for microwave trips. TravelMate brings sleek boardroom ergonomics and all-day thermal precision right to your desk. Elevate your daily workflow with zero interruptions.',
        score: 98,
        personaFit: 99,
        brandFit: 97,
      },
      {
        name: 'Traveller',
        role: 'Digital Nomad (Commutes & flights)',
        social: 'From airport terminals to rugged road trips, TravelMate keeps your favorite brew hot across time zones. 100% leakproof battery comfort on the move. ✈️🌍',
        socialTags: ['#TravelMate', '#TravelEssentials', '#Wanderlust'],
        emailSubject: 'Hot coffee anywhere in the world — wherever you travel',
        emailBody: 'Airport spills and lukewarm hotel coffee are things of the past. TravelMate is carry-on approved, 100% spill-proof, and holds exact thermal calibration across 14-hour flights.',
        score: 95,
        personaFit: 96,
        brandFit: 94,
      },
    ],
  },
  cybershield: {
    id: 'cybershield',
    name: 'CyberShield Cloud',
    category: 'Enterprise SaaS',
    tagline: 'Autonomous Defense. Uncompromising Velocity.',
    tone: 'Authoritative, Enterprise, Rigorous',
    concept: 'The Proactive Guardrail Initiative',
    conceptHook: '"Stop reacting to threats. Build unshakeable confidence."',
    bannedWords: ['cheap', 'guaranteed', 'best', 'unhackable'],
    personas: [
      {
        name: 'Enterprise CISO',
        role: 'Chief Information Security Officer',
        social: 'Stop reacting to alerts. CyberShield delivers continuous policy compliance and autonomous cloud security guardrails for high-velocity teams. 🛡️☁️',
        socialTags: ['#CyberShield', '#InfoSec', '#CloudSecurity'],
        emailSubject: 'Zero-trust cloud governance for your 2026 infrastructure',
        emailBody: 'In modern multi-cloud architectures, speed cannot compromise security. CyberShield continuously remediates configuration drift before audits begin, giving your executive board verifiable peace of mind.',
        score: 99,
        personaFit: 99,
        brandFit: 99,
      },
      {
        name: 'DevOps Lead',
        role: 'Principal Platform Engineer',
        social: 'Ship code at full speed without security breaking the pipeline. CyberShield automated guardrails enforce compliance directly in git commits. 🚀💻',
        socialTags: ['#CyberShield', '#DevSecOps', '#CloudNative'],
        emailSubject: 'Automate security checks directly in your CI/CD pipeline',
        emailBody: 'Eliminate friction between security audits and daily sprint releases. CyberShield runs lightweight pre-commit checks and automated remediation so your engineers ship without waiting for ticket approvals.',
        score: 97,
        personaFit: 98,
        brandFit: 96,
      },
      {
        name: 'Compliance Officer',
        role: 'VP Governance & Risk',
        social: 'Audit-ready in seconds. CyberShield turns complex SOC2 and ISO benchmarks into real-time deterministic dashboards. 📋✨',
        socialTags: ['#CyberShield', '#Compliance', '#AuditReady'],
        emailSubject: 'Real-time compliance evidence without quarterly audit panic',
        emailBody: 'Manual audit spreadsheets are obsolete. With CyberShield, every cloud change is automatically mapped to regulatory controls with cryptographic evidence trails ready for your auditors on demand.',
        score: 98,
        personaFit: 97,
        brandFit: 98,
      },
    ],
  },
  zenbrew: {
    id: 'zenbrew',
    name: 'ZenBrew Organic',
    category: 'Health & Wellness',
    tagline: 'Pure Botanical Energy for Calm Focus.',
    tone: 'Mindful, Vibrant, Natural',
    concept: 'The Mindful Morning Ritual',
    conceptHook: '"Because every morning deserves clarity without crashes."',
    bannedWords: ['cheap', 'guaranteed', 'best', 'magic'],
    personas: [
      {
        name: 'Busy Professional',
        role: 'Creative Director / Founder',
        social: 'Ditch the jittery afternoon crash. ZenBrew combines adaptogenic matcha and Lion\'s Mane for sustained, calm focus through creative blocks. 🍵🌿',
        socialTags: ['#ZenBrew', '#CleanEnergy', '#DeepWork'],
        emailSubject: 'A calmer, clearer way to power your high-output days',
        emailBody: 'Your afternoon slump doesn\'t need another jittery espresso shot. ZenBrew blends ceremonial grade green tea with nootropics to give you 6 hours of clean mental clarity without the jitters.',
        score: 97,
        personaFit: 98,
        brandFit: 96,
      },
      {
        name: 'Wellness Enthusiast',
        role: 'Holistic Health Coach',
        social: 'Clean ingredients only. ZenBrew delivers 100% organic, shade-grown adaptogens with zero artificial sweeteners or jitter spikes. 🧘‍♀️✨',
        socialTags: ['#ZenBrew', '#HolisticHealth', '#PlantPower'],
        emailSubject: 'Elevate your daily ritual with organic adaptogenic botanicals',
        emailBody: 'Crafted with ceremonial grade Japanese matcha and organic functional mushrooms, ZenBrew supports your immune system and sustained vitality through every mindful morning ritual.',
        score: 99,
        personaFit: 99,
        brandFit: 99,
      },
      {
        name: 'Remote Worker',
        role: 'Software Engineer / Writer',
        social: 'Deep work sessions without the coffee anxiety. ZenBrew fuels your flow state with organic L-theanine and clean green tea extract. 💻🌱',
        socialTags: ['#ZenBrew', '#RemoteWork', '#FlowState'],
        emailSubject: 'Long focus sessions without the afternoon crash',
        emailBody: 'Struggling with post-lunch brain fog while working from home? ZenBrew provides sustained focus with balanced amino acids and antioxidant nutrients to keep your brain firing cleanly.',
        score: 96,
        personaFit: 97,
        brandFit: 95,
      },
    ],
  },
}

const HOW_IT_WORKS_STEPS = [
  {
    step: 'Step 1',
    title: 'Brand Kit & Audience Personas',
    shortDesc: 'Set your core product rules and define multi-segment customer profiles.',
    description:
      'Enter your product name, core value proposition, tone guidelines, and zero-tolerance banned words. Add multiple personas tailored with their individual goals, daily friction points, and buying triggers.',
    features: [
      'Multi-tone vectors (e.g. Friendly, Premium, Modern)',
      'Zero-tolerance banned word enforcement',
      'Unlimited customizable customer personas (+ / -)',
      'Instant presets (B2B SaaS, Hardware, D2C)',
    ],
    badge: 'Foundation',
  },
  {
    step: 'Step 2',
    title: 'AI Persona DNA & Strategy',
    shortDesc: 'AI analyzes psychological drivers and formulates high-resonance angles.',
    description:
      'The engine breaks down each persona into emotional vectors, primary hooks, and differentiation strategies. It ensures messaging speaks directly to specific pain points rather than generic marketing fluff.',
    features: [
      'Psychological driver mapping',
      'Value-angle synthesis',
      'Persona-specific hook formulation',
      'Audience resonance scoring',
    ],
    badge: 'Strategy',
  },
  {
    step: 'Step 3',
    title: 'Multi-Concept & Asset Studio',
    shortDesc: 'Generate 3 strategic campaign angles and tailor social posts and emails.',
    description:
      'Choose from 3 distinct creative concepts, each with its own hook and rationale. The generator immediately crafts channel-optimized social media copy and full-length marketing emails for every configured persona.',
    features: [
      '3 distinct strategic concepts per campaign',
      'Character-counted social copy (≤ 280 chars)',
      'Structured emails (subject ≤ 60 chars, 75-250 words)',
      'In-place inline editing & regeneration',
    ],
    badge: 'Creative Engine',
  },
  {
    step: 'Step 4',
    title: 'Safety Guardrails & 1-Click Auto-Fix',
    shortDesc: 'Deterministic guardrails audit copy against 6 brand dimensions.',
    description:
      'Every piece of generated content is evaluated for brand tone, persona relevance, channel constraints, and banned words. Any violation is flagged with actionable diagnostics and can be resolved instantly with 1-click Auto-Fix.',
    features: [
      'Deterministic 6-dimension scoring',
      'Zero brand drift guarantee',
      'Real-time banned word scanner',
      '1-Click automated remediation',
    ],
    badge: 'Compliance',
  },
  {
    step: 'Step 5',
    title: 'One-Click Export & Delivery',
    shortDesc: 'Download complete campaign bundles in Markdown or structured JSON.',
    description:
      'Package your entire multi-persona campaign with brand certification into ready-to-publish Markdown documents or machine-readable JSON payloads ready to plug into your CMS, CRM, or ad platform.',
    features: [
      'Comprehensive Markdown (.md) bundle',
      'Structured JSON payload with all personas',
      'Instant client-side offline download',
      'Audit & compliance verification certificate',
    ],
    badge: 'Export Hub',
  },
]

const FAQS = [
  {
    q: 'How does the guardrail engine differ from standard ChatGPT or Claude copy?',
    a: 'Generic LLMs suffer from brand drift — hallucinating unauthorized claims, ignoring negative word constraints, or slipping into cliché marketing tropes. CampaignGuard AI pairs generative AI with deterministic guardrails that strictly enforce banned terms, length limits, and multi-dimensional scoring before any asset reaches your team.',
  },
  {
    q: 'Can I add custom banned words and tone guidelines?',
    a: 'Yes! In Step 1, you can define your exact brand tones (e.g. Authoritative, Playful, Premium) and specify zero-tolerance banned words. The compliance scanner checks every line of copy in real time and automatically rewrites non-compliant phrases.',
  },
  {
    q: 'How many customer personas can I create in a single campaign?',
    a: 'As many as you need! You can add, edit, or remove personas dynamically using the + and - controls. The platform generates tailored social posts and marketing emails for each audience segment simultaneously.',
  },
  {
    q: 'Can I run CampaignGuard AI with real Gemini or AI models?',
    a: 'Yes. CampaignGuard AI connects directly to Google Gemini models (e.g. gemini-3.1-flash-lite, gemini-3.8-flash) using your API key. If the external network or API is unavailable, it gracefully engages a high-fidelity offline mock provider so your workflow never halts.',
  },
  {
    q: 'What formats can I export my campaigns to?',
    a: 'You can export complete campaign bundles as beautifully formatted Markdown (.md) documents — complete with persona profiles, social copy, email templates, and brand check scores — or as raw structured JSON (.json) for programmatic integration into your marketing stack.',
  },
]

export default function LandingPage() {
  // ─── Interactive Demo State ──────────────────────────────────────────────
  const [activePresetKey, setActivePresetKey] = useState('travelmate')
  const [activePersonaIdx, setActivePersonaIdx] = useState(0)
  const [activeChannel, setActiveChannel] = useState('social')
  const [isBannedSimulated, setIsBannedSimulated] = useState(false)
  const [copiedFeedback, setCopiedFeedback] = useState(false)
  const [autoFixFeedback, setAutoFixFeedback] = useState(false)

  // ─── Interactive How-It-Works State ──────────────────────────────────────
  const [activeHowStepIdx, setActiveHowStepIdx] = useState(0)

  // ─── FAQ Accordion State ─────────────────────────────────────────────────
  const [openFaqIdx, setOpenFaqIdx] = useState(0)

  // ─── Footer Newsletter State ─────────────────────────────────────────────
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)

  const activePreset = DEMO_PRESETS[activePresetKey]
  const activePersona = activePreset.personas[activePersonaIdx] || activePreset.personas[0]

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text)
    setCopiedFeedback(true)
    setTimeout(() => setCopiedFeedback(false), 2000)
  }

  const handleSimulateViolation = () => {
    setIsBannedSimulated(true)
    setAutoFixFeedback(false)
  }

  const handleRunAutoFix = () => {
    setIsBannedSimulated(false)
    setAutoFixFeedback(true)
    setTimeout(() => setAutoFixFeedback(false), 3500)
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      setNewsletterSuccess(true)
      setNewsletterEmail('')
      setTimeout(() => setNewsletterSuccess(false), 5000)
    }
  }

  // Display content based on violation simulation
  const displayedSocialText = isBannedSimulated
    ? `Get our cheap and guaranteed best deal on ${activePreset.name} today before it expires! You will not find a better price anywhere.`
    : activePersona.social

  const displayedScore = isBannedSimulated ? 68 : activePersona.score
  const isPassing = displayedScore >= 85

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F4FD] via-[#FAF8FF] to-white text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900 scroll-smooth">
      {/* ─── Top Navbar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-purple-100/70 px-6 sm:px-12 py-3.5 flex items-center justify-between shadow-xs">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-200 group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 fill-white/20 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            CampaignGuard <span className="text-purple-600">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#how-it-works" className="hover:text-purple-700 transition-colors">
            How it Works
          </a>
          <a href="#demo" className="hover:text-purple-700 transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Interactive Demo</span>
          </a>
          <a href="#features" className="hover:text-purple-700 transition-colors">
            Features
          </a>
          <a href="#faq" className="hover:text-purple-700 transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-purple-700 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-200 transition-all hover:scale-102 cursor-pointer"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* ─── Hero Section ────────────────────────────────────────────────────── */}
      <section className="relative px-6 sm:px-12 pt-12 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-700 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Marketing Campaign Generator</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Create Brand-Right Marketing Campaigns for Every Audience
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
              Generate multiple campaign concepts, personalize content for different personas, validate with brand rules, auto-fix issues, and export — all in one intelligent workflow.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-all hover:scale-102"
              >
                <span>Start Free Campaign</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#demo"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm px-5 py-3.5 rounded-xl shadow-xs transition-all hover:border-purple-300 cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-purple-600" />
                <span>Live Demo</span>
              </a>
            </div>

            {/* Feature Checklist */}
            <div className="flex flex-wrap items-center gap-5 pt-3 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Persona Tailored Content</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Brand Consistency Checks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Auto-Fix & Regenerate</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Mockup Card matching Image 2 */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl bg-white border border-purple-200/80 p-3 shadow-2xl shadow-purple-500/10">
              {/* Fake App Window */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-[#FAF9FF] flex flex-col md:flex-row">
                {/* Mini Sidebar */}
                <div className="w-full md:w-44 bg-[#14112E] text-white p-3 space-y-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>CampaignGuard AI</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="px-2 py-1 bg-white/10 rounded-lg text-white font-semibold">Dashboard</div>
                    <div className="px-2 py-1 hover:text-white">Brand & Personas</div>
                    <div className="px-2 py-1 hover:text-white">Campaign Concepts</div>
                    <div className="px-2 py-1 hover:text-white">Campaign Assets</div>
                    <div className="px-2 py-1 hover:text-white">Brand Audit</div>
                    <div className="px-2 py-1 hover:text-white">Export</div>
                  </div>
                </div>

                {/* Mini Content Area */}
                <div className="flex-1 p-4 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Campaign Dashboard</h3>
                    <p className="text-[10px] text-slate-500">TravelMate Smart Mug</p>
                  </div>

                  {/* Stepper Flow */}
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-600 bg-white p-2 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-1 text-purple-700">
                      <CheckCircle2 className="w-3 h-3 text-purple-600" /> Brand
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1 text-purple-700">
                      <CheckCircle2 className="w-3 h-3 text-purple-600" /> Concepts
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1 text-purple-700">
                      <CheckCircle2 className="w-3 h-3 text-purple-600" /> Assets
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Audit
                    </span>
                  </div>

                  {/* Product Highlight + Scores */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800">Campaign: Temperature That Travels</span>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Brand Score: 94/100
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-800">Student</div>
                        <div className="text-[10px] font-extrabold text-purple-700">5/5</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-800">Professional</div>
                        <div className="text-[10px] font-extrabold text-purple-700">4.8/5</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-800">Traveller</div>
                        <div className="text-[10px] font-extrabold text-purple-700">5/5</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: INTERACTIVE LIVE DEMO (PLAYGROUND) ───────────────────── */}
      <section id="demo" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-purple-100">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            <span>Try It Right Now</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Interactive Campaign & Guardrail Demo
          </h2>
          <p className="text-sm text-slate-600 mt-2 font-normal">
            Switch products and audience personas to see how marketing copy transforms dynamically, and test the safety guardrail in real time.
          </p>
        </div>

        {/* Demo Workspace Card */}
        <div className="bg-white border border-purple-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-900/5 space-y-6">
          {/* Controls Bar: Preset Picker & Persona Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            {/* Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1. Select Sample Product:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(DEMO_PRESETS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActivePresetKey(key)
                      setActivePersonaIdx(0)
                      setIsBannedSimulated(false)
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activePresetKey === key
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] opacity-75 hidden sm:inline">({item.category})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personas */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                2. Select Target Persona:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {activePreset.personas.map((p, idx) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setActivePersonaIdx(idx)
                      setIsBannedSimulated(false)
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePersonaIdx === idx
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Concept Banner */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-800">
              <span className="font-bold text-purple-900">Campaign Concept:</span>
              <span className="font-extrabold text-slate-900">{activePreset.concept}</span>
              <span className="text-slate-500 italic hidden md:inline">{activePreset.conceptHook}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-purple-700 bg-white px-2.5 py-0.5 rounded-full border border-purple-200">
                Tone: {activePreset.tone}
              </span>
            </div>
          </div>

          {/* Output Card: Channel Switcher + Copy Box + Brand Guardian Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: Generated Asset */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveChannel('social')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeChannel === 'social'
                        ? 'bg-purple-100 text-purple-800'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>Social Media Post</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveChannel('email')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeChannel === 'email'
                        ? 'bg-purple-100 text-purple-800'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Marketing Email</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      activeChannel === 'social'
                        ? displayedSocialText
                        : `${activePersona.emailSubject}\n\n${activePersona.emailBody}`
                    )
                  }
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedFeedback ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Asset Box */}
              {activeChannel === 'social' ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {displayedSocialText}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-purple-600 font-bold">
                    {activePersona.socialTags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/80">
                    <span>Character count: {displayedSocialText.length} / 280</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Within Limit
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[11px] font-bold text-slate-500 block">Subject Line:</span>
                    <h4 className="text-xs font-extrabold text-slate-900">{activePersona.emailSubject}</h4>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Email Body:</span>
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                      {activePersona.emailBody}
                    </p>
                  </div>
                </div>
              )}

              {/* Simulation Action Bar */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-amber-900">
                  <span className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Test Brand Guardrail:
                  </span>
                  <span className="text-[11px] text-amber-800 block">
                    {isBannedSimulated
                      ? 'Violation simulated: Banned words injected into copy.'
                      : 'Simulate a banned word breach to see the compliance engine catch and fix it.'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!isBannedSimulated ? (
                    <button
                      type="button"
                      onClick={handleSimulateViolation}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                    >
                      Trigger Violation
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRunAutoFix}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1.5 animate-pulse"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run Auto-Fix</span>
                    </button>
                  )}
                </div>
              </div>

              {autoFixFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Auto-Fix complete! Removed banned terms & rewritten to brand tone.</span>
                </div>
              )}
            </div>

            {/* Right 5 Cols: Live Compliance Radar */}
            <div className="lg:col-span-5 bg-[#120F29] text-white rounded-2xl p-5 space-y-4 shadow-lg border border-[#231F4A]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white tracking-wide">Live Compliance Audit</span>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isPassing ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {isPassing ? '✓ PASS' : '⚠ FLAGGED'}
                </span>
              </div>

              {/* Big Score Display */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Compliance Health Score</div>
                  <div className="text-2xl font-black text-white">{displayedScore} / 100</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
                  <div className={`text-xs font-bold ${isPassing ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPassing ? 'Excellent' : 'Needs Auto-Fix'}
                  </div>
                </div>
              </div>

              {/* Dimensions breakdown */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                    <span>Brand Fit</span>
                    <span>{isBannedSimulated ? '65%' : `${activePersona.brandFit}%`}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isBannedSimulated ? 'bg-rose-500 w-[65%]' : 'bg-purple-400 w-[96%]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                    <span>Persona Fit ({activePersona.name})</span>
                    <span>{isBannedSimulated ? '70%' : `${activePersona.personaFit}%`}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isBannedSimulated ? 'bg-rose-500 w-[70%]' : 'bg-emerald-400 w-[98%]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                    <span>Zero-Tolerance Banned Words</span>
                    <span className={isBannedSimulated ? 'text-rose-400' : 'text-emerald-400'}>
                      {isBannedSimulated ? '3 Detected (Fail)' : '0 Detected (Clean)'}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isBannedSimulated ? 'bg-rose-500 w-[30%]' : 'bg-emerald-400 w-[100%]'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* CTA directly into live app */}
              <div className="pt-2">
                <Link
                  to="/generator"
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Build Full Campaign with this Product</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: HOW IT WORKS (INTERACTIVE STEPPER) ────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-purple-100">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-3">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>5-Step Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How CampaignGuard AI Works
          </h2>
          <p className="text-sm text-slate-600 mt-2 font-normal">
            From initial product parameters to multi-persona asset deployment in minutes. Click any step to inspect the architecture.
          </p>
        </div>

        {/* Step Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {HOW_IT_WORKS_STEPS.map((s, idx) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setActiveHowStepIdx(idx)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeHowStepIdx === idx
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-200 scale-105'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                activeHowStepIdx === idx ? 'bg-white text-purple-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {idx + 1}
              </span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>

        {/* Active Step Showcase Card */}
        {(() => {
          const activeStep = HOW_IT_WORKS_STEPS[activeHowStepIdx]
          return (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-lg shadow-purple-900/5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Details */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                    {activeStep.step} — {activeStep.badge}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{activeStep.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">{activeStep.description}</p>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Key Capabilities:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                    {activeStep.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  {activeHowStepIdx < HOW_IT_WORKS_STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setActiveHowStepIdx((prev) => prev + 1)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-all"
                    >
                      <span>Next: {HOW_IT_WORKS_STEPS[activeHowStepIdx + 1].step}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link
                      to="/generator"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-all"
                    >
                      <span>Launch Campaign Generator</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <span className="text-xs text-slate-400">Step {activeHowStepIdx + 1} of 5</span>
                </div>
              </div>

              {/* Right Column: Visual Preview Mockup */}
              <div className="lg:col-span-6 bg-gradient-to-tr from-[#120F29] to-[#251F52] text-white p-6 rounded-2xl border border-[#352D6C] space-y-4 shadow-xl">
                <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-mono text-purple-200 ml-2">
                      workflow/{activeStep.step.toLowerCase().replace(/\s+/g, '')}.json
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-emerald-300">
                    200 OK
                  </span>
                </div>

                {/* Dynamic Content by Step */}
                {activeHowStepIdx === 0 && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-purple-300 font-bold block mb-1">Brand Kit Spec:</span>
                      <p className="text-slate-300 text-[11px]">
                        "Product": "TravelMate Smart Mug"<br />
                        "Tones": ["Friendly", "Premium", "Modern"]<br />
                        "Zero-Tolerance Banned": ["cheap", "guaranteed", "best"]
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-emerald-300 font-bold block mb-1">Configured Personas (3 Active):</span>
                      <p className="text-slate-300 text-[11px]">
                        1. Student (Lecture stamina & affordability)<br />
                        2. Working Professional (Executive productivity)<br />
                        3. Traveller (Commuter & flight durability)
                      </p>
                    </div>
                  </div>
                )}

                {activeHowStepIdx === 1 && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-purple-300 font-bold block mb-1">Synthesized Persona DNA:</span>
                      <p className="text-slate-300 text-[11px]">
                        <strong>Primary Hook:</strong> "Your schedule changes. Your drink doesn't have to."<br />
                        <strong>Emotional Driver:</strong> Academic productivity & frictionless focus.<br />
                        <strong>Tone Vector:</strong> Short, energetic, student-friendly, casual.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-indigo-300 font-bold block mb-1">Strategy Benchmark:</span>
                      <p className="text-slate-300 text-[11px]">
                        Differentiate on thermal battery endurance rather than generic mug styling.
                      </p>
                    </div>
                  </div>
                )}

                {activeHowStepIdx === 2 && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-purple-300 font-bold block mb-1">Multi-Channel Asset Studio:</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                          <strong>Social Post:</strong> 158 / 280 chars (Valid)
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                          <strong>Marketing Email:</strong> 82 words (Optimal)
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300">
                      Tailored simultaneously for all N customer segments without manual copy-pasting.
                    </div>
                  </div>
                )}

                {activeHowStepIdx === 3 && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                      <div className="flex items-center justify-between font-bold">
                        <span>Compliance Engine Certification</span>
                        <span>98 / 100</span>
                      </div>
                      <p className="text-[11px] text-emerald-200 mt-1">
                        Zero banned words detected. Tone adherence 98%. Channel constraint compliance 100%.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300">
                      ⚡ 1-Click Auto-Fix instantly remediates length violations or banned phrases.
                    </div>
                  </div>
                )}

                {activeHowStepIdx === 4 && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-purple-300 font-bold block mb-1">Production Export Ready:</span>
                      <p className="text-slate-300 text-[11px]">
                        📦 Markdown (.md) campaign brief with personas & assets<br />
                        📦 Structured JSON payload ready for CMS & API pipelines
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-lg text-[10px] font-mono border border-purple-500/30">
                        Export .MD
                      </span>
                      <span className="px-3 py-1 bg-indigo-600/30 text-indigo-300 rounded-lg text-[10px] font-mono border border-indigo-500/30">
                        Export .JSON
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </section>

      {/* ─── SECTION 4: WHY CAMPAIGNGUARD AI (FEATURES) ──────────────────────── */}
      <section id="features" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-purple-100">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-3">
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span>Built For Guardrail Marketing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why CampaignGuard AI?
          </h2>
          <p className="text-sm text-slate-600 mt-2 font-normal">
            A focused AI workflow to create, personalize, and validate marketing campaigns.
          </p>
        </div>

        {/* 5 Feature Cards matching Image 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">AI Campaign Concepts</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Get 2–3 strategic campaign directions instantly with distinct hooks.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">Persona-Specific Content</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Create unique social posts and emails for each audience segment.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">Brand Guardian</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Check tone, rules, and brand fit with an objective compliance score.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">Auto-Fix & Regenerate</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Automatically fix content that violates brand rules with 1 click.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">Export & Share</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Download your complete campaign in Markdown or structured JSON.
            </p>
          </div>
        </div>

        {/* Key Metrics / Social Proof Bar */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-xl">
          <div className="text-center p-3 border-r border-white/10 last:border-none">
            <div className="text-2xl sm:text-3xl font-black text-purple-300">10x</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Faster Campaign Delivery</div>
          </div>
          <div className="text-center p-3 border-r border-white/10 last:border-none">
            <div className="text-2xl sm:text-3xl font-black text-emerald-300">100%</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Brand Rule Adherence</div>
          </div>
          <div className="text-center p-3 border-r border-white/10 last:border-none">
            <div className="text-2xl sm:text-3xl font-black text-indigo-300">0%</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Banned Word Leakage</div>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">3-in-1</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Multi-Persona Tailoring</div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: INTERACTIVE FAQ ACCORDION ────────────────────────────── */}
      <section id="faq" className="py-20 px-6 sm:px-12 max-w-4xl mx-auto border-t border-purple-100">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-3">
            <Lock className="w-3.5 h-3.5 text-purple-600" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 mt-2 font-normal">
            Everything you need to know about guardrails, AI generation, and campaign export.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIdx === idx
            return (
              <div
                key={faq.q}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed font-normal border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── SECTION 6: PRE-FOOTER CALL TO ACTION ────────────────────────────── */}
      <section className="py-16 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-tr from-[#1E1648] via-[#2F216E] to-[#432A9C] text-white p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to eliminate brand drift forever?
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
              Join marketing and growth teams creating high-resonance, guardrail-protected campaigns in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-purple-900 font-extrabold text-sm hover:bg-purple-50 shadow-lg hover:scale-102 transition-all cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/generator"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-purple-800/60 hover:bg-purple-800 text-white font-bold text-sm border border-purple-400/30 transition-all cursor-pointer"
            >
              <span>Open Campaign Studio</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: COMPREHENSIVE FOOTER ─────────────────────────────────── */}
      <footer className="bg-[#0F0D24] text-white border-t border-[#1F1B40] pt-16 pb-10 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top 5-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            {/* Col 1: Brand & Status (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
                  <Shield className="w-4 h-4 fill-white/20 text-white" />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-white">
                  CampaignGuard <span className="text-purple-400">AI</span>
                </span>
              </Link>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                The intelligent guardrail marketing engine. Generate multi-persona campaigns, synthesize audience DNA, validate compliance, and export with zero brand drift.
              </p>

              {/* Operational Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All AI Guardrail Systems Operational</span>
              </div>

              {/* Social / External Links */}
              <div className="flex items-center gap-3 pt-2 text-slate-400">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Community"
                >
                  <Share2 className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Code Repository"
                >
                  <Code2 className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Network"
                >
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Product (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Product</h4>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li>
                  <Link to="/generator" className="hover:text-white transition-colors">
                    Brand & Personas
                  </Link>
                </li>
                <li>
                  <Link to="/strategy-concept" className="hover:text-white transition-colors">
                    Persona DNA
                  </Link>
                </li>
                <li>
                  <Link to="/strategy-concept" className="hover:text-white transition-colors">
                    Concept Studio
                  </Link>
                </li>
                <li>
                  <Link to="/results?tab=guardian" className="hover:text-white transition-colors">
                    Guardrail Audit
                  </Link>
                </li>
                <li>
                  <Link to="/results?tab=export" className="hover:text-white transition-colors">
                    Export Hub (.md / .json)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Solutions (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Solutions</h4>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li>
                  <a href="#demo" className="hover:text-white transition-colors">
                    B2B Enterprise Tech
                  </a>
                </li>
                <li>
                  <a href="#demo" className="hover:text-white transition-colors">
                    Consumer Hardware
                  </a>
                </li>
                <li>
                  <a href="#demo" className="hover:text-white transition-colors">
                    Health & Wellness
                  </a>
                </li>
                <li>
                  <a href="#demo" className="hover:text-white transition-colors">
                    Growth Marketers
                  </a>
                </li>
                <li>
                  <a href="#demo" className="hover:text-white transition-colors">
                    Agencies & Studios
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Newsletter & Stay Updated (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Stay Updated</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Subscribe to receive cutting-edge insights on AI guardrail marketing, prompt governance, and multi-audience growth tactics.
              </p>

              {newsletterSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Subscribed! Welcome to the Guardrail Dispatch.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your work email"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Row: Legal & Copyright */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <div>
              © 2026 CampaignGuard AI. All rights reserved. Built with deterministic guardrails.
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <a href="#privacy" className="hover:text-slate-300 transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-slate-300 transition-colors">
                Terms of Service
              </a>
              <a href="#security" className="hover:text-slate-300 transition-colors">
                Security & Guardrails
              </a>
              <a href="#cookies" className="hover:text-slate-300 transition-colors">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
