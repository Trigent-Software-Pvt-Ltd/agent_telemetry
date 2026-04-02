'use client'

import { useState, useCallback } from 'react'
import { REPORT_HISTORY } from '@/lib/mock-data'
import { ExportConfigForm } from '@/components/export/ExportConfigForm'
import { ReportPreview } from '@/components/export/ReportPreview'
import { ReportHistory } from '@/components/export/ReportHistory'
import { ScheduledReports } from '@/components/export/ScheduledReports'
import type { ReportConfig } from '@/types/telemetry'

type TabId = 'generate' | 'scheduled'

export default function BoardExportPage() {
  const [activeTab, setActiveTab] = useState<TabId>('generate')
  const [reports, setReports] = useState<ReportConfig[]>(REPORT_HISTORY)
  const [toast, setToast] = useState<string | null>(null)

  // Track preview state
  const [previewSections, setPreviewSections] = useState<string[]>([
    'executive-summary', 'roi', 'sigma', 'audit',
  ])
  const [previewProcesses, setPreviewProcesses] = useState<string[]>([
    'sports-betting', 'customer-service',
  ])
  const [previewName, setPreviewName] = useState('Q1 2026 Board Report')

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleGenerate = useCallback((config: {
    name: string
    dateFrom: string
    dateTo: string
    processes: string[]
    sections: string[]
    format: 'pdf' | 'pptx'
  }) => {
    const fromDate = new Date(config.dateFrom)
    const toDate = new Date(config.dateTo)
    const dateRange = `${fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

    const newReport: ReportConfig = {
      id: `rpt-${String(reports.length + 1).padStart(3, '0')}`,
      name: config.name,
      dateRange,
      processes: config.processes,
      sections: config.sections,
      generatedAt: new Date().toISOString(),
      format: config.format,
      status: 'ready',
    }

    setReports(prev => [newReport, ...prev])
    showToast('Report generated successfully')
  }, [reports.length])

  function handleDownload() {
    window.print()
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'generate', label: 'Generate Report' },
    { id: 'scheduled', label: 'Scheduled Reports' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="no-print">
        <h1 className="text-2xl font-bold font-[var(--font-sora)]">Board Report Export</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Generate and download board-ready reports
        </p>
      </div>

      {/* Tab switcher */}
      <div className="no-print">
        <div
          className="inline-flex rounded-lg p-1"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer"
              style={{
                background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'generate' && (
        <>
          {/* Two-column: Config + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 no-print">
              <ExportConfigForm
                onGenerate={(config) => {
                  setPreviewSections(config.sections)
                  setPreviewProcesses(config.processes)
                  setPreviewName(config.name)
                  handleGenerate(config)
                }}
              />
            </div>
            <div className="lg:col-span-3">
              <ReportPreview
                sections={previewSections}
                processes={previewProcesses}
                reportName={previewName}
              />
            </div>
          </div>

          {/* Report History */}
          <div className="no-print">
            <ReportHistory reports={reports} onDownload={handleDownload} />
          </div>
        </>
      )}

      {activeTab === 'scheduled' && (
        <ScheduledReports onToast={showToast} />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-medium text-white shadow-lg animate-fade-up z-50 no-print"
          style={{ background: 'var(--status-green)' }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
