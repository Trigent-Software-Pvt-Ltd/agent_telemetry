'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AEOSTenantId } from '@/types/aeos'

interface AEOSContextShape {
  tenantId: AEOSTenantId
  setTenantId: (id: AEOSTenantId) => void
}

const AEOSContext = createContext<AEOSContextShape | null>(null)

export function AEOSDemoProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState<AEOSTenantId>('kengarff_automotive')
  return (
    <AEOSContext.Provider value={{ tenantId, setTenantId }}>
      {children}
    </AEOSContext.Provider>
  )
}

export function useAEOSDemo() {
  const ctx = useContext(AEOSContext)
  if (!ctx) throw new Error('useAEOSDemo must be used within AEOSDemoProvider')
  return ctx
}
