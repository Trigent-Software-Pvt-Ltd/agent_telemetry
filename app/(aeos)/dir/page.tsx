'use client'

import { useState, useMemo } from 'react'
import { useAEOSDemo } from '@/components/aeos/layout/AEOSDemoProvider'
import { listActiveImprovements, listImprovementHistory, listDIRRules } from '@/lib/aeos/data'
import type {
  ImprovementRecommendation,
  ImprovementStatus,
  DIRRule,
} from '@/types/aeos'
import { TwoPartySignaturePill } from '@/components/aeos/shared/TwoPartySignaturePill'
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  GitCompare,
  RotateCcw,
  Zap,
  ChevronRight,
} from 'lucide-react'

const TYPE_LABEL: Record<string, string> = {
  prompt_edit: 'Prompt edit',
  instruction_add: 'Instruction add',
  tool_restriction: 'Tool restriction',
  tool_addition: 'Tool addition',
  routing_override: 'Routing override',
  model_swap: 'Model swap',
  dir_rule_synthesis: 'New DIR rule',
}

export default function AutoImprovementPage() {
  const { tenantId } = useAEOSDemo()
  const [filter, setFilter] = useState<'all' | 'this_tenant'>('this_tenant')
  const [openDiff, setOpenDiff] = useState<ImprovementRecommendation | null>(null)
  const [openOutcome, setOpenOutcome] = useState<ImprovementRecommendation | null>(null)

  const active = useMemo(
    () => (filter === 'this_tenant' ? listActiveImprovements(tenantId) : listActiveImprovements()),
    [filter, tenantId],
  )
  const history = useMemo(
    () => (filter === 'this_tenant' ? listImprovementHistory(tenantId) : listImprovementHistory()),
    [filter, tenantId],
  )

  const dirRules = listDIRRules()
  const liveRules = dirRules.filter(r => r.status === 'live')

  // Aggregate: total realized impact across confirmed history
  const realizedVariance = history
    .filter(h => h.status === 'confirmed')
    .reduce((s, h) => s + (h.outcome?.variance_actual_delta_usd_per_week ?? 0), 0)
  const realizedCost = history
    .filter(h => h.status === 'confirmed')
    .reduce((s, h) => s + (h.projected_impact.cost_change_usd_per_week ?? 0), 0)
  const realizedEAI = history
    .filter(h => h.status === 'confirmed')
    .reduce((s, h) => s + (h.outcome?.eai_actual_delta ?? 0), 0)

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1
            className="font-[var(--font-sora)]"
            style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Auto-Improvement
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14, lineHeight: 1.5, maxWidth: 760 }}>
            AEOS continuously analyses the Predictive Economic Ledger for delta-improvement
            opportunities. Variance breaches, drift signals, and aggregated eval failures feed a
            hypothesis generator. Every recommendation is human-approved before deployment —
            you stay in control of what ships.
          </p>
        </div>
        <div className="flex items-center gap-2" style={{ fontSize: 12 }}>
          <button
            type="button"
            onClick={() => setFilter('this_tenant')}
            className="px-3 py-1.5 rounded-lg cursor-pointer"
            style={{
              background: filter === 'this_tenant' ? 'var(--accent-blue)' : 'transparent',
              color: filter === 'this_tenant' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              fontWeight: 500,
            }}
          >
            This tenant
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="px-3 py-1.5 rounded-lg cursor-pointer"
            style={{
              background: filter === 'all' ? 'var(--accent-blue)' : 'transparent',
              color: filter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              fontWeight: 500,
            }}
          >
            All tenants
          </button>
        </div>
      </header>

      {/* Realised impact summary */}
      <div className="grid grid-cols-4 gap-4">
        <ImpactStat
          label="Active recommendations"
          value={active.length.toString()}
          sub="awaiting human review"
        />
        <ImpactStat
          label="Cost impact realised"
          value={`$${Math.abs(realizedCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}/wk`}
          sub={realizedCost <= 0 ? 'savings · last 90d' : 'increase · last 90d'}
          tone={realizedCost <= 0 ? 'ok' : 'warn'}
        />
        <ImpactStat
          label="Variance reduction realised"
          value={`$${Math.abs(realizedVariance).toLocaleString(undefined, { maximumFractionDigits: 0 })}/wk`}
          sub="from confirmed improvements"
          tone="ok"
        />
        <ImpactStat
          label="EAI delta from auto-improvement"
          value={`+${realizedEAI.toFixed(3)}`}
          sub="cumulative · last 90d"
          tone="ok"
        />
      </div>

      {/* Active recommendations */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2
              className="font-[var(--font-sora)]"
              style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Pending recommendations
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Each card is a data-backed delta proposal. Approve to deploy via L9 DIR; reject to
              dismiss. Outcome is measured against the ledger automatically.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {active.length === 0 && (
            <div className="card" style={{ padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>
              No active recommendations. Auto-Research is monitoring telemetry continuously.
            </div>
          )}
          {active.map(imp => (
            <RecommendationCard
              key={imp.improvement_id}
              imp={imp}
              onViewDiff={() => setOpenDiff(imp)}
            />
          ))}
        </div>
      </section>

      {/* Improvement History */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2
              className="font-[var(--font-sora)]"
              style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Improvement history
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Track record of past improvements with measured outcome data. Every confirmed
              improvement is co-signed by FuzeBox + rPotential.
            </p>
          </div>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="w-full" style={{ fontSize: 12 }}>
            <thead>
              <tr
                style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-2 font-medium">Skill</th>
                <th className="text-left py-3 px-2 font-medium">Type</th>
                <th className="text-left py-3 px-2 font-medium">Approver</th>
                <th className="text-right py-3 px-2 font-medium">Outcome</th>
                <th className="text-left py-3 px-2 font-medium">Status</th>
                <th className="py-3 px-2" />
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr
                  key={h.improvement_id}
                  onClick={() => setOpenOutcome(h)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  className="row-hover"
                >
                  <td
                    className="py-3 px-4 tabular-nums"
                    style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}
                  >
                    {h.applied_at?.slice(0, 10) ?? h.reviewed_at?.slice(0, 10) ?? '—'}
                  </td>
                  <td className="py-3 px-2" style={{ color: 'var(--text-primary)' }}>
                    {prettySkill(h.skill_id ?? '—')}
                  </td>
                  <td className="py-3 px-2" style={{ color: 'var(--text-secondary)' }}>
                    {TYPE_LABEL[h.type] ?? h.type}
                  </td>
                  <td className="py-3 px-2" style={{ color: 'var(--text-secondary)' }}>
                    {h.reviewed_by ?? '—'}
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums">
                    <OutcomeCell imp={h} />
                  </td>
                  <td className="py-3 px-2">
                    <StatusBadge status={h.status} />
                  </td>
                  <td className="py-3 px-2">
                    <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* How it works */}
      <section className="card" style={{ padding: 24 }}>
        <h2
          className="font-[var(--font-sora)] mb-2"
          style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}
        >
          How Auto-Improvement works
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 820, lineHeight: 1.5 }}>
          Inspired by automated research feedback loops, the system writes its own improvements
          based on data — but you stay in control of what ships. Every step is recorded; every
          deployed change has a measurable outcome attached to the next ledger window.
        </p>
        <div className="grid grid-cols-7 gap-3 items-start">
          <FlowStep n={1} label="Telemetry" desc="Every PEL row, every observation event feeds the analyser." />
          <FlowArrow />
          <FlowStep n={2} label="Pattern" desc="Variance breaches + drift + eval failures grouped by skill × time × vendor." />
          <FlowArrow />
          <FlowStep n={3} label="Hypothesis" desc="LLM-generated improvement candidates with projected delta." />
          <FlowArrow />
          <FlowStep n={4} label="Govern" desc="Proposed change reviewed against active policy packs." />
        </div>
        <div className="grid grid-cols-7 gap-3 items-start mt-3">
          <FlowStep n={5} label="Approve" desc="Human reviews diff, projected impact, confidence — approves or rejects." accent />
          <FlowArrow />
          <FlowStep n={6} label="Deploy" desc="L9 DIR injects the patch. Cross-vendor propagation if applicable." />
          <FlowArrow />
          <FlowStep n={7} label="Measure" desc="Variance tracked vs baseline. Confirmed, reverted, or rolled back." />
          <FlowArrow />
          <div className="col-span-1" />
        </div>
      </section>

      {/* Default DIR rule set */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2
              className="font-[var(--font-sora)]"
              style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}
            >
              L9 DIR · current live rule set
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {liveRules.length} live rules — the runtime layer the auto-improvement system
              deploys patches into.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {liveRules.map(r => (
            <DIRRuleSummaryCard key={r.rule_id} rule={r} />
          ))}
        </div>
      </section>

      {openDiff && <DiffModal imp={openDiff} onClose={() => setOpenDiff(null)} />}
      {openOutcome && <OutcomeModal imp={openOutcome} onClose={() => setOpenOutcome(null)} />}
    </div>
  )
}

