'use client'

import { useState } from 'react'
import { Calendar, Clock, Mail, Pause, Play, Trash2, Edit3, Plus } from 'lucide-react'
import { getScheduledReports, PROCESSES } from '@/lib/mock-data'
import type { ScheduledReport } from '@/types/telemetry'

const SECTION_OPTIONS = [
  { id: 'executive-summary', label: 'Executive Summary' },
  { id: 'roi', label: 'ROI Analysis' },
  { id: 'sigma', label: 'Sigma Scores' },
  { id: 'audit', label: 'Audit Trail' },
  { id: 'labor', label: 'Labor Analysis' },
  { id: 'fmea', label: 'FMEA Summary' },
]

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface ScheduledReportsProps {
  onToast: (message: string) => void
}

export function ScheduledReports({ onToast }: ScheduledReportsProps) {
  const [schedules, setSchedules] = useState<ScheduledReport[]>(getScheduledReports())
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [templateName, setTemplateName] = useState('')
  const [sections, setSections] = useState<string[]>(['executive-summary', 'roi'])
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly')
  const [dayOfWeek, setDayOfWeek] = useState('Monday')
  const [time, setTime] = useState('09:00')
  const [recipients, setRecipients] = useState('')
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>(['sports-betting'])

  function toggleSection(id: string) {
    setSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  function toggleProcess(id: string) {
    setSelectedProcesses(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  function handleSave() {
    const newSchedule: ScheduledReport = {
      id: `sched-${String(schedules.length + 1).padStart(3, '0')}`,
      templateName: templateName || 'Untitled Report',
      sections,
      frequency,
      dayOfWeek: frequency !== 'monthly' ? dayOfWeek : undefined,
      time,
      recipients: recipients.split(',').map(r => r.trim()).filter(Boolean),
      processes: selectedProcesses,
      status: 'active',
      nextRun: '2026-04-07T09:00:00Z',
    }
    setSchedules(prev => [...prev, newSchedule])
    setShowForm(false)
    setTemplateName('')
    setRecipients('')
    onToast('Report scheduled successfully')
  }

  function handlePauseResume(id: string) {
    setSchedules(prev => prev.map(s =>
      s.id === id ? { ...s, status: s.status === 'active' ? 'paused' as const : 'active' as const } : s
    ))
    const schedule = schedules.find(s => s.id === id)
    onToast(schedule?.status === 'active' ? 'Schedule paused' : 'Schedule resumed')
  }

  function handleDelete(id: string) {
    setSchedules(prev => prev.filter(s => s.id !== id))
    onToast('Schedule deleted')
  }

  function handleEdit() {
    onToast('Edit mode opened (demo)')
  }

  function formatFrequency(s: ScheduledReport): string {
    if (s.frequency === 'monthly') return `1st of month at ${s.time}`
    return `Every ${s.dayOfWeek ?? ''} at ${s.time}`
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Existing Schedules Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Active Schedules</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all cursor-pointer"
            style={{ background: 'var(--accent-blue)' }}
          >
            <Plus size={14} />
            Create Schedule
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Report</th>
                <th className="text-left py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Frequency</th>
                <th className="text-left py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Recipients</th>
                <th className="text-left py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="text-right py-2 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(schedule => (
                <tr key={schedule.id} className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3 pr-4">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{schedule.templateName}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {schedule.sections.length} sections &middot; {schedule.processes.length} process{schedule.processes.length > 1 ? 'es' : ''}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                      <span className="capitalize">{schedule.frequency}</span>
                    </div>
                    <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={11} />
                      {formatFrequency(schedule)}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <Mail size={13} style={{ color: 'var(--text-muted)' }} />
                      <span>{schedule.recipients.length} recipient{schedule.recipients.length > 1 ? 's' : ''}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: schedule.status === 'active' ? 'var(--status-green-bg)' : 'var(--status-amber-bg)',
                        color: schedule.status === 'active' ? 'var(--status-green)' : 'var(--status-amber)',
                      }}
                    >
                      {schedule.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={handleEdit}
                        className="p-1.5 rounded-md transition-colors cursor-pointer hover:bg-gray-100"
                        title="Edit"
                      >
                        <Edit3 size={14} style={{ color: 'var(--text-muted)' }} />
                      </button>
                      <button
                        onClick={() => handlePauseResume(schedule.id)}
                        className="p-1.5 rounded-md transition-colors cursor-pointer hover:bg-gray-100"
                        title={schedule.status === 'active' ? 'Pause' : 'Resume'}
                      >
                        {schedule.status === 'active'
                          ? <Pause size={14} style={{ color: 'var(--status-amber)' }} />
                          : <Play size={14} style={{ color: 'var(--status-green)' }} />
                        }
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="p-1.5 rounded-md transition-colors cursor-pointer hover:bg-gray-100"
                        title="Delete"
                      >
                        <Trash2 size={14} style={{ color: 'var(--status-red)' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No scheduled reports. Click &quot;Create Schedule&quot; to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Schedule Form */}
      {showForm && (
        <div className="card animate-fade-up">
          <h2 className="text-base font-semibold mb-4">Create Schedule</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Template name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Report Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="e.g. Weekly Executive Summary"
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Sections */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Report Sections
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SECTION_OPTIONS.map(section => (
                  <label key={section.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sections.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className="rounded accent-[var(--accent-blue)]"
                    />
                    <span>{section.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Frequency
              </label>
              <div className="flex flex-col gap-2">
                {(['weekly', 'biweekly', 'monthly'] as const).map(f => (
                  <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      checked={frequency === f}
                      onChange={() => setFrequency(f)}
                      className="accent-[var(--accent-blue)]"
                    />
                    <span className="capitalize">{f}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Day of week + time */}
            <div className="flex flex-col gap-4">
              {frequency !== 'monthly' && (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Day of Week
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={e => setDayOfWeek(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Recipients */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Recipients (comma-separated emails)
              </label>
              <input
                type="text"
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                placeholder="ceo@company.com, coo@company.com"
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Process scope */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Process Scope
              </label>
              <div className="flex flex-col gap-2">
                {PROCESSES.map(proc => (
                  <label key={proc.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProcesses.includes(proc.id)}
                      onChange={() => toggleProcess(proc.id)}
                      className="rounded accent-[var(--accent-blue)]"
                    />
                    <span>{proc.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer"
              style={{ background: 'var(--accent-blue)' }}
            >
              Save Schedule
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
