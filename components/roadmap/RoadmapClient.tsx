'use client'

import { useState } from 'react'
import type { TransformationStage, Agent } from '@/types/telemetry'
import { StageTimeline } from './StageTimeline'
import { StageDetail } from './StageDetail'
import { RoiProjectionChart } from './RoiProjectionChart'
import { SigmaGapAnalysis } from './SigmaGapAnalysis'

interface RoadmapClientProps {
  stages: TransformationStage[]
  agents: Agent[]
  processName: string
  sigmaTarget: number
}

export function RoadmapClient({ stages, agents, processName, sigmaTarget }: RoadmapClientProps) {
  const [selectedStageId, setSelectedStageId] = useState(stages[0]?.id ?? '')

  const selectedIndex = stages.findIndex((s) => s.id === selectedStageId)
  const selectedStage = stages[selectedIndex] ?? stages[0]
  const previousStage = selectedIndex > 0 ? stages[selectedIndex - 1] : null

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>
          Transformation Roadmap &mdash; {processName}
        </h1>
        <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
          What happens as agent quality improves &mdash; task migration, ROI growth, and sigma requirements
        </p>
      </div>

      {/* Stage Timeline (full width) */}
      <StageTimeline
        stages={stages}
        selectedId={selectedStageId}
        onSelect={setSelectedStageId}
      />

      {/* Two-column: StageDetail 60% | SigmaGapAnalysis 40% */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <StageDetail stage={selectedStage} previousStage={previousStage} />
        </div>
        <div className="lg:col-span-2">
          <SigmaGapAnalysis agents={agents} targetSigma={sigmaTarget} />
        </div>
      </div>

      {/* ROI Projection Chart (full width) */}
      <RoiProjectionChart stages={stages} />
    </div>
  )
}
