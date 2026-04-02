'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'

interface ExportConfigFormProps {
  onGenerate: (config: {
    name: string
    dateFrom: string
    dateTo: string
    processes: string[]
    sections: string[]
    format: 'pdf' | 'pptx'
  }) => void
}

const PROCESS_OPTIONS = [
  { id: 'sports-betting', label: 'Sports Betting Analyst' },
  { id: 'customer-service', label: 'Customer Service Rep' },
]

const SECTION_OPTIONS = [
  { id: 'executive-summary', label: 'Executive Summary', defaultChecked: true },
  { id: 'roi', label: 'ROI Analysis', defaultChecked: true },
  { id: 'sigma', label: 'Sigma Scores', defaultChecked: true },
  { id: 'audit', label: 'Audit Trail', defaultChecked: true },
  { id: 'labor', label: 'Labor Analysis', defaultChecked: false },
  { id: 'fmea', label: 'FMEA Summary', defaultChecked: false },
]

export function ExportConfigForm({ onGenerate }: ExportConfigFormProps) {
  const [name, setName] = useState('Q1 2026 Board Report')
  const [dateFrom, setDateFrom] = useState('2026-01-01')
  const [dateTo, setDateTo] = useState('2026-03-31')
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([
    'sports-betting',
    'customer-service',
  ])
  const [selectedSections, setSelectedSections] = useState<string[]>(
    SECTION_OPTIONS.filter(s => s.defaultChecked).map(s => s.id)
  )
  const [format, setFormat] = useState<'pdf' | 'pptx'>('pdf')

  function toggleProcess(id: string) {
    setSelectedProcesses(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  function toggleSection(id: string) {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  function handleGenerate() {
    onGenerate({
      name,
      dateFrom,
      dateTo,
      processes: selectedProcesses,
      sections: selectedSections,
      format,
    })
  }

  return (
    <div className="card flex flex-col gap-5">
      <div className="flex items-center gap-2 mb-1">
        <FileText size={18} style={{ color: 'var(--accent-blue)' }} />
        <h2 className="text-base font-semibold">Report Configuration</h2>
      </div>

      {/* Report name */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Report Name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Date range */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Date Range
        </label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
            }}
          />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Processes */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Processes
        </label>
        <div className="flex flex-col gap-2">
          {PROCESS_OPTIONS.map(proc => (
            <label key={proc.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProcesses.includes(proc.id)}
                onChange={() => toggleProcess(proc.id)}
                className="rounded accent-[var(--accent-blue)]"
              />
              <span>{proc.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Sections
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SECTION_OPTIONS.map(section => (
            <label key={section.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSections.includes(section.id)}
                onChange={() => toggleSection(section.id)}
                className="rounded accent-[var(--accent-blue)]"
              />
              <span>{section.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Format toggle */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Format
        </label>
        <div
          className="inline-flex rounded-lg p-1"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {(['pdf', 'pptx'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className="px-5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer uppercase"
              style={{
                background: format === f ? '#FFFFFF' : 'transparent',
                color: format === f ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: format === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer"
        style={{ background: 'var(--accent-blue)' }}
      >
        Generate Report
      </button>
    </div>
  )
}
