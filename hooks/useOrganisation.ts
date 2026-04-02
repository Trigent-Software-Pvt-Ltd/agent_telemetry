'use client'

import { createContext, useContext } from 'react'
import type { QualityFramework } from '@/types/telemetry'

interface OrganisationContextValue {
  qualityFramework: QualityFramework
  setQualityFramework: (framework: QualityFramework) => void
}

export const OrganisationContext = createContext<OrganisationContextValue>({
  qualityFramework: 'oee',
  setQualityFramework: () => {},
})

export function useOrganisation() {
  const ctx = useContext(OrganisationContext)
  if (!ctx) {
    throw new Error('useOrganisation must be used within an OrganisationProvider')
  }
  return ctx
}
