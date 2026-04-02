'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { PeakHourCell } from '@/lib/mock-data'

interface PeakHourHeatmapProps {
  data: PeakHourCell[]
  defaultOpen?: boolean
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getCellColor(failureRate: number): string {
  // Green (low failure) to red (high failure)
  if (failureRate <= 0.03) return '#E8F5E9'
  if (failureRate <= 0.06) return '#C8E6C9'
  if (failureRate <= 0.10) return '#FFF9C4'
  if (failureRate <= 0.15) return '#FFE082'
  if (failureRate <= 0.20) return '#FFAB91'
  if (failureRate <= 0.30) return '#EF5350'
  return '#C62828'
}

function getTextColor(failureRate: number): string {
  return failureRate > 0.20 ? '#FFFFFF' : '#374151'
}

export function PeakHourHeatmap({ data, defaultOpen = false }: PeakHourHeatmapProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Find the worst cell for the insight
  const worstCell = data.reduce((worst, cell) =>
    cell.failureRate > worst.failureRate ? cell : worst
  , data[0])

  // Find the worst time range
  const afternoonFriday = data.filter(
    (c) => c.dayOfWeek === 4 && c.hour >= 14 && c.hour <= 16
  )
  const avgAfternoonFridayRate = afternoonFriday.length > 0
    ? afternoonFriday.reduce((s, c) => s + c.failureRate, 0) / afternoonFriday.length
    : 0

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <div className="text-left">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            Peak Hour Failure Heatmap
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Most failures happen between 2&ndash;4 PM on Fridays ({Math.round(avgAfternoonFridayRate * 100)}% failure rate)
          </p>
        </div>
        {isOpen ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
      </button>

      {isOpen && (
        <div className="mt-4 animate-fade-up">
          {/* Insight callout */}
          <div
            className="rounded-lg px-4 py-3 mb-4 text-sm"
            style={{
              background: 'var(--status-amber-bg)',
              border: '1px solid var(--status-amber)',
              color: 'var(--text-primary)',
            }}
          >
            <strong>Peak risk window:</strong> {DAY_LABELS[worstCell.dayOfWeek]} at{' '}
            {worstCell.hour}:00 has the highest failure rate ({Math.round(worstCell.failureRate * 100)}%).
            Consider load balancing or request queuing during afternoon peak hours.
          </div>

          {/* Heatmap grid */}
          <div className="overflow-x-auto">
            <div style={{ minWidth: 700 }}>
              {/* Hour labels */}
              <div className="flex items-end mb-1" style={{ paddingLeft: 40 }}>
                {Array.from({ length: 24 }, (_, h) => (
                  <div
                    key={h}
                    className="text-center text-[9px] font-medium tabular-nums"
                    style={{ width: 28, color: '#9CA3AF' }}
                  >
                    {h.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {DAY_LABELS.map((dayLabel, dayIdx) => (
                <div key={dayLabel} className="flex items-center mb-[2px]">
                  <div
                    className="text-[11px] font-medium"
                    style={{ width: 40, color: '#6B7280' }}
                  >
                    {dayLabel}
                  </div>
                  {Array.from({ length: 24 }, (_, h) => {
                    const cell = data.find(
                      (c) => c.dayOfWeek === dayIdx && c.hour === h
                    )
                    if (!cell) return <div key={h} style={{ width: 28, height: 28 }} />
                    return (
                      <div
                        key={h}
                        className="rounded-sm flex items-center justify-center"
                        style={{
                          width: 28,
                          height: 28,
                          backgroundColor: getCellColor(cell.failureRate),
                          color: getTextColor(cell.failureRate),
                        }}
                        title={`${dayLabel} ${h}:00 - ${cell.runs} runs, ${cell.failures} failures (${Math.round(cell.failureRate * 100)}%)`}
                      >
                        <span className="text-[8px] font-bold tabular-nums">
                          {Math.round(cell.failureRate * 100)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center gap-3 mt-3" style={{ paddingLeft: 40 }}>
                <span className="text-[10px]" style={{ color: '#9CA3AF' }}>Failure rate:</span>
                {[
                  { label: '< 3%', color: '#E8F5E9' },
                  { label: '3-6%', color: '#C8E6C9' },
                  { label: '6-10%', color: '#FFF9C4' },
                  { label: '10-15%', color: '#FFE082' },
                  { label: '15-20%', color: '#FFAB91' },
                  { label: '20-30%', color: '#EF5350' },
                  { label: '> 30%', color: '#C62828' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[9px]" style={{ color: '#6B7280' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
