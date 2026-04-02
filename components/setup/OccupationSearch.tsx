'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { searchOccupations } from '@/lib/mock-data'
import type { OnetOccupation } from '@/types/telemetry'

interface OccupationSearchProps {
  selected: OnetOccupation | null
  onSelect: (occupation: OnetOccupation) => void
}

const riskColors: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'var(--status-red-bg)', text: 'var(--status-red)', label: 'High' },
  medium: { bg: 'var(--status-amber-bg)', text: 'var(--status-amber)', label: 'Medium' },
  low: { bg: 'var(--status-green-bg)', text: 'var(--status-green)', label: 'Low' },
}

export function OccupationSearch({ selected, onSelect }: OccupationSearchProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => searchOccupations(query), [query])

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search occupations by title, category, or O*NET code..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
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

      {/* Results count */}
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {results.length} occupation{results.length !== 1 ? 's' : ''} found
      </p>

      {/* Results list */}
      <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
        {results.map((occ) => {
          const isSelected = selected?.code === occ.code
          const risk = riskColors[occ.automationRisk]

          return (
            <button
              key={occ.code}
              onClick={() => onSelect(occ)}
              className="card text-left transition-all cursor-pointer"
              style={{
                borderColor: isSelected ? 'var(--accent-blue)' : 'var(--border)',
                boxShadow: isSelected
                  ? '0 0 0 2px var(--accent-blue-bg), 0 1px 3px rgba(0,0,0,0.04)'
                  : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {occ.title}
                  </h4>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {occ.code}
                  </span>
                </div>
                {/* Automation risk badge */}
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                  style={{ background: risk.bg, color: risk.text }}
                >
                  {risk.label} risk
                </span>
              </div>

              <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {occ.description}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Category pill */}
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
                  style={{ background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)' }}
                >
                  {occ.category}
                </span>
                {/* Task count */}
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {occ.taskCount} tasks
                </span>
                {/* Median wage */}
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  ${occ.medianWage}/hr
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
