"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AssetData } from "@/services/api"
import { TrendingUp, Pencil, Check, X } from "lucide-react"

interface AssetCardProps {
  asset: AssetData & { projectedBalance?: number }
  onBalanceChange: (id: string, newBalance: number) => void
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value)

  useEffect(() => {
    const start = displayed
    const end = value
    const steps = 28
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3) // cubic ease-out
      setDisplayed(Math.round(start + (end - start) * eased))
      if (step >= steps) { setDisplayed(end); clearInterval(timer) }
    }, 600 / steps)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <>${Math.round(displayed).toLocaleString()}</>
}

const GLOW_CLASS: Record<string, string> = {
  savings: "glow-blue",
  bonds: "glow-purple",
  "index-funds": "glow-emerald",
  crypto: "glow-amber",
}

const RISK_BADGE: Record<string, string> = {
  Low:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Moderate: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  High:     "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Extreme:  "bg-rose-500/10 text-rose-400 border-rose-500/20",
}

export function AssetCard({ asset, onBalanceChange }: AssetCardProps) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(asset.currentBalance.toString())

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v)

  const handleSave = () => {
    const parsed = parseFloat(inputValue.replace(/,/g, ""))
    if (!isNaN(parsed) && parsed >= 0) {
      onBalanceChange(asset.id, parsed)
    }
    setEditing(false)
  }

  const handleCancel = () => {
    setInputValue(asset.currentBalance.toString())
    setEditing(false)
  }

  const growthPct = asset.projectedBalance && asset.currentBalance > 0
    ? ((asset.projectedBalance - asset.currentBalance) / asset.currentBalance) * 100
    : 0

  return (
    <Card
      className={`fade-in-up relative overflow-hidden ${GLOW_CLASS[asset.id] ?? "glow-emerald"}`}
      style={{ borderColor: `${asset.color}20` }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(to right, ${asset.color}, transparent)` }}
      />

      <CardHeader className="pb-2 pt-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: asset.color, boxShadow: `0 0 8px ${asset.glowColor}` }}
            />
            <CardTitle className="text-base font-bold">{asset.name}</CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className={RISK_BADGE[asset.riskLevel]} variant="outline">
              {asset.riskLevel}
            </Badge>
            {!editing && (
              <button
                onClick={() => { setInputValue(asset.currentBalance.toString()); setEditing(true) }}
                className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded"
                title="Edit balance"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <CardDescription className="text-xs mt-1">
          Vol: {asset.volatility}&nbsp;·&nbsp;APY:{" "}
          <span style={{ color: asset.color }}>{asset.baseReturn}%</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Balance row — editable */}
        {editing ? (
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Your balance</label>
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <Input
                  autoFocus
                  type="number"
                  min="0"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel() }}
                  className="pl-7 bg-slate-900 border-slate-700 h-8 text-sm"
                />
              </div>
              <Button size="icon" className="h-8 w-8 bg-emerald-500 hover:bg-emerald-400 text-slate-950" onClick={handleSave}>
                <Check className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 border-slate-700" onClick={handleCancel}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Your Balance</span>
            <span className="font-semibold text-slate-200 text-sm">{fmt(asset.currentBalance)}</span>
          </div>
        )}

        {/* Projected */}
        {!editing && asset.projectedBalance !== undefined && asset.currentBalance > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs flex items-center gap-1" style={{ color: asset.color }}>
                <TrendingUp className="w-3 h-3" /> Projected
              </span>
              <span className="font-bold text-base shimmer-text">
                <AnimatedNumber value={asset.projectedBalance} />
              </span>
            </div>

            <div>
              <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(growthPct, 100)}%`,
                    background: `linear-gradient(to right, ${asset.color}80, ${asset.color})`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">+{growthPct.toFixed(0)}% projected growth</p>
            </div>
          </>
        )}

        {!editing && asset.currentBalance === 0 && (
          <button
            onClick={() => setEditing(true)}
            className="w-full text-xs text-slate-500 hover:text-slate-300 border border-dashed border-slate-700 hover:border-slate-600 rounded-lg py-2 transition-colors"
          >
            + Add your {asset.name} balance
          </button>
        )}
      </CardContent>
    </Card>
  )
}
