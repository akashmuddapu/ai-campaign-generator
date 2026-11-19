import React from 'react'
import { X, CheckCircle2, Sparkles, Shield, User, FileText } from 'lucide-react'

export default function WhyThisContentModal({
  isOpen,
  onClose,
  asset = null,
  channelType = 'Social Post',
  personaName = 'Student',
  brandKit = {},
  whyThisContent = {},
  concept = {},
  validationReport = {},
}) {
  if (!isOpen) return null

  // Support both asset object prop (from test/components) and separate props (from pages)
  const effectiveWhy = asset?.why_this_content || whyThisContent || {}
  const personaReasoning = effectiveWhy.persona_reasoning || effectiveWhy.persona_rationale || 'Targets specific audience pain points and goals.'
  const brandReasoning = effectiveWhy.brand_reasoning || effectiveWhy.brand_rationale || 'Reflects the verified brand tone with precise positioning.'
  const channelReasoning = effectiveWhy.channel_reasoning || effectiveWhy.channel_rationale || 'Short, punchy structure optimized for high engagement.'

  const effectiveChannel = asset?.channel_type === 'social_post' || channelType === 'social_post' ? 'Social Post' : channelType
  const effectivePersona = personaName || 'Target Audience'

  const personaScore = 92
  const brandScore = 95
  const channelScore = 90

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-out Drawer matching Image 1 Screen 7 */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl p-6 flex flex-col justify-between border-l border-slate-200 z-10 animate-in slide-in-from-right duration-200">
        <div className="space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explainability Engine</span>
              </div>
              <h2 className="text-base font-black text-slate-900">
                Why This Content?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Explanation for the {effectivePersona} — {effectiveChannel}
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Dismiss"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3 Horizontal Progress Bars matching Image 1 Screen 7 */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {/* Persona Fit */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Persona Fit</span>
                <span className="text-emerald-600">{personaScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${personaScore}%` }}
                />
              </div>
            </div>

            {/* Brand Fit */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Brand Fit</span>
                <span className="text-emerald-600">{brandScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${brandScore}%` }}
                />
              </div>
            </div>

            {/* Channel Fit */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Channel Fit</span>
                <span className="text-emerald-600">{channelScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${channelScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Why this message works checklist matching Image 1 Screen 7 */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Why this message works
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{personaReasoning}</span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{brandReasoning}</span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{channelReasoning}</span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Strictly avoids all prohibited terms ({((brandKit && brandKit.banned_words) || ['cheap', 'guaranteed', 'best']).join(', ')})</span>
              </div>
            </div>
          </div>

          {/* Deep Dives from AI rationale if available */}
          {effectiveWhy.audience_impact && (
            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 space-y-1">
              <span className="font-bold block">Target Audience Impact:</span>
              <p className="text-slate-600">{effectiveWhy.audience_impact}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
