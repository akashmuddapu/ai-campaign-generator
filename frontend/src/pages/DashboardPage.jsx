import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Sparkles,
  Users,
  Shield,
  ArrowRight,
  TrendingUp,
  FolderKanban,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import SidebarLayout from '../components/SidebarLayout'

export default function DashboardPage({ user, onLogout }) {
  const navigate = useNavigate()

  return (
    <SidebarLayout user={user} onLogout={onLogout} campaignName="TravelMate" campaignStatus="Ready">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ─── Hero Banner matching Image 1 Screen 1 ───────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-8 md:p-10 shadow-lg shadow-purple-950/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Workspace Active</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              Build campaigns that understand your audience.
            </h1>

            <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed font-normal">
              Create personalized marketing content and validate every message against your brand rules.
            </p>

            <div className="pt-2">
              <Link
                to="/generator"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-purple-900/50 transition-all hover:scale-102 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Campaign</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 3 Feature Cards matching Image 1 Screen 1 ───────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-purple-300 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">AI Concepts</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Get multiple campaign ideas instantly from your core brand value propositions.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-purple-300 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Persona Tailoring</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Unique messaging for each audience with distinct psychological hooks.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-purple-300 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Brand Guardian</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Ensure brand consistency with smart checks, length rules, and 1-click auto-fix.
            </p>
          </div>
        </div>

        {/* ─── Active & Recent Campaigns ───────────────────────────────────── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Campaign Workspace & History</h2>
              <p className="text-xs text-slate-500">Pick up previous campaigns or view full audit reports</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/history"
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>View Full History & Reports</span>
              </Link>
              <span className="text-slate-300">|</span>
              <Link
                to="/generator"
                className="text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1"
              >
                <span>New Setup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* TravelMate Card */}
            <div className="p-4 rounded-xl border border-purple-200/80 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 transition-all space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">TravelMate Smart Mug</span>
                <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full">
                  Score: 96%
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">
                A smart travel mug that keeps drinks at your preferred temperature during your journey.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-purple-100 text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  Concept: Temperature That Travels
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    to="/history?id=camp-travelmate-001"
                    className="font-bold text-purple-700 hover:text-purple-900 text-xs"
                  >
                    View Report
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link
                    to="/generator"
                    className="font-bold text-slate-700 hover:text-slate-900 text-xs"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>

            {/* CyberShield Card */}
            <div className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-slate-50 transition-all space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">CyberShield Cloud</span>
                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Score: 98%
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">
                AI-powered enterprise cloud security and autonomous threat defense platform.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  Concept: The Proactive Guardrail
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    to="/history?id=camp-cybershield-002"
                    className="font-bold text-purple-700 hover:text-purple-900 text-xs"
                  >
                    View Report
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link
                    to="/generator"
                    className="font-bold text-slate-700 hover:text-slate-900 text-xs"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
