'use client'

import BuildVsBuy from '@/components/insights/BuildVsBuy'

export default function BuildVsBuyPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
        >
          Build vs Buy Analysis
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Per-process comparison of building custom AI solutions versus purchasing vendor platforms. Weighted decision matrix included.
        </p>
      </div>

      <BuildVsBuy />
    </div>
  )
}
