'use client'

import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, AlertTriangle, CheckCircle2, ShieldCheck, UserCheck, Users } from 'lucide-react'
import {
  AUDIT_EVENTS,
  GSTI,
  GSTI_HISTORY,
  LAST_ROLE_CHANGE,
  ROLES,
  SOURCE_HEALTH,
} from './data'

const NAVY = '#0A1628'
const GOLD = '#D4AF37'
const GREEN = 'var(--status-green)'
const GREEN_BG = 'var(--status-green-bg)'
const AMBER = 'var(--status-amber)'
const AMBER_BG = 'var(--status-amber-bg)'

export default function ProductionReadinessView() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-sora)' }}>
          Production Readiness
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Phase 4 hardening preview — enterprise-grade controls for the Quadrant deployment.
        </p>
      </div>

      {/* 2x2 grid on desktop, 1-col on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccessControlCard />
        <GstiThresholdCard />
        <AuditTrailCard />
        <CircuitBreakerCard />
      </div>
    </div>
  )
}

/* -------------------------------------------------------- */
/* Tile 1 — Access Control                                    */
/* -------------------------------------------------------- */

function AccessControlCard() {
  return (
    <div className="card flex flex-col gap-4">
      <TileHeader icon={<Users size={16} />} title="Access Control" subtitle="Role-based permissions" />

      <div className="flex flex-col gap-2">
        {ROLES.map((r) => (
          <div
            key={r.key}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
              style={{ background: NAVY, color: GOLD }}
            >
              {r.label}
            </span>
            <div className="text-sm flex-1 min-w-0">
              <span className="font-semibold">{r.people}</span>
              <span style={{ color: 'var(--text-secondary)' }}> · {r.access}</span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex items-start gap-2 rounded-md px-3 py-2 text-xs"
        style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
      >
        <UserCheck size={14} style={{ color: GOLD, marginTop: 1 }} />
        <div>
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {LAST_ROLE_CHANGE.summary}
          </span>{' '}
          · {LAST_ROLE_CHANGE.date} · by {LAST_ROLE_CHANGE.actor}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------- */
/* Tile 2 — GSTI Score Threshold                              */
/* -------------------------------------------------------- */

function GstiThresholdCard() {
  return (
    <div className="card flex flex-col gap-4">
      <TileHeader icon={<Activity size={16} />} title="GSTI Score Threshold" subtitle="14-day trend" />

      <div className="flex items-end gap-6">
        <div>
          <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Current
          </div>
          <div className="text-3xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-sora)' }}>
            {GSTI.current}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Baseline
          </div>
          <div className="text-lg font-semibold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {GSTI.baseline}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Alert at
          </div>
          <div className="text-lg font-semibold tabular-nums" style={{ color: AMBER }}>
            {GSTI.alertThreshold}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 120 }}>
        <ResponsiveContainer>
          <AreaChart data={GSTI_HISTORY} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gstiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" hide />
            <YAxis domain={[70, 95]} hide />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: 'var(--text-secondary)' }}
            />
            <ReferenceLine y={GSTI.alertThreshold} stroke={AMBER} strokeDasharray="3 3" />
            <ReferenceLine y={GSTI.baseline} stroke="var(--text-muted)" strokeDasharray="2 4" />
            <Area
              type="monotone"
              dataKey="score"
              stroke={GOLD}
              strokeWidth={2}
              fill="url(#gstiFill)"
              dot={false}
              activeDot={{ r: 4, fill: GOLD }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <label
        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer select-none group"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <input type="checkbox" defaultChecked className="peer sr-only" />
        <span
          className="relative h-5 w-9 rounded-full transition-colors"
          style={{ background: GOLD }}
        >
          <span
            className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow"
            style={{ left: 18 }}
          />
        </span>
        <span className="text-sm font-medium">Alert on breach</span>
        <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
          Notifies Principal via email + Slack
        </span>
      </label>
    </div>
  )
}

/* -------------------------------------------------------- */
/* Tile 3 — Audit Trail Preview                               */
/* -------------------------------------------------------- */

function AuditTrailCard() {
  return (
    <div className="card flex flex-col gap-3 lg:col-span-1">
      <TileHeader icon={<ShieldCheck size={16} />} title="Audit Trail Preview" subtitle="Last 10 events" />

      <div className="overflow-x-auto -mx-4">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              {['Timestamp', 'Actor', 'Action', 'Trace ID'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: '#64748B' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AUDIT_EVENTS.map((e) => (
              <tr key={e.id} className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                <td
                  className="px-4 py-2 whitespace-nowrap tabular-nums text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {e.timestamp}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs font-medium">{e.actor}</td>
                <td className="px-4 py-2 text-xs">{e.action}</td>
                <td
                  className="px-4 py-2 whitespace-nowrap text-xs tabular-nums"
                  style={{ fontFamily: 'var(--font-mono-jb)', color: 'var(--text-muted)' }}
                >
                  {e.traceId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* -------------------------------------------------------- */
/* Tile 4 — Retry / Circuit Breaker Health                    */
/* -------------------------------------------------------- */

function CircuitBreakerCard() {
  return (
    <div className="card flex flex-col gap-3">
      <TileHeader
        icon={<AlertTriangle size={16} />}
        title="Retry / Circuit Breaker Health"
        subtitle="Per data source"
      />

      <div className="flex flex-col gap-2">
        {SOURCE_HEALTH.map((s) => {
          const healthy = s.status === 'healthy'
          return (
            <div
              key={s.name}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{s.name}</span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      background: healthy ? GREEN_BG : AMBER_BG,
                      color: healthy ? GREEN : AMBER,
                    }}
                  >
                    {healthy ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                    {s.status}
                  </span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {s.detail}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------- */
/* Shared                                                     */
/* -------------------------------------------------------- */

function TileHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-md"
        style={{ background: NAVY, color: GOLD }}
      >
        {icon}
      </span>
      <div>
        <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-sora)' }}>
          {title}
        </div>
        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </div>
      </div>
    </div>
  )
}
