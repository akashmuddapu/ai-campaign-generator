import React, { useState } from 'react'
import {
  Share2,
  Mail,
  Wand2,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import ValidationReportCard from './ValidationReportCard'

export default function AssetCard({
  asset,
  onAutoFix,
  onExplain,
  onRegenerate,
  isAutoFixing = false
}) {
  const [copied, setCopied] = useState(false)

  if (!asset) return null

  const { channel_type, content = {}, validation_report } = asset
  const isSocial = channel_type === 'social_post'
  const hasViolations = validation_report?.violations?.length > 0 || validation_report?.status === 'fail'

  const handleCopy = () => {
    let textToCopy = ''
    if (isSocial) {
      textToCopy = `${content.headline || ''}\n\n${content.body || ''}\n\n${(content.hashtags || []).join(' ')}`
    } else {
      textToCopy = `Subject: ${content.subject_line || ''}\nPreview: ${content.preview_text || ''}\n\n${content.body || ''}\n\nCTA: ${content.call_to_action || ''}`
    }
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate live lengths
  const socialCharCount = (content.body || '').length
  const emailSubjectLen = (content.subject_line || '').length
  const emailBodyWordCount = (content.body || '').trim() ? (content.body || '').trim().split(/\s+/).length : 0

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              isSocial
                ? 'bg-sky-100 text-sky-700'
                : 'bg-purple-100 text-purple-700'
            }`}
          >
            {isSocial ? <Share2 className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-purple-600 block">
              {isSocial ? 'Social Media Campaign' : 'Marketing Email'}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {isSocial ? 'Engagement Post' : 'Direct Response Email'}
            </h3>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            title="Copy copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          {onRegenerate && (
            <button
              onClick={() => onRegenerate(channel_type)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Regenerate copy"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}
        </div>
      </div>

      {/* Asset Content Display */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 mb-5 space-y-3.5 text-slate-800">
        {isSocial ? (
          <>
            {content.headline && (
              <h4 className="text-base font-bold text-slate-950 leading-snug">
                {content.headline}
              </h4>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-normal text-slate-800">
              {content.body}
            </p>
            {content.hashtags && content.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {content.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {content.visual_suggestion && (
              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-start gap-2 text-xs text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Visual Concept: </strong>
                  {content.visual_suggestion}
                </span>
              </div>
            )}
            {/* Length pill */}
            <div className="flex justify-end pt-1">
              <span
                className={`text-[11px] font-mono font-medium ${
                  socialCharCount <= 280 ? 'text-slate-500' : 'text-rose-600 font-bold'
                }`}
              >
                {socialCharCount}/280 characters
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2 border-b border-slate-200/60 pb-3">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold text-slate-500 w-16">Subject:</span>
                <span className="font-bold text-slate-900 flex-1 text-sm">{content.subject_line}</span>
                <span
                  className={`text-[11px] font-mono ml-2 ${
                    emailSubjectLen <= 60 ? 'text-slate-400' : 'text-rose-600 font-bold'
                  }`}
                >
                  {emailSubjectLen}/60
                </span>
              </div>
              {content.preview_text && (
                <div className="flex items-baseline text-xs text-slate-500">
                  <span className="font-semibold text-slate-400 w-16">Preview:</span>
                  <span className="italic flex-1">{content.preview_text}</span>
                </div>
              )}
            </div>

            <div className="py-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-800">
              {content.body}
            </div>

            {content.call_to_action && (
              <div className="pt-2">
                <div className="inline-block bg-purple-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs">
                  {content.call_to_action}
                </div>
              </div>
            )}

            {/* Word count pill */}
            <div className="flex justify-end pt-1">
              <span
                className={`text-[11px] font-mono font-medium ${
                  emailBodyWordCount >= 75 && emailBodyWordCount <= 250
                    ? 'text-slate-500'
                    : 'text-rose-600 font-bold'
                }`}
              >
                {emailBodyWordCount} words (Target: 75–250)
              </span>
            </div>
          </>
        )}
      </div>

      {/* Brand Guardian Audit Component */}
      <div className="mb-4">
        <ValidationReportCard report={validation_report} />
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={() => onExplain && onExplain(asset)}
          className="flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-purple-200"
        >
          <HelpCircle className="w-4 h-4 text-purple-600" />
          <span>Why This Content?</span>
        </button>

        {hasViolations && (
          <button
            onClick={() => onAutoFix && onAutoFix(channel_type, asset)}
            disabled={isAutoFixing}
            className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:opacity-95 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            aria-label="Auto-Fix"
          >
            <Wand2 className={`w-4 h-4 ${isAutoFixing ? 'animate-spin' : ''}`} />
            <span>{isAutoFixing ? 'Auto-Fixing...' : 'Auto-Fix with Guardrails'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
