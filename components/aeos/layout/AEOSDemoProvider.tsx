'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AEOSTenantId, DemoBeat, DemoState } from '@/types/aeos'

interface AEOSDemoContextShape extends DemoState {
  tenantId: AEOSTenantId
  setTenantId: (id: AEOSTenantId) => void
  start: () => void
  pause: () => void
  reset: () => void
  setBeat: (b: DemoBeat) => void
}

const AEOSDemoContext = createContext<AEOSDemoContextShape | null>(null)

export function AEOSDemoProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState<AEOSTenantId>('kengarff_automotive')
  const [beat, setBeat] = useState<DemoBeat>('idle')
  const [isPlaying, setIsPlaying] = useState(false)
  const [startedAt, setStartedAt] = useState<string | null>(null)

  const start = useCallback(() => {
    setIsPlaying(true)
    setBeat('opening')
    setStartedAt(new Date().toISOString())
  }, [])
  const pause = useCallback(() => setIsPlaying(false), [])
  const reset = useCallback(() => {
    setIsPlaying(false)
    setBeat('idle')
    setStartedAt(null)
  }, [])

  return (
    <AEOSDemoContext.Provider
      value={{
        tenantId,
        setTenantId,
        beat,
        isPlaying,
        startedAt,
        scenarioId: 'brake_diagnosis_v1',
        playbackSpeed: 1,
        start,
        pause,
        reset,
        setBeat,
      }}
    >
      {children}
    </AEOSDemoContext.Provider>
  )
}

export function useAEOSDemo() {
  const ctx = useContext(AEOSDemoContext)
  if (!ctx) throw new Error('useAEOSDemo must be used within AEOSDemoProvider')
  return ctx
}
