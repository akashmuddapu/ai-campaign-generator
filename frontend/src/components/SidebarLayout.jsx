import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Shield,
  Home,
  Layers,
  Sparkles,
  FileText,
  ShieldCheck,
  Download,
  History,
  Bell,
  LogOut,
  ChevronRight,
  Clock,
} from 'lucide-react'
import api from '../services/api'

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

  // Previous campaigns list for sidebar
  const [previousCampaigns, setPreviousCampaigns] = useState(() => {
    try {
      const s = sessionStorage.getItem('cg_campaign_history')
      return s ? JSON.parse(s) : DEFAULT_PREVIOUS
    } catch {
      return DEFAULT_PREVIOUS
    }
  })

  // Fetch previous campaigns on mount / login
  useEffect(() => {
    api
      .get('/campaigns')
      .then((res) => {
        if (res.data?.campaigns && res.data.campaigns.length > 0) {
          setPreviousCampaigns(res.data.campaigns)
          try {
            sessionStorage.setItem('cg_campaign_history', JSON.stringify(res.data.campaigns))
          } catch {}
        }
      })
      .catch(() => {
        // Fall back to storage or default
      })
  }, [])

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

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home, exact: true },
    { label: 'Brand & Personas', path: '/generator', icon: Layers },
    { label: 'Campaign Concepts', path: '/strategy-concept', icon: Sparkles },
    { label: 'Campaign Assets', path: '/results', icon: FileText, tab: 'assets' },
    { label: 'Brand Guardian', path: '/results?tab=guardian', icon: ShieldCheck, tab: 'guardian' },
    { label: 'Export', path: '/results?tab=export', icon: Download, tab: 'export' },
    { label: 'Campaign History', path: '/history', icon: History },
  ]

  const isNavActive = (item) => {
    if (item.tab) {
      return currentPath === '/results' && (activeTab === item.tab || (!activeTab && item.tab === 'assets'))
    }
    return currentPath === item.path
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F6F7FB] font-sans antialiased text-slate-800">
      {/* ─── Left Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-[#120F29] text-white flex flex-col justify-between p-4 select-none border-r border-[#1F1B40]">
        <div>
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-3 mb-4 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-900/40">
              <Shield className="w-5 h-5 fill-white/20 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                CampaignGuard <span className="text-purple-400">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Guardrail Marketing
              </span>
            </div>
          </Link>

          {/* Studio Label */}
          <div className="px-3 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Campaign Studio
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isNavActive(item)
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  state={location.state}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-purple-600/30 text-white border border-purple-500/30 font-bold shadow-xs'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Previous Campaigns Section in Side Navbar */}
          <div className="pt-4 mt-3 border-t border-white/10">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Previous Campaigns
              </span>
              <span className="text-[10px] font-extrabold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                {previousCampaigns.length}
              </span>
            </div>

            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {previousCampaigns.map((camp) => {
                const isSelected =
                  currentPath === '/history' && searchParams.get('id') === camp.id
                return (
                  <Link
                    key={camp.id}
                    to={`/history?id=${camp.id}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all group ${
                      isSelected
                        ? 'bg-purple-600/30 text-white border border-purple-500/30 font-bold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <span className="block truncate text-xs font-semibold">
                        {camp.product_name}
                      </span>
                      <span className="block truncate text-[10px] text-slate-400 font-normal">
                        {camp.concept_title || camp.persona_name || 'Campaign'}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 shrink-0">
                      {camp.score || 96}%
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Campaign Status Card */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs">
            <div className="text-slate-400 font-medium text-[11px]">
              Campaign: <span className="text-white font-bold">{resolvedCampaignName}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] text-emerald-300 font-semibold">Status: {campaignStatus}</span>
            </div>
          </div>

          {/* User Profile / Logout */}
          <div className="flex items-center justify-between px-1 text-xs">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="truncate text-slate-300 font-medium max-w-[110px]">
                {user?.name || 'Marketer'}
              </span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Main Content Pane ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {currentStep && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                {currentStep}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
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
