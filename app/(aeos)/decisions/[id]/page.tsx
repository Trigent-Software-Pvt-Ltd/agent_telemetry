export default async function DecisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="space-y-6">
      <header>
        <h1 style={{ fontSize: 'var(--aeos-fs-title)', fontWeight: 600 }}>Decision Explorer</h1>
        <p style={{ color: 'var(--aeos-fg-secondary)', marginTop: 4 }}>
          {id}
        </p>
      </header>
      <div className="aeos-card">
        <p style={{ color: 'var(--aeos-fg-muted)' }}>
          Phase 4 build — TaskHeader, UEFDecision, AdapterResult, ScoredPathTable, DIRPatch, PolicyEvaluation, LedgerRow, CrossVendorPatchPreview, VarianceShrinkageTimeline.
        </p>
      </div>
    </div>
  )
}
