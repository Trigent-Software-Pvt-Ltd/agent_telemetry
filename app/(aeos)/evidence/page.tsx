export default function EvidenceExportPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 style={{ fontSize: 'var(--aeos-fs-title)', fontWeight: 600 }}>Evidence Export</h1>
        <p style={{ color: 'var(--aeos-fg-secondary)', marginTop: 4 }}>
          Two-party signed bundles · EU AI Act · WP.29 · GDPR · SOC 2.
        </p>
      </header>
      <div className="aeos-card">
        <p style={{ color: 'var(--aeos-fg-muted)' }}>Phase 5 build — ExportForm + BundleQueue + SignatureRevealModal.</p>
      </div>
    </div>
  )
}
