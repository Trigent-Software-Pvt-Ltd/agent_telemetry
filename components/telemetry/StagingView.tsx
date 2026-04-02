'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowRightLeft, CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react'
import { StagingCandidate } from '@/types/telemetry'
import { StagingMetricsPanel } from './StagingMetricsPanel'
import { TrafficSplitBar } from './TrafficSplitBar'

interface StagingViewProps {
  candidate: StagingCandidate
  workflowName: string
}

export function StagingView({ candidate, workflowName }: StagingViewProps) {
  const [promoted, setPromoted] = useState(false)
  const [productionPercent, setProductionPercent] = useState(100)

  const prodMetrics = promoted ? candidate.candidateMetrics : candidate.productionMetrics
  const stagingMetrics = promoted ? candidate.productionMetrics : candidate.candidateMetrics
  const prodModel = promoted ? candidate.candidateModel : candidate.productionModel
  const stagingModel = promoted ? candidate.productionModel : candidate.candidateModel

  function handlePromote() {
    setPromoted(true)
    setProductionPercent(100)
    toast.success('Agent promoted to production', {
      description: `${candidate.candidateModel} is now serving 100% of traffic for ${workflowName}.`,
    })
  }

  function handleRollback() {
    setPromoted(false)
    setProductionPercent(100)
    toast.info('Rolled back to previous production agent', {
      description: `${candidate.productionModel} restored as production model.`,
    })
  }

  const RiskIcon = candidate.riskLevel === 'LOW' ? ShieldCheck : ShieldAlert
  const riskColor = candidate.riskLevel === 'LOW' ? '#059669' : candidate.riskLevel === 'MEDIUM' ? '#D97706' : '#DC2626'
  const riskBg = candidate.riskLevel === 'LOW' ? '#ECFDF5' : candidate.riskLevel === 'MEDIUM' ? '#FFFBEB' : '#FFF5F5'

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowRightLeft size={20} style={{ color: '#D4AF37' }} />
          <h2 className="text-lg font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
            Staging &amp; Canary — {workflowName}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePromote}
            disabled={promoted}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#059669', color: '#FFFFFF' }}
          >
            <CheckCircle2 size={16} />
            Promote to Production
          </button>
          <button
            onClick={handleRollback}
            disabled={!promoted}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: '#E2E8F0', color: '#64748B' }}
          >
            <RotateCcw size={16} />
            Rollback
          </button>
        </div>
      </div>

      {/* Two-panel comparison */}
      <div className="flex gap-6">
        <StagingMetricsPanel
          title="Production"
          model={prodModel}
          framework={candidate.productionFramework}
          metrics={prodMetrics}
          compareMetrics={stagingMetrics}
          accent="#0891B2"
        />
        <StagingMetricsPanel
          title="Staging Candidate"
          model={stagingModel}
          framework={candidate.candidateFramework}
          metrics={stagingMetrics}
          compareMetrics={prodMetrics}
          accent="#D4AF37"
        />
      </div>

      {/* Traffic split */}
      <TrafficSplitBar
        productionPercent={productionPercent}
        onSplitChange={setProductionPercent}
      />

      {/* Risk assessment */}
      <div className="card" style={{ background: riskBg, borderColor: riskColor + '33' }}>
        <div className="flex items-start gap-3">
          <RiskIcon size={20} style={{ color: riskColor, marginTop: 2 }} />
          <div>
            <h4 className="text-sm font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
              Risk Assessment — <span style={{ color: riskColor }}>{candidate.riskLevel}</span>
            </h4>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>
              Staging agent tested on <span className="font-semibold" style={{ color: '#0A1628' }}>{candidate.stagingRuns} runs</span> with{' '}
              <span className="font-semibold" style={{ color: '#0A1628' }}>{Math.round(candidate.stagingSucessRate * 100)}% success rate</span>.
            </p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>
              {candidate.riskNote}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="card">
        <h3 className="text-sm font-semibold font-[var(--font-sora)] mb-4" style={{ color: '#0A1628' }}>
          Side-by-Side Comparison
        </h3>
        <div className="overflow-hidden rounded-lg border" style={{ borderColor: '#E2E8F0' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F7F9FC' }}>
                <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#64748B' }}>Metric</th>
                <th className="text-right px-4 py-2.5 font-medium" style={{ color: '#0891B2' }}>Production</th>
                <th className="text-right px-4 py-2.5 font-medium" style={{ color: '#D4AF37' }}>Staging</th>
                <th className="text-center px-4 py-2.5 font-medium" style={{ color: '#64748B' }}>Winner</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: 'Model',
                  prod: prodModel,
                  staging: stagingModel,
                  winner: null,
                },
                {
                  label: 'Sigma Score',
                  prod: `${prodMetrics.sigma.toFixed(1)}σ`,
                  staging: `${stagingMetrics.sigma.toFixed(1)}σ`,
                  winner: prodMetrics.sigma > stagingMetrics.sigma ? 'prod' : prodMetrics.sigma < stagingMetrics.sigma ? 'staging' : null,
                },
                {
                  label: 'Success Rate',
                  prod: `${Math.round(prodMetrics.successRate * 100)}%`,
                  staging: `${Math.round(stagingMetrics.successRate * 100)}%`,
                  winner: prodMetrics.successRate > stagingMetrics.successRate ? 'prod' : prodMetrics.successRate < stagingMetrics.successRate ? 'staging' : null,
                },
                {
                  label: 'Avg Cost',
                  prod: `$${prodMetrics.avgCost.toFixed(3)}`,
                  staging: `$${stagingMetrics.avgCost.toFixed(3)}`,
                  winner: prodMetrics.avgCost < stagingMetrics.avgCost ? 'prod' : prodMetrics.avgCost > stagingMetrics.avgCost ? 'staging' : null,
                },
                {
                  label: 'Avg Latency',
                  prod: `${prodMetrics.avgLatencyMs.toLocaleString()}ms`,
                  staging: `${stagingMetrics.avgLatencyMs.toLocaleString()}ms`,
                  winner: prodMetrics.avgLatencyMs < stagingMetrics.avgLatencyMs ? 'prod' : prodMetrics.avgLatencyMs > stagingMetrics.avgLatencyMs ? 'staging' : null,
                },
              ].map(row => (
                <tr key={row.label} className="border-t row-hover" style={{ borderColor: '#E2E8F0' }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: '#0A1628' }}>{row.label}</td>
                  <td
                    className="px-4 py-2.5 text-right font-[var(--font-mono-jb)]"
                    style={{ color: row.winner === 'prod' ? '#059669' : '#0A1628' }}
                  >
                    {row.prod}
                  </td>
                  <td
                    className="px-4 py-2.5 text-right font-[var(--font-mono-jb)]"
                    style={{ color: row.winner === 'staging' ? '#059669' : '#0A1628' }}
                  >
                    {row.staging}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {row.winner === 'prod' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#ECFDF5', color: '#059669' }}>
                        Prod
                      </span>
                    )}
                    {row.winner === 'staging' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#ECFDF5', color: '#059669' }}>
                        Staging
                      </span>
                    )}
                    {row.winner === null && (
                      <span className="text-xs" style={{ color: '#94A3B8' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
