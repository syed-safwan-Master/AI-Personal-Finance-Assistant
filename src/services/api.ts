// Pure calculation / metadata layer — no hardcoded balances.
// All user balances come from localStorage via storage.ts.

export type AssetClass = "Savings" | "Bonds" | "Index Funds" | "Crypto"

export interface AssetMeta {
  id: string
  name: AssetClass
  riskLevel: "Low" | "Moderate" | "High" | "Extreme"
  riskScore: number       // 0-100
  volatilityNum: number   // percentage
  volatility: string
  baseReturn: number      // annual %
  color: string
  glowColor: string
  description: string
}

export interface AssetData extends AssetMeta {
  currentBalance: number
  projectedBalance?: number
}

// Static metadata — no balances here
export const ASSET_META: AssetMeta[] = [
  {
    id: "savings",
    name: "Savings",
    riskLevel: "Low",
    riskScore: 8,
    volatilityNum: 0.5,
    volatility: "0.5%",
    baseReturn: 4.5,
    color: "#3b82f6",
    glowColor: "rgba(59,130,246,0.4)",
    description: "High-yield savings accounts & cash equivalents",
  },
  {
    id: "bonds",
    name: "Bonds",
    riskLevel: "Low",
    riskScore: 18,
    volatilityNum: 2.1,
    volatility: "2.1%",
    baseReturn: 5.2,
    color: "#8b5cf6",
    glowColor: "rgba(139,92,246,0.4)",
    description: "Government & corporate bond funds",
  },
  {
    id: "index-funds",
    name: "Index Funds",
    riskLevel: "Moderate",
    riskScore: 45,
    volatilityNum: 15.0,
    volatility: "15.0%",
    baseReturn: 8.5,
    color: "#10b981",
    glowColor: "rgba(16,185,129,0.4)",
    description: "Diversified market index funds (e.g. S&P 500)",
  },
  {
    id: "crypto",
    name: "Crypto",
    riskLevel: "Extreme",
    riskScore: 92,
    volatilityNum: 65.0,
    volatility: "65.0%",
    baseReturn: 22.0,
    color: "#f59e0b",
    glowColor: "rgba(245,158,11,0.4)",
    description: "Bitcoin, Ethereum, and other digital assets",
  },
]

// ── Calculations ──────────────────────────────────────────────────────────────

export const calculateProjectedReturns = (assets: AssetData[], years: number) =>
  assets.map((asset) => ({
    ...asset,
    projectedBalance: asset.currentBalance * Math.pow(1 + asset.baseReturn / 100, years),
  }))

export const generateChartData = (assets: AssetData[], years: number) => {
  const data = []
  for (let y = 0; y <= years; y++) {
    const point: any = { year: `Yr ${y}` }
    assets.forEach((asset) => {
      point[asset.name] = Math.round(
        asset.currentBalance * Math.pow(1 + asset.baseReturn / 100, y)
      )
    })
    data.push(point)
  }
  return data
}

export const calculatePortfolioRiskScore = (assets: AssetData[]): number => {
  const total = assets.reduce((s, a) => s + a.currentBalance, 0)
  if (total === 0) return 0
  return Math.round(
    assets.reduce((sum, a) => sum + a.riskScore * (a.currentBalance / total), 0)
  )
}

// ── Monte Carlo ───────────────────────────────────────────────────────────────

export interface MonteCarloPoint {
  year: string
  optimistic: number
  base: number
  pessimistic: number
}

export const generateMonteCarloData = (
  assets: AssetData[],
  years: number
): MonteCarloPoint[] => {
  const total = assets.reduce((s, a) => s + a.currentBalance, 0)
  if (total === 0) return Array.from({ length: years + 1 }, (_, y) => ({
    year: `Yr ${y}`, optimistic: 0, base: 0, pessimistic: 0,
  }))

  const wReturn = assets.reduce((s, a) => s + a.baseReturn * (a.currentBalance / total), 0) / 100
  const wVol    = assets.reduce((s, a) => s + a.volatilityNum * (a.currentBalance / total), 0) / 100

  return Array.from({ length: years + 1 }, (_, y) => {
    const base   = total * Math.pow(1 + wReturn, y)
    const spread = total * wVol * Math.sqrt(y)
    return {
      year: `Yr ${y}`,
      optimistic:  Math.round(base + spread * 1.5),
      base:        Math.round(base),
      pessimistic: Math.max(0, Math.round(base - spread)),
    }
  })
}

// ── Rebalancing ───────────────────────────────────────────────────────────────

export interface RebalanceSuggestion {
  assetName: AssetClass
  currentAllocation: number
  suggestedAllocation: number
  action: "increase" | "decrease" | "hold"
  reason: string
}

const TARGET: Record<AssetClass, number> = {
  Savings: 0.2,
  Bonds: 0.15,
  "Index Funds": 0.55,
  Crypto: 0.1,
}

const REASONS: Record<AssetClass, string> = {
  Savings: "Keep 20% liquid for emergencies and short-term opportunities.",
  Bonds: "15% in bonds cushions drawdowns and provides steady income.",
  "Index Funds": "Core 55% in index funds captures long-term market growth.",
  Crypto: "Cap crypto at 10% to limit extreme volatility exposure.",
}

