import type { ProcessBenchmark } from '@/types/telemetry'
import { Lightbulb, Star, AlertCircle } from 'lucide-react'
import { AGENTS, AUDIT_LOG } from '@/lib/mock-data'

interface BenchmarkInsightsProps {
  benchmarks: ProcessBenchmark[]
}

export function BenchmarkInsights({ benchmarks }: BenchmarkInsightsProps) {
  if (benchmarks.length === 0) return null

  // Find best agent across all processes
  const allAgents = AGENTS
  const bestAgent = allAgents.reduce((a, b) => a.sigmaScore > b.sigmaScore ? a : b, allAgents[0])

  // Find process with the highest override rate
  const overrideCount = AUDIT_LOG.filter(e => e.decisionType === 'overridden').length
  const totalAudit = AUDIT_LOG.length
  const overrideRate = totalAudit > 0 ? Math.round((overrideCount / totalAudit) * 100) : 0

  // Worst process by rank
  const worstProcess = benchmarks[benchmarks.length - 1]

  const insights = [
    {
      id: 'best-agent',
      icon: Star,
      iconColor: 'var(--status-green)',
      title: `${bestAgent.name} (${bestAgent.sigmaScore.toFixed(1)}σ) can serve as a template`,
      description: `This agent in the ${AGENTS.find(a => a.id === bestAgent.id)?.processId === 'sports-betting' ? 'Sports Betting' : 'Customer Service'} process leads across all agents. Its configuration and prompt engineering can be replicated for lower-performing agents.`,
    },
    {
      id: 'override-rate',
      icon: AlertCircle,
      iconColor: 'var(--status-amber)',
      title: `Override rate at ${overrideRate}% — investigate recommendation quality`,
      description: `${overrideCount} of ${totalAudit} audit decisions were overridden by human reviewers. High override rates may indicate that agent recommendations need prompt tuning or additional context.`,
    },
    {
      id: 'gap-analysis',
      icon: Lightbulb,
      iconColor: 'var(--accent-blue)',
      title: `${worstProcess?.processName ?? 'Lowest-ranked process'} has improvement potential`,
      description: `With an average sigma of ${worstProcess?.avgSigma.toFixed(1) ?? 'N/A'}σ and ${Math.round((worstProcess?.agentCoveragePct ?? 0) * 100)}% agent coverage, targeted training and prompt optimization could improve performance significantly.`,
    },
  ]

  return (
    <div className="card animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={18} style={{ color: 'var(--status-amber)' }} />
        <h2 className="text-base font-semibold">Best Practices &amp; Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map(insight => {
          const Icon = insight.icon
          return (
            <div
              key={insight.id}
              className="rounded-xl p-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start gap-3 mb-2">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${insight.iconColor}15` }}
                >
                  <Icon size={16} style={{ color: insight.iconColor }} />
                </div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {insight.title}
                </h3>
              </div>
              <p className="text-xs leading-relaxed ml-11" style={{ color: 'var(--text-secondary)' }}>
                {insight.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
