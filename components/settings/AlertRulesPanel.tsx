'use client'

import { useState } from 'react'
import { getAlertRules, AlertRule } from '@/lib/mock-data'
import { AlertRuleCard } from './AlertRuleCard'

export function AlertRulesPanel() {
  const [rules, setRules] = useState<AlertRule[]>(() => getAlertRules())

  const handleChange = (index: number, updated: AlertRule) => {
    setRules(prev => {
      const next = [...prev]
      next[index] = updated
      return next
    })
  }

  return (
    <section>
      <div className="mb-4">
        <h2
          className="text-xs font-semibold uppercase"
          style={{ color: '#64748B', letterSpacing: '0.08em' }}
        >
          Alert Rules
        </h2>
        <p className="text-[12px] mt-1" style={{ color: '#94A3B8' }}>
          Configure when alerts fire. Toggle rules on/off and set severity per rule.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule, i) => (
          <AlertRuleCard
            key={rule.id}
            rule={rule}
            onChange={updated => handleChange(i, updated)}
          />
        ))}
      </div>
    </section>
  )
}
