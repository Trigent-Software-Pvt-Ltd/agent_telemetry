'use client'

import { createContext, useContext } from 'react'

interface WorkflowContextType {
  activeWorkflowId: string
  setActiveWorkflowId: (id: string) => void
}

export const WorkflowContext = createContext<WorkflowContextType>({
  activeWorkflowId: 'odds-analysis-agent',
  setActiveWorkflowId: () => {},
})

export function useWorkflow() {
  return useContext(WorkflowContext)
}