/* ── Recommendation card (active) ─────────────────────────────── */

function RecommendationCard({
  imp,
  onViewDiff,
}: {
  imp: ImprovementRecommendation
  onViewDiff: () => void
}) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="flex items-start gap-4">
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 36, height: 36, background: 'rgba(55,138,221,0.1)', color: 'var(--accent-blue)' }}
        >
          <Sparkles size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <StatusBadge status={imp.status} />
            <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {imp.improvement_id}
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(55,138,221,0.08)', color: 'var(--accent-blue)' }}
            >
              {TYPE_LABEL[imp.type]}
            </span>
            <PolicyBadge check={imp.policy_check} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{imp.title}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
            {imp.hypothesis}
          </p>

          {/* Source telemetry */}
          <div
            className="mt-3 p-3 rounded-lg"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start gap-2">
              <span
                style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                Source telemetry
              </span>
            </div>
            <div className="mt-1.5" style={{ fontSize: 12, color: 'var(--text-primary)' }}>
              <code className="font-[var(--font-mono-jb)]" style={{ fontSize: 11 }}>
                {imp.source_telemetry.scope}
              </code>
              <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
                {imp.source_telemetry.observed_metric}
              </div>
              <div className="mt-1" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                {imp.source_telemetry.ledger_rows} ledger rows · last {imp.source_telemetry.window_days}d
              </div>
            </div>
          </div>

          {/* Projected impact */}
          <div className="grid grid-cols-4 gap-3 mt-3">
            <Projection
              label="Variance reduction"
              value={
                imp.projected_impact.variance_reduction_usd_per_week === 0
                  ? '—'
                  : `$${Math.abs(imp.projected_impact.variance_reduction_usd_per_week).toLocaleString()}/wk`
              }
              tone="ok"
            />
            <Projection
              label="Cost change"
              value={
                imp.projected_impact.cost_change_usd_per_week === 0
                  ? '—'
                  : `${imp.projected_impact.cost_change_usd_per_week < 0 ? '−' : '+'}$${Math.abs(imp.projected_impact.cost_change_usd_per_week).toLocaleString()}/wk`
              }
              tone={imp.projected_impact.cost_change_usd_per_week <= 0 ? 'ok' : 'warn'}
            />
            <Projection
              label="EAI delta"
              value={`${imp.projected_impact.eai_delta >= 0 ? '+' : ''}${imp.projected_impact.eai_delta.toFixed(3)}`}
              tone={imp.projected_impact.eai_delta >= 0 ? 'ok' : 'warn'}
            />
            <Projection
              label="Confidence"
              value={`${Math.round(imp.projected_impact.confidence * 100)}%`}
              tone={imp.projected_impact.confidence >= 0.8 ? 'ok' : imp.projected_impact.confidence >= 0.6 ? 'neutral' : 'warn'}
            />
          </div>

          {imp.policy_notes && (
            <div
              className="mt-3 px-3 py-2 rounded-lg flex items-start gap-2"
              style={{
                background: imp.policy_check === 'flagged' ? 'var(--status-amber-bg)' : 'rgba(55,138,221,0.06)',
                border:
                  '1px solid ' +
                  (imp.policy_check === 'flagged' ? 'rgba(186,117,23,0.2)' : 'rgba(55,138,221,0.18)'),
              }}
            >
              <AlertTriangle
                size={12}
                style={{
                  color: imp.policy_check === 'flagged' ? 'var(--status-amber)' : 'var(--accent-blue)',
                  marginTop: 2,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {imp.policy_notes}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={onViewDiff}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              <GitCompare size={12} />
              View diff
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer"
              style={{
                background: 'var(--accent-blue)',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid var(--accent-blue)',
              }}
            >
              <CheckCircle2 size={12} />
              Approve & deploy
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer"
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              <XCircle size={12} />
              Reject
            </button>
            {imp.reviewed_at && (
              <span className="ml-auto" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                In review since {imp.reviewed_at.slice(0, 10)} · {imp.reviewed_by}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── DIR rule summary card ────────────────────────────────────── */

function DIRRuleSummaryCard({ rule }: { rule: DIRRule }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="flex items-start gap-3">
        <Zap size={14} style={{ color: 'var(--accent-blue)', marginTop: 2, flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <code className="font-[var(--font-mono-jb)]" style={{ fontSize: 12, color: 'var(--text-primary)' }}>
            {rule.rule_id}
          </code>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
            {rule.description}
          </p>
          <div className="flex items-center gap-3 mt-2" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            <span>fired {rule.fired_last_7d}× / 7d</span>
            {rule.pack_id && <span className="font-[var(--font-mono-jb)]">{rule.pack_id}</span>}
            {rule.source && (
              <span style={{ color: 'var(--accent-blue)' }}>· synthesized</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Modal: Diff ──────────────────────────────────────────────── */

function DiffModal({ imp, onClose }: { imp: ImprovementRecommendation; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-6" style={{ background: 'rgba(15,17,23,0.7)' }} onClick={onClose}>
      <div
        className="card overflow-y-auto"
        style={{ width: 760, maxHeight: '92vh', padding: 24 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={imp.status} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }} className="font-[var(--font-mono-jb)]">{imp.improvement_id}</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{imp.title}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>{imp.hypothesis}</p>
          </div>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-muted)', fontSize: 22, lineHeight: 1, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <div
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              marginBottom: 6,
            }}
          >
            Diff summary
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{imp.diff.summary}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DiffPane title="Before" bg="var(--status-red-bg)" border="rgba(226,75,74,0.18)" content={imp.diff.before} />
          <DiffPane title="After" bg="var(--status-green-bg)" border="rgba(29,158,117,0.18)" content={imp.diff.after} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <div
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: 6,
              }}
            >
              Source telemetry
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <code className="font-[var(--font-mono-jb)] block" style={{ fontSize: 11, color: 'var(--text-primary)' }}>
                {imp.source_telemetry.scope}
              </code>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                {imp.source_telemetry.observed_metric}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {imp.source_telemetry.ledger_rows} rows · last {imp.source_telemetry.window_days}d
              </div>
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: 6,
              }}
            >
              Projected impact (annualised)
            </div>
            <div
              className="p-3 rounded-lg space-y-1.5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <KV
                k="Variance reduction"
                v={`$${(imp.projected_impact.variance_reduction_usd_per_week * 52).toLocaleString()}/yr`}
              />
              <KV
                k="Cost change"
                v={`${imp.projected_impact.cost_change_usd_per_week < 0 ? '−' : '+'}$${(Math.abs(imp.projected_impact.cost_change_usd_per_week) * 52).toLocaleString()}/yr`}
              />
              <KV k="EAI delta" v={`+${imp.projected_impact.eai_delta.toFixed(3)}`} />
              <KV k="Confidence" v={`${Math.round(imp.projected_impact.confidence * 100)}%`} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg cursor-pointer"
            style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 12 }}
          >
            Close
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer"
            style={{ background: 'var(--accent-blue)', color: '#FFFFFF', fontSize: 12, fontWeight: 600 }}
          >
            <CheckCircle2 size={12} /> Approve & deploy
          </button>
        </div>
      </div>
    </div>
  )
}

function DiffPane({ title, bg, border, content }: { title: string; bg: string; border: string; content: string }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: bg, border: `1px solid ${border}` }}>
      <div
        className="px-3 py-2"
        style={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-secondary)',
          borderBottom: `1px solid ${border}`,
        }}
      >
        {title}
      </div>
      <pre
        className="font-[var(--font-mono-jb)]"
        style={{ fontSize: 11, color: 'var(--text-primary)', padding: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' }}
      >
        {content}
      </pre>
    </div>
  )
}

