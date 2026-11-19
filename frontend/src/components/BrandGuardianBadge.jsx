import React from 'react'
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

export default function BrandGuardianBadge({ score = 100, status }) {
  // Determine status if not explicitly passed
  const resolvedStatus = status || (score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail')

  let config = {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
    label: 'PASS',
    Icon: ShieldCheck,
  }

  if (resolvedStatus === 'warning') {
    config = {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800',
      label: 'WARNING',
      Icon: ShieldAlert,
    }
  } else if (resolvedStatus === 'fail') {
    config = {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-700',
      badge: 'bg-rose-100 text-rose-800',
      label: 'FAIL',
      Icon: ShieldX,
    }
  }

  const { Icon } = config

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${config.bg} ${config.border} shadow-2xs`}
      title={`Brand Guardian Compliance Score: ${score}/100`}
    >
      <Icon className={`w-4 h-4 ${config.text}`} />
      <span className={`text-sm font-black tracking-tight ${config.text}`}>
        {score}/100
      </span>
      <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${config.badge}`}>
        {config.label}
      </span>
    </div>
  )
}
