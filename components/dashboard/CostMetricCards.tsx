'use client'

import { TrendingDown, TrendingUp, DollarSign, Activity } from 'lucide-react'
import type { MonthlyCost } from '@/types/telemetry'

interface Props {
  data: MonthlyCost[]
}

export default function CostMetricCards({ data }: Props) {
  const months = [...new Set(data.map(d => d.month))]
  const currentMonth = months[months.length - 1]
  const previousMonth = months.length >= 2 ? months[months.length - 2] : null

  const currentData = data.filter(d => d.month === currentMonth)
  const previousData = previousMonth ? data.filter(d => d.month === previousMonth) : []

  // Total monthly spend
  const totalSpend = currentData.reduce((s, d) => s + d.inferenceCost, 0)
  const prevTotalSpend = previousData.reduce((s, d) => s + d.inferenceCost, 0)
  const spendChange = prevTotalSpend > 0 ? ((totalSpend - prevTotalSpend) / prevTotalSpend) * 100 : 0

  // Cost per run
  const totalRuns = currentData.reduce((s, d) => s + d.runs, 0)
  const costPerRun = totalRuns > 0 ? totalSpend / totalRuns : 0
  const prevTotalRuns = previousData.reduce((s, d) => s + d.runs, 0)
  const prevCostPerRun = prevTotalRuns > 0 ? prevTotalSpend / prevTotalRuns : 0
  const costPerRunChange = prevCostPerRun > 0 ? ((costPerRun - prevCostPerRun) / prevCostPerRun) * 100 : 0

  // Cost per successful task
  const totalSuccess = currentData.reduce((s, d) => s + d.successfulRuns, 0)
  const costPerSuccess = totalSuccess > 0 ? totalSpend / totalSuccess : 0
  const prevTotalSuccess = previousData.reduce((s, d) => s + d.successfulRuns, 0)
  const prevCostPerSuccess = prevTotalSuccess > 0 ? prevTotalSpend / prevTotalSuccess : 0
  const costPerSuccessChange = prevCostPerSuccess > 0
    ? ((costPerSuccess - prevCostPerSuccess) / prevCostPerSuccess) * 100
    : 0

  // Total runs this month
  const runsChange = prevTotalRuns > 0 ? ((totalRuns - prevTotalRuns) / prevTotalRuns) * 100 : 0

  const cards = [
    {
      label: 'Total Monthly Spend',
      value: `$${totalSpend.toFixed(2)}`,
      change: spendChange,
      icon: DollarSign,
      invertColor: true, // negative is good for cost
    },
    {
      label: 'Cost / Run',
      value: `$${costPerRun.toFixed(4)}`,
      change: costPerRunChange,
      icon: Activity,
      invertColor: true,
    },
    {
      label: 'Cost / Successful Task',
      value: `$${costPerSuccess.toFixed(4)}`,
      change: costPerSuccessChange,
      icon: TrendingDown,
      invertColor: true,
    },
    {
      label: 'Total Runs',
      value: totalRuns.toLocaleString(),
      change: runsChange,
      icon: TrendingUp,
      invertColor: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon
        const isPositive = card.invertColor ? card.change < 0 : card.change > 0
        const changeColor = isPositive ? '#1D9E75' : card.change === 0 ? 'var(--vip-muted)' : '#E24B4A'
        const ArrowIcon = card.change < 0 ? TrendingDown : TrendingUp

        return (
          <div key={card.label} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'var(--vip-muted)' }}>
                {card.label}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(55, 138, 221, 0.08)' }}
              >
                <Icon size={16} style={{ color: '#378ADD' }} />
              </div>
            </div>
            <div
              className="text-xl font-bold tabular-nums"
              style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
            >
              {card.value}
            </div>
            {card.change !== 0 && (
              <div className="flex items-center gap-1 mt-1.5">
                <ArrowIcon size={12} style={{ color: changeColor }} />
                <span className="text-xs font-medium" style={{ color: changeColor }}>
                  {Math.abs(card.change).toFixed(1)}% vs prev month
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
