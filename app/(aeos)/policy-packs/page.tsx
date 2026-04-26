export default function PolicyPacksPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 style={{ fontSize: 'var(--aeos-fs-title)', fontWeight: 600 }}>Policy Packs</h1>
        <p style={{ color: 'var(--aeos-fg-secondary)', marginTop: 4 }}>
          EU AI Act high-risk · GDPR · SOC 2.
        </p>
      </header>
      <div className="aeos-card">
        <p style={{ color: 'var(--aeos-fg-muted)' }}>Phase 5 build — PolicyPackList + PolicyRuleTable.</p>
      </div>
    </div>
  )
}
