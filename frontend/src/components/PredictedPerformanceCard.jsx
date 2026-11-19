import React from 'react'
import { TrendingUp, Mail, MousePointerClick, ArrowUpRight, Share2 } from 'lucide-react'

// Custom clean LinkedIn icon
function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

export default function PredictedPerformanceCard({ performance = {} }) {
  const metrics = [
    {
      label: 'LinkedIn Engagement',
      value: performance.linkedin_engagement_rate || '4.8%',
      benchmark: performance.linkedin_benchmark || '3.8%',
      icon: LinkedInIcon,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      status: '+26% vs industry benchmark',
    },
    {
      label: 'Email Open Rate',
      value: performance.email_open_rate || '28.4%',
      benchmark: performance.email_benchmark || '21.5%',
      icon: Mail,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      status: '+32% vs industry benchmark',
    },
    {
      label: 'Click-Through Rate (CTR)',
      value: performance.click_through_rate || '3.6%',
      benchmark: performance.ctr_benchmark || '2.4%',
      icon: MousePointerClick,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      status: '+50% vs industry benchmark',
    },
  ]

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">Predicted Channel Performance</h3>
            <p className="text-[11px] text-slate-500">Predictive conversion & engagement benchmarks</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          Heuristic Forecast
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {metrics.map((m, idx) => {
          const Icon = m.icon
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-purple-200 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600">{m.label}</span>
                <div className={`w-6 h-6 rounded-md ${m.bg} ${m.color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900">{m.value}</span>
                <span className="text-[10px] text-slate-400 font-medium">Avg: {m.benchmark}</span>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                <ArrowUpRight className="w-3 h-3" />
                <span>{m.status}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
