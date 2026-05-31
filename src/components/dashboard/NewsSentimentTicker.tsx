"use client"

import React, { useEffect, useState } from "react"
import { NewsItem, fetchNewsFeed } from "@/services/api"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export function NewsSentimentTicker() {
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    fetchNewsFeed().then(setNews)
  }, [])

  if (news.length === 0) return null

  const sentimentIcon = (s: string) => {
    if (s === "bullish") return <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
    if (s === "bearish") return <TrendingDown className="w-3 h-3 text-rose-400 shrink-0" />
    return <Minus className="w-3 h-3 text-slate-400 shrink-0" />
  }

  const sentimentChange = (item: NewsItem) => {
    if (item.sentiment === "bullish") return "text-emerald-400"
    if (item.sentiment === "bearish") return "text-rose-400"
    return "text-slate-400"
  }

  // Duplicate for seamless loop
  const doubled = [...news, ...news]

  return (
    <div className="w-full bg-slate-900/80 border-b border-slate-800 backdrop-blur-md overflow-hidden">
      <div className="flex items-center">
        {/* Static label */}
        <div className="shrink-0 px-3 py-2 bg-emerald-500/10 border-r border-slate-800 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Live</span>
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1">
          <div className="ticker-track flex items-center gap-0 whitespace-nowrap py-2">
            {doubled.map((item, i) => (
              <div
                key={`${item.id}-${i}`}
                className="inline-flex items-center gap-2 px-6 border-r border-slate-800/60"
              >
                {sentimentIcon(item.sentiment)}
                <span className="text-slate-300 text-xs">{item.headline}</span>
                <span className={cn("text-xs font-semibold", sentimentChange(item))}>
                  {item.change}
                </span>
                <span className="text-slate-600 text-xs">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
