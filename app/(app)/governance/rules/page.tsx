'use client'

import { useState } from 'react'
import type { GovernanceRule, EnforcementLevel, Geography } from '@/types/telemetry'
import { getGovernanceRules, getGovernanceViolations, getMtbvData, getRuleGeography } from '@/lib/mock-data'
import { ComplianceGauge } from '@/components/governance/ComplianceGauge'
import { GovernanceRuleCard } from '@/components/governance/GovernanceRuleCard'
import { ViolationsList } from '@/components/governance/ViolationsList'
import { AddRuleForm } from '@/components/governance/AddRuleForm'
import { Scale, AlertTriangle, TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react'

export default function GovernanceRulesPage() {
  const [rules, setRules] = useState<GovernanceRule[]>(getGovernanceRules)
  const [geoMap, setGeoMap] = useState<Record<string, Geography>>(() => {
    const map: Record<string, Geography> = {}
    getGovernanceRules().forEach(r => { map[r.id] = getRuleGeography(r.id) })
    return map
  })
  const violations = getGovernanceViolations()
  const mtbvData = getMtbvData()

  const activeRules = rules.filter(r => r.active)
  const satisfiedCount = activeRules.filter(r => r.satisfied).length

  // MTBV calculation
  const currentMtbv = mtbvData[mtbvData.length - 1]?.days ?? 0
  const prevMtbv = mtbvData[mtbvData.length - 2]?.days ?? 0
  const mtbvTrend = currentMtbv > prevMtbv ? 'improving' : currentMtbv < prevMtbv ? 'declining' : 'stable'

  function handleToggleActive(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
  }

  function handleChangeEnforcement(id: string, level: EnforcementLevel) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enforcement: level } : r))
  }

  function handleChangeGeography(id: string, geo: Geography) {
    setGeoMap(prev => ({ ...prev, [id]: geo }))
  }

  function handleAddRule(input: { name: string; condition: string; enforcement: EnforcementLevel; scope: string }) {
    const newRule: GovernanceRule = {
      id: `gr-${Date.now()}`,
      name: input.name,
      condition: input.condition,
      enforcement: input.enforcement,
      active: true,
      satisfied: true,
    }
    setRules(prev => [...prev, newRule])
    setGeoMap(prev => ({ ...prev, [newRule.id]: 'Global' }))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale size={22} style={{ color: 'var(--vip-gold)' }} />
          <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
            Governance Rules
          </h1>
        </div>
        <AddRuleForm onAdd={handleAddRule} />
      </div>

      {/* MTBV metric */}
      <div className="card flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock size={18} style={{ color: 'var(--vip-gold)' }} />
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
              Mean Time Between Violations
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-bold tabular-nums font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
                {currentMtbv} days
              </span>
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: mtbvTrend === 'improving' ? 'var(--status-green-bg)' : mtbvTrend === 'declining' ? 'var(--status-red-bg)' : 'var(--surface)',
                  color: mtbvTrend === 'improving' ? 'var(--status-green)' : mtbvTrend === 'declining' ? 'var(--status-red)' : 'var(--text-muted)',
                }}
              >
                {mtbvTrend === 'improving' && <TrendingUp size={12} />}
                {mtbvTrend === 'declining' && <TrendingDown size={12} />}
                {mtbvTrend === 'stable' && <Minus size={12} />}
                {mtbvTrend}
              </span>
            </div>
          </div>
        </div>
        {/* Sparkline-like trend */}
        <div className="ml-auto flex items-end gap-1" style={{ height: 32 }}>
          {mtbvData.map((d, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: 20,
                height: `${(d.days / 14) * 100}%`,
                background: i === mtbvData.length - 1 ? 'var(--vip-gold)' : 'var(--border)',
                minHeight: 4,
              }}
              title={`${d.month}: ${d.days} days`}
            />
          ))}
        </div>
      </div>

      {/* Compliance gauge */}
      <ComplianceGauge satisfied={satisfiedCount} total={activeRules.length} />

      {/* Risk consequence callout — only when violations exist */}
      {violations.length > 0 && (
        <div
          className="card flex items-start gap-3"
          style={{
            background: violations.length >= 2 ? 'var(--status-red-bg)' : 'var(--status-amber-bg)',
            border: `1px solid ${violations.length >= 2 ? 'var(--status-red)' : 'var(--status-amber)'}`,
          }}
        >
          <AlertTriangle
            size={20}
            className="flex-shrink-0 mt-0.5"
            style={{ color: violations.length >= 2 ? 'var(--status-red)' : 'var(--status-amber)' }}
          />
          <div>
            <p
              className="text-sm font-semibold"
              style={{
                color: violations.length >= 2 ? 'var(--status-red)' : 'var(--status-amber)',
                fontFamily: 'var(--font-sora)',
              }}
            >
              {violations.length} violated rule{violations.length !== 1 ? 's' : ''} put you at risk of non-compliance with EU AI Act Article 14
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Estimated exposure: regulatory audit flag. Review and remediate violated rules to maintain compliance posture.
            </p>
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
          All Rules ({rules.length})
        </h3>
        {rules.map(rule => (
          <GovernanceRuleCard
            key={rule.id}
            rule={rule}
            geography={geoMap[rule.id] ?? 'Global'}
            onToggleActive={handleToggleActive}
            onChangeEnforcement={handleChangeEnforcement}
            onChangeGeography={handleChangeGeography}
          />
        ))}
      </div>

      {/* Violations */}
      <ViolationsList violations={violations} />
    </div>
  )
}
