"use client"

import React, { useState } from "react"
import { ASSET_META } from "@/services/api"
import { saveProfile, saveBalances, UserBalance } from "@/services/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wallet, ChevronRight, Sparkles } from "lucide-react"

interface OnboardingSetupProps {
  onComplete: () => void
}

export function OnboardingSetup({ onComplete }: OnboardingSetupProps) {
  const [step, setStep] = useState<"name" | "balances">("name")
  const [name, setName] = useState("")
  const [balances, setBalances] = useState<Record<string, string>>(
    Object.fromEntries(ASSET_META.map((a) => [a.id, ""]))
  )

  const handleNameNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) setStep("balances")
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    saveProfile({
      name: name.trim(),
      setupComplete: true,
      createdAt: new Date().toISOString(),
    })

    const userBalances: UserBalance[] = ASSET_META.map((a) => ({
      id: a.id,
      assetClass: a.name,
      balance: parseFloat(balances[a.id] || "0") || 0,
      lastUpdated: new Date().toISOString(),
    }))
    saveBalances(userBalances)
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-slate-800 p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 mx-auto mb-3">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white">AI Finance Assistant</h1>
          <p className="text-slate-400 text-sm mt-1">Your personal portfolio, powered by AI</p>
        </div>

        <div className="p-6">
          {step === "name" ? (
            <form onSubmit={handleNameNext} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Welcome! What's your name?</h2>
                <p className="text-slate-400 text-sm mb-4">We'll personalize your dashboard for you.</p>
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  className="bg-slate-800 border-slate-700 text-white text-base"
                />
              </div>
              <Button type="submit" disabled={!name.trim()} className="w-full gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">
                  Enter your current balances, {name.trim()}
                </h2>
                <p className="text-slate-400 text-sm mb-4">
                  Leave blank or enter 0 if you don't have that investment yet.
                </p>
              </div>

              <div className="space-y-3">
                {ASSET_META.map((asset) => (
                  <div key={asset.id} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: asset.color, boxShadow: `0 0 6px ${asset.glowColor}` }}
                    />
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 block mb-1">
                        {asset.name}
                        <span className="ml-2 text-slate-600">{asset.description}</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={balances[asset.id]}
                          onChange={(e) =>
                            setBalances((b) => ({ ...b, [asset.id]: e.target.value }))
                          }
                          placeholder="0"
                          className="pl-7 bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full gap-2 mt-2">
                <Sparkles className="w-4 h-4" />
                Build My Dashboard
              </Button>
              <button
                type="button"
                onClick={() => setStep("name")}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
              >
                ← Back
              </button>
            </form>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pb-4">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${step === "name" ? "bg-emerald-400" : "bg-slate-700"}`} />
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${step === "balances" ? "bg-emerald-400" : "bg-slate-700"}`} />
        </div>
      </div>
    </div>
  )
}
