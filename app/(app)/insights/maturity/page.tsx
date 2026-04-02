'use client'

import MaturityScore from '@/components/insights/MaturityScore'

export default function MaturityPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
        >
          AI Maturity Assessment
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Evaluate your organisation&apos;s AI readiness across five key dimensions. Identify gaps and plan your path forward.
        </p>
      </div>

      <MaturityScore />
    </div>
  )
}
