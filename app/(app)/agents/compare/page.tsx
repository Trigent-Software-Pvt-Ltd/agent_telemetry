'use client'

import { AgentComparisonView } from '@/components/telemetry/AgentComparisonView'
import { Scale } from 'lucide-react'

export default function AgentComparePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: '#D4AF3714' }}
        >
          <Scale size={20} style={{ color: '#D4AF37' }} />
        </div>
        <div>
          <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
            Agent A/B Comparison
          </h1>
          <p className="text-sm" style={{ color: '#64748B' }}>
            Compare two agents side-by-side across key performance dimensions
          </p>
        </div>
      </div>

      <AgentComparisonView />
    </div>
  )
}
