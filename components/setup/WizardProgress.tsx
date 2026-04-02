'use client'

import { Check } from 'lucide-react'

interface WizardProgressProps {
  currentStep: number
}

const STEPS = [
  { number: 1, label: 'Choose Job Role' },
  { number: 2, label: 'Map Tasks' },
  { number: 3, label: 'Set Targets' },
  { number: 4, label: 'Review' },
]

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const isCompleted = step.number < currentStep
          const isActive = step.number === currentStep
          const isFuture = step.number > currentStep
          const isComingSoon = step.number > 2

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    background: isCompleted
                      ? 'var(--status-green)'
                      : isActive
                        ? 'var(--accent-blue)'
                        : 'transparent',
                    border: isFuture
                      ? '2px solid var(--border)'
                      : 'none',
                    color: isCompleted || isActive
                      ? '#FFFFFF'
                      : 'var(--text-muted)',
                  }}
                >
                  {isCompleted ? <Check size={16} /> : step.number}
                </div>
                <div>
                  <p
                    className="text-sm font-medium leading-tight"
                    style={{
                      color: isActive
                        ? 'var(--text-primary)'
                        : isCompleted
                          ? 'var(--status-green)'
                          : 'var(--text-muted)',
                    }}
                  >
                    {step.label}
                  </p>
                  {isComingSoon && (
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Coming soon
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting line */}
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 mx-4"
                  style={{
                    height: 2,
                    background: isCompleted ? 'var(--status-green)' : 'var(--border)',
                    borderRadius: 1,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
