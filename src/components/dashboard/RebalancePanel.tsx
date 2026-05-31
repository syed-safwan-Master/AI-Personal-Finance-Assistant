"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RebalanceSuggestion, AssetData } from "@/services/api"
import { ArrowUp, ArrowDown, Minus, Zap, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface RebalancePanelProps {
  suggestions: RebalanceSuggestion[]
  assets: AssetData[]
}

export function RebalancePanel({ suggestions, assets }: RebalancePanelProps) {
  const [applied, setApplied] = useState(false)

  const getAssetColor = (name: string) => {
    const asset = assets.find((a) => a.name === name)
    return asset?.color ?? "#64748b"
  }

  const actionIcon = (action: string) => {
    if (action === "increase") return <ArrowUp className="w-3 h-3 text-emerald-400" />
    if (action === "decrease") return <ArrowDown className="w-3 h-3 text-rose-400" />
    return <Minus className="w-3 h-3 text-slate-400" />
  }

  const actionColor = (action: string) => {
    if (action === "increase") return "text-emerald-400"
    if (action === "decrease") return "text-rose-400"
    return "text-slate-400"
  }

  return (
    <Card className="fade-in-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <CardTitle className="text-sm font-semibold text-slate-300">Smart Rebalancing</CardTitle>
          </div>
          <span className="text-xs text-slate-500">Target: Balanced Growth</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((s) => {
          const diff = s.suggestedAllocation - s.currentAllocation
          const color = getAssetColor(s.assetName)
          return (
            <div
              key={s.assetName}
              className="rounded-lg bg-slate-900/70 border border-slate-800 p-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium text-slate-200">{s.assetName}</span>
                </div>
                <div className={cn("flex items-center gap-1 text-xs font-semibold", actionColor(s.action))}>
                  {actionIcon(s.action)}
                  {s.action === "hold" ? "Hold" : `${Math.abs(diff)}%`}
                </div>
              </div>

              {/* Allocation bars */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-14">Current</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${s.currentAllocation}%`, backgroundColor: color, opacity: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right">{s.currentAllocation}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-14">Target</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${s.suggestedAllocation}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 6px ${color}80`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right" style={{ color }}>
                    {s.suggestedAllocation}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-1.5">{s.reason}</p>
            </div>
          )
        })}

        <Button
          className={cn(
            "w-full mt-2 transition-all",
            applied
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
              : "bg-amber-500 hover:bg-amber-400 text-slate-950"
          )}
          onClick={() => setApplied(true)}
        >
          {applied ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Rebalancing Applied (Simulated)
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> Apply Rebalance (Simulate)
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
