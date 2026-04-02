'use client'

import { useState, useMemo, Fragment } from 'react'
import { getFmeaEntries } from '@/lib/mock-data'
import type { FmeaEntry } from '@/types/telemetry'
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'

interface RiskTableProps {
  selectedId: string | null
  onSelect: (entry: FmeaEntry) => void
}

type SortKey = 'agentName' | 'failureMode' | 'effect' | 'severity' | 'occurrence' | 'detection' | 'rpn' | 'status'

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  open: { bg: 'var(--status-red-bg)', color: 'var(--status-red)' },
  'in-progress': { bg: 'var(--status-amber-bg)', color: 'var(--status-amber)' },
  mitigated: { bg: 'var(--status-green-bg)', color: 'var(--status-green)' },
}

function rpnColor(rpn: number): string {
  if (rpn > 200) return 'var(--status-red)'
  if (rpn > 100) return 'var(--status-amber)'
  return 'var(--status-green)'
}

export function RiskTable({ selectedId, onSelect }: RiskTableProps) {
  const entries = getFmeaEntries()
  const [sortKey, setSortKey] = useState<SortKey>('rpn')
  const [sortAsc, setSortAsc] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sorted = useMemo(() => {
    const copy = [...entries]
    copy.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
    return copy
  }, [entries, sortKey, sortAsc])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (col !== sortKey) return <ChevronDown size={12} className="opacity-30" />
    return sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  const columns: { key: SortKey; label: string; width?: string }[] = [
    { key: 'agentName', label: 'Agent', width: '14%' },
    { key: 'failureMode', label: 'Failure Mode', width: '20%' },
    { key: 'effect', label: 'Effect', width: '18%' },
    { key: 'severity', label: 'S' },
    { key: 'occurrence', label: 'O' },
    { key: 'detection', label: 'D' },
    { key: 'rpn', label: 'RPN' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          FMEA Register
          <span className="font-normal ml-2" style={{ color: 'var(--text-muted)' }}>
            {entries.length} failure modes analyzed
          </span>
        </h2>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="w-full text-sm" style={{ minWidth: 900 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              <th style={{ width: 32 }} />
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left px-3 py-2.5 font-semibold cursor-pointer select-none"
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    width: col.width,
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry) => {
              const isExpanded = expandedId === entry.id
              const isSelected = selectedId === entry.id
              const isCritical = entry.rpn > 200
              const st = STATUS_STYLE[entry.status]
              return (
                <Fragment key={entry.id}>
                  <tr
                    className="row-hover cursor-pointer"
                    onClick={() => {
                      onSelect(entry)
                      setExpandedId(isExpanded ? null : entry.id)
                    }}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      borderLeft: isCritical ? '3px solid var(--status-red)' : '3px solid transparent',
                      background: isSelected ? 'rgba(55, 138, 221, 0.06)' : undefined,
                    }}
                  >
                    <td className="pl-3 py-2">
                      <ChevronRight
                        size={14}
                        style={{
                          color: 'var(--text-muted)',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                          transition: 'transform 0.15s ease',
                        }}
                      />
                    </td>
                    <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {entry.agentName}
                    </td>
                    <td
                      className="px-3 py-2.5"
                      style={{
                        color: 'var(--text-primary)',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {entry.failureMode}
                    </td>
                    <td
                      className="px-3 py-2.5"
                      style={{
                        color: 'var(--text-secondary)',
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {entry.effect}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-center">{entry.severity}</td>
                    <td className="px-3 py-2.5 tabular-nums text-center">{entry.occurrence}</td>
                    <td className="px-3 py-2.5 tabular-nums text-center">{entry.detection}</td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-center font-bold"
                      style={{ color: rpnColor(entry.rpn) }}
                    >
                      {entry.rpn}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ background: 'var(--surface)' }}>
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                              Root Cause
                            </p>
                            <p style={{ color: 'var(--text-primary)' }}>{entry.cause}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                              Recommended Action
                            </p>
                            <p style={{ color: 'var(--text-primary)' }}>{entry.recommendedAction}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