/* ── Modal: Outcome ───────────────────────────────────────────── */

function OutcomeModal({ imp, onClose }: { imp: ImprovementRecommendation; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-6" style={{ background: 'rgba(15,17,23,0.7)' }} onClick={onClose}>
      <div
        className="card overflow-y-auto"
        style={{ width: 720, maxHeight: '92vh', padding: 24 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={imp.status} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }} className="font-[var(--font-mono-jb)]">
                {imp.improvement_id}
              </span>
              {imp.signature_pair && <TwoPartySignaturePill />}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{imp.title}</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: 22, lineHeight: 1, cursor: 'pointer' }}>×</button>
        </div>

        <Section title="Hypothesis">
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{imp.hypothesis}</p>
        </Section>

        <Section title="Lifecycle">
          <div className="grid grid-cols-4 gap-2" style={{ fontSize: 12 }}>
            <Lifecycle label="Detected" value={imp.detected_at?.slice(0, 10) ?? '—'} />
            <Lifecycle
              label="Reviewed"
              value={imp.reviewed_at?.slice(0, 10) ?? '—'}
              sub={imp.reviewed_by}
            />
            <Lifecycle label="Applied" value={imp.applied_at?.slice(0, 10) ?? '—'} />
            <Lifecycle label="Measured" value={imp.outcome?.measured_at?.slice(0, 10) ?? '—'} />
          </div>
        </Section>

        <Section title="Projected vs realised">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Projected</div>
              <KV
                k="Variance"
                v={`$${imp.projected_impact.variance_reduction_usd_per_week.toLocaleString()}/wk`}
              />
              <KV k="EAI" v={`+${imp.projected_impact.eai_delta.toFixed(3)}`} />
              <KV k="Confidence" v={`${Math.round(imp.projected_impact.confidence * 100)}%`} />
            </div>
            <div
              className="p-3 rounded-lg"
              style={{
                background: imp.status === 'confirmed' ? 'var(--status-green-bg)' : imp.status === 'reverted' ? 'var(--status-red-bg)' : 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Realised</div>
              {imp.outcome ? (
                <>
                  <KV
                    k="Variance"
                    v={`$${Math.abs(imp.outcome.variance_actual_delta_usd_per_week).toLocaleString()}/wk`}
                    accent={imp.outcome.variance_actual_delta_usd_per_week <= 0 ? 'ok' : 'warn'}
                  />
                  <KV
                    k="EAI"
                    v={`${imp.outcome.eai_actual_delta >= 0 ? '+' : ''}${imp.outcome.eai_actual_delta.toFixed(3)}`}
                    accent={imp.outcome.eai_actual_delta >= 0 ? 'ok' : 'warn'}
                  />
                  <KV k="Rows observed" v={imp.outcome.rows_observed.toString()} />
                </>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Outcome not yet measured.</div>
              )}
            </div>
          </div>
          {imp.outcome?.notes && (
            <div className="mt-3" style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {imp.outcome.notes}
            </div>
          )}
        </Section>

        {imp.policy_notes && (
          <Section title="Governance">
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{imp.policy_notes}</div>
          </Section>
        )}
      </div>
    </div>
  )
}

