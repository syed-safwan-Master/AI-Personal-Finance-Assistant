"use client"

import React, { useState, useEffect, useCallback } from "react"
import { AssetCard } from "./AssetCard"
import { PortfolioChart } from "./PortfolioChart"
import { RiskScoreMeter } from "./RiskScoreMeter"
import { MonteCarloChart } from "./MonteCarloChart"
import { NewsSentimentTicker } from "./NewsSentimentTicker"
import { GoalTracker } from "./GoalTracker"
import { RebalancePanel } from "./RebalancePanel"
import { Slider } from "@/components/ui/slider"
import {
  ASSET_META,
  AssetData,
  calculateProjectedReturns,
  generateChartData,
  generateMonteCarloData,
  calculatePortfolioRiskScore,
  generateRebalanceSuggestions,
} from "@/services/api"
import { getBalances, updateBalance } from "@/services/storage"
import { Badge } from "@/components/ui/badge"
import { BarChart2, FlaskConical, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "overview" | "monte-carlo" | "insights"

interface FinancialDashboardProps {
  userName?: string
}

export function FinancialDashboard({ userName }: FinancialDashboardProps) {
  const [years, setYears] = useState<number>(10)
  const [assets, setAssets] = useState<AssetData[]>([])
  const [activeTab, setActiveTab] = useState<Tab>("overview")

  // Load user balances from localStorage and merge with static metadata
  const loadAssets = useCallback(() => {
    const storedBalances = getBalances()
    const merged: AssetData[] = ASSET_META.map((meta) => {
      const stored = storedBalances.find((b) => b.id === meta.id)
      return { ...meta, currentBalance: stored?.balance ?? 0 }
    })
    setAssets(merged)
  }, [])

  useEffect(() => {
    loadAssets()
  }, [loadAssets])

  const handleBalanceChange = (id: string, newBalance: number) => {
    updateBalance(id, newBalance)
    loadAssets()
  }

  const projectedAssets = calculateProjectedReturns(assets, years)
  const chartData = generateChartData(assets, years)
  const monteCarloData = generateMonteCarloData(assets, years)
  const riskScore = calculatePortfolioRiskScore(assets)
  const rebalanceSuggestions = generateRebalanceSuggestions(assets)

  const totalBalance = assets.reduce((s, a) => s + a.currentBalance, 0)
  const totalProjected = projectedAssets.reduce((s, a) => s + (a.projectedBalance ?? 0), 0)
  const hasAnyBalance = totalBalance > 0

  const tabs = [
    { id: "overview" as Tab,    label: "Overview",    icon: LayoutDashboard },
    { id: "monte-carlo" as Tab, label: "Scenarios",   icon: FlaskConical },
    { id: "insights" as Tab,    label: "Insights",    icon: BarChart2 },
  ]

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-50 overflow-hidden">
      {/* News Ticker */}
      <NewsSentimentTicker />

      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {userName ? `${userName}'s Portfolio` : "My Portfolio"}
          </h1>
          {hasAnyBalance ? (
            <p className="text-slate-500 text-xs mt-0.5">
              Net worth:{" "}
              <span className="text-emerald-400 font-medium">${totalBalance.toLocaleString()}</span>
              {" "}→{" "}
              <span className="text-emerald-400 font-medium">${Math.round(totalProjected).toLocaleString()}</span>
              {" "}in {years}y
            </p>
          ) : (
            <p className="text-slate-500 text-xs mt-0.5">
              Click <span className="text-slate-300">✏️</span> on any card below to add your balances
            </p>
          )}
        </div>

        {/* Time horizon slider */}
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl backdrop-blur-xl min-w-[240px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">Time Horizon</span>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs px-2 py-0">
              {years} yr{years !== 1 ? "s" : ""}
            </Badge>
          </div>
          <Slider value={[years]} onValueChange={(v) => setYears(v[0])} max={40} min={1} step={1} />
          <div className="flex justify-between text-xs text-slate-700 mt-1">
            <span>1</span><span>40</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-3 border-b border-slate-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors",
              activeTab === id
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {projectedAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onBalanceChange={handleBalanceChange}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                {hasAnyBalance ? (
                  <PortfolioChart data={chartData} />
                ) : (
                  <div className="h-full min-h-[300px] flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-600 text-sm">
                    Add your balances above to see projected growth
                  </div>
                )}
              </div>
              <div>
                <RiskScoreMeter score={riskScore} />
              </div>
            </div>
          </div>
        )}

        {/* SCENARIOS / MONTE CARLO */}
        {activeTab === "monte-carlo" && (
          <div className="space-y-4">
            {hasAnyBalance ? (
              <>
                <MonteCarloChart data={monteCarloData} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["pessimistic", "base", "optimistic"] as const).map((scenario, i) => {
                    const last = monteCarloData[monteCarloData.length - 1]
                    const val = last?.[scenario] ?? 0
                    const colors = ["text-rose-400", "text-purple-400", "text-emerald-400"]
                    const labels = ["Pessimistic", "Base Case", "Optimistic"]
                    return (
                      <div key={scenario} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center fade-in-up">
                        <p className="text-xs text-slate-500 mb-1">{labels[i]}</p>
                        <p className={`text-xl font-bold ${colors[i]}`}>${Math.round(val).toLocaleString()}</p>
                        <p className="text-xs text-slate-600 mt-1">after {years} years</p>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-600 text-sm">
                Add your balances in Overview to run simulations
              </div>
            )}
          </div>
        )}

        {/* INSIGHTS */}
        {activeTab === "insights" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GoalTracker assets={assets} />
            <RebalancePanel suggestions={rebalanceSuggestions} assets={assets} />
          </div>
        )}
      </div>
    </div>
  )
}
