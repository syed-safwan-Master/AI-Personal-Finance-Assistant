"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RiskScoreMeterProps {
  score: number // 0-100
}

export function RiskScoreMeter({ score }: RiskScoreMeterProps) {
  // Arc drawing: semi-circle from -180° to 0°
  const radius = 70
  const stroke = 10
  const cx = 100
  const cy = 90
  const circumference = Math.PI * radius // semi-circle arc length

  const getColor = (s: number) => {
    if (s < 25) return "#3b82f6"
    if (s < 50) return "#10b981"
    if (s < 75) return "#f59e0b"
    return "#ef4444"
  }

  const getLabel = (s: number) => {
    if (s < 25) return { text: "Conservative", color: "#3b82f6" }
    if (s < 50) return { text: "Balanced", color: "#10b981" }
    if (s < 75) return { text: "Aggressive", color: "#f59e0b" }
    return { text: "High Risk", color: "#ef4444" }
  }

  const color = getColor(score)
  const label = getLabel(score)

  // The filled arc length (score out of 100)
  const filledLength = (score / 100) * circumference
  const emptyLength = circumference - filledLength

  // Needle angle: from -180° (left) to 0° (right), mapping score 0→100
  const needleAngle = -180 + score * 1.8 // degrees
  const needleRad = (needleAngle * Math.PI) / 180
  const needleX = cx + (radius - 10) * Math.cos(needleRad)
  const needleY = cy + (radius - 10) * Math.sin(needleRad)

  return (
    <Card className="fade-in-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-300">Portfolio Risk Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <svg viewBox="0 0 200 110" className="w-full max-w-[220px]">
          {/* Background arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth={stroke}
            strokeLinecap="round"
          />

          {/* Score arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${emptyLength}`}
            style={{
              filter: `drop-shadow(0 0 6px ${color}99)`,
              transition: "stroke-dasharray 0.7s ease, stroke 0.7s ease",
            }}
          />

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transition: "x2 0.7s ease, y2 0.7s ease" }}
          />
          <circle cx={cx} cy={cy} r="5" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />

          {/* Score label */}
          <text x={cx} y={cy - 14} textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">
            {score}
          </text>
          <text x={cx} y={cy - 2} textAnchor="middle" fill="#64748b" fontSize="9">
            / 100
          </text>

          {/* Left / Right labels */}
          <text x={cx - radius + 2} y={cy + 18} fill="#3b82f6" fontSize="8">Low</text>
          <text x={cx + radius - 18} y={cy + 18} fill="#ef4444" fontSize="8">High</text>
        </svg>

        <div
          className="mt-1 text-sm font-semibold tracking-wide"
          style={{ color: label.color }}
        >
          {label.text}
        </div>
        <p className="text-xs text-slate-500 mt-1 text-center">
          Based on current allocation weights
        </p>
      </CardContent>
    </Card>
  )
}