export const generateRebalanceSuggestions = (assets: AssetData[]): RebalanceSuggestion[] => {
  const total = assets.reduce((s, a) => s + a.currentBalance, 0)
  return assets.map((asset) => {
    const current = total > 0 ? asset.currentBalance / total : 0
    const target  = TARGET[asset.name]
    const diff    = target - current
    return {
      assetName: asset.name,
      currentAllocation: Math.round(current * 100),
      suggestedAllocation: Math.round(target * 100),
      action: Math.abs(diff) < 0.02 ? "hold" : diff > 0 ? "increase" : "decrease",
      reason: REASONS[asset.name],
    }
  })
}

// ── News Feed ─────────────────────────────────────────────────────────────────

export type Sentiment = "bullish" | "bearish" | "neutral"

export interface NewsItem {
  id: string
  headline: string
  asset: AssetClass | "Market"
  sentiment: Sentiment
  time: string
  change: string
}

const NEWS: NewsItem[] = [
  { id: "1", headline: "S&P 500 hits record high driven by tech rally",         asset: "Index Funds", sentiment: "bullish", time: "2m ago",  change: "+1.4%" },
  { id: "2", headline: "Bitcoin surges past key resistance level at $72K",       asset: "Crypto",      sentiment: "bullish", time: "5m ago",  change: "+6.8%" },
  { id: "3", headline: "Fed signals potential rate cut in Q4, bond yields dip",  asset: "Bonds",       sentiment: "bearish", time: "11m ago", change: "-0.3%" },
  { id: "4", headline: "Treasury yields stabilize as inflation data cools",      asset: "Savings",     sentiment: "bullish", time: "18m ago", change: "+0.1%" },
  { id: "5", headline: "Ethereum faces selling pressure amid regulatory news",   asset: "Crypto",      sentiment: "bearish", time: "22m ago", change: "-4.2%" },
  { id: "6", headline: "Nasdaq composite rebounds after morning selloff",        asset: "Index Funds", sentiment: "neutral", time: "30m ago", change: "+0.6%" },
  { id: "7", headline: "High-yield savings rates remain competitive at 4.5%",   asset: "Savings",     sentiment: "bullish", time: "45m ago", change: "0.0%"  },
  { id: "8", headline: "Corporate bond issuance slows amid credit tightening",  asset: "Bonds",       sentiment: "bearish", time: "1h ago",  change: "-0.8%" },
]

export const fetchNewsFeed = async (): Promise<NewsItem[]> => {
  await new Promise((r) => setTimeout(r, 200))
  return NEWS
}

// ── AI Assistant ──────────────────────────────────────────────────────────────

export const generateAssistantResponse = async (
  message: string,
  userName?: string
): Promise<string> => {
  await new Promise((r) => setTimeout(r, 700))
  const m = message.toLowerCase()
  const greet = userName ? `${userName}, ` : ""

  if (m.includes("crypto"))
    return `${greet}your Crypto allocation carries a risk score of 92/100 and 65% volatility. While the 22% APY potential is exciting, keeping it under 10% of your portfolio protects you from severe drawdowns.`
  if (m.includes("savings") || m.includes("safe") || m.includes("cash"))
    return `${greet}your Savings bucket is the safest allocation (risk score 8/100) at 4.5% APY. Aim to keep 3–6 months of living expenses here before investing more aggressively.`
  if (m.includes("index") || m.includes("etf") || m.includes("s&p"))
    return `${greet}Index Funds are the workhorse of long-term wealth building — 8.5% APY with moderate 15% volatility. They should be your largest allocation (target: 55%).`
  if (m.includes("bond"))
    return `${greet}Bonds add stability to your portfolio (risk 18/100, 5.2% APY). They tend to rise when equities fall, making them a great hedge.`
  if (m.includes("rebalanc"))
    return `Head to the Insights tab to see your Smart Rebalancing suggestions — it compares your current vs. optimal allocation for each bucket.`
  if (m.includes("goal") || m.includes("retire") || m.includes("target"))
    return `Your Goal Tracker (Insights tab) calculates exactly how many years it'll take to hit any savings target based on your current portfolio's weighted return rate.`
  if (m.includes("risk"))
    return `Your portfolio risk score is a weighted average across all four assets. Crypto and Index Funds drive it up — shifting more to Savings or Bonds would lower it.`
  if (m.includes("monte carlo") || m.includes("simulation") || m.includes("scenario"))
    return `The Monte Carlo tab shows three growth scenarios using your portfolio's blended return and volatility. The wider the fan, the more uncertainty in your mix.`
  if (m.includes("net worth") || m.includes("total") || m.includes("portfolio"))
    return `Your total portfolio value is the sum of all four buckets. You can update any balance by clicking the edit icon on an asset card — your data is saved locally.`
  if (m.includes("edit") || m.includes("update") || m.includes("change") || m.includes("balance"))
    return `${greet}click the ✏️ edit icon on any asset card to update your balance. Changes are saved instantly to your browser's local storage.`

  return `Hi${userName ? ` ${userName}` : ""}! I'm your personal finance assistant. You can ask me about any of your four investment buckets, your risk score, rebalancing strategy, or savings goals. Try editing your balances first to personalize your dashboard!`
}
