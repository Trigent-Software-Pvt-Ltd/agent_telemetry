'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getTasksForProcess } from '@/lib/mock-data'
import type { OnetOccupation, OnetTask } from '@/types/telemetry'

interface OccupationPreviewProps {
  occupation: OnetOccupation
  onAdd: (occupation: OnetOccupation, headcount: number, wage: number) => void
}

// Map known O*NET codes to process IDs
const CODE_TO_PROCESS: Record<string, string> = {
  '13-2099.01': 'sports-betting',
  '43-4051.00': 'customer-service',
}

function classifyAutomation(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.7) return 'high'
  if (score >= 0.35) return 'medium'
  return 'low'
}

const barColors = {
  high: '#1D9E75',
  medium: '#BA7517',
  low: '#E24B4A',
}

export function OccupationPreview({ occupation, onAdd }: OccupationPreviewProps) {
  const processId = CODE_TO_PROCESS[occupation.code]
  const tasks: OnetTask[] = processId ? getTasksForProcess(processId) : []
  const hasTasks = tasks.length > 0

  const [headcount, setHeadcount] = useState(
    processId === 'sports-betting' ? 12 : processId === 'customer-service' ? 8 : 5
  )
  const [wage, setWage] = useState(occupation.medianWage)

  // Compute automation susceptibility distribution
  const distribution = hasTasks
    ? (() => {
        let high = 0, medium = 0, low = 0
        tasks.forEach((t) => {
          const c = classifyAutomation(t.automationScore)
          if (c === 'high') high++
          else if (c === 'medium') medium++
          else low++
        })
        return [
          { name: 'Highly automatable', count: high, key: 'high' as const },
          { name: 'Moderate', count: medium, key: 'medium' as const },
          { name: 'Low automation', count: low, key: 'low' as const },
        ]
      })()
    : [
        { name: 'Highly automatable', count: Math.round(occupation.taskCount * 0.35), key: 'high' as const },
        { name: 'Moderate', count: Math.round(occupation.taskCount * 0.4), key: 'medium' as const },
        { name: 'Low automation', count: occupation.taskCount - Math.round(occupation.taskCount * 0.35) - Math.round(occupation.taskCount * 0.4), key: 'low' as const },
      ]

  const riskStyle = {
    high: { bg: 'var(--status-red-bg)', color: 'var(--status-red)' },
    medium: { bg: 'var(--status-amber-bg)', color: 'var(--status-amber)' },
    low: { bg: 'var(--status-green-bg)', color: 'var(--status-green)' },
  }[occupation.automationRisk]

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {occupation.title}
          </h3>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
            style={{ background: riskStyle.bg, color: riskStyle.color }}
          >
            {occupation.automationRisk.charAt(0).toUpperCase() + occupation.automationRisk.slice(1)} automation risk
          </span>
        </div>
        <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
          O*NET {occupation.code}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {occupation.description}
        </p>
      </div>

      {/* Task list preview */}
      <div className="card">
        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Task List Preview
        </h4>
        {hasTasks ? (
          <div className="flex flex-col gap-1.5">
            {tasks.map((t) => {
              const cls = classifyAutomation(t.automationScore)
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded-md text-sm"
                  style={{ background: 'var(--surface)' }}
                >
                  <span style={{ color: 'var(--text-primary)' }}>{t.task}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {(t.automationScore * 100).toFixed(0)}%
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: barColors[cls] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {occupation.taskCount} tasks available &mdash; task details will load after adding this process.
          </p>
        )}
      </div>

      {/* Automation susceptibility chart */}
      <div className="card">
        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Automation Susceptibility
        </h4>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={distribution} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--content-bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [`${value} tasks`, 'Count']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
              {distribution.map((entry) => (
                <Cell key={entry.key} fill={barColors[entry.key]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Headcount and wage inputs */}
      <div className="card">
        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Staffing Details
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              Headcount
            </label>
            <input
              type="number"
              min={1}
              value={headcount}
              onChange={(e) => setHeadcount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg text-sm tabular-nums"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--content-bg)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              Avg. Hourly Wage ($)
            </label>
            <input
              type="number"
              min={1}
              value={wage}
              onChange={(e) => setWage(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg text-sm tabular-nums"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--content-bg)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => onAdd(occupation, headcount, wage)}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
        style={{ background: 'var(--accent-blue)' }}
      >
        Add this process
      </button>
    </div>
  )
}
