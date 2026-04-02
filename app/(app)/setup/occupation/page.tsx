'use client'

import { useState, useCallback } from 'react'
import { OccupationSearch } from '@/components/setup/OccupationSearch'
import { OccupationPreview } from '@/components/setup/OccupationPreview'
import { SelectedProcesses } from '@/components/setup/SelectedProcesses'
import { ONET_OCCUPATIONS } from '@/lib/mock-data'
import type { OnetOccupation } from '@/types/telemetry'

interface ConfiguredProcess {
  code: string
  title: string
  status: 'active' | 'pending'
  headcount: number
  wage: number
}

const INITIAL_PROCESSES: ConfiguredProcess[] = [
  { code: '13-2099.01', title: 'Sports Betting Analyst', status: 'active', headcount: 12, wage: 42 },
  { code: '43-4051.00', title: 'Customer Service Representatives', status: 'active', headcount: 8, wage: 28 },
]

export default function OccupationSelectorPage() {
  // Pre-select Sports Betting Analyst
  const [selected, setSelected] = useState<OnetOccupation>(
    ONET_OCCUPATIONS.find((o) => o.code === '13-2099.01')!
  )

  const [processes, setProcesses] = useState<ConfiguredProcess[]>(INITIAL_PROCESSES)
  const [toast, setToast] = useState<string | null>(null)

  const handleAdd = useCallback(
    (occupation: OnetOccupation, headcount: number, wage: number) => {
      // Check if already added
      if (processes.some((p) => p.code === occupation.code)) {
        setToast(`${occupation.title} is already configured`)
        setTimeout(() => setToast(null), 3000)
        return
      }

      setProcesses((prev) => [
        ...prev,
        {
          code: occupation.code,
          title: occupation.title,
          status: 'pending',
          headcount,
          wage,
        },
      ])
      setToast(`Process added: ${occupation.title}`)
      setTimeout(() => setToast(null), 3000)
    },
    [processes]
  )

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Add a Process
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Search the O*NET occupation database to find the job roles your agents support
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: '2fr 3fr' }}>
        {/* Left: Search */}
        <OccupationSearch selected={selected} onSelect={setSelected} />

        {/* Right: Preview */}
        <OccupationPreview occupation={selected} onAdd={handleAdd} />
      </div>

      {/* Bottom: Selected processes */}
      <SelectedProcesses processes={processes} />

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 px-4 py-3 rounded-lg text-sm font-medium shadow-lg animate-fade-up"
          style={{
            background: 'var(--text-primary)',
            color: 'var(--content-bg)',
            zIndex: 50,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
