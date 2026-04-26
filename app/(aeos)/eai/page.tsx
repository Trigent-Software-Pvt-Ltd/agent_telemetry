export default function EAIBoardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 style={{ fontSize: 'var(--aeos-fs-title)', fontWeight: 600 }}>EAI Board</h1>
        <p style={{ color: 'var(--aeos-fg-secondary)', marginTop: 4 }}>
          The board-level autonomy metric. Signed by FuzeBox + rPotential.
        </p>
      </header>
      <div className="aeos-card">
        <p style={{ color: 'var(--aeos-fg-muted)' }}>
          Phase 3 build — EAIHero, EAISubMetrics (UCS, SY, SER, EROI, HPI, HLR), EAIFormula, RollingTimeSeries.
        </p>
      </div>
    </div>
  )
}
