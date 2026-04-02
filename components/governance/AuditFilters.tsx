'use client'

import { Search } from 'lucide-react'

const selectStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 13,
  color: 'var(--text-primary)',
  background: '#fff',
  minWidth: 160,
}

export function AuditFilters() {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Date range */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          defaultValue="2026-03-24"
          style={selectStyle}
          readOnly
        />
        <span style={{ color: 'var(--text-muted)' }}>to</span>
        <input
          type="date"
          defaultValue="2026-03-30"
          style={selectStyle}
          readOnly
        />
      </div>

      {/* Process */}
      <select style={selectStyle} defaultValue="">
        <option value="">All processes</option>
        <option>Sports Betting Analyst</option>
        <option>Customer Service Representative</option>
      </select>

      {/* Decision type */}
      <select style={selectStyle} defaultValue="">
        <option value="">All decisions</option>
        <option>Approved</option>
        <option>Overridden</option>
        <option>Escalated</option>
      </select>

      {/* Search (decorative) */}
      <div
        className="flex items-center gap-2 ml-auto"
        style={{
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px 12px',
          background: '#fff',
        }}
      >
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search audit log..."
          className="text-sm outline-none bg-transparent"
          style={{ width: 160, color: 'var(--text-primary)' }}
          readOnly
        />
      </div>
    </div>
  )
}
