export default function DynamicInstructionsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 style={{ fontSize: 'var(--aeos-fs-title)', fontWeight: 600 }}>Dynamic Instructions</h1>
        <p style={{ color: 'var(--aeos-fg-secondary)', marginTop: 4 }}>
          L9 control surface · 6 default rules · self-improving flywheel.
        </p>
      </header>
      <div className="aeos-card">
        <p style={{ color: 'var(--aeos-fg-muted)' }}>Phase 5 build — RuleList + RuleDetail + SynthesizedRulesPanel.</p>
      </div>
    </div>
  )
}
