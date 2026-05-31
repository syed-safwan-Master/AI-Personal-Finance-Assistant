"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AssetData } from "@/services/api"
import { getGoals, saveGoal, deleteGoal, UserGoal } from "@/services/storage"
import { Target, Trophy, Plus, Trash2, CalendarDays } from "lucide-react"

interface GoalTrackerProps {
  assets: AssetData[]
}

export function GoalTracker({ assets }: GoalTrackerProps) {
  const [goals, setGoals] = useState<UserGoal[]>([])
  const [label, setLabel] = useState("")
  const [targetInput, setTargetInput] = useState("")
  const [deadline, setDeadline] = useState("")
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    setGoals(getGoals())
  }, [])

  const totalBalance = assets.reduce((s, a) => s + a.currentBalance, 0)
  const weightedReturn =
    totalBalance > 0
      ? assets.reduce((s, a) => s + (a.baseReturn * a.currentBalance) / totalBalance, 0) / 100
      : 0.085

  const yearsToGoal = (targetAmount: number) => {
    if (totalBalance <= 0) return null
    if (targetAmount <= totalBalance) return 0
    return Math.ceil(
      Math.log(targetAmount / totalBalance) / Math.log(1 + weightedReturn)
    )
  }

  const projectedDateForYears = (years: number) => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + years)
    return d.getFullYear()
  }

  const deadlineYearsLeft = (deadline: string) => {
    if (!deadline) return null
    const years = Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)
    )
    return years
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(targetInput.replace(/,/g, ""))
    if (isNaN(amount) || amount <= 0 || !label.trim()) return
    const updated = saveGoal({
      label: label.trim(),
      targetAmount: amount,
      deadline: deadline || "",
    })
    setGoals(updated)
    setLabel("")
    setTargetInput("")
    setDeadline("")
    setAdding(false)
  }

  const handleDelete = (id: string) => {
    setGoals(deleteGoal(id))
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v)

  return (
    <Card className="fade-in-up glow-emerald">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <CardTitle className="text-sm font-semibold text-slate-300">My Goals</CardTitle>
          </div>
          {!adding && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-slate-700 hover:border-emerald-500/50 gap-1"
              onClick={() => setAdding(true)}
            >
              <Plus className="w-3 h-3" /> Add Goal
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Add goal form */}
        {adding && (
          <form onSubmit={handleAdd} className="space-y-2 bg-slate-900/70 border border-slate-800 rounded-lg p-3">
            <Input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Goal name (e.g. House down payment)"
              className="bg-slate-800 border-slate-700 text-sm h-8"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <Input
                type="number"
                min="0"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="Target amount"
                className="pl-7 bg-slate-800 border-slate-700 text-sm h-8"
              />
            </div>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-slate-800 border-slate-700 text-sm h-8 text-slate-300"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1 h-7 text-xs">Save Goal</Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs border-slate-700"
                onClick={() => setAdding(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Goal list */}
        {goals.length === 0 && !adding ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            <Target className="w-6 h-6 mx-auto mb-2 opacity-30" />
            No goals yet. Add one to track your progress!
          </div>
        ) : (
          goals.map((goal) => {
            const years = yearsToGoal(goal.targetAmount)
            const progress = Math.min(100, totalBalance > 0 ? (totalBalance / goal.targetAmount) * 100 : 0)
            const achieved = totalBalance >= goal.targetAmount
            const dlYears = goal.deadline ? deadlineYearsLeft(goal.deadline) : null
            const onTrack = dlYears !== null && years !== null && years <= dlYears

            return (
              <div
                key={goal.id}
                className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{goal.label}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-500">
                        {fmt(totalBalance)} / <span className="text-emerald-400">{fmt(goal.targetAmount)}</span>
                      </span>
                      {goal.deadline && (
                        <span className="text-xs text-slate-600 flex items-center gap-1">
                          <CalendarDays className="w-2.5 h-2.5" />
                          {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-slate-600 hover:text-rose-400 transition-colors ml-2 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                      background: achieved
                        ? "linear-gradient(to right, #10b981, #6ee7b7)"
                        : "linear-gradient(to right, #3b82f6, #10b981)",
                      boxShadow: "0 0 6px rgba(16,185,129,0.35)",
                    }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{progress.toFixed(1)}% there</span>
                  {achieved ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Achieved!
                    </span>
                  ) : years !== null ? (
                    <span className={`text-xs flex items-center gap-1 ${onTrack ? "text-emerald-400" : "text-amber-400"}`}>
                      {onTrack ? "✓ On track" : "⚠ Behind"} · {years}y needed
                      {years > 0 && <span className="text-slate-600">(~{projectedDateForYears(years)})</span>}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600">Enter balances to project</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
