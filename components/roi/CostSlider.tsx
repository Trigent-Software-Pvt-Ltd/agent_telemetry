'use client'

interface CostSliderProps {
  value: number
  onChange: (value: number) => void
}

export function CostSlider({ value, onChange }: CostSliderProps) {
  return (
    <div className="card flex flex-col gap-3">
      <label
        className="text-[10px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: '#64748B' }}
      >
        Manual cost per task ($)
      </label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={5}
          max={500}
          step={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-[var(--accent-blue)] h-2 cursor-pointer"
          style={{ accentColor: 'var(--accent-blue)' }}
        />
        <span
          className="text-lg font-bold tabular-nums font-[var(--font-sora)] min-w-[64px] text-right"
          style={{ color: '#0A1628' }}
        >
          ${value}
        </span>
      </div>
      <div className="flex justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
        <span>$5</span>
        <span>$500</span>
      </div>
    </div>
  )
}
