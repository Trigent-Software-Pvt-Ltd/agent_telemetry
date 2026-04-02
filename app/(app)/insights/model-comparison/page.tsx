'use client'

import ModelComparison from '@/components/insights/ModelComparison'

export default function ModelComparisonPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
        >
          Model Cost Comparison
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Compare current model performance against alternatives. See cost, quality, and latency trade-offs.
        </p>
      </div>

      <ModelComparison />
    </div>
  )
}
