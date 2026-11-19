import React from 'react'
import { ShieldCheck, Award, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function ExecutiveGradeBanner({
  overallScore = 95,
  grade = 'A+',
  launchReadiness = 'Ready to Launch',
  onImproveClick,
  isImproving = false,
}) {
  const getGradeColor = (g) => {
    if (g.startsWith('A')) return 'bg-emerald-500 text-white border-emerald-600'
    if (g === 'B') return 'bg-indigo-500 text-white border-indigo-600'
    if (g === 'C') return 'bg-amber-500 text-white border-amber-600'
    return 'bg-rose-500 text-white border-rose-600'
  }

  const getReadinessBadge = (status) => {
    if (status === 'Ready to Launch') {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
        label: 'Ready to Launch',
      }
    }
    if (status === 'Launch with Improvements') {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Sparkles,
        label: 'Launch with Improvements',
      }
    }
    return {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertTriangle,
      label: 'Needs Revision',
    }
  }

  const badgeInfo = getReadinessBadge(launchReadiness)
  const StatusIcon = badgeInfo.icon

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Shield icon + Overall Score + Grade + Tagline */}
        <div className="flex items-start sm:items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 shadow-inner">
            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-purple-700" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {overallScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>

              <span
                className={`text-xs sm:text-sm font-black px-3 py-1 rounded-xl shadow-xs border ${getGradeColor(
                  grade
                )}`}
              >
                Grade: {grade}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${badgeInfo.bg}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{badgeInfo.label}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-xl leading-relaxed">
              {overallScore >= 85
                ? 'Your campaign shows exemplary brand consistency, high audience relevance, and certified rule compliance.'
                : 'Your campaign has viable creative foundations but requires minor adjustments to maximize conversion.'}
            </p>
          </div>
        </div>

        {/* Right: "Improve Campaign" Button matching Image 2 Run Brand Auto-Fix */}
        <div className="shrink-0 flex items-center">
          <button
            type="button"
            onClick={onImproveClick}
            disabled={isImproving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md shadow-purple-900/20 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>{isImproving ? 'Analyzing Improvements…' : 'Improve Campaign'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
