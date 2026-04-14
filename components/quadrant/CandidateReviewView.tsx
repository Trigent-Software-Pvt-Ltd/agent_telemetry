'use client'

import { useMemo, useState } from 'react'
import { setCandidateFit } from '@/lib/quadrant-mock'
import type { SourcingCandidate, SourcingRun, FitState } from '@/lib/quadrant-mock'
import { X, CheckCircle2, XCircle, HelpCircle, ExternalLink, AlertTriangle } from 'lucide-react'

type Filter = 'all' | 'unreviewed' | 'good_fit' | 'poor_fit' | 'unclear'

interface Props {
  initialCandidates: SourcingCandidate[]
  runs: SourcingRun[]
}

export default function CandidateReviewView({ initialCandidates, runs }: Props) {
  const [candidates, setCandidates] = useState(initialCandidates)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [runId, setRunId] = useState(runs[0].id)
  // Medicare % assumption override per candidate (for panel)
  const [pctOverride, setPctOverride] = useState<Record<string, number>>({})

  const run = runs.find(r => r.id === runId)!

  const filtered = useMemo(() => {
    let arr = [...candidates]
    if (filter !== 'all') {
      arr = arr.filter(c => c.fitState === filter)
    }
    arr.sort((a, b) => b.overallConfidence - a.overallConfidence)
    return arr
  }, [candidates, filter])

  const selected = candidates.find(c => c.id === selectedId) || null

  const reviewed = candidates.filter(c => c.fitState !== 'unreviewed').length
  const good = candidates.filter(c => c.fitState === 'good_fit').length
  const poor = candidates.filter(c => c.fitState === 'poor_fit').length
  const unclear = candidates.filter(c => c.fitState === 'unclear').length

  function label(id: string, state: FitState) {
    setCandidateFit(id, state)
    setCandidates(prev =>
      prev.map(c => (c.id === id ? { ...c, fitState: state, reviewedBy: 'Sam Stillman', reviewedAt: new Date().toISOString() } : c)),
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Sourcing · Day-5 working session
            </div>
            <h1 className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-sora)' }}>
              Candidate Review
            </h1>
            <p className="text-sm mt-2 max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
              Outpatient Physical Therapy (Tier 1) — {candidates.length} candidates surfaced from last manager run.
              Click a row to inspect evidence and label ground truth.
            </p>
            <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              Reviewed <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{reviewed} of {candidates.length}</span>
              {' · '}
              <span style={{ color: '#1D9E75' }}>{good} good</span>{' / '}
              <span style={{ color: '#E24B4A' }}>{poor} poor</span>{' / '}
              <span style={{ color: '#F59E0B' }}>{unclear} unclear</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <select
              value={runId}
              onChange={e => setRunId(e.target.value)}
              className="text-xs px-2 py-1 rounded border"
              style={{ borderColor: 'var(--border)' }}
            >
              {runs.map(r => (
                <option key={r.id} value={r.id}>
                  Run {r.triggeredAt.slice(0, 10)}
                </option>
              ))}
            </select>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {run.evaluationSurfacedCount} surfaced · {run.promptVersion}
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 px-1">
        {(['all', 'unreviewed', 'good_fit', 'poor_fit', 'unclear'] as Filter[]).map(f => {
          const count =
            f === 'all'
              ? candidates.length
              : candidates.filter(c => c.fitState === f).length
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs cursor-pointer"
              style={{
                background: active ? '#378ADD' : 'var(--surface-muted, #F7F9FC)',
                color: active ? 'white' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 500,
                border: active ? '1px solid #378ADD' : '1px solid var(--border)',
              }}
            >
              {f.replace('_', ' ')} · {count}
            </button>
          )
        })}
      </div>

      <div className={selected ? 'grid grid-cols-[1fr_420px] gap-4' : ''}>
        {/* Table */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--surface-muted, #F7F9FC)' }}>
              <tr className="text-left text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
                <th className="px-4 py-2.5 font-semibold">Company</th>
                <th className="px-2 py-2.5 font-semibold">Geo</th>
                <th className="px-2 py-2.5 font-semibold text-right">Revenue (est)</th>
                <th className="px-2 py-2.5 font-semibold text-center">R1</th>
                <th className="px-2 py-2.5 font-semibold text-center">R2</th>
                <th className="px-2 py-2.5 font-semibold text-right">Conf.</th>
                <th className="px-4 py-2.5 font-semibold">State</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className="cursor-pointer row-hover border-t"
                  style={{
                    borderColor: 'var(--border)',
                    background: selectedId === c.id ? 'rgba(55,138,221,0.06)' : 'transparent',
                  }}
                >
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{c.companyName}</div>
                    <div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      NPI {c.npi}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {c.geographyMetro}, {c.geographyState}
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono">
                    ${(c.extrapolatedTotalRevenue / 1_000_000).toFixed(1)}M
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    {c.isThirdParty ? (
                      <CheckCircle2 size={14} style={{ color: '#1D9E75', display: 'inline' }} />
                    ) : (
                      <XCircle size={14} style={{ color: '#E24B4A', display: 'inline' }} />
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    {c.revenueOver5M ? (
                      <CheckCircle2 size={14} style={{ color: '#1D9E75', display: 'inline' }} />
                    ) : (
                      <XCircle size={14} style={{ color: '#E24B4A', display: 'inline' }} />
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-right text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {Math.round(c.overallConfidence * 100)}%
                  </td>
                  <td className="px-4 py-2.5">
                    <FitBadge state={c.fitState} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No candidates match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Evidence panel */}
        {selected && (
          <EvidencePanel
            candidate={selected}
            pctOverride={pctOverride[selected.id]}
            onPctChange={pct => setPctOverride(prev => ({ ...prev, [selected.id]: pct }))}
            onLabel={state => label(selected.id, state)}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  )
}

function FitBadge({ state }: { state: FitState }) {
  const styles: Record<FitState, { bg: string; color: string; label: string }> = {
    unreviewed: { bg: 'rgba(107,114,128,0.15)', color: '#6B7280', label: 'Unreviewed' },
    good_fit: { bg: 'rgba(29,158,117,0.15)', color: '#1D9E75', label: 'Good fit' },
    poor_fit: { bg: 'rgba(226,75,74,0.15)', color: '#E24B4A', label: 'Poor fit' },
    unclear: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', label: 'Unclear' },
  }
  const s = styles[state]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

function EvidencePanel({
  candidate,
  pctOverride,
  onPctChange,
  onLabel,
  onClose,
}: {
  candidate: SourcingCandidate
  pctOverride: number | undefined
  onPctChange: (pct: number) => void
  onLabel: (state: FitState) => void
  onClose: () => void
}) {
  const pct = pctOverride ?? candidate.medicarePctAssumption
  const extrapolated = Math.round(candidate.medicareRevenue / pct)
  const exceedsThreshold = extrapolated >= 5_000_000

  return (
    <aside className="card overflow-y-auto sticky top-4" style={{ maxHeight: 'calc(100vh - 32px)' }}>
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
            Evidence & labeling
          </div>
          <div className="text-base font-semibold mt-0.5">{candidate.companyName}</div>
        </div>
        <button onClick={onClose} className="p-1 rounded cursor-pointer hover:bg-gray-100">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Identity */}
        <div>
          <div className="text-xs uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
            Identity
          </div>
          <div className="text-xs font-mono">NPI {candidate.npi}</div>
          <div className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            Taxonomy {candidate.taxonomyCode} · {candidate.taxonomyLabel}
          </div>
          <div className="text-xs mt-1">
            {candidate.serviceCategory} · {candidate.geographyMetro}, {candidate.geographyState}
          </div>
        </div>

        {/* Rule 1 */}
        <div className="p-3 rounded-lg" style={{ background: 'var(--surface-muted, #F7F9FC)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
              Rule 1 — 3rd-party provider?
            </span>
            {candidate.isThirdParty ? (
              <CheckCircle2 size={14} style={{ color: '#1D9E75' }} />
            ) : (
              <XCircle size={14} style={{ color: '#E24B4A' }} />
            )}
          </div>
          <div className="text-sm font-semibold" style={{ color: candidate.isThirdParty ? '#1D9E75' : '#E24B4A' }}>
            {candidate.isThirdParty ? 'Pass — independent entity' : 'Fail — captive or hospital-owned'}
          </div>
        </div>

        {/* Rule 2 with Medicare % assumption */}
        <div className="p-3 rounded-lg border" style={{ borderColor: '#F59E0B', background: 'rgba(245,158,11,0.05)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} style={{ color: '#F59E0B' }} />
            <span className="text-xs uppercase font-semibold" style={{ color: '#F59E0B' }}>
              Rule 2 — revenue ≥ $5M (assumption-sensitive)
            </span>
          </div>
          <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            Medicare revenue from CMS:{' '}
            <span className="font-mono font-semibold">${candidate.medicareRevenue.toLocaleString()}</span>
          </div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            Medicare % of total (assumption — default {Math.round(candidate.medicarePctAssumption * 100)}%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0.15}
              max={0.5}
              step={0.01}
              value={pct}
              onChange={e => onPctChange(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-semibold font-mono" style={{ width: 48 }}>
              {Math.round(pct * 100)}%
            </span>
          </div>
          <div className="mt-2 text-sm">
            Extrapolated total:{' '}
            <span className="font-mono font-bold text-base" style={{ color: exceedsThreshold ? '#1D9E75' : '#E24B4A' }}>
              ${(extrapolated / 1_000_000).toFixed(2)}M
            </span>
            {' '}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              (band ${(candidate.revenueConfidenceBand[0] / 1_000_000).toFixed(1)}M – ${(candidate.revenueConfidenceBand[1] / 1_000_000).toFixed(1)}M)
            </span>
          </div>
          <div className="mt-2 text-[11px] italic" style={{ color: 'var(--text-muted)' }}>
            False-confidence mitigation: treat this assumption as Sam-tunable. The ±7% band translates to{' '}
            ±{Math.round(((candidate.revenueConfidenceBand[1] - candidate.revenueConfidenceBand[0]) / 2 / 1_000_000))}M of revenue uncertainty.
          </div>
        </div>

        {/* Raw evidence */}
        <div>
          <div className="text-xs uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
            Raw evidence ({candidate.evidence.length})
          </div>
          <div className="space-y-2">
            {candidate.evidence.map((e, i) => (
              <div key={i} className="text-xs p-2 rounded" style={{ background: 'var(--surface-muted, #F7F9FC)' }}>
                <div>{e.claim}</div>
                <div className="flex items-center justify-between mt-1">
                  <a
                    href={e.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                    style={{ color: '#378ADD' }}
                  >
                    {e.sourceLabel} <ExternalLink size={10} />
                  </a>
                  <span
                    className="font-mono"
                    style={{
                      color:
                        e.confidence > 0.9 ? '#1D9E75' : e.confidence > 0.75 ? '#F59E0B' : '#E24B4A',
                    }}
                  >
                    {Math.round(e.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Label buttons */}
        <div>
          <div className="text-xs uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
            Ground truth
          </div>
          <div className="grid grid-cols-3 gap-2">
            <LabelButton
              label="Good fit"
              icon={<CheckCircle2 size={14} />}
              color="#1D9E75"
              active={candidate.fitState === 'good_fit'}
              onClick={() => onLabel('good_fit')}
            />
            <LabelButton
              label="Poor fit"
              icon={<XCircle size={14} />}
              color="#E24B4A"
              active={candidate.fitState === 'poor_fit'}
              onClick={() => onLabel('poor_fit')}
            />
            <LabelButton
              label="Unclear"
              icon={<HelpCircle size={14} />}
              color="#F59E0B"
              active={candidate.fitState === 'unclear'}
              onClick={() => onLabel('unclear')}
            />
          </div>
          {candidate.reviewedBy && candidate.reviewedAt && (
            <div className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
              Last labeled by {candidate.reviewedBy} · {new Date(candidate.reviewedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

function LabelButton({
  label,
  icon,
  color,
  active,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  color: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-all"
      style={{
        background: active ? color : 'var(--surface-muted, #F7F9FC)',
        color: active ? 'white' : color,
        border: `1px solid ${color}`,
      }}
    >
      {icon} {label}
    </button>
  )
}
