'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type {
  QuadrantAgent,
  QuadrantUser,
  Briefing,
  CardType,
  DraftLifecycle,
} from '@/lib/quadrant-mock'
import { FileCode, Clock, Mail, Activity } from 'lucide-react'

type TabId = 'all' | 'sam' | 'genevieve' | 'ted'

interface CardBreakdown {
  userId: string
  userName: string
  byType: Record<CardType, { total: number; acted: number; dismissed: number }>
}

interface RitualStat {
  userId: string
  userName: string
  medianMinutesToOpen: number | null
  dashboardOpens14d: number
  briefingsTotal: number
  openRate: number
}

interface DraftSummary {
  total: Record<DraftLifecycle, number>
  byUser: Record<string, Record<DraftLifecycle, number>>
}

interface Props {
  agent: QuadrantAgent
  users: QuadrantUser[]
  ritual: RitualStat[]
  cardBreakdown: CardBreakdown[]
  draftLifecycle: DraftSummary
  overallAction: { acted: number; total: number; rate: number }
  briefings: Briefing[]
}

const CARD_TYPE_ORDER: CardType[] = ['follow_up', 'meeting_prep', 'deal_action', 'email_draft', 'admin', 'deferred']
const CARD_TYPE_LABEL: Record<CardType, string> = {
  follow_up: 'Follow-up',
  meeting_prep: 'Meeting prep',
  deal_action: 'Deal action',
  email_draft: 'Email draft',
  admin: 'Admin',
  deferred: 'Deferred',
}
const CARD_TYPE_COLOR: Record<CardType, string> = {
  follow_up: '#378ADD',
  meeting_prep: '#1D9E75',
  deal_action: '#8B5CF6',
  email_draft: '#F59E0B',
  admin: '#6B7280',
  deferred: '#E24B4A',
}

