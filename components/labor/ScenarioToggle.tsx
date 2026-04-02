'use client'

import type { Scenario } from '@/types/telemetry'
import clsx from 'clsx'

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'aggressive', label: 'Aggressive' },
]

interface ScenarioToggleProps {
  active: Scenario
  onChange: (s: Scenario) => void
}

export function ScenarioToggle({ active, onChange }: ScenarioToggleProps) {
  return (
    <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--vip-navy-100)' }}>
      {SCENARIOS.map(s => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={clsx(
            'px-4 py-2 text-sm font-semibold rounded-md transition-all',
            active === s.value
              ? 'shadow-sm'
              : 'hover:opacity-80'
          )}
          style={{
            background: active === s.value ? '#FFFFFF' : 'transparent',
            color: active === s.value ? 'var(--vip-navy)' : 'var(--vip-muted)',
            fontFamily: 'var(--font-sora)',
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
