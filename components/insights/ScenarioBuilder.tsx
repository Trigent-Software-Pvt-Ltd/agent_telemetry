'use client'

import { useState, useMemo } from 'react'
import { UserPlus, Users, TrendingUp } from 'lucide-react'
import { PROCESSES, AGENTS, ROI_SNAPSHOTS, ONET_TASKS, getAgentRoi } from '@/lib/mock-data'
import { ScenarioCard } from './ScenarioCard'
import { ScenarioResults } from './ScenarioResults'

/* ── Shared slider component ───────────────────────────────────── */

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  const display = format ? format(value) : String(value)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <span
          className="text-xs font-bold tabular-nums"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono-jb)' }}
        >
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#378ADD] cursor-pointer"
        style={{ height: 6 }}
      />
      <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  )
}

/* ── Select dropdown ───────────────────────────────────────────── */

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm rounded-lg px-3 py-2 cursor-pointer"
        style={{
          border: '1px solid var(--border)',
          background: '#FFFFFF',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-dm)',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/* ── Assumptions block ─────────────────────────────────────────── */

function Assumptions({ items }: { items: string[] }) {
  return (
    <div
      className="rounded-lg px-3 py-2 mt-2"
      style={{ background: 'rgba(186, 117, 23, 0.06)', border: '1px solid rgba(186, 117, 23, 0.2)' }}
    >
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1"
        style={{ color: '#BA7517' }}
      >
        Assumptions
      </div>
      <ul className="text-[11px] list-disc pl-4 flex flex-col gap-0.5" style={{ color: 'var(--text-secondary)' }}>
        {items.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
    </div>
  )
}

/* ── Scenario A: Add an Agent ──────────────────────────────────── */

function ScenarioAddAgent() {
  const [processId, setProcessId] = useState(PROCESSES[0].id)
  const [agentName, setAgentName] = useState('Generic Agent')
  const [tasksCovered, setTasksCovered] = useState(2)
  const [sigmaQuality, setSigmaQuality] = useState(3.5)

  const results = useMemo(() => {
    const process = PROCESSES.find((p) => p.id === processId)!
    const roi = ROI_SNAPSHOTS.find((r) => r.processId === processId)!
    const tasks = ONET_TASKS.filter((t) => t.processId === processId)
    const totalTasks = tasks.length

    // Each task covered adds proportional coverage
    const additionalCoverage = tasksCovered / totalTasks
    const newCoverage = Math.min(1, process.agentCoverage + additionalCoverage)
    const coverageChange = newCoverage - process.agentCoverage

    // ROI projection: proportional to coverage increase, scaled by sigma quality
    const qualityMultiplier = sigmaQuality / 4.0 // 4.0 sigma = baseline
    const additionalGross = roi.grossSavingWeekly * (coverageChange / process.agentCoverage) * qualityMultiplier
    const additionalInference = 12 * tasksCovered // ~$12/wk per task in inference
    const additionalOversight = sigmaQuality < 3.5 ? 45 * tasksCovered : 20 * tasksCovered
    const additionalNet = Math.round(additionalGross - additionalInference - additionalOversight)
    const projectedRoi = roi.netRoiWeekly + additionalNet

    // Oversight impact
    const oversightHoursChange = sigmaQuality >= 4.0 ? -2 : sigmaQuality >= 3.5 ? 0 : 3

    return {
      currentCoverage: Math.round(process.agentCoverage * 100),
      projectedCoverage: Math.round(newCoverage * 100),
      currentRoi: roi.netRoiWeekly,
      projectedRoi,
      oversightHoursChange,
      processName: process.name,
    }
  }, [processId, tasksCovered, sigmaQuality])

  return (
    <ScenarioCard
      title="Add an Agent"
      subtitle="Model the impact of deploying a new agent to a process"
      icon={<UserPlus size={20} />}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Process"
          value={processId}
          onChange={setProcessId}
          options={PROCESSES.map((p) => ({ value: p.id, label: p.name }))}
        />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Agent name
          </span>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="text-sm rounded-lg px-3 py-2"
            style={{
              border: '1px solid var(--border)',
              background: '#FFFFFF',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-dm)',
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Slider
          label="Tasks to cover"
          min={1}
          max={5}
          step={1}
          value={tasksCovered}
          onChange={setTasksCovered}
          format={(v) => `${v} task${v > 1 ? 's' : ''}`}
        />
        <Slider
          label="Estimated sigma quality"
          min={2.0}
          max={5.0}
          step={0.1}
          value={sigmaQuality}
          onChange={setSigmaQuality}
          format={(v) => `${v.toFixed(1)}σ`}
        />
      </div>

      <Assumptions
        items={[
          `Each task adds ~${Math.round(100 / ONET_TASKS.filter((t) => t.processId === processId).length)}% coverage`,
          'Inference cost estimated at $12/week per task covered',
          `Oversight cost scaled by sigma quality (${sigmaQuality >= 4 ? 'low' : sigmaQuality >= 3.5 ? 'moderate' : 'high'} at ${sigmaQuality.toFixed(1)}σ)`,
          'ROI scales linearly with coverage increase',
        ]}
      />

      <ScenarioResults
        ceoReads={`Adding "${agentName}" to ${results.processName} would increase coverage from ${results.currentCoverage}% to ${results.projectedCoverage}% and ROI from $${results.currentRoi.toLocaleString()} to ~$${results.projectedRoi.toLocaleString()}/week`}
        items={[
          {
            label: 'Coverage change',
            value: `${results.currentCoverage}% → ${results.projectedCoverage}%`,
            detail: `+${results.projectedCoverage - results.currentCoverage}pp`,
            positive: true,
          },
          {
            label: 'ROI change',
            value: `$${results.projectedRoi.toLocaleString()}/wk`,
            detail: `${results.projectedRoi >= results.currentRoi ? '+' : ''}$${(results.projectedRoi - results.currentRoi).toLocaleString()}/wk`,
            positive: results.projectedRoi >= results.currentRoi,
          },
          {
            label: 'Oversight impact',
            value: `${results.oversightHoursChange >= 0 ? '+' : ''}${results.oversightHoursChange} hrs/wk`,
            detail: results.oversightHoursChange < 0 ? 'Reduces oversight load' : results.oversightHoursChange === 0 ? 'No change' : 'Additional oversight needed',
            positive: results.oversightHoursChange <= 0,
          },
        ]}
      />
    </ScenarioCard>
  )
}

/* ── Scenario B: Change Headcount ──────────────────────────────── */

function ScenarioChangeHeadcount() {
  const [processId, setProcessId] = useState(PROCESSES[0].id)
  const [headcountChange, setHeadcountChange] = useState(0)

  const results = useMemo(() => {
    const process = PROCESSES.find((p) => p.id === processId)!
    const roi = ROI_SNAPSHOTS.find((r) => r.processId === processId)!
    const currentHeadcount = process.headcount
    const newHeadcount = Math.max(1, currentHeadcount + headcountChange)
    const weeklySalary = process.avgHourlyWage * process.weeklyHours

    const salarySaved = headcountChange < 0
      ? Math.abs(headcountChange) * weeklySalary
      : 0
    const salaryAdded = headcountChange > 0
      ? headcountChange * weeklySalary
      : 0

    // More agents needed if reducing headcount
    const additionalAgentCost = headcountChange < 0
      ? Math.abs(headcountChange) * 210 // $210/wk per headcount replaced
      : 0

    const perPersonRoi = newHeadcount > 0
      ? Math.round(roi.netRoiWeekly / newHeadcount)
      : 0

    // Coverage sustainability: if headcount drops too low, oversight capacity is at risk
    const oversightCapacity = Math.round((newHeadcount / currentHeadcount) * 100)
    const sustainable = oversightCapacity >= 60

    return {
      currentHeadcount,
      newHeadcount,
      salarySaved,
      salaryAdded,
      additionalAgentCost,
      perPersonRoi,
      currentPerPerson: roi.netPerPerson,
      oversightCapacity,
      sustainable,
      processName: process.name,
      weeklySalary,
    }
  }, [processId, headcountChange])

  return (
    <ScenarioCard
      title="Change Headcount"
      subtitle="See how staffing changes affect ROI and oversight capacity"
      icon={<Users size={20} />}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Process"
          value={processId}
          onChange={setProcessId}
          options={PROCESSES.map((p) => ({ value: p.id, label: p.name }))}
        />
        <Slider
          label="Headcount change"
          min={-5}
          max={5}
          step={1}
          value={headcountChange}
          onChange={setHeadcountChange}
          format={(v) => `${v >= 0 ? '+' : ''}${v} people`}
        />
      </div>

      <Assumptions
        items={[
          `Current headcount: ${results.currentHeadcount} at $${results.weeklySalary.toLocaleString()}/wk each`,
          headcountChange < 0
            ? `Removing ${Math.abs(headcountChange)} person(s) saves $${results.salarySaved.toLocaleString()}/wk in salary`
            : headcountChange > 0
            ? `Adding ${headcountChange} person(s) costs $${results.salaryAdded.toLocaleString()}/wk`
            : 'No headcount change',
          'Agent inference cost increases $210/wk per headcount reduced',
          'Oversight capacity is proportional to remaining headcount',
        ]}
      />

      <ScenarioResults
        ceoReads={
          headcountChange < 0
            ? `Reducing headcount by ${Math.abs(headcountChange)} saves $${results.salarySaved.toLocaleString()}/week in salary but requires $${results.additionalAgentCost.toLocaleString()}/week additional agent inference`
            : headcountChange > 0
            ? `Adding ${headcountChange} staff costs $${results.salaryAdded.toLocaleString()}/week but increases oversight capacity to ${results.oversightCapacity}%`
            : `No headcount change. Current per-person ROI is $${results.currentPerPerson}/week`
        }
        items={[
          {
            label: 'Per-person ROI',
            value: `$${results.perPersonRoi}/wk`,
            detail: `Was $${results.currentPerPerson}/wk`,
            positive: results.perPersonRoi >= results.currentPerPerson,
          },
          {
            label: 'Oversight capacity',
            value: `${results.oversightCapacity}%`,
            detail: results.sustainable ? 'Sustainable' : 'At risk',
            positive: results.sustainable,
          },
          {
            label: 'Net salary impact',
            value: headcountChange < 0
              ? `-$${(results.salarySaved - results.additionalAgentCost).toLocaleString()}/wk`
              : headcountChange > 0
              ? `+$${results.salaryAdded.toLocaleString()}/wk`
              : '$0/wk',
            detail: headcountChange < 0 ? 'Net savings after agent costs' : headcountChange > 0 ? 'Additional cost' : 'No change',
            positive: headcountChange <= 0,
          },
        ]}
      />
    </ScenarioCard>
  )
}

/* ── Scenario C: Scale Run Volume ──────────────────────────────── */

function ScenarioScaleVolume() {
  const [agentId, setAgentId] = useState(AGENTS[0].id)
  const [volumeMultiplier, setVolumeMultiplier] = useState(1)

  const results = useMemo(() => {
    const agent = AGENTS.find((a) => a.id === agentId)!
    const roi = getAgentRoi(agentId)
    const currentWeeklyCost = agent.avgCostPerRun * agent.totalRuns * (7 / 30) // scale 30-day to weekly
    const scaledCost = currentWeeklyCost * volumeMultiplier
    const additionalCost = scaledCost - currentWeeklyCost

    // Marginal cost decreases slightly at scale (batch efficiency)
    const marginalCostPerRun = agent.avgCostPerRun * (1 - 0.05 * Math.log2(volumeMultiplier))
    const scaledRuns = Math.round(agent.totalRuns * volumeMultiplier * (7 / 30))

    // Break-even: how many runs before the setup cost is covered
    const netPerRun = (roi?.netRoiWeekly ?? 0) / Math.max(1, agent.totalRuns * (7 / 30))
    const breakEvenRuns = netPerRun > 0 ? Math.round(500 / netPerRun) : Infinity // $500 assumed setup

    return {
      agentName: agent.name,
      currentWeeklyCost: Math.round(currentWeeklyCost * 100) / 100,
      scaledCost: Math.round(scaledCost * 100) / 100,
      additionalCost: Math.round(additionalCost * 100) / 100,
      marginalCostPerRun: Math.round(marginalCostPerRun * 10000) / 10000,
      baseCostPerRun: agent.avgCostPerRun,
      scaledRuns,
      breakEvenRuns: breakEvenRuns === Infinity ? 'N/A' : breakEvenRuns.toLocaleString(),
      weeklyNetRoi: roi?.netRoiWeekly ?? 0,
    }
  }, [agentId, volumeMultiplier])

  return (
    <ScenarioCard
      title="Scale Run Volume"
      subtitle="Project costs and ROI at higher run volumes"
      icon={<TrendingUp size={20} />}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Agent"
          value={agentId}
          onChange={setAgentId}
          options={AGENTS.map((a) => ({ value: a.id, label: a.name }))}
        />
        <Slider
          label="Volume multiplier"
          min={1}
          max={5}
          step={0.5}
          value={volumeMultiplier}
          onChange={setVolumeMultiplier}
          format={(v) => `${v}x`}
        />
      </div>

      <Assumptions
        items={[
          `Current cost: $${results.baseCostPerRun}/run, ${results.scaledRuns} runs/week at ${volumeMultiplier}x`,
          'Marginal cost decreases ~5% per doubling (batch efficiency)',
          'Break-even calculated against $500 setup investment',
          `Current weekly net ROI: $${results.weeklyNetRoi.toLocaleString()}`,
        ]}
      />

      <ScenarioResults
        ceoReads={`Scaling ${results.agentName} to ${volumeMultiplier}x volume adds $${results.additionalCost.toFixed(2)}/week in inference${results.additionalCost < 5 ? ' — negligible' : ''}`}
        items={[
          {
            label: 'Projected weekly cost',
            value: `$${results.scaledCost.toFixed(2)}/wk`,
            detail: `+$${results.additionalCost.toFixed(2)} from current`,
            positive: results.additionalCost < results.weeklyNetRoi,
          },
          {
            label: 'Marginal cost/run',
            value: `$${results.marginalCostPerRun.toFixed(4)}`,
            detail: `Base: $${results.baseCostPerRun}`,
            positive: results.marginalCostPerRun <= results.baseCostPerRun,
          },
          {
            label: 'Break-even',
            value: `${results.breakEvenRuns} runs`,
            detail: 'To recover $500 setup cost',
            positive: true,
          },
        ]}
      />
    </ScenarioCard>
  )
}

/* ── Main ScenarioBuilder ──────────────────────────────────────── */

export function ScenarioBuilder() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
        >
          What-If Scenarios
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Model changes to your AI workforce and see projected impact
        </p>
      </div>

      {/* Scenario cards */}
      <ScenarioAddAgent />
      <ScenarioChangeHeadcount />
      <ScenarioScaleVolume />
    </div>
  )
}