export default function ChiefOfStaffView({
  agent,
  users,
  ritual,
  cardBreakdown,
  draftLifecycle,
  overallAction,
  briefings,
}: Props) {
  const [tab, setTab] = useState<TabId>('all')

  const filteredBriefings = useMemo(() => {
    if (tab === 'all') return briefings
    return briefings.filter(b => b.userId === tab)
  }, [tab, briefings])

  const activeRitual = tab === 'all' ? ritual : ritual.filter(r => r.userId === tab)
  const activeBreakdown = tab === 'all' ? cardBreakdown : cardBreakdown.filter(c => c.userId === tab)
  const activeDraftTotal =
    tab === 'all'
      ? draftLifecycle.total
      : draftLifecycle.byUser[tab] || { drafted: 0, sent: 0, edited: 0, deleted: 0 }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Agent header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Agent
            </div>
            <h1 className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-sora)' }}>
              {agent.name}
            </h1>
            <p className="text-sm mt-2 max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
              {agent.summary}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Model: <span className="font-mono">{agent.model}</span></span>
              <span>·</span>
              <span>Status: <span className="capitalize" style={{ color: '#1D9E75' }}>{agent.status}</span></span>
              <span>·</span>
              <Link href="/chief-of-staff/prompts" className="inline-flex items-center gap-1 hover:underline" style={{ color: '#378ADD' }}>
                <FileCode size={12} /> Prompt {agent.currentPromptVersion}
              </Link>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Action rate
            </div>
            <div className="text-3xl font-bold mt-1" style={{ fontFamily: 'var(--font-sora)', color: '#1D9E75' }}>
              {Math.round(overallAction.rate * 100)}%
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {overallAction.acted} of {overallAction.total} cards
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
        {(['all', 'sam', 'genevieve', 'ted'] as TabId[]).map(t => {
          const label = t === 'all' ? 'All' : users.find(u => u.id === t)?.name.split(' ')[0] || t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-sm cursor-pointer"
              style={{
                color: tab === t ? '#378ADD' : 'var(--text-secondary)',
                fontWeight: tab === t ? 600 : 400,
                borderBottom: tab === t ? '2px solid #378ADD' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Metrics bar */}
      <div className="grid grid-cols-4 gap-4">
        <Metric
          label="Briefings (30d)"
          value={filteredBriefings.length.toString()}
          icon={<Activity size={16} />}
        />
        <Metric
          label="Avg latency"
          value={
            filteredBriefings.length
              ? Math.round(
                  filteredBriefings.reduce((s, b) => s + b.latencyMs, 0) / filteredBriefings.length,
                ).toLocaleString() + 'ms'
              : '—'
          }
          icon={<Clock size={16} />}
        />
        <Metric
          label="Avg cost / briefing"
          value={
            filteredBriefings.length
              ? '$' +
                (filteredBriefings.reduce((s, b) => s + b.costUsd, 0) / filteredBriefings.length).toFixed(3)
              : '—'
          }
          icon={<Activity size={16} />}
        />
        <Metric
          label="Drafts sent"
          value={activeDraftTotal.sent.toString()}
          icon={<Mail size={16} />}
        />
      </div>

      {/* Morning ritual */}
      <section className="card p-5">
        <h3 className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-sora)' }}>
          Morning ritual baseline
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          First-open time after 09:30 briefing, last 30 weekdays.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {activeRitual.map(r => (
            <div key={r.userId} className="p-4 rounded-lg" style={{ background: 'var(--surface-muted, #F7F9FC)' }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {r.userName}
              </div>
              <div className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-sora)' }}>
                {r.medianMinutesToOpen !== null ? `${Math.round(r.medianMinutesToOpen)}m` : '—'}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Median open delay
              </div>
              <div className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                Open rate: {Math.round(r.openRate * 100)}% · {r.dashboardOpens14d} / {r.briefingsTotal} briefings
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Card type breakdown */}
      <section className="card p-5">
        <h3 className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-sora)' }}>
          Card-type action breakdown
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Stacked by user · cards acted-on vs dismissed vs pending.
        </p>
        <div className="space-y-4">
          {activeBreakdown.map(b => (
            <div key={b.userId}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="font-medium">{b.userName}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {Object.values(b.byType).reduce((s, v) => s + v.total, 0)} cards total
                </span>
              </div>
              <div className="space-y-1">
                {CARD_TYPE_ORDER.map(t => {
                  const row = b.byType[t]
                  if (row.total === 0) return null
                  const actedPct = (row.acted / row.total) * 100
                  const dismissedPct = (row.dismissed / row.total) * 100
                  return (
                    <div key={t} className="flex items-center gap-3 text-xs">
                      <div className="w-24" style={{ color: 'var(--text-secondary)' }}>
                        {CARD_TYPE_LABEL[t]}
                      </div>
                      <div className="flex-1 h-5 rounded overflow-hidden flex" style={{ background: '#E8EDF5' }}>
                        <div style={{ width: `${actedPct}%`, background: CARD_TYPE_COLOR[t] }} />
                        <div style={{ width: `${dismissedPct}%`, background: '#E24B4A', opacity: 0.45 }} />
                      </div>
                      <div className="w-32 text-right" style={{ color: 'var(--text-muted)' }}>
                        {row.acted} acted · {row.dismissed} dismissed
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Outlook draft lifecycle */}
      <section className="card p-5">
        <h3 className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-sora)' }}>
          Outlook draft lifecycle
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Fate of email_draft cards sent to the user&apos;s Outlook.
        </p>
        <div className="grid grid-cols-4 gap-3">
          {(['drafted', 'sent', 'edited', 'deleted'] as DraftLifecycle[]).map(l => {
            const total = Object.values(activeDraftTotal).reduce((s, v) => s + v, 0)
            const v = activeDraftTotal[l]
            const pct = total ? Math.round((v / total) * 100) : 0
            const color =
              l === 'sent' ? '#1D9E75' : l === 'edited' ? '#378ADD' : l === 'drafted' ? '#F59E0B' : '#E24B4A'
            return (
              <div key={l} className="p-4 rounded-lg" style={{ background: 'var(--surface-muted, #F7F9FC)' }}>
                <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  {l}
                </div>
                <div className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-sora)', color }}>
                  {v}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {pct}% of drafts
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recent briefings list */}
      <section className="card p-5">
        <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-sora)' }}>
          Recent briefings
        </h3>
        <div className="text-xs mb-2 grid grid-cols-6 gap-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
          <div>Date</div>
          <div>User</div>
          <div>Prompt</div>
          <div>Cards</div>
          <div>Latency</div>
          <div>Cost</div>
        </div>
        <div className="space-y-1">
          {filteredBriefings.slice(0, 10).map(b => (
            <div key={b.id} className="grid grid-cols-6 gap-2 text-sm py-1.5 row-hover px-1">
              <div>{b.date}</div>
              <div>{users.find(u => u.id === b.userId)?.name}</div>
              <div className="font-mono text-xs">{b.promptVersion}</div>
              <div>{b.cards.length}</div>
              <div>{b.latencyMs.toLocaleString()}ms</div>
              <div>${b.costUsd.toFixed(3)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-sora)' }}>
        {value}
      </div>
    </div>
  )
}
