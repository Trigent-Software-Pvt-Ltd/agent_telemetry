'use client'

import { useState } from 'react'
import Link from 'next/link'
import type {
  QuadrantAgent,
  SourcingSpecialist,
  SourcingRun,
  RuleOutcome,
  GroundTruthExample,
  SourcingCandidate,
} from '@/lib/quadrant-mock'
import { ChevronDown, ChevronRight, Circle, CheckCircle2 } from 'lucide-react'

interface Props {
  agent: QuadrantAgent
  specialists: SourcingSpecialist[]
  runs: SourcingRun[]
  ruleOutcomes: RuleOutcome[]
  groundTruth: GroundTruthExample[]
  candidates: SourcingCandidate[]
}

export default function SourcingAgentView({
  agent,
  specialists,
  runs,
  ruleOutcomes,
  groundTruth,
  candidates,
}: Props) {
  const [selectedRunId, setSelectedRunId] = useState(runs[0].id)
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const run = runs.find(r => r.id === selectedRunId)!

  // Calibration accuracy = how many ground-truth examples match their current fit state
  const gtMatches = groundTruth.filter(g => {
    const c = candidates.find(x => x.id === g.candidateId)
    return c && c.fitState === g.label
  }).length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Agent · Multi-specialist
            </div>
            <h1 className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-sora)' }}>
              {agent.name}
            </h1>
            <p className="text-sm mt-2 max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
              {agent.summary}
            </p>
            <div className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              Model: <span className="font-mono">{agent.model}</span> · Status:{' '}
              <span className="capitalize" style={{ color: '#F59E0B' }}>{agent.status}</span>
            </div>
          </div>
          <Link
            href="/sourcing/review"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer"
            style={{ background: '#378ADD' }}
          >
            Review surfaced candidates →
          </Link>
        </div>
      </div>

      {/* Specialist cards */}
      <section>
        <h3 className="text-sm font-semibold mb-3 px-1" style={{ fontFamily: 'var(--font-sora)' }}>
          Specialists
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {specialists.map(s => (
            <div key={s.id} className="card p-4">
              <div className="text-sm font-semibold">{s.name}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {s.role}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <MiniStat label="Success" value={`${Math.round(s.successRate * 100)}%`} />
                <MiniStat label="Latency" value={`${s.avgLatencyMs.toLocaleString()}ms`} />
                <MiniStat label="Cost" value={`$${s.avgCostPerCandidate.toFixed(3)}`} />
                <MiniStat label="Last run" value={`${s.lastRunCount}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manager trace */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-sora)' }}>
            Manager trace
          </h3>
          <select
            value={selectedRunId}
            onChange={e => setSelectedRunId(e.target.value)}
            className="text-xs px-2 py-1 rounded border"
            style={{ borderColor: 'var(--border)' }}
          >
            {runs.map(r => (
              <option key={r.id} value={r.id}>
                {r.triggeredAt.slice(0, 10)} · {r.triggeredBy}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs mb-3 font-mono" style={{ color: 'var(--text-muted)' }}>
          [{run.trigger === 'manual' ? 'Manual trigger' : 'Scheduled'} — {run.triggeredBy},{' '}
          {new Date(run.triggeredAt).toLocaleString()}]
        </div>
        <div
          className="text-xs mb-4 pl-4 font-mono"
          style={{ color: 'var(--text-secondary)' }}
        >
          └─ Manager plan created ({run.steps.length} steps) · prompt {run.promptVersion}
        </div>

        <div className="space-y-2 pl-4">
          {run.steps.map(step => {
            const isOpen = expandedStep === step.id
            return (
              <div key={step.id}>
                <button
                  onClick={() => setExpandedStep(isOpen ? null : step.id)}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded text-left cursor-pointer"
                  style={{ background: 'var(--surface-muted, #F7F9FC)' }}
                >
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    Step {step.stepNumber}:
                  </span>
                  <span className="text-sm font-medium capitalize">{step.specialist}</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    — {step.description}
                  </span>
                  <span className="ml-auto text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {step.inputCount} → {step.outputCount} · {step.latencyMs.toLocaleString()}ms · $
                    {step.costUsd.toFixed(3)}
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-2 ml-6 p-3 text-xs font-mono rounded" style={{ background: '#0f1117', color: '#D1D5DB' }}>
                    <div>input: {step.inputCount} candidates</div>
                    <div>output: {step.outputCount} candidates</div>
                    <div>tokens: in={step.tokensIn.toLocaleString()} out={step.tokensOut.toLocaleString()}</div>
                    <div>status: {step.status}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 pl-4 space-y-1 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
          <div>└─ Evidence layer validated → {run.evidenceValidatedCount} candidates with full provenance</div>
          <div>└─ Evaluation layer scored → {run.evaluationSurfacedCount} surfaced to review queue</div>
        </div>

        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-xs" style={{ borderColor: 'var(--border)' }}>
          <div>
            Total cost: <span className="font-semibold">${run.totalCostUsd.toFixed(3)}</span>
          </div>
          <div>
            Total latency: <span className="font-semibold">{run.totalLatencyMs.toLocaleString()}ms</span>
          </div>
          <div>
            Candidates surfaced: <span className="font-semibold">{run.evaluationSurfacedCount}</span>
          </div>
        </div>
      </section>

      {/* Two-rule evaluation */}
      <section className="card p-5">
        <h3 className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-sora)' }}>
          Two-rule evaluation
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Gating rules the Sourcing Agent evaluates before surfacing a candidate for review.
        </p>
        <div className="space-y-3">
          {ruleOutcomes.map(r => (
            <div key={r.id} className="p-4 rounded-lg" style={{ background: 'var(--surface-muted, #F7F9FC)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Rule {r.id.split('-')[1]}: {r.label}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {r.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ color: '#378ADD', fontFamily: 'var(--font-sora)' }}>
                    {Math.round(r.passRate * 100)}%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {r.filteredCount} / {r.totalInput} pass
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ground-truth panel */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-sora)' }}>
              Ground-truth calibration set
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Evaluator last tuned against {groundTruth.length} examples · Accuracy{' '}
              <span className="font-semibold" style={{ color: gtMatches >= 7 ? '#1D9E75' : '#F59E0B' }}>
                {gtMatches}/{groundTruth.length}
              </span>
            </p>
          </div>
          <button
            className="text-xs px-3 py-1.5 rounded border cursor-pointer"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            + Add example
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {groundTruth.map(g => {
            const c = candidates.find(x => x.id === g.candidateId)
            const label = g.label
            return (
              <div
                key={g.candidateId}
                className="p-3 rounded-lg text-xs"
                style={{ background: 'var(--surface-muted, #F7F9FC)' }}
              >
                <div className="flex items-center gap-2">
                  {label === 'good_fit' ? (
                    <CheckCircle2 size={14} style={{ color: '#1D9E75' }} />
                  ) : (
                    <Circle size={14} style={{ color: '#E24B4A' }} />
                  )}
                  <span className="font-medium">{c?.companyName || g.candidateId}</span>
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{
                    background: label === 'good_fit' ? 'rgba(29,158,117,0.15)' : 'rgba(226,75,74,0.15)',
                    color: label === 'good_fit' ? '#1D9E75' : '#E24B4A',
                  }}>
                    {label.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {g.rationale}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}
