'use client'

import { createContext, useContext } from 'react'
import type { LanguageMode } from '@/types/telemetry'

interface LanguageModeContextValue {
  mode: LanguageMode
  setMode: (mode: LanguageMode) => void
}

export const LanguageModeContext = createContext<LanguageModeContextValue>({
  mode: 'operations',
  setMode: () => {},
})

export function useLanguageMode() {
  const ctx = useContext(LanguageModeContext)
  if (!ctx) {
    throw new Error('useLanguageMode must be used within a LanguageModeProvider')
  }
  return ctx
}
