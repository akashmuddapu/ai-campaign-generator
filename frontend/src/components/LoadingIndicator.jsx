import React from 'react'
import { Shield, Sparkles, Loader2 } from 'lucide-react'

export default function LoadingIndicator({
  message = 'Generating brand-safe campaign...',
  subtext,
  stage = 1,
  totalStages = 4,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
      {/* Icon with glowing pulse effect */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-300 animate-pulse">
          <Shield className="w-8 h-8 fill-purple-200/40" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-sm animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main message */}
      <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
        <span>{message}</span>
      </h3>

      {/* Subtext */}
      {subtext && (
        <p className="text-sm text-slate-500 mb-5 leading-relaxed">
          {subtext}
        </p>
      )}

      {/* Progress pill indicator */}
      <div className="w-full bg-purple-100 rounded-full h-1.5 overflow-hidden mt-2">
        <div 
          className="bg-gradient-to-r from-purple-600 to-indigo-600 h-1.5 rounded-full animate-pulse transition-all duration-500"
          style={{ width: `${Math.max(25, (stage / totalStages) * 100)}%` }}
        />
      </div>
      <span className="text-[11px] font-semibold text-purple-700 tracking-wider uppercase mt-2">
        Brand Guardian Active
      </span>
    </div>
  )
}
