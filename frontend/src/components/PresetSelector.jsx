import React from 'react'
import { Sparkles, Building2, Coffee, CheckCircle2 } from 'lucide-react'

export default function PresetSelector({ presets = [], onSelect, selectedId }) {
  if (!presets || presets.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-2xl p-4 sm:p-5 shadow-xs mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-slate-900">
            1-Click Demo Presets
          </span>
          <span className="text-[10px] uppercase font-extrabold tracking-wider bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
            Instant Test
          </span>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Select a pre-configured brand to test immediately without typing
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {presets.map((preset) => {
          const isSelected = selectedId === preset.id
          const isB2B = preset.category === 'B2B Tech'

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect && onSelect(preset)}
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-purple-600 shadow-md ring-2 ring-purple-600/20'
                  : 'bg-white/80 hover:bg-white border-slate-200 hover:border-purple-300 shadow-xs'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isB2B
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isB2B ? <Building2 className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {preset.name}
                  </h4>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                    {preset.category}
                  </span>
                  <span className="text-xs text-slate-500 truncate">
                    Tone: {preset.brand_kit?.brand_tone}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 truncate">
                  Personas: {preset.personas?.map((p) => p.persona_name).join(', ')}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
