import React from 'react'
import { ShieldCheck, Users, Sparkles, Wand2, CheckCircle2 } from 'lucide-react'

const CATEGORIES = [
  {
    key: 'brand_consistency',
    label: 'Brand Consistency',
    icon: ShieldCheck,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    desc: 'Alignment with brand voice, tone & style',
  },
  {
    key: 'persona_relevance',
    label: 'Persona Relevance',
    icon: Users,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    desc: 'Resonance with audience emotional triggers',
  },
  {
    key: 'marketing_quality',
    label: 'Marketing Quality',
    icon: Sparkles,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    desc: 'Persuasion, readability & channel format',
  },
  {
    key: 'creativity',
    label: 'Creativity',
    icon: Wand2,
    color: 'text-fuchsia-600',
    bg: 'bg-fuchsia-50',
    desc: 'Angle distinctiveness & hook novelty',
  },
  {
    key: 'compliance',
    label: 'Compliance',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    desc: 'Zero banned words & length boundary rules',
  },
]

export default function ScoreBreakdownGrid({ scores = {} }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon
        const score = scores[cat.key] ?? 90
        const isGood = score >= 85
        const isWarning = score >= 70 && score < 85

        return (
          <div
            key={cat.key}
            className="bg-white border border-slate-200/80 hover:border-purple-300 rounded-2xl p-4.5 shadow-xs transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isGood
                    ? 'bg-emerald-50 text-emerald-700'
                    : isWarning
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {isGood ? 'Optimal' : isWarning ? 'Pass' : 'Review'}
              </span>
            </div>

            <div>
              <div className="text-xl font-black text-slate-900 tracking-tight">
                {score} <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
              <div className="text-xs font-bold text-slate-800 tracking-tight mt-0.5">
                {cat.label}
              </div>
              <div className="text-[10px] text-slate-500 font-normal leading-tight mt-1 line-clamp-1">
                {cat.desc}
              </div>
            </div>

            {/* Micro progress meter */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isGood
                    ? 'bg-purple-600'
                    : isWarning
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
