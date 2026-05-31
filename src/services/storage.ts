import { AssetClass } from "./api"

export interface UserBalance {
  id: string
  assetClass: AssetClass
  balance: number
  lastUpdated: string // ISO string
}

export interface UserGoal {
  id: string
  label: string
  targetAmount: number
  deadline: string // ISO date string e.g. "2035-01-01"
  createdAt: string
}

export interface UserProfile {
  name: string
  setupComplete: boolean
  createdAt: string
}

const KEYS = {
  profile: "afa_profile",
  balances: "afa_balances",
  goals: "afa_goals",
}

// ── Profile ──────────────────────────────────────────────────────────────────

export const getProfile = (): UserProfile | null => {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(KEYS.profile)
  return raw ? JSON.parse(raw) : null
}

export const saveProfile = (profile: UserProfile): void => {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile))
}

// ── Balances ─────────────────────────────────────────────────────────────────

const DEFAULT_BALANCES: UserBalance[] = [
  { id: "savings",     assetClass: "Savings",     balance: 0, lastUpdated: new Date().toISOString() },
  { id: "bonds",       assetClass: "Bonds",       balance: 0, lastUpdated: new Date().toISOString() },
  { id: "index-funds", assetClass: "Index Funds", balance: 0, lastUpdated: new Date().toISOString() },
  { id: "crypto",      assetClass: "Crypto",      balance: 0, lastUpdated: new Date().toISOString() },
]

export const getBalances = (): UserBalance[] => {
  if (typeof window === "undefined") return DEFAULT_BALANCES
  const raw = localStorage.getItem(KEYS.balances)
  return raw ? JSON.parse(raw) : DEFAULT_BALANCES
}

export const saveBalances = (balances: UserBalance[]): void => {
  localStorage.setItem(KEYS.balances, JSON.stringify(balances))
}

export const updateBalance = (id: string, amount: number): UserBalance[] => {
  const balances = getBalances()
  const updated = balances.map((b) =>
    b.id === id ? { ...b, balance: amount, lastUpdated: new Date().toISOString() } : b
  )
  saveBalances(updated)
  return updated
}

// ── Goals ────────────────────────────────────────────────────────────────────

export const getGoals = (): UserGoal[] => {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(KEYS.goals)
  return raw ? JSON.parse(raw) : []
}

export const saveGoal = (goal: Omit<UserGoal, "id" | "createdAt">): UserGoal[] => {
  const goals = getGoals()
  const newGoal: UserGoal = {
    ...goal,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  const updated = [...goals, newGoal]
  localStorage.setItem(KEYS.goals, JSON.stringify(updated))
  return updated
}

export const deleteGoal = (id: string): UserGoal[] => {
  const updated = getGoals().filter((g) => g.id !== id)
  localStorage.setItem(KEYS.goals, JSON.stringify(updated))
  return updated
}

// ── Reset (for dev / "start over") ───────────────────────────────────────────

export const resetUserData = (): void => {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}
