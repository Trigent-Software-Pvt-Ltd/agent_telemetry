'use client'

import { useState } from 'react'
import type { GovernanceRule, EnforcementLevel } from '@/types/telemetry'
import { getGovernanceRules, getGovernanceViolations } from '@/lib/mock-data'
import { ComplianceGauge } from '@/components/governance/ComplianceGauge'
import { GovernanceRuleCard } from '@/components/governance/GovernanceRuleCard'
import { ViolationsList } from '@/components/governance/ViolationsList'
import { AddRuleForm } from '@/components/governance/AddRuleForm'
import { Scale } from 'lucide-react'

export default function GovernanceRulesPage() {
  const [rules, setRules] = useState<GovernanceRule[]>(getGovernanceRules)
  const violations = getGovernanceViolations()

  const activeRules = rules.filter(r => r.active)
  const satisfiedCount = activeRules.filter(r => r.satisfied).length

  function handleToggleActive(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
  }

  function handleChangeEnforcement(id: string, level: EnforcementLevel) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enforcement: level } : r))
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

      {/* Compliance gauge */}
      <ComplianceGauge satisfied={satisfiedCount} total={activeRules.length} />

      {/* Rules list */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
          All Rules ({rules.length})
        </h3>
        {rules.map(rule => (
          <GovernanceRuleCard
            key={rule.id}
            rule={rule}
            onToggleActive={handleToggleActive}
            onChangeEnforcement={handleChangeEnforcement}
          />
        ))}
      </div>

      {/* Violations */}
      <ViolationsList violations={violations} />
    </div>
  )
}
