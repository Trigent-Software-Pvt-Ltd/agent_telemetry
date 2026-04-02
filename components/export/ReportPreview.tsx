'use client'

import { PROCESSES, AGENTS, ROI_SNAPSHOTS, AUDIT_LOG } from '@/lib/mock-data'
import { SigmaTooltip } from '@/components/shared/SigmaTooltip'

interface ReportPreviewProps {
  sections: string[]
  processes: string[]
  reportName: string
}

function PreviewSection({ title, children, pageBreak = false }: { title: string; children: React.ReactNode; pageBreak?: boolean }) {
  return (
    <div className={`mb-4${pageBreak ? ' page-break-before' : ''}`}>
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-2 pb-1"
        style={{ color: 'var(--accent-blue)', borderBottom: '2px solid var(--accent-blue)' }}
      >
        {title}
      </h3>
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </div>
    </div>
  )
}

export function ReportPreview({ sections, processes, reportName }: ReportPreviewProps) {
  const selectedProcesses = PROCESSES.filter(p => processes.includes(p.id))
  const totalNetRoi = selectedProcesses.reduce((sum, p) => sum + p.weeklyNetRoi, 0)
  const totalAgents = selectedProcesses.reduce((sum, p) => sum + p.agents.length, 0)

  const roiSnapshots = ROI_SNAPSHOTS.filter(r => processes.includes(r.processId))
  const totalGross = roiSnapshots.reduce((sum, r) => sum + r.grossSavingWeekly, 0)
  const totalOversight = roiSnapshots.reduce((sum, r) => sum + r.oversightCostWeekly, 0)
  const totalInference = roiSnapshots.reduce((sum, r) => sum + r.inferenceCostWeekly, 0)
  const totalGovernance = roiSnapshots.reduce((sum, r) => sum + r.governanceOverheadWeekly, 0)

  const overrideCount = AUDIT_LOG.filter(e => e.decisionType === 'overridden').length
  const escalatedCount = AUDIT_LOG.filter(e => e.decisionType === 'escalated').length
  const totalAudit = AUDIT_LOG.length

  const selectedAgents = AGENTS.filter(a => processes.includes(a.processId))

  if (sections.length === 0) {
    return (
      <div
        className="card flex items-center justify-center"
        style={{ minHeight: 400, background: '#FFFFFF' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Select sections to preview the report
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}
    >
      {/* Document header */}
      <div
        className="px-6 py-4"
        style={{ background: 'var(--accent-blue)', color: '#FFFFFF' }}
      >
        <div className="text-lg font-bold">{reportName || 'Board Report'}</div>
        <div className="text-xs opacity-80 mt-0.5">
          r-Potential Agent Quality Platform — Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Document body */}
      <div className="px-6 py-5" style={{ minHeight: 350 }}>

        {sections.includes('executive-summary') && (
          <PreviewSection title="Executive Summary">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Processes</div>
                <div className="text-lg font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{selectedProcesses.length}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Active Agents</div>
                <div className="text-lg font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{totalAgents}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Weekly Net ROI</div>
                <div className="text-lg font-bold mt-0.5" style={{ color: 'var(--status-green)' }}>${totalNetRoi.toLocaleString()}</div>
              </div>
            </div>
            <p className="leading-relaxed">
              Across {selectedProcesses.length} monitored process{selectedProcesses.length > 1 ? 'es' : ''}, {totalAgents} AI agents are delivering ${totalNetRoi.toLocaleString()}/week in net ROI after accounting for oversight, inference, and governance costs.
            </p>
          </PreviewSection>
        )}

        {sections.includes('roi') && (
          <PreviewSection title="ROI Analysis">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid var(--border)' }}>
                <span>Gross Savings</span>
                <span className="font-semibold" style={{ color: 'var(--status-green)' }}>${totalGross.toLocaleString()}/wk</span>
              </div>
              <div className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid var(--border)' }}>
                <span>Oversight Cost</span>
                <span className="font-semibold" style={{ color: 'var(--status-red)' }}>-${totalOversight.toLocaleString()}/wk</span>
              </div>
              <div className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid var(--border)' }}>
                <span>Inference Cost</span>
                <span className="font-semibold" style={{ color: 'var(--status-red)' }}>-${totalInference.toLocaleString()}/wk</span>
              </div>
              <div className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid var(--border)' }}>
                <span>Governance Overhead</span>
                <span className="font-semibold" style={{ color: 'var(--status-red)' }}>-${totalGovernance.toLocaleString()}/wk</span>
              </div>
              <div className="flex items-center justify-between py-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>
                <span>Net ROI</span>
                <span style={{ color: 'var(--status-green)' }}>${totalNetRoi.toLocaleString()}/wk</span>
              </div>
            </div>
          </PreviewSection>
        )}

        {sections.includes('sigma') && (
          <PreviewSection title="Sigma Scores">
            <div className="space-y-2">
              {selectedAgents.map(agent => (
                <div key={agent.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block rounded-full"
                      style={{
                        width: 6, height: 6,
                        backgroundColor: agent.status === 'green' ? 'var(--status-green)' : agent.status === 'amber' ? 'var(--status-amber)' : 'var(--status-red)',
                      }}
                    />
                    <span>{agent.name}</span>
                  </div>
                  <SigmaTooltip value={agent.sigmaScore}>
                    <span className="font-mono font-semibold" style={{
                      color: agent.sigmaScore >= 4 ? 'var(--status-green)' : agent.sigmaScore >= 3 ? 'var(--status-amber)' : 'var(--status-red)',
                    }}>
                      {agent.sigmaScore.toFixed(1)}σ
                    </span>
                  </SigmaTooltip>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {sections.includes('audit') && (
          <PreviewSection title="Audit Trail">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg p-3 text-center" style={{ background: 'var(--status-green-bg)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--status-green)' }}>{totalAudit - overrideCount - escalatedCount}</div>
                <div className="text-[10px] mt-0.5">Approved</div>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ background: 'var(--status-amber-bg)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--status-amber)' }}>{overrideCount}</div>
                <div className="text-[10px] mt-0.5">Overridden</div>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ background: 'var(--status-red-bg)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--status-red)' }}>{escalatedCount}</div>
                <div className="text-[10px] mt-0.5">Escalated</div>
              </div>
            </div>
          </PreviewSection>
        )}

        {sections.includes('labor') && (
          <PreviewSection title="Labor Analysis" pageBreak>
            <div className="space-y-2">
              {selectedProcesses.map(proc => (
                <div key={proc.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{proc.name}</span>
                    <span className="text-[10px]">{proc.headcount} FTE @ ${proc.avgHourlyWage}/hr</span>
                  </div>
                  <div className="flex rounded-full overflow-hidden h-3" style={{ background: 'var(--surface)' }}>
                    <div style={{ width: `${proc.agentCoverage * 100}%`, background: 'var(--status-green)' }} />
                    <div style={{ width: `${proc.collaborativeCoverage * 100}%`, background: 'var(--status-amber)' }} />
                    <div style={{ width: `${proc.humanCoverage * 100}%`, background: '#D1D5DB' }} />
                  </div>
                  <div className="flex gap-3 mt-1 text-[10px]">
                    <span>Agent {Math.round(proc.agentCoverage * 100)}%</span>
                    <span>Collaborative {Math.round(proc.collaborativeCoverage * 100)}%</span>
                    <span>Human {Math.round(proc.humanCoverage * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {sections.includes('fmea') && (
          <PreviewSection title="FMEA Summary">
            <p className="leading-relaxed">
              10 failure modes identified across 3 agents. 6 open, 2 in-progress, 2 mitigated.
              Highest RPN: 225 (Recommendation Writer Agent — hallucinated odds).
              Critical risk items (RPN &gt; 200): 4.
            </p>
          </PreviewSection>
        )}
      </div>

      {/* Document footer */}
      <div
        className="px-6 py-3 flex items-center justify-between text-[10px]"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
      >
        <span>Confidential — r-Potential by FuzeBox</span>
        <span className="no-print">Page 1 of 1</span>
        <span className="hidden print-footer" style={{ display: 'none' }}>
          Generated by VIPPlay Agent Telemetry
        </span>
      </div>
    </div>
  )
}
