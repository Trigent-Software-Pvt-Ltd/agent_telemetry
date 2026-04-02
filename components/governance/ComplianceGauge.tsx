'use client'

interface ComplianceGaugeProps {
  satisfied: number
  total: number
}

export function ComplianceGauge({ satisfied, total }: ComplianceGaugeProps) {
  const pct = Math.round((satisfied / total) * 100)
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const filled = (pct / 100) * circumference
  const color = pct >= 90 ? 'var(--v-green)' : pct >= 70 ? 'var(--v-amber)' : 'var(--v-red)'

  return (
    <div className="card flex items-center gap-6">
      <div className="relative" style={{ width: 140, height: 140 }}>
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle
            cx={70} cy={70} r={radius}
            fill="none"
            stroke="var(--vip-border)"
            strokeWidth={10}
          />
          <circle
            cx={70} cy={70} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <span className="text-2xl font-bold font-[var(--font-sora)]" style={{ color }}>
            {pct}%
          </span>
          <span className="text-[10px]" style={{ color: 'var(--vip-muted)' }}>
            compliant
          </span>
        </div>
      </div>
      <div>
        <div className="text-lg font-semibold font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
          {satisfied} of {total} rules satisfied
        </div>
        <div className="text-sm mt-1" style={{ color: 'var(--vip-muted)' }}>
          {total - satisfied} rule{total - satisfied !== 1 ? 's' : ''} currently violated
        </div>
      </div>
    </div>
  )
}
