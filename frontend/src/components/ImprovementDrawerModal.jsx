import React from 'react'
import { X, Sparkles, Wand2, ArrowRight, ShieldCheck, Check } from 'lucide-react'

export default function ImprovementDrawerModal({
  isOpen = false,
  onClose,
  suggestions = [],
  onApplyImprovements,
  isApplying = false,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative z-10 w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-white to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-purple-100" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Improve Campaign & Re-score
              </h2>
              <p className="text-[11px] text-slate-500">
                AI copy remediation based on Brand Guardian evaluations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
            <span className="font-bold">Prioritized Recommendations:</span> Our remediation engine identified the following optimizations to maximize conversion and achieve an A+ certified rating.
          </div>

          {suggestions.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Your campaign is already in top shape!</p>
              <p className="text-[11px] text-slate-500">No critical issues or policy breaches detected.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 bg-white transition-all space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      {item.channel === 'social_post' ? 'Social Post' : 'Marketing Email'} • {item.persona_name}
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {item.projected_score_boost || '+3 pts'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900">Current Issue:</div>
                    <p className="text-[11px] text-rose-700 bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                      {item.current_issue}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900">Recommended Action:</div>
                    <p className="text-[11px] text-slate-700 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {item.suggested_action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onApplyImprovements}
            disabled={isApplying}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-purple-900/20 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4 text-purple-200" />
            <span>{isApplying ? 'Regenerating & Re-scoring…' : 'Apply Improvements & Regenerate'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
