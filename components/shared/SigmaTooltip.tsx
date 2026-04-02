'use client'

import { useState, useRef, type ReactNode } from 'react'
import { SIGMA_LEVELS } from '@/lib/mock-data'

function getSigmaLabel(value: number): string {
  // Find the closest sigma level
  const sorted = [...SIGMA_LEVELS].sort(
    (a, b) => Math.abs(a.sigma - value) - Math.abs(b.sigma - value)
  )
  return sorted[0].label
}

function getSigmaBracket(value: number): number {
  // Return the integer sigma level the value falls into (floor, clamped 1-6)
  return Math.max(1, Math.min(6, Math.floor(value)))
}

export function SigmaTooltip({ value, children }: { value: number; children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const bracket = getSigmaBracket(value)
  const currentLabel = getSigmaLabel(value)

  // Show the bracket the value is in, plus one above and one below for context
  const contextLevels = SIGMA_LEVELS.filter(
    (l) => l.sigma >= bracket - 1 && l.sigma <= bracket + 1
  )

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      ref={ref}
    >
      {children}
      {visible && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-xl overflow-hidden"
          style={{
            background: '#0f1117',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
            animation: 'fade-up 0.15s ease-out forwards',
            minWidth: 260,
          }}
        >
          {/* Current value callout */}
          <div
            className="px-4 py-2.5 text-center"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-sm font-bold tabular-nums" style={{ color: '#D4AF37' }}>
              {value.toFixed(1)}&sigma;
            </span>
            <span className="text-xs ml-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              = {currentLabel}
            </span>
          </div>

          {/* Mini scale */}
          <div className="px-4 py-2.5 flex flex-col gap-1.5">
            {contextLevels.map((level) => {
              const isCurrent = level.sigma === bracket
              return (
                <div
                  key={level.sigma}
                  className="flex items-center gap-2 text-xs"
                  style={{ opacity: isCurrent ? 1 : 0.55 }}
                >
                  <span
                    className="font-bold tabular-nums"
                    style={{
                      width: 24,
                      color: isCurrent ? '#D4AF37' : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {level.sigma}&sigma;
                  </span>
                  <span
                    className="flex-1 h-1 rounded-full"
                    style={{
                      background: isCurrent
                        ? 'linear-gradient(90deg, #D4AF37, #F5D06E)'
                        : 'rgba(255,255,255,0.12)',
                    }}
                  />
                  <span
                    className="text-[10px]"
                    style={{ color: isCurrent ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }}
                  >
                    {level.shortLabel}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
