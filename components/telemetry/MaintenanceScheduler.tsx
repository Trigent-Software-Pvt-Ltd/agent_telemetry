'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Calendar, Clock, Wrench } from 'lucide-react'

interface MaintenanceWindow {
  day: string
  time: string
  duration: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIMES = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
]
const DURATIONS = ['15 min', '30 min', '1 hr', '2 hr']

export function MaintenanceScheduler({ agentName }: { agentName: string }) {
  const [schedule, setSchedule] = useState<MaintenanceWindow | null>(null)
  const [formDay, setFormDay] = useState('Sunday')
  const [formTime, setFormTime] = useState('02:00')
  const [formDuration, setFormDuration] = useState('1 hr')

  function handleSave() {
    const newSchedule: MaintenanceWindow = {
      day: formDay,
      time: formTime,
      duration: formDuration,
    }
    setSchedule(newSchedule)
    toast.success('Maintenance window saved', {
      description: `${agentName} will be paused every ${formDay} at ${formTime} for ${formDuration}.`,
    })
  }

  function handleRemove() {
    setSchedule(null)
    toast.success('Maintenance window removed', {
      description: `Scheduled maintenance for ${agentName} has been cleared.`,
    })
  }

  return (
    <div className="card animate-fade-up">
      <div className="flex items-center gap-2 mb-6">
        <Wrench size={18} style={{ color: '#D4AF37' }} />
        <h3 className="text-base font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
          Schedule Maintenance
        </h3>
      </div>

      {/* Current schedule display */}
      {schedule && (
        <div
          className="flex items-center justify-between p-4 rounded-lg mb-5"
          style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
        >
          <div className="flex items-center gap-3">
            <Calendar size={16} style={{ color: '#059669' }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: '#059669' }}>
                Next maintenance: {schedule.day} at {schedule.time}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                Duration: {schedule.duration} &middot; Agent paused, tasks routed to human
              </div>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border cursor-pointer transition-colors"
            style={{ borderColor: '#E2E8F0', color: '#DC2626' }}
          >
            Remove
          </button>
        </div>
      )}

      {/* Schedule form */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#64748B' }}>
            Day
          </label>
          <select
            value={formDay}
            onChange={e => setFormDay(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm cursor-pointer"
            style={{ borderColor: '#E2E8F0', color: '#0A1628', background: '#FFFFFF' }}
          >
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#64748B' }}>
            Time
          </label>
          <select
            value={formTime}
            onChange={e => setFormTime(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm cursor-pointer"
            style={{ borderColor: '#E2E8F0', color: '#0A1628', background: '#FFFFFF' }}
          >
            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#64748B' }}>
            Duration
          </label>
          <select
            value={formDuration}
            onChange={e => setFormDuration(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm cursor-pointer"
            style={{ borderColor: '#E2E8F0', color: '#0A1628', background: '#FFFFFF' }}
          >
            {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div
        className="flex items-center gap-2 p-3 rounded-lg mb-5"
        style={{ background: '#F7F9FC', border: '1px solid #E2E8F0' }}
      >
        <Clock size={14} style={{ color: '#64748B' }} />
        <span className="text-xs" style={{ color: '#64748B' }}>
          During maintenance: agent is paused, all tasks are routed to human handling
        </span>
      </div>

      <button
        onClick={handleSave}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
        style={{ background: '#D4AF37' }}
      >
        Save Schedule
      </button>
    </div>
  )
}
