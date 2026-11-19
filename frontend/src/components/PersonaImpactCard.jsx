import React from 'react'
import { Users, Target, Zap, GraduationCap, Briefcase, Plane } from 'lucide-react'

function getPersonaIcon(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('student') || n.includes('college')) return GraduationCap
  if (n.includes('professional') || n.includes('ciso') || n.includes('exec') || n.includes('cto')) return Briefcase
  return Target
}

export default function PersonaImpactCard({ personas = [] }) {
  if (!personas || personas.length === 0) {
    personas = [
      {
        persona_id: 'p-1',
        persona_name: 'Target Audience',
        relevance_score: 95,
        primary_trigger: 'High efficiency, reliable performance, and peace of mind.',
      },
    ]
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">Persona Impact Analysis</h3>
            <p className="text-[11px] text-slate-500">Segment differentiation & resonance triggers</p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
          {personas.length} {personas.length === 1 ? 'Segment' : 'Segments'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {personas.map((p, idx) => {
          const Icon = getPersonaIcon(p.persona_name)
          const score = p.relevance_score ?? 92

          return (
            <div
              key={p.persona_id || idx}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-purple-200 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-purple-700 flex items-center justify-center shadow-2xs">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{p.persona_name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                    Fit: {score}%
                  </span>
                </div>
              </div>

              <div className="pt-1 text-[11px] text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800 flex items-center gap-1 mb-0.5">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Primary Marketing Trigger:
                </span>
                <p className="text-slate-600 italic pl-4 border-l-2 border-purple-200">
                  "{p.primary_trigger}"
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
