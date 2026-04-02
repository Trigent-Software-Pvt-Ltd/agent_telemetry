'use client'

import { useRef, useEffect, useState } from 'react'
import { AGENTS, PROCESSES, getAgentDependencies, type AgentDependency } from '@/lib/mock-data'
import { AlertTriangle, Database, ArrowRight } from 'lucide-react'

/* ── Card positions for the layout ─────────────────────────────── */

interface CardPos {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export function DependencyMap() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<CardPos[]>([])
  const deps = getAgentDependencies()

  // Group agents by process
  const processBuckets = PROCESSES.map(p => ({
    process: p,
    agents: AGENTS.filter(a => a.processId === p.id),
  }))

  // Compute card positions after render
  useEffect(() => {
    if (!containerRef.current) return
    const cards = containerRef.current.querySelectorAll('[data-agent-id]')
    const rect = containerRef.current.getBoundingClientRect()
    const newPos: CardPos[] = []
    cards.forEach(card => {
      const cr = card.getBoundingClientRect()
      newPos.push({
        id: card.getAttribute('data-agent-id') || '',
        x: cr.left - rect.left,
        y: cr.top - rect.top,
        w: cr.width,
        h: cr.height,
      })
    })
    setPositions(newPos)
  }, [])

  // Get data-flow dependencies
  const dataFlowDeps = deps.filter(d => d.type === 'data_flow')
  const sharedResourceDeps = deps.filter(d => d.type === 'shared_resource')

  // Compute risk chains
  const riskChains = computeRiskChains(dataFlowDeps)

  // Find unique shared resources
  const sharedResources = Array.from(new Set(sharedResourceDeps.map(d => d.resource).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Dependency diagram */}
      <div className="card animate-fade-up">
        <h3 className="text-base font-semibold font-[var(--font-sora)] mb-6" style={{ color: '#0A1628' }}>
          Agent Data Flow
        </h3>

        <div ref={containerRef} className="relative" style={{ minHeight: 340 }}>
          {/* SVG arrows layer */}
          <svg
            ref={svgRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <polygon points="0 0, 10 4, 0 8" fill="#94A3B8" />
              </marker>
              <marker id="arrowhead-gold" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <polygon points="0 0, 10 4, 0 8" fill="#D4AF37" />
              </marker>
            </defs>
            {positions.length > 0 && dataFlowDeps.map((dep, i) => {
              const from = positions.find(p => p.id === dep.from)
              const to = positions.find(p => p.id === dep.to)
              if (!from || !to) return null

              const x1 = from.x + from.w
              const y1 = from.y + from.h / 2
              const x2 = to.x
              const y2 = to.y + to.h / 2
              const cx1 = x1 + 40
              const cx2 = x2 - 40

              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`}
                  stroke="#94A3B8"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  strokeDasharray="6 3"
                />
              )
            })}
          </svg>

          {/* Process groups with agent cards */}
          <div className="flex flex-col gap-8">
            {processBuckets.map(({ process, agents }) => (
              <div key={process.id}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#64748B' }}>
                  {process.name}
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                  {agents.map((agent, idx) => {
                    const statusColors: Record<string, string> = {
                      green: '#059669',
                      amber: '#D97706',
                      red: '#DC2626',
                    }
                    const borderColor = statusColors[agent.status] || '#E2E8F0'
                    const arrow = idx < agents.length - 1

                    return (
                      <div key={agent.id} className="flex items-center gap-4">
                        <div
                          data-agent-id={agent.id}
                          className="rounded-xl px-5 py-4 relative"
                          style={{
                            background: '#FFFFFF',
                            border: `2px solid ${borderColor}`,
                            boxShadow: '0 2px 8px rgba(10,22,40,0.06)',
                            minWidth: 200,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: borderColor }}
                            />
                            <span className="text-sm font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
                              {agent.name}
                            </span>
                          </div>
                          <div className="text-xs font-[var(--font-mono-jb)]" style={{ color: '#64748B' }}>
                            {agent.model} &middot; {agent.framework}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs" style={{ color: '#64748B' }}>
                              {agent.sigmaScore.toFixed(1)}σ
                            </span>
                            <span className="text-xs" style={{ color: '#64748B' }}>
                              {(agent.successRate * 100).toFixed(0)}% success
                            </span>
                          </div>
                        </div>
                        {arrow && (
                          <div className="flex items-center gap-1" style={{ color: '#94A3B8' }}>
                            <span className="text-xs font-medium">feeds into</span>
                            <ArrowRight size={14} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shared Resources */}
      {sharedResources.length > 0 && (
        <div className="card animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Database size={16} style={{ color: '#D4AF37' }} />
            <h3 className="text-base font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
              Shared Resources
            </h3>
          </div>
          <div className="space-y-3">
            {sharedResources.map(resource => {
              const consumers = sharedResourceDeps
                .filter(d => d.resource === resource)
                .map(d => AGENTS.find(a => a.id === d.from)?.name ?? d.from)

              return (
                <div
                  key={resource}
                  className="flex items-center gap-4 p-4 rounded-lg"
                  style={{ background: '#FBF5DC', border: '1px solid #D4AF3733' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#D4AF3720' }}>
                    <Database size={16} style={{ color: '#D4AF37' }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: '#0A1628' }}>
                      {resource}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                      Used by: {consumers.join(' and ')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Risk Indicators */}
      {riskChains.length > 0 && (
        <div className="card animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} style={{ color: '#DC2626' }} />
            <h3 className="text-base font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
              Dependency Risks
            </h3>
          </div>
          <div className="space-y-3">
            {riskChains.map((risk, i) => (
              <div
                key={i}
                className="p-4 rounded-lg"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
              >
                <div className="text-sm font-medium" style={{ color: '#991B1B' }}>
                  {risk}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function computeRiskChains(dataFlowDeps: AgentDependency[]): string[] {
  const risks: string[] = []
  // Find source agents (agents that have dependents)
  const sources = new Set(dataFlowDeps.map(d => d.from))

  sources.forEach(sourceId => {
    const sourceName = AGENTS.find(a => a.id === sourceId)?.name ?? sourceId
    const directDeps = dataFlowDeps.filter(d => d.from === sourceId).map(d => d.to)
    // Also find transitive deps
    const allAffected = new Set<string>()
    const queue = [...directDeps]
    while (queue.length > 0) {
      const current = queue.shift()!
      if (allAffected.has(current)) continue
      allAffected.add(current)
      dataFlowDeps.filter(d => d.from === current).forEach(d => queue.push(d.to))
    }

    if (allAffected.size > 0) {
      const names = Array.from(allAffected).map(id => AGENTS.find(a => a.id === id)?.name ?? id)
      risks.push(
        `If ${sourceName} goes down, ${names.join(' and ')} ${names.length === 1 ? 'is' : 'are'} also affected`
      )
    }
  })

  return risks
}