/* ── Building blocks ──────────────────────────────────────────── */

function ImpactStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub: string
  tone?: 'ok' | 'warn'
}) {
  const color = tone === 'ok' ? 'var(--status-green)' : tone === 'warn' ? 'var(--status-amber)' : 'var(--text-primary)'
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="font-[var(--font-mono-jb)] tabular-nums mt-1" style={{ fontSize: 22, color, fontWeight: 600 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: ImprovementStatus | DIRRule['status'] }) {
  const map: Record<string, { label: string; bg: string; fg: string; icon: typeof CheckCircle2 }> = {
    new: { label: 'NEW', bg: 'rgba(55,138,221,0.1)', fg: 'var(--accent-blue)', icon: Sparkles },
    in_review: { label: 'IN REVIEW', bg: 'var(--status-amber-bg)', fg: 'var(--status-amber)', icon: Clock },
    approved: { label: 'APPROVED', bg: 'var(--status-green-bg)', fg: 'var(--status-green)', icon: CheckCircle2 },
    applied: { label: 'APPLIED', bg: 'rgba(55,138,221,0.1)', fg: 'var(--accent-blue)', icon: Zap },
    confirmed: { label: 'CONFIRMED', bg: 'var(--status-green-bg)', fg: 'var(--status-green)', icon: CheckCircle2 },
    reverted: { label: 'REVERTED', bg: 'var(--status-red-bg)', fg: 'var(--status-red)', icon: RotateCcw },
    rejected: { label: 'REJECTED', bg: 'var(--surface)', fg: 'var(--text-muted)', icon: XCircle },
    live: { label: 'LIVE', bg: 'var(--status-green-bg)', fg: 'var(--status-green)', icon: CheckCircle2 },
    proposed: { label: 'PROPOSED', bg: 'var(--surface)', fg: 'var(--text-muted)', icon: Clock },
    synthesized: { label: 'SYNTH', bg: 'var(--status-amber-bg)', fg: 'var(--status-amber)', icon: Sparkles },
  }
  const m = map[status] ?? map.new
  const Icon = m.icon
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{
        background: m.bg,
        color: m.fg,
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: '0.05em',
      }}
    >
      <Icon size={10} />
      {m.label}
    </span>
  )
}

