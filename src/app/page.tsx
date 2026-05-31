"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { FinancialDashboard } from "@/components/dashboard/FinancialDashboard"
import { OnboardingSetup } from "@/components/onboarding/OnboardingSetup"
import { getProfile } from "@/services/storage"

export default function Home() {
  const [ready, setReady] = useState(false)         // waiting for localStorage read
  const [setupDone, setSetupDone] = useState(false)
  const [userName, setUserName] = useState<string | undefined>()

  useEffect(() => {
    const profile = getProfile()
    if (profile?.setupComplete) {
      setUserName(profile.name)
      setSetupDone(true)
    }
    setReady(true)
  }, [])

  const handleSetupComplete = () => {
    const profile = getProfile()
    setUserName(profile?.name)
    setSetupDone(true)
  }

  const handleReset = () => {
    setUserName(undefined)
    setSetupDone(false)
  }

  if (!ready) {
    // Prevent flash of onboarding for returning users
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <main className="flex h-screen w-full flex-col sm:flex-row overflow-hidden bg-slate-950 text-slate-50 selection:bg-emerald-500/30">
      {!setupDone && <OnboardingSetup onComplete={handleSetupComplete} />}
      <ChatInterface userName={userName} onReset={handleReset} />
      <FinancialDashboard userName={userName} />
    </main>
  )
}
