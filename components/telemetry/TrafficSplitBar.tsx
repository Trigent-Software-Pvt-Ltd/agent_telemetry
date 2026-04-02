'use client'

interface TrafficSplitBarProps {
  productionPercent: number
  onSplitChange: (productionPercent: number) => void
  disabled?: boolean
}

export function TrafficSplitBar({ productionPercent, onSplitChange, disabled = false }: TrafficSplitBarProps) {
  const stagingPercent = 100 - productionPercent

  return (
    <div className="card">
      <h3 className="text-sm font-semibold font-[var(--font-sora)] mb-3" style={{ color: '#0A1628' }}>
        Traffic Split
      </h3>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-6 rounded-full overflow-hidden flex" style={{ background: '#E2E8F0' }}>
          <div
            className="h-full flex items-center justify-center text-[11px] font-semibold text-white transition-all duration-300"
            style={{ width: `${productionPercent}%`, background: '#0891B2', minWidth: productionPercent > 0 ? 40 : 0 }}
          >
            {productionPercent > 8 && `${productionPercent}%`}
          </div>
          <div
            className="h-full flex items-center justify-center text-[11px] font-semibold text-white transition-all duration-300"
            style={{ width: `${stagingPercent}%`, background: '#D4AF37', minWidth: stagingPercent > 0 ? 40 : 0 }}
          >
            {stagingPercent > 8 && `${stagingPercent}%`}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#0891B2' }} />
          <span className="text-xs" style={{ color: '#64748B' }}>Production</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#D4AF37' }} />
          <span className="text-xs" style={{ color: '#64748B' }}>Staging</span>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={productionPercent}
        onChange={e => onSplitChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full accent-[#D4AF37] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <p className="text-xs mt-2 text-center" style={{ color: '#64748B' }}>
        Currently: {productionPercent}% production / {stagingPercent}% staging
      </p>
    </div>
  )
}
