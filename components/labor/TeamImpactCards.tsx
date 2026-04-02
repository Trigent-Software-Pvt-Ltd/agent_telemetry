'use client'

import type { TeamMemberImpact } from '@/types/telemetry'
import { Star, Users, TrendingUp } from 'lucide-react'

interface TeamImpactCardsProps {
  members: TeamMemberImpact[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={12}
          fill={n <= rating ? 'var(--vip-gold)' : 'none'}
          stroke={n <= rating ? 'var(--vip-gold)' : 'var(--border)'}
        />
      ))}
    </span>
  )
}

export function TeamImpactCards({ members }: TeamImpactCardsProps) {
  const avgSaved = members.reduce((sum, m) => sum + m.netSaved, 0) / members.length
  const avgSat = members.reduce((sum, m) => sum + m.satisfaction, 0) / members.length

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Users size={18} style={{ color: 'var(--vip-gold)' }} />
        <h2 className="text-lg font-bold font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
          Individual Team Impact
        </h2>
      </div>

      {/* Summary */}
      <div
        className="card flex items-center gap-3"
        style={{ background: 'var(--vip-gold-subtle, #FBF5DC)', borderColor: 'var(--vip-gold)' }}
      >
        <TrendingUp size={18} style={{ color: 'var(--vip-gold-hover, #A8891A)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--vip-navy)' }}>
          Average team member saves {avgSaved.toFixed(1)} hrs/week. Satisfaction: {avgSat.toFixed(1)}/5
        </p>
      </div>

      {/* Member cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map(member => (
          <div key={member.name} className="card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.role}</p>
              </div>
              <StarRating rating={member.satisfaction} />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg p-2" style={{ background: 'var(--status-green-bg)' }}>
                <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--status-green)' }}>
                  {member.hoursFreed}h
                </p>
                <p className="text-[10px] font-semibold" style={{ color: 'var(--status-green)' }}>Freed</p>
              </div>
              <div className="rounded-lg p-2" style={{ background: 'var(--status-amber-bg)' }}>
                <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--status-amber)' }}>
                  +{member.oversightHours}h
                </p>
                <p className="text-[10px] font-semibold" style={{ color: 'var(--status-amber)' }}>Oversight</p>
              </div>
              <div className="rounded-lg p-2" style={{ background: 'var(--surface)' }}>
                <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--vip-navy)' }}>
                  {member.netSaved}h
                </p>
                <p className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Net saved</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
