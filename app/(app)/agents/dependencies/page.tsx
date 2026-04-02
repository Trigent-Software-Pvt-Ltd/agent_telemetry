'use client'

import { DependencyMap } from '@/components/telemetry/DependencyMap'
import { GitBranch } from 'lucide-react'

export default function AgentDependenciesPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: '#D4AF3714' }}
        >
          <GitBranch size={20} style={{ color: '#D4AF37' }} />
        </div>
        <div>
          <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
            Agent Dependencies
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            Data flow relationships and shared resources between agents
          </p>
        </div>
      </div>

      <DependencyMap />
    </div>
  )
}
