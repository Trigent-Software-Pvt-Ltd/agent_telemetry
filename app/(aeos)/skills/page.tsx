'use client'

import { useState } from 'react'
import { listSkills } from '@/lib/aeos/data'
import type { AEOSSkill, ExecutionPath, GovernanceTag } from '@/types/aeos'
import { TrendingDown, TrendingUp, ShieldAlert } from 'lucide-react'

const FAMILY_LABELS: Record<string, string> = {
  auto_diag: 'Auto Diagnosis',
  auto_repair: 'Auto Repair',
  cx_triage: 'CX Triage',
  events_ops: 'Events & Ops',
  compliance: 'Compliance',
  field_service: 'Field Service',
  hr_people: 'HR · People',
  sportsbook: 'Sportsbook',
}

const PATH_SHORT: Record<string, string> = {
  human: 'H',
  anthropic_agent: 'AN',
  openai_agent: 'OAI',
  google_vertex_agent: 'VTX',
  salesforce_agent: 'SF',
  cloudflare_agent: 'CF',
  uniphore_agent: 'UP',
  hybrid_anthropic_human: 'AN+H',
  hybrid_openai_human: 'OAI+H',
}

export default function SkillsAuthorityPage() {
  const skills = listSkills()
  const [selected, setSelected] = useState<AEOSSkill | null>(null)
  const [familyFilter, setFamilyFilter] = useState<string>('all')

  const families = Array.from(new Set(skills.map(s => s.family)))
  const filtered = familyFilter === 'all' ? skills : skills.filter(s => s.family === familyFilter)

  return (
    <div className="space-y-6">
      <header>
        <h1 style={{ fontSize: 'var(--aeos-fs-title)', fontWeight: 600 }}>Skills Authority</h1>
        <p style={{ color: 'var(--aeos-fg-secondary)', marginTop: 4, fontSize: 14 }}>
          {skills.length} skills · {families.length} families · per-path performance and drift.
        </p>
      </header>

      <div className="aeos-card" style={{ padding: 12 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 6 }}>
            Family
          </span>
          <FilterChip active={familyFilter === 'all'} onClick={() => setFamilyFilter('all')}>
            All ({skills.length})
          </FilterChip>
          {families.map(f => (
            <FilterChip key={f} active={familyFilter === f} onClick={() => setFamilyFilter(f)}>
              {FAMILY_LABELS[f] ?? f} ({skills.filter(s => s.family === f).length})
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {filtered.map(s => (
          <button
            key={s.skill_id}
            type="button"
            onClick={() => setSelected(s)}
            className="aeos-card text-left transition-colors"
            style={{ padding: 14 }}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="aeos-pill" style={{ fontSize: 9 }}>{FAMILY_LABELS[s.family] ?? s.family}</span>
              <StrategicRing weight={s.strategic_weight} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--aeos-fg-primary)', lineHeight: 1.3, marginBottom: 6 }}>
              {s.name}
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {s.allowed_paths.slice(0, 4).map(p => {
                const success = s.performance[p]?.success_rate ?? 0
                const color = success >= 0.92 ? 'var(--aeos-accent-ok)' : success >= 0.82 ? 'var(--aeos-fg-secondary)' : 'var(--aeos-accent-warn)'
                return (
                  <span key={p} className="aeos-mono" style={{ fontSize: 9, color, padding: '1px 5px', border: `1px solid ${color}33`, borderRadius: 4 }}>
                    {PATH_SHORT[p] ?? p}
                  </span>
                )
              })}
            </div>
            <div className="flex items-center justify-between" style={{ fontSize: 10, color: 'var(--aeos-fg-muted)' }}>
              <span>drift</span>
              <span className="flex items-center gap-1" style={{ color: s.drift_risk > 0.30 ? 'var(--aeos-accent-warn)' : 'var(--aeos-accent-ok)' }}>
                {s.drift_risk > 0.30 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {(s.drift_risk * 100).toFixed(0)}%
              </span>
            </div>
          </button>
        ))}
      </div>

      {selected && <SkillDrawer skill={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function FilterChip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1 rounded-full"
      style={{
        fontSize: 11,
        background: active ? 'var(--aeos-accent-primary)' : 'transparent',
        color: active ? 'var(--aeos-bg-canvas)' : 'var(--aeos-fg-secondary)',
        border: `1px solid ${active ? 'var(--aeos-accent-primary)' : 'var(--aeos-border-line)'}`,
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </button>
  )
}

function StrategicRing({ weight }: { weight: number }) {
  const r = 10
  const c = 2 * Math.PI * r
  const dash = weight * c
  return (
    <svg width={28} height={28}>
      <title>{`Strategic weight: ${weight.toFixed(2)}`}</title>
      <circle cx={14} cy={14} r={r} fill="none" stroke="var(--aeos-bg-nested)" strokeWidth={3} />
      <circle
        cx={14}
        cy={14}
        r={r}
        fill="none"
        stroke={weight > 0.6 ? 'var(--aeos-accent-warn)' : 'var(--aeos-accent-primary)'}
        strokeWidth={3}
        strokeDasharray={`${dash} ${c - dash}`}
        transform="rotate(-90 14 14)"
        strokeLinecap="round"
      />
      <text x={14} y={17} textAnchor="middle" className="aeos-mono" style={{ fontSize: 9, fill: 'var(--aeos-fg-primary)' }}>
        {(weight * 100).toFixed(0)}
      </text>
    </svg>
  )
}

function SkillDrawer({ skill, onClose }: { skill: AEOSSkill; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-20 flex justify-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        className="aeos-card overflow-y-auto"
        style={{ width: 480, height: '100vh', borderRadius: 0, padding: 24 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="aeos-pill" style={{ fontSize: 10 }}>{FAMILY_LABELS[skill.family] ?? skill.family}</span>
            <h2 style={{ fontSize: 18, color: 'var(--aeos-fg-primary)', fontWeight: 500, marginTop: 8 }}>{skill.name}</h2>
            <div className="aeos-mono mt-1" style={{ fontSize: 11, color: 'var(--aeos-fg-muted)' }}>{skill.skill_id}</div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--aeos-fg-muted)', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--aeos-fg-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          {skill.description}
        </p>

        <Section title="Workforce signals">
          <div className="grid grid-cols-2 gap-3">
            <KV k="Strategic weight" v={skill.strategic_weight.toFixed(2)} mono />
            <KV k="Drift risk" v={`${(skill.drift_risk * 100).toFixed(0)}%`} mono accent={skill.drift_risk > 0.30 ? 'warn' : 'ok'} />
          </div>
        </Section>

        <Section title="Governance tags">
          <div className="flex flex-wrap gap-1">
            {skill.governance_tags.length === 0 && <span style={{ fontSize: 11, color: 'var(--aeos-fg-muted)' }}>none</span>}
            {skill.governance_tags.map(t => (
              <span key={t} className="aeos-pill aeos-mono" style={{ fontSize: 10, color: t === 'safety_relevant' || t === 'auto_safety' ? 'var(--aeos-accent-warn)' : 'var(--aeos-fg-secondary)' }}>
                {t === 'safety_relevant' || t === 'auto_safety' ? <ShieldAlert size={9} /> : null}
                {t}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Per-path performance">
          <table className="w-full" style={{ fontSize: 12 }}>
            <thead>
              <tr style={{ color: 'var(--aeos-fg-muted)', fontSize: 10 }}>
                <th className="text-left py-1">Path</th>
                <th className="text-right py-1">Success</th>
                <th className="text-right py-1">Cost</th>
                <th className="text-right py-1">Latency</th>
              </tr>
            </thead>
            <tbody>
              {skill.allowed_paths.map(p => {
                const perf = skill.performance[p]
                if (!perf) return (
                  <tr key={p} style={{ borderTop: '1px solid var(--aeos-border-divider)' }}>
                    <td className="py-2 aeos-mono" style={{ color: 'var(--aeos-fg-secondary)' }}>{p}</td>
                    <td colSpan={3} className="text-right" style={{ color: 'var(--aeos-fg-muted)', fontSize: 11 }}>no data</td>
                  </tr>
                )
                return (
                  <tr key={p} style={{ borderTop: '1px solid var(--aeos-border-divider)' }}>
                    <td className="py-2 aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{p}</td>
                    <td className="text-right py-2 aeos-mono" style={{ color: perf.success_rate >= 0.90 ? 'var(--aeos-accent-ok)' : 'var(--aeos-fg-primary)' }}>
                      {(perf.success_rate * 100).toFixed(1)}%
                    </td>
                    <td className="text-right py-2 aeos-mono" style={{ color: 'var(--aeos-fg-secondary)' }}>${perf.avg_cost_usd.toFixed(2)}</td>
                    <td className="text-right py-2 aeos-mono" style={{ color: 'var(--aeos-fg-secondary)' }}>{perf.avg_latency_ms}ms</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Section>

        <Section title="Required tools">
          <div className="flex flex-wrap gap-1">
            {skill.required_tools.map(t => (
              <span key={t} className="aeos-pill aeos-mono" style={{ fontSize: 10 }}>{t}</span>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--aeos-border-divider)' }}>
      <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )
}

function KV({ k, v, mono, accent }: { k: string; v: string; mono?: boolean; accent?: 'ok' | 'warn' }) {
  const color = accent === 'ok' ? 'var(--aeos-accent-ok)' : accent === 'warn' ? 'var(--aeos-accent-warn)' : 'var(--aeos-fg-primary)'
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>{k}</div>
      <div className={mono ? 'aeos-mono' : ''} style={{ fontSize: 16, color, marginTop: 2 }}>{v}</div>
    </div>
  )
}
