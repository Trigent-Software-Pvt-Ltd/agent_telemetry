import type { Agent, Process } from '@/types/telemetry'

interface SigmaContextProps {
  agent: Agent
  process: Process
}

export default function SigmaContext({ agent, process }: SigmaContextProps) {
  const qualityScore = Math.round(agent.oee * 100)
  const roiContribution = process.agents.length > 0
    ? Math.round(process.weeklyNetRoi / process.agents.length)
    : 0

  return (
    <div className="card animate-fade-up">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
        Process Context
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Process</span>
          <span className="text-sm font-medium text-text-primary">{process.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Tasks Owned</span>
          <span className="text-sm font-medium text-text-primary">{agent.tasks.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Quality Score</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: qualityScore >= 80 ? 'var(--status-green)' : qualityScore >= 65 ? 'var(--status-amber)' : 'var(--status-red)' }}>
            {qualityScore}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Contribution to ROI</span>
          <span className="text-sm font-bold text-accent-blue tabular-nums">
            ~${roiContribution}/week
          </span>
        </div>

        {/* Tasks list */}
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Assigned Tasks</p>
          <ul className="space-y-1">
            {agent.tasks.map((task) => (
              <li key={task} className="text-sm text-text-primary flex items-start gap-2">
                <span className="text-status-green mt-0.5">&#8226;</span>
                {task}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
