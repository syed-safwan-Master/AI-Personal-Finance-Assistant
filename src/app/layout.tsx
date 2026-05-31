import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'AI Finance Assistant — Portfolio Dashboard',
  description: 'Track and visualize your Savings, Bonds, Index Funds, and Crypto portfolio with AI-powered insights, Monte Carlo simulations, and smart rebalancing suggestions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-slate-950 text-slate-50 overflow-hidden`}>
        {children}
      </body>
    </html>
  )
}
