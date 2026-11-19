import React, { useState } from 'react'

const AXES = [
  { key: 'brand_consistency', label: 'Brand Consistency', short: 'Brand' },
  { key: 'persona_relevance', label: 'Persona Relevance', short: 'Persona' },
  { key: 'marketing_quality', label: 'Marketing Quality', short: 'Quality' },
  { key: 'creativity', label: 'Creativity', short: 'Creativity' },
  { key: 'compliance', label: 'Compliance', short: 'Compliance' },
]

export default function CampaignRadarChart({ scores = {} }) {
  const [activeAxis, setActiveAxis] = useState(null)

  const size = 320
  const center = size / 2
  const radius = 105
  const levels = [20, 40, 60, 80, 100]

  // Convert polar coordinates to Cartesian
  const getCoordinates = (value, index, total = 5) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2
    const r = (value / 100) * radius
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y }
  }

  // Generate grid polygon path for a given level (e.g. 20, 40, 60...)
  const getLevelPolygon = (lvl) => {
    return AXES.map((_, i) => {
      const { x, y } = getCoordinates(lvl, i)
      return `${x},${y}`
    }).join(' ')
  }

  // Data polygon path
  const dataPoints = AXES.map((axis, i) => {
    const val = Math.max(0, Math.min(100, scores[axis.key] ?? 85))
    return getCoordinates(val, i)
  })
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="h-full flex flex-col justify-between relative p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
        <span className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
          5-Dimension Balance Radar
        </span>
        <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full">
          Max: 100
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[290px] h-auto overflow-visible select-none mx-auto"
        >
        {/* Concentric pentagon grid lines */}
        {levels.map((lvl) => (
          <polygon
            key={lvl}
            points={getLevelPolygon(lvl)}
            fill={lvl === 100 ? 'rgba(243, 232, 255, 0.3)' : 'transparent'}
            stroke={lvl === 100 ? '#DDD6FE' : '#F1F5F9'}
            strokeWidth={lvl === 100 ? '1.5' : '1'}
            strokeDasharray={lvl < 100 ? '2,2' : undefined}
          />
        ))}

        {/* Axis radial spokes */}
        {AXES.map((_, i) => {
          const outer = getCoordinates(100, i)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          )
        })}

        {/* Data polygon filled */}
        <polygon
          points={dataPolygon}
          fill="rgba(147, 51, 234, 0.22)"
          stroke="#7C3AED"
          strokeWidth="2.5"
          className="transition-all duration-300 ease-out hover:fill-purple-500/30"
        />

        {/* Data point vertices */}
        {dataPoints.map((pt, i) => {
          const axis = AXES[i]
          const val = scores[axis.key] ?? 85
          const isHovered = activeAxis === axis.key

          return (
            <g
              key={axis.key}
              className="cursor-pointer"
              onMouseEnter={() => setActiveAxis(axis.key)}
              onMouseLeave={() => setActiveAxis(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6 : 4.5}
                fill="#7C3AED"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="transition-all duration-200"
              />
            </g>
          )
        })}

        {/* Labels around perimeter */}
        {AXES.map((axis, i) => {
          const outer = getCoordinates(120, i)
          const val = scores[axis.key] ?? 85
          const isHovered = activeAxis === axis.key

          let textAnchor = 'middle'
          if (i === 1 || i === 2) textAnchor = 'start'
          if (i === 3 || i === 4) textAnchor = 'end'

          return (
            <g key={axis.key}>
              <text
                x={outer.x}
                y={outer.y}
                textAnchor={textAnchor}
                className={`text-[11px] font-bold transition-colors ${
                  isHovered ? 'fill-purple-700' : 'fill-slate-700'
                }`}
                style={{ fontSize: '11px' }}
              >
                {axis.label}
              </text>
              <text
                x={outer.x}
                y={outer.y + 12}
                textAnchor={textAnchor}
                className="text-[10px] font-extrabold fill-purple-600"
                style={{ fontSize: '10px' }}
              >
                {val}/100
              </text>
            </g>
          )
        })}
        </svg>
      </div>
    </div>
  )
}