function PolicyBadge({ check }: { check: 'passed' | 'flagged' | 'blocked' }) {
  const map = {
    passed: { label: 'POLICY ✓', color: 'var(--status-green)', bg: 'var(--status-green-bg)' },
    flagged: { label: 'POLICY FLAGGED', color: 'var(--status-amber)', bg: 'var(--status-amber-bg)' },
    blocked: { label: 'POLICY BLOCKED', color: 'var(--status-red)', bg: 'var(--status-red-bg)' },
  }
  const m = map[check]
  return (
    <span
      className="px-2 py-0.5 rounded-full"
      style={{ background: m.bg, color: m.color, fontSize: 9, fontWeight: 600, letterSpacing: '0.05em' }}
    >
      {m.label}
    </span>
  )
}

function Projection({ label, value, tone }: { label: string; value: string; tone: 'ok' | 'warn' | 'neutral' }) {
  const color =
    tone === 'ok' ? 'var(--status-green)' : tone === 'warn' ? 'var(--status-amber)' : 'var(--text-primary)'
  return (
    <div className="p-2 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="font-[var(--font-mono-jb)] tabular-nums" style={{ fontSize: 14, color, fontWeight: 600, marginTop: 2 }}>
        {value}
      </div>
    </div>
  )
}

function FlowStep({ n, label, desc, accent }: { n: number; label: string; desc: string; accent?: boolean }) {
  return (
    <div className="col-span-1">
      <div
        className="rounded-xl flex items-center justify-center mb-2"
        style={{
          width: 32,
          height: 32,
          background: accent ? 'var(--accent-blue)' : '#0f1117',
          color: '#FFFFFF',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {n}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
    </div>
  )
}

function FlowArrow() {
  return (
    <div className="col-span-1 flex items-center justify-center" style={{ paddingTop: 10 }}>
      <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
    </div>
  )
}

function OutcomeCell({ imp }: { imp: ImprovementRecommendation }) {
  if (imp.status === 'rejected') {
    return <span style={{ color: 'var(--text-muted)' }}>—</span>
  }
  if (!imp.outcome) {
    return <span style={{ color: 'var(--text-muted)' }}>measuring…</span>
  }
  if (imp.status === 'reverted') {
    return (
      <span style={{ color: 'var(--status-red)' }}>
        <TrendingUp size={11} className="inline" /> +${Math.abs(imp.outcome.variance_actual_delta_usd_per_week).toFixed(0)}/wk
      </span>
    )
  }
  // Confirmed
  if (imp.outcome.variance_actual_delta_usd_per_week !== 0) {
    return (
      <span style={{ color: 'var(--status-green)' }}>
        <TrendingDown size={11} className="inline" /> $
        {Math.abs(imp.outcome.variance_actual_delta_usd_per_week).toFixed(0)}/wk
      </span>
    )
  }
  return (
    <span style={{ color: 'var(--status-green)' }}>
      EAI +{imp.outcome.eai_actual_delta.toFixed(3)}
    </span>
  )
}

function Lifecycle({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div className="font-[var(--font-mono-jb)] tabular-nums" style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
      <div
        style={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function KV({ k, v, accent }: { k: string; v: string; accent?: 'ok' | 'warn' }) {
  const color = accent === 'ok' ? 'var(--status-green)' : accent === 'warn' ? 'var(--status-amber)' : 'var(--text-primary)'
  return (
    <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
      <span className="font-[var(--font-mono-jb)] tabular-nums" style={{ color, fontWeight: 500 }}>
        {v}
      </span>
    </div>
  )
}

function prettySkill(skillId: string): string {
  if (skillId === '—') return '—'
  return skillId
    .replace(/^skill_/, '')
    .replace(/_v\d+$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}
