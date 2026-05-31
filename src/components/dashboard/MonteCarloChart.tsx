"use client"

import React from "react"
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MonteCarloPoint } from "@/services/api"
import { FlaskConical } from "lucide-react"

interface MonteCarloChartProps {
  data: MonteCarloPoint[]
}

const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)

export function MonteCarloChart({ data }: MonteCarloChartProps) {
  return (
    <Card className="w-full fade-in-up">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-purple-400" />
          <CardTitle className="text-sm font-semibold text-slate-300">Monte Carlo Simulation</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Fan projection: Optimistic (+1.5σ) · Base · Pessimistic (−1σ)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCompact} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                }}
                formatter={(val: number) => [formatCompact(val)]}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />

              {/* Fan region */}
              <Area
                type="monotone"
                dataKey="optimistic"
                name="Optimistic"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                fill="url(#fanGrad)"
                fillOpacity={1}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="pessimistic"
                name="Pessimistic"
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                fill="#0f172a"
                fillOpacity={1}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="base"
                name="Base Case"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                dot={false}
                style={{ filter: "drop-shadow(0 0 4px rgba(139,92,246,0.6))" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
