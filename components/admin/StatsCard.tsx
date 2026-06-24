import type { LucideIcon } from 'lucide-react'

type ColorVariant = 'rust' | 'green' | 'blue' | 'gray'

interface StatsCardProps {
  Icon: LucideIcon
  label: string
  value: number | string
  subLabel?: string
  variant?: ColorVariant
}

const variantConfig: Record<ColorVariant, { bg: string; icon: string; text: string }> = {
  rust:  { bg: 'bg-rust/10',    icon: 'text-rust',        text: 'text-rust' },
  green: { bg: 'bg-green-50',   icon: 'text-green-600',   text: 'text-green-600' },
  blue:  { bg: 'bg-blue-50',    icon: 'text-blue-600',    text: 'text-blue-600' },
  gray:  { bg: 'bg-gray-100',   icon: 'text-gray-500',    text: 'text-gray-600' },
}

export default function StatsCard({
  Icon,
  label,
  value,
  subLabel,
  variant = 'gray',
}: StatsCardProps) {
  const cfg = variantConfig[variant]
  return (
    <div className="bg-white border border-gray-100 p-6 flex items-start gap-4">
      <div className={`w-12 h-12 ${cfg.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${cfg.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-barlow uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <p className={`font-barlow font-800 text-3xl ${cfg.text} leading-none`}>{value}</p>
        {subLabel && (
          <p className="text-xs text-gray-400 mt-1.5">{subLabel}</p>
        )}
      </div>
    </div>
  )
}
