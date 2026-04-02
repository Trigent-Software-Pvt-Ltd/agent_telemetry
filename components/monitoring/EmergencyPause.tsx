'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { OctagonX, Play, AlertTriangle, X } from 'lucide-react'
import { AGENTS, PROCESSES } from '@/lib/mock-data'

export function EmergencyPause({
  onPauseChange,
}: {
  onPauseChange?: (paused: boolean) => void
}) {
  const [paused, setPaused] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const agentCount = AGENTS.length
  const processCount = PROCESSES.length
  const taskCount = AGENTS.reduce((s, a) => s + a.tasks.length, 0)
  const manualHoursIncrease = 17

  function handleConfirmPause() {
    setPaused(true)
    setShowConfirm(false)
    onPauseChange?.(true)
    toast.success('All agents paused', {
      description: 'All AI agents have been paused. Tasks are now in manual mode.',
    })
  }

  function handleResume() {
    setPaused(false)
    onPauseChange?.(false)
    toast.success('All agents resumed', {
      description: 'All AI agents are back online and processing tasks.',
    })
  }

  return (
    <>
      {/* Main button */}
      <div className="flex items-center gap-3">
        {paused ? (
          <button
            onClick={handleResume}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all"
            style={{ background: '#059669' }}
          >
            <Play size={16} />
            Resume All Agents
          </button>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all"
            style={{ background: '#DC2626' }}
          >
            <OctagonX size={16} />
            Emergency Pause All Agents
          </button>
        )}
      </div>

      {/* Confirmation dialog overlay */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(10,22,40,0.6)' }}>
          <div
            className="relative w-full max-w-md rounded-2xl p-6 animate-fade-up"
            style={{ background: '#FFFFFF', boxShadow: '0 20px 60px rgba(10,22,40,0.25)' }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 p-1 rounded-lg cursor-pointer transition-colors"
              style={{ color: '#94A3B8' }}
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(220,38,38,0.1)' }}
            >
              <AlertTriangle size={24} style={{ color: '#DC2626' }} />
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold font-[var(--font-sora)] mb-4" style={{ color: '#0A1628' }}>
              Pause All AI Agents?
            </h2>

            {/* Impact preview */}
            <div
              className="rounded-lg p-4 mb-5 space-y-3"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#DC2626' }} />
                <p className="text-sm" style={{ color: '#991B1B' }}>
                  This will pause <strong>{agentCount} agents</strong> across <strong>{processCount} processes</strong>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#DC2626' }} />
                <p className="text-sm" style={{ color: '#991B1B' }}>
                  Affected tasks: <strong>{taskCount} agent-owned tasks</strong> will revert to manual handling
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#DC2626' }} />
                <p className="text-sm" style={{ color: '#991B1B' }}>
                  Estimated manual workload increase: <strong>+{manualHoursIncrease} hrs/week</strong>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border cursor-pointer transition-colors"
                style={{ borderColor: '#E2E8F0', color: '#64748B' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPause}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all"
                style={{ background: '#DC2626' }}
              >
                Confirm Pause
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
