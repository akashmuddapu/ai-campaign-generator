import React from 'react'
import { ShieldCheck, ShieldAlert, ShieldX, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'
import BrandGuardianBadge from './BrandGuardianBadge'

export default function ValidationReportCard({ report }) {
  if (!report) return null

  const {
    overall_score = 100,
    status = 'pass',
    dimensions = {},
    violations = [],
    diagnostic_reasoning = '',
  } = report

  const dimensionList = [
    { key: 'brand_fit', label: 'Brand Fit', data: dimensions.brand_fit },
    { key: 'persona_fit', label: 'Persona Fit', data: dimensions.persona_fit },
    { key: 'channel_fit', label: 'Channel Fit', data: dimensions.channel_fit },
    { key: 'rule_compliance', label: 'Rule Compliance', data: dimensions.rule_compliance },
    { key: 'length_check', label: 'Length Check', data: dimensions.length_check, isDeterministic: true },
    { key: 'banned_words_check', label: 'Banned Words', data: dimensions.banned_words_check, isDeterministic: true },
  ]

  const renderStatusIcon = (dimStatus, passed) => {
    if (passed === true || dimStatus === 'pass') {
      return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
    }
    if (dimStatus === 'warning') {
      return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
    }
    return <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            🛡️
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Brand Guardian Audit</h4>
            <span className="text-[11px] text-slate-500">
              Deterministic & Semantic Compliance
            </span>
          </div>
        </div>
        <BrandGuardianBadge score={overall_score} status={status} />
      </div>

      {/* Itemized Dimensions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
        {dimensionList.map((dim) => {
          const isPassed =
            dim.data?.passed !== undefined ? dim.data.passed : dim.data?.status === 'pass'

          return (
            <div
              key={dim.key}
              className={`p-2.5 rounded-xl border flex items-start justify-between text-xs transition-colors ${
                isPassed ? 'bg-slate-50/70 border-slate-200' : 'bg-rose-50/60 border-rose-200'
              }`}
            >
              <div>
                <span className="font-semibold text-slate-800 block">{dim.label}</span>
                {dim.data?.score !== undefined && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Score: {dim.data.score}/100
                  </span>
                )}
                {dim.key === 'length_check' && dim.data && (
                  <span className="text-[11px] text-slate-500 block font-mono">
                    {dim.data.current}/{dim.data.limit} {dim.data.unit || 'units'}
                  </span>
                )}
                {dim.key === 'banned_words_check' && dim.data?.flagged_words?.length > 0 && (
                  <span className="text-[10px] text-rose-600 font-bold block truncate max-w-[120px]">
                    Flagged: {dim.data.flagged_words.join(', ')}
                  </span>
                )}
              </div>
              {renderStatusIcon(dim.data?.status, dim.data?.passed)}
            </div>
          )
        })}
      </div>

      {/* Violations Alert Callout */}
      {violations && violations.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Violations Detected ({violations.length})</span>
          </div>
          <ul className="list-disc list-inside text-xs text-rose-700 space-y-0.5">
            {violations.map((violation, idx) => (
              <li key={idx} className="font-medium">
                {typeof violation === 'string' ? violation : violation.message || JSON.stringify(violation)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Diagnostic Reasoning */}
      {diagnostic_reasoning && (
        <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2">
          <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-purple-900 font-semibold">Diagnostic Feedback: </strong>
            {diagnostic_reasoning}
          </p>
        </div>
      )}
    </div>
  )
}
