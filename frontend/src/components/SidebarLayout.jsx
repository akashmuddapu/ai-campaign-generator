import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Shield,
  Home,
  Layers,
  Target,
  Sparkles,
  FileText,
  ShieldCheck,
  Award,
  Download,
  History,
  Bell,
  LogOut,
  ChevronRight,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import api from '../services/api'
import { getMaxUnlockedStep } from '../utils/wizardProgress'

const DEFAULT_PREVIOUS = [
  {
    id: 'camp-travelmate-001',
    product_name: 'TravelMate Smart Mug',
    concept_title: 'Temperature That Travels',
    score: 96,
  },
  {
    id: 'camp-cybershield-002',
    product_name: 'CyberShield Cloud',
    concept_title: 'The Proactive Guardrail',
    score: 98,
  },
]

export default function SidebarLayout({
  children,
  currentStep,
  campaignName,
  campaignStatus = 'In Progress',
  user,
  onLogout
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const searchParams = new URLSearchParams(location.search)
  const activeTab = searchParams.get('tab')

  // Sidebar collapse/expand state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('cg_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('cg_sidebar_collapsed', String(next))
      } catch {}
      return next
    })
  }

  // Previous campaigns list for sidebar (strictly isolated to current user)
  const [previousCampaigns, setPreviousCampaigns] = useState(() => {
    try {
      const userId = user?.id || localStorage.getItem('cg_user_id')
      const cacheKey = userId ? `cg_campaign_history_${userId}` : 'cg_campaign_history'
      const s = sessionStorage.getItem(cacheKey)
      if (s) return JSON.parse(s)
      return []
    } catch {
      return []
    }
  })

  // Fetch previous campaigns on mount, user change, or route navigation
  useEffect(() => {
    const userId = user?.id || localStorage.getItem('cg_user_id')
    api
      .get('/campaigns', { params: userId ? { user_id: userId } : {} })
      .then((res) => {
        if (res.data?.campaigns) {
          const list = res.data.campaigns
          setPreviousCampaigns(list)
          try {
            const cacheKey = userId ? `cg_campaign_history_${userId}` : 'cg_campaign_history'
            sessionStorage.setItem(cacheKey, JSON.stringify(list))
          } catch {}
        }
      })
      .catch(() => {})
  }, [user?.id, location.pathname])

  // Instantly listen for newly created campaigns to update sidebar with 0 latency
  useEffect(() => {
    const handleCampaignCreated = (e) => {
      const newCamp = e.detail
      if (!newCamp || !newCamp.id) return

      const bk = newCamp.brand_kit || {}
      const concept = newCamp.concept || {}
      const vr = newCamp.assets?.social_post?.validation_report || {}
      const isDraft = newCamp.status === 'Draft'
      const summary = {
        id: newCamp.id,
        user_id: newCamp.user_id,
        product_name: bk.product_name || 'Campaign',
        concept_title: isDraft ? `Draft • Step ${newCamp.current_step || 1} of 5` : (concept.title || 'Campaign Concept'),
        score: isDraft ? 90 : (vr.overall_score || 96),
        status: isDraft ? 'Draft' : (vr.passed ? 'Validated' : 'Review'),
        current_step: newCamp.current_step || 1,
        created_at: newCamp.created_at || new Date().toISOString(),
        bundle: newCamp,
      }

      setPreviousCampaigns((prev) => {
        const withoutNew = prev.filter(
          (c) => c.id !== newCamp.id && (!newCamp.replaced_draft_id || c.id !== newCamp.replaced_draft_id)
        )
        const updated = [summary, ...withoutNew]
        const userId = user?.id || localStorage.getItem('cg_user_id')
        try {
          const cacheKey = userId ? `cg_campaign_history_${userId}` : 'cg_campaign_history'
          sessionStorage.setItem(cacheKey, JSON.stringify(updated))
        } catch {}
        return updated
      })
    }

    const handleDraftSaved = (e) => {
      const draft = e.detail
      if (!draft || !draft.id) return
      const bk = draft.brand_kit || {}
      const concept = draft.concept || {}
      const step = draft.current_step || 1
      const summary = {
        id: draft.id,
        user_id: draft.user_id,
        product_name: bk.product_name || 'Draft Campaign',
        concept_title: `Draft • Step ${step} of 5`,
        score: 90,
        status: 'Draft',
        current_step: step,
        created_at: draft.created_at || new Date().toISOString(),
        updated_at: draft.updated_at || new Date().toISOString(),
        bundle: draft,
      }

      setPreviousCampaigns((prev) => {
        const withoutDraft = prev.filter((c) => c.id !== draft.id)
        const updated = [summary, ...withoutDraft]
        const userId = user?.id || localStorage.getItem('cg_user_id')
        try {
          const cacheKey = userId ? `cg_campaign_history_${userId}` : 'cg_campaign_history'
          sessionStorage.setItem(cacheKey, JSON.stringify(updated))
        } catch {}
        return updated
      })
    }

    window.addEventListener('cg_campaign_created', handleCampaignCreated)
    window.addEventListener('cg_draft_saved', handleDraftSaved)
    return () => {
      window.removeEventListener('cg_campaign_created', handleCampaignCreated)
      window.removeEventListener('cg_draft_saved', handleDraftSaved)
    }
  }, [user?.id])

  // Dynamically resolve campaign name from props or sessionStorage
  const resolvedCampaignName =
    campaignName && campaignName !== 'TravelMate'
      ? campaignName
      : (() => {
          try {
            const s = sessionStorage.getItem('cg_brand_kit')
            if (s) {
              const bk = JSON.parse(s)
              if (bk?.product_name) return bk.product_name.split(' ')[0]
            }
          } catch {
            // ignore
          }
          return campaignName || 'TravelMate'
        })()

  // Progressive wizard step unlocking (steps 2..5 stay invisible until unlocked!)
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(() => getMaxUnlockedStep())

  useEffect(() => {
    setMaxUnlockedStep(getMaxUnlockedStep())
  }, [location.pathname, location.search])

  useEffect(() => {
    const handleStepUnlocked = (e) => {
      const next = e.detail?.maxStep || getMaxUnlockedStep()
      setMaxUnlockedStep(next)
    }
    window.addEventListener('cg_step_unlocked', handleStepUnlocked)
    return () => window.removeEventListener('cg_step_unlocked', handleStepUnlocked)
  }, [])

  const currentStepNum = (() => {
    if (!currentStep) return 1
    const match = String(currentStep).match(/Step\s+(\d+)/i)
    return match ? parseInt(match[1], 10) : 1
  })()

  const activeStepParam = searchParams.get('step')
  const effectiveMaxStep = Math.max(
    maxUnlockedStep,
    currentPath === '/results' && activeTab === 'export'
      ? 6
      : currentPath === '/report-card'
      ? 5
      : currentStepNum
  )

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home, exact: true },
    { label: 'Brand & Personas', path: '/generator', icon: Layers, minStep: 1, stepNum: 1 },
    { label: 'Persona Strategy', path: '/strategy-concept?step=dna', icon: Target, minStep: 2, stepNum: 2, subStep: 'dna' },
    { label: 'Campaign Concepts', path: '/strategy-concept?step=concepts', icon: Sparkles, minStep: 3, stepNum: 3, subStep: 'concepts' },
    { label: 'Campaign Assets', path: '/results?tab=assets', icon: FileText, tab: 'assets', minStep: 4, stepNum: 4 },
    { label: 'Brand Guardian', path: '/results?tab=guardian', icon: ShieldCheck, tab: 'guardian', minStep: 5, stepNum: 5 },
    { label: 'Campaign Report Card', path: '/report-card', icon: Award, minStep: 5 },
    { label: 'Export', path: '/results?tab=export', icon: Download, tab: 'export', minStep: 6 },
    { label: 'Campaign History', path: '/history', icon: History },
  ]

  // Only show steps that have been unlocked in the current flow
  const visibleNavItems = navItems.filter((item) => {
    if (!item.minStep) return true
    return effectiveMaxStep >= item.minStep
  })

  const isNavActive = (item) => {
    if (item.tab) {
      return currentPath === '/results' && (activeTab === item.tab || (!activeTab && item.tab === 'assets'))
    }
    if (item.subStep) {
      if (currentPath !== '/strategy-concept') return false
      if (activeStepParam) return activeStepParam === item.subStep
      return currentStep === (item.subStep === 'dna' ? 'Step 2 of 5' : 'Step 3 of 5')
    }
    return currentPath === item.path
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F6F7FB] font-sans antialiased text-slate-800">
      {/* ─── Left Sidebar (Collapsible with Open / Close feature) ──────────────── */}
      <aside
        className={`${
          isCollapsed ? 'w-20 p-2.5' : 'w-64 p-4'
        } shrink-0 bg-[#120F29] text-white flex flex-col justify-between select-none border-r border-[#1F1B40] transition-all duration-300 ease-in-out relative overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent`}
      >
        <div>
          {/* Header: Logo and Close / Open button */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between mb-4 px-1">
              <Link to="/dashboard" className="flex items-center gap-2.5 group overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-900/40 shrink-0">
                  <Shield className="w-5 h-5 fill-white/20 text-white" />
                </div>
                <div className="truncate">
                  <span className="font-extrabold text-base tracking-tight text-white block leading-tight truncate">
                    CampaignGuard <span className="text-purple-400">AI</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block truncate">
                    Guardrail Marketing
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={toggleSidebar}
                title="Close sidebar"
                aria-label="Close sidebar"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 mb-4">
              <Link to="/dashboard" title="CampaignGuard AI — Guardrail Marketing" className="group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-900/40">
                  <Shield className="w-5 h-5 fill-white/20 text-white" />
                </div>
              </Link>
              <button
                type="button"
                onClick={toggleSidebar}
                title="Open sidebar"
                aria-label="Open sidebar"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer mt-0.5"
              >
                <PanelLeftOpen className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          )}

          {/* Studio Label or divider */}
          {!isCollapsed ? (
            <div className="px-3 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Campaign Studio
              </span>
            </div>
          ) : (
            <div className="w-8 h-px bg-white/10 mx-auto my-2" />
          )}

          {/* Navigation Links (progressively revealed by wizard step) */}
          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const active = isNavActive(item)
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  state={location.state}
                  title={item.stepNum ? `Step ${item.stepNum}: ${item.label}` : item.label}
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center p-2.5' : 'justify-between gap-2 px-3.5 py-2.5'
                  } rounded-xl text-xs font-semibold transition-all relative group ${
                    active
                      ? 'bg-purple-600/30 text-white border border-purple-500/30 font-bold shadow-xs'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`${
                        isCollapsed ? 'w-5 h-5' : 'w-4 h-4'
                      } shrink-0 ${active ? 'text-purple-400' : 'text-slate-400'}`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.stepNum && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                        active
                          ? 'bg-purple-500/40 text-purple-100'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {item.stepNum}
                    </span>
                  )}
                  {isCollapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                      {item.stepNum ? `Step ${item.stepNum}: ${item.label}` : item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Previous Campaigns Section in Side Navbar */}
          {isCollapsed ? (
            <div className="pt-3 mt-2 border-t border-white/10 flex justify-center">
              <Link
                to="/history"
                title={`Previous Campaigns (${previousCampaigns.length})`}
                className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors group flex items-center justify-center"
              >
                <Clock className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-purple-600 text-white border border-[#120F29]">
                  {previousCampaigns.length}
                </span>
                <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                  Previous Campaigns ({previousCampaigns.length})
                </span>
              </Link>
            </div>
          ) : (
            <div className="pt-4 mt-3 border-t border-white/10">
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Previous Campaigns
                </span>
                <span className="text-[10px] font-extrabold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  {previousCampaigns.length}
                </span>
              </div>

              <div className="space-y-1 max-h-44 overflow-y-auto pr-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                {previousCampaigns.length === 0 ? (
                  <div className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[11px] text-slate-400 block">No saved campaigns yet</span>
                    <Link
                      to="/generator"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 mt-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Start Campaign →</span>
                    </Link>
                  </div>
                ) : (
                  previousCampaigns.map((camp) => {
                    const isSelected =
                      currentPath === '/history' && searchParams.get('id') === camp.id
                    const isDraft = camp.status === 'Draft'
                    const step = camp.current_step || 1

                    return (
                      <Link
                        key={camp.id}
                        to={`/history?id=${camp.id}`}
                        title={isDraft ? `Draft Campaign (Step ${step} of 5) — Click to view & resume` : camp.product_name}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all group ${
                          isSelected
                            ? 'bg-purple-600/30 text-white border border-purple-500/30 font-bold'
                            : isDraft
                            ? 'bg-amber-500/10 text-slate-200 hover:bg-amber-500/20 hover:text-white border border-amber-500/30'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <span className="block truncate text-xs font-semibold">
                            {camp.product_name}
                          </span>
                          <span className="block truncate text-[10px] text-slate-400 font-normal">
                            {isDraft ? `🟡 Draft • Step ${step} of 5` : (camp.concept_title || camp.persona_name || 'Campaign')}
                          </span>
                        </div>
                        {isDraft ? (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/40 shrink-0">
                            Step {step}/5
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 shrink-0">
                            {camp.score || 96}%
                          </span>
                        )}
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom: User Profile + Sign Out — always pinned */}
        <div className="pt-3 border-t border-white/10">
          {!isCollapsed ? (
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              {/* User info row */}
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-xs font-semibold text-white leading-tight">
                    {user?.name || 'Marketer'}
                  </span>
                  <span className="block truncate text-[10px] text-slate-400 leading-tight">
                    {user?.email || ''}
                  </span>
                </div>
              </div>
              {/* Sign out — always visible, prominent */}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border-t border-white/10"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div
                title={`${user?.name || 'Marketer'} — ${user?.email || ''}`}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-sm relative group cursor-default"
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                  {user?.name || 'Marketer'}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                aria-label="Sign Out"
                className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer group relative"
              >
                <LogOut className="w-4 h-4" />
                <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                  Sign Out
                </span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main Content Pane ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar — minimal, blends with page bg */}
        <header className="h-12 bg-[#F6F7FB] border-b border-slate-200/60 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Open / Close Sidebar Toggle Button */}
            <button
              type="button"
              onClick={toggleSidebar}
              title={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
              aria-label={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-purple-600" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-500" />
              )}
              <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                {isCollapsed ? 'Open Sidebar' : 'Close Sidebar'}
              </span>
            </button>

            {currentStep && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                {currentStep}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            {/* Avatar + sign out dropdown hint */}
            <div className="flex items-center gap-2 group relative">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm cursor-default">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              {user?.name && (
                <span className="text-xs font-semibold text-slate-700 hidden sm:block max-w-[100px] truncate">
                  {user.name}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
