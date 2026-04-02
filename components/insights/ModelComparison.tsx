'use client'

import { useState } from 'react'
import { AGENTS, getModelOptionsForAgent } from '@/lib/mock-data'

export default function ModelComparison() {
  const [selectedAgentId, setSelectedAgentId] = useState(AGENTS[0].id)
  const { agent, currentCostPerRun, currentMonthlySpend, alternatives } = getModelOptionsForAgent(selectedAgentId)

  const runsPerMonth = agent.totalRuns * 4

  // Find the best alternative
  const best = alternatives.reduce((prev, curr) =>
    (curr.estimatedSigmaDelta > 0 && curr.monthlyCostEstimate < prev.monthlyCostEstimate) ? curr : prev
  , alternatives[0])

  const savingVsBest = currentMonthlySpend - best.monthlyCostEstimate
  const sigmaChange = best.estimatedSigmaDelta

  return (
    <div className="flex flex-col gap-6">
      {/* Agent selector */}
      <div className="card">
        <label
          className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          Select Agent
        </label>
        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className="text-sm rounded-lg px-3 py-2"
          style={{
            border: '1px solid var(--border)',
            background: '#FFFFFF',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-dm)',
            minWidth: 280,
          }}
        >
          {AGENTS.map(a => (
            <option key={a.id} value={a.id}>{a.name} — {a.model}</option>
          ))}
        </select>
      </div>

      {/* Current model metrics */}
      <div className="card">
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
        >
          Current Model: <span style={{ color: '#378ADD' }}>{agent.model}</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Cost/Run', value: `$${currentCostPerRun.toFixed(4)}` },
            { label: 'Sigma', value: `${agent.sigmaScore.toFixed(1)}σ` },
            { label: 'P95 Latency', value: `${agent.p95LatencyMs.toLocaleString()}ms` },
            { label: 'Monthly Spend', value: `$${currentMonthlySpend.toFixed(2)}` },
          ].map(m => (
            <div key={m.label} className="flex flex-col">
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-secondary)' }}>
                {m.label}
              </div>
              <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div className="card">
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
        >
          Compare With Alternatives
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ color: 'var(--text-primary)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Model</th>
                <th className="text-right py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Cost/Run</th>
                <th className="text-right py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Est. Sigma Δ</th>
                <th className="text-right py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Est. Latency</th>
                <th className="text-right py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Monthly Spend</th>
              </tr>
            </thead>
            <tbody>
              {/* Current model row */}
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(55, 138, 221, 0.06)' }}>
                <td className="py-2.5 font-bold">
                  {agent.model} <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>(current)</span>
                </td>
                <td className="py-2.5 text-right tabular-nums">${currentCostPerRun.toFixed(4)}</td>
                <td className="py-2.5 text-right tabular-nums">—</td>
                <td className="py-2.5 text-right tabular-nums">{agent.p95LatencyMs.toLocaleString()}ms</td>
                <td className="py-2.5 text-right tabular-nums font-bold">${currentMonthlySpend.toFixed(2)}</td>
              </tr>
              {/* Alternative rows */}
              {alternatives.map(alt => {
                const estSigma = agent.sigmaScore + alt.estimatedSigmaDelta
                const altCostPerRun = +(alt.monthlyCostEstimate / runsPerMonth).toFixed(4)
                const isBetter = alt.estimatedSigmaDelta > 0 && alt.monthlyCostEstimate < currentMonthlySpend
                return (
                  <tr
                    key={alt.id}
                    className="row-hover"
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: isBetter ? 'var(--status-green-bg)' : 'transparent',
                    }}
                  >
                    <td className="py-2.5 font-medium">
                      {alt.name}
                      {isBetter && (
                        <span
                          className="ml-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--status-green)', color: '#FFFFFF' }}
                        >
                          Recommended
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">${altCostPerRun}</td>
                    <td className="py-2.5 text-right tabular-nums">
                      <span style={{ color: alt.estimatedSigmaDelta >= 0 ? 'var(--status-green)' : 'var(--status-red)' }}>
                        {alt.estimatedSigmaDelta >= 0 ? '+' : ''}{alt.estimatedSigmaDelta.toFixed(1)}σ
                      </span>
                      <span className="ml-1" style={{ color: 'var(--text-muted)' }}>
                        (→{estSigma.toFixed(1)}σ)
                      </span>
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{alt.estimatedLatencyMs.toLocaleString()}ms</td>
                    <td className="py-2.5 text-right tabular-nums font-bold">${alt.monthlyCostEstimate}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projection insight */}
      <div
        className="card"
        style={{
          background: savingVsBest > 0 ? 'var(--status-green-bg)' : 'var(--surface)',
          border: savingVsBest > 0 ? '1px solid var(--status-green)' : '1px solid var(--border)',
        }}
      >
        <div className="text-xs" style={{ color: 'var(--text-primary)' }}>
          <span className="font-bold">Projection:</span>{' '}
          {savingVsBest > 0 ? (
            <>
              Switching {agent.name.replace(' Agent', '')} from <strong>{agent.model}</strong> to{' '}
              <strong>{best.name}</strong> would save <strong>${savingVsBest.toFixed(0)}/month</strong>
              {sigmaChange > 0 && <> with estimated <strong>+{sigmaChange.toFixed(1)}σ</strong> quality improvement</>}.
            </>
          ) : (
            <>
              Current model appears cost-optimal for this agent. Consider alternatives only if quality improvement is the priority.
            </>
          )}
        </div>
        <div className="mt-2 text-[10px] italic" style={{ color: 'var(--text-muted)' }}>
          Assumption: Sigma deltas are estimates based on benchmark data and may vary with prompt engineering. Monthly spend assumes {runsPerMonth} runs/month.
        </div>
      </div>
    </div>
  )
}
