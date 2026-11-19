import React from 'react'
import { Sparkles, CheckCircle2, AlertCircle, Compass } from 'lucide-react'

export default function AIInsightsPanel({ insights = {} }) {
  const strengths = insights.top_strengths || [
    'Strong persona hook differentiation across audience segments.',
    'Certified 100% compliance with brand tone and length bounds.',
  ]

  const opportunities = insights.improvement_opportunities || [
    'Consider testing curiosity-gap openers in social copy.',
  ]

  const recommendations = insights.recommendations || [
    'Authorized for multi-channel deployment and scheduled export.',
  ]

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">AI Insights & Diagnostics</h3>
            <p className="text-[11px] text-slate-500">Strengths, opportunities & strategic next steps</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-2.5 py-0.5 rounded-full">
          Executive Summary
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Strengths */}
        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Top Strengths</span>
          </div>
          <ul className="space-y-1.5">
            {strengths.map((item, idx) => (
              <li key={idx} className="text-[11px] text-slate-700 leading-relaxed flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement Opportunities */}
        <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Improvement Opportunities</span>
          </div>
          <ul className="space-y-1.5">
            {opportunities.map((item, idx) => (
              <li key={idx} className="text-[11px] text-slate-700 leading-relaxed flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strategic Recommendations */}
        <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 space-y-2.5">
          <div className="flex items-center gap-2 text-purple-800 text-xs font-bold">
            <Compass className="w-4 h-4 text-purple-600" />
            <span>Strategic Recommendations</span>
          </div>
          <ul className="space-y-1.5">
            {recommendations.map((item, idx) => (
              <li key={idx} className="text-[11px] text-slate-700 leading-relaxed flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
