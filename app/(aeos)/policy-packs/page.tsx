'use client'

import { useState } from 'react'
import { listPolicyPacks } from '@/lib/aeos/data'
import type { PolicyPack, PolicyRule } from '@/types/aeos'
import { ShieldCheck, FileText, ChevronRight } from 'lucide-react'

export default function PolicyPacksPage() {
  const packs = listPolicyPacks()
  const [selectedId, setSelectedId] = useState<string>(packs[0]?.pack_id ?? '')
  const [drawerRule, setDrawerRule] = useState<PolicyRule | null>(null)
  const selected = packs.find(p => p.pack_id === selectedId)

  return (
    <div className="space-y-6">
      <header>
        <h1 style={{ fontSize: 'var(--aeos-fs-title)', fontWeight: 600 }}>Policy Packs</h1>
        <p style={{ color: 'var(--aeos-fg-secondary)', marginTop: 4, fontSize: 14 }}>
          {packs.length} packs · enforced by Layer 2 governance · read-only transparency.
        </p>
      </header>

      <div className="grid grid-cols-4 gap-4">
        {/* Pack list */}
        <div className="col-span-1 space-y-2">
          {packs.map(p => (
            <button
              key={p.pack_id}
              type="button"
              onClick={() => setSelectedId(p.pack_id)}
              className="aeos-card w-full text-left"
              style={{
                padding: 14,
                borderColor: p.pack_id === selectedId ? 'var(--aeos-accent-primary)' : 'var(--aeos-border-line)',
                background: p.pack_id === selectedId ? 'var(--aeos-bg-elevated)' : 'var(--aeos-bg-card)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} style={{ color: 'var(--aeos-accent-ok)' }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--aeos-fg-primary)' }}>{p.display_name}</span>
              </div>
              <div className="aeos-mono" style={{ fontSize: 10, color: 'var(--aeos-fg-muted)' }}>v{p.version}</div>
              <div className="flex items-center gap-2 mt-2" style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)' }}>
                <span>{p.rules.length} rules</span>
                <span>·</span>
                <span>{p.jurisdiction.join(', ')}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Rule table for selected pack */}
        <div className="col-span-3 aeos-card" style={{ padding: 0, overflow: 'hidden' }}>
          {selected && (
            <>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--aeos-border-divider)' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--aeos-fg-primary)' }}>{selected.display_name}</div>
                <div style={{ fontSize: 12, color: 'var(--aeos-fg-secondary)', marginTop: 2, lineHeight: 1.5 }}>{selected.description}</div>
              </div>
              <table className="w-full" style={{ fontSize: 12 }}>
                <thead>
                  <tr style={{ color: 'var(--aeos-fg-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th className="text-left py-2 px-3 font-medium">Rule</th>
                    <th className="text-left py-2 px-2 font-medium">Severity</th>
                    <th className="text-left py-2 px-2 font-medium">When</th>
                    <th className="text-left py-2 px-2 font-medium">Require</th>
                    <th className="text-right py-2 px-2 font-medium">Fired 7d</th>
                    <th className="text-right py-2 px-2 font-medium">Denied 7d</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {selected.rules.map(r => (
                    <tr
                      key={r.rule_id}
                      onClick={() => setDrawerRule(r)}
                      style={{ borderTop: '1px solid var(--aeos-border-divider)', cursor: 'pointer' }}
                    >
                      <td className="py-3 px-3 aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{r.rule_id}</td>
                      <td className="py-3 px-2"><SeverityPill severity={r.severity} /></td>
                      <td className="py-3 px-2 aeos-mono" style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)' }}>{r.when_summary}</td>
                      <td className="py-3 px-2 aeos-mono" style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)' }}>{r.require_summary}</td>
                      <td className="py-3 px-2 text-right aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{r.fired_last_7d}</td>
                      <td className="py-3 px-2 text-right aeos-mono" style={{ color: r.denied_last_7d > 0 ? 'var(--aeos-accent-warn)' : 'var(--aeos-fg-muted)' }}>{r.denied_last_7d}</td>
                      <td className="py-3 px-2"><ChevronRight size={12} style={{ color: 'var(--aeos-fg-muted)' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {drawerRule && <RuleDrawer rule={drawerRule} onClose={() => setDrawerRule(null)} />}
    </div>
  )
}

function SeverityPill({ severity }: { severity: PolicyRule['severity'] }) {
  const colors = {
    critical: 'var(--aeos-accent-bad)',
    high: 'var(--aeos-accent-warn)',
    medium: 'var(--aeos-fg-secondary)',
  }
  return (
    <span className="aeos-pill" style={{ fontSize: 10, color: colors[severity], borderColor: colors[severity] + '33', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {severity}
    </span>
  )
}

function RuleDrawer({ rule, onClose }: { rule: PolicyRule; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-20 flex justify-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        className="aeos-card overflow-y-auto"
        style={{ width: 540, height: '100vh', borderRadius: 0, padding: 24 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SeverityPill severity={rule.severity} />
            </div>
            <div className="aeos-mono" style={{ fontSize: 16, color: 'var(--aeos-fg-primary)' }}>{rule.rule_id}</div>
            <p style={{ fontSize: 13, color: 'var(--aeos-fg-secondary)', marginTop: 8, lineHeight: 1.5 }}>{rule.description}</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--aeos-fg-muted)', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        <Section title="When">
          <code className="aeos-mono block" style={{ fontSize: 12, color: 'var(--aeos-fg-primary)', background: 'var(--aeos-bg-nested)', padding: 10, borderRadius: 6 }}>
            {rule.when_summary}
          </code>
        </Section>

        <Section title="Require">
          <code className="aeos-mono block" style={{ fontSize: 12, color: 'var(--aeos-fg-primary)', background: 'var(--aeos-bg-nested)', padding: 10, borderRadius: 6 }}>
            {rule.require_summary}
          </code>
        </Section>

        <Section title="Activity (last 7d)">
          <div className="flex gap-6">
            <KV k="Fired" v={rule.fired_last_7d.toString()} accent="ok" />
            <KV k="Denied" v={rule.denied_last_7d.toString()} accent={rule.denied_last_7d > 0 ? 'warn' : undefined} />
          </div>
        </Section>

        <Section title="References">
          <ul className="space-y-1">
            {rule.references.map(r => (
              <li key={r} style={{ fontSize: 12, color: 'var(--aeos-fg-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={11} />
                {r}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="YAML">
          <pre className="aeos-mono" style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)', background: 'var(--aeos-bg-nested)', padding: 12, borderRadius: 6, lineHeight: 1.5, overflowX: 'auto' }}>
            {rule.yaml_excerpt}
          </pre>
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

function KV({ k, v, accent }: { k: string; v: string; accent?: 'ok' | 'warn' }) {
  const color = accent === 'ok' ? 'var(--aeos-accent-ok)' : accent === 'warn' ? 'var(--aeos-accent-warn)' : 'var(--aeos-fg-primary)'
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>{k}</div>
      <div className="aeos-mono" style={{ fontSize: 18, color, marginTop: 2 }}>{v}</div>
    </div>
  )
}
