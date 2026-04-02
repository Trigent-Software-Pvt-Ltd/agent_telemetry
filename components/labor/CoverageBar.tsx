interface CoverageBarProps {
  agentPct: number
  collaborativePct: number
  humanPct: number
}

export default function CoverageBar({ agentPct, collaborativePct, humanPct }: CoverageBarProps) {
  const sections = [
    { label: 'Agent', pct: agentPct, color: 'var(--status-green)', bg: 'var(--status-green-bg)' },
    { label: 'Collaborative', pct: collaborativePct, color: 'var(--status-amber)', bg: 'var(--status-amber-bg)' },
    { label: 'Human', pct: humanPct, color: 'var(--text-muted)', bg: 'var(--surface)' },
  ]

  return (
    <div className="card animate-fade-up">
      <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
        Labor Coverage Split
      </h3>
      <div className="flex w-full h-12 rounded-lg overflow-hidden">
        {sections.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-center gap-1.5 text-sm font-semibold transition-all"
            style={{
              width: `${Math.round(s.pct * 100)}%`,
              backgroundColor: s.color,
              color: '#FFFFFF',
            }}
          >
            <span>{Math.round(s.pct * 100)}%</span>
            <span className="hidden sm:inline font-normal">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-6 mt-3">
        {sections.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs text-text-secondary">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            <span>{s.label} — {Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
