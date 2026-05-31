"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateAssistantResponse } from "@/services/api"
import { resetUserData } from "@/services/storage"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatInterfaceProps {
  userName?: string
  onReset: () => void
}

export function ChatInterface({ userName, onReset }: ChatInterfaceProps) {
  const greeting = userName
    ? `Hi ${userName}! 👋 I'm your personal finance assistant. Ask me about your balances, risk score, goals, or rebalancing strategy.`
    : `Hello! I'm your AI Finance Assistant. Update your balances on the dashboard and ask me anything about your portfolio.`

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: greeting },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    const responseContent = await generateAssistantResponse(userMsg.content, userName)
    
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responseContent,
    }

    setMessages((prev) => [...prev, aiMsg])
    setIsTyping(false)
  }

  const handleReset = () => {
    if (window.confirm("Reset all your data and start over?")) {
      resetUserData()
      onReset()
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-50 w-full sm:w-[350px] md:w-[400px]">
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-semibold">{userName ? `${userName}'s Assistant` : "AI Assistant"}</h2>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          title="Reset & start over"
          className="text-slate-600 hover:text-rose-400 transition-colors p-1 rounded"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
              msg.role === "user"
                ? "bg-emerald-500 text-slate-950 self-end ml-auto rounded-tr-sm"
                : "bg-slate-800 border border-slate-700 self-start mr-auto rounded-tl-sm text-slate-200"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {msg.role === "user" ? (
                <User className="w-3 h-3 opacity-70" />
              ) : (
                <Bot className="w-3 h-3 text-emerald-400" />
              )}
              <span className="text-xs font-medium opacity-70">
                {msg.role === "user" ? "You" : "Assistant"}
              </span>
            </div>
            <p className="leading-relaxed">{msg.content}</p>
          </div>
        ))}
        {isTyping && (
          <div className="bg-slate-800 border border-slate-700 self-start mr-auto rounded-2xl rounded-tl-sm px-4 py-4 w-16">
            <div className="flex space-x-1 items-center justify-center">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950/80 border-t border-slate-800 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your portfolio..."
            className="flex-1 bg-slate-900 border-slate-700 focus-visible:ring-emerald-500 rounded-full px-4"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-transform active:scale-95"
            disabled={!input.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
