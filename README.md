# 💰 AI Personal Finance Assistant

A highly polished, dark-mode personal finance tracker built with **Next.js 13**, **Tailwind CSS**, and **Radix UI**. Track your real savings, bonds, index funds, and crypto — with AI-powered insights, Monte Carlo simulations, smart rebalancing suggestions, and persistent personal goals.

---

## ✨ Features

### 🧑‍💼 Personal Dashboard
- **Onboarding flow** — enter your name and actual balances on first visit
- **Editable asset cards** — click the ✏️ icon to update any balance; saves instantly to `localStorage`
- **Real net worth** — your total portfolio value calculated from your own data
- **Returning user memory** — your data persists between browser sessions

### 📊 Four Asset Buckets
| Asset | Risk | Volatility | Base APY |
|---|---|---|---|
| Savings | Low | 0.5% | 4.5% |
| Bonds | Low | 2.1% | 5.2% |
| Index Funds | Moderate | 15.0% | 8.5% |
| Crypto | Extreme | 65.0% | 22.0% |

### 📈 Interactive Dashboard (3 Tabs)

**Overview**
- Asset cards with animated projected balances and growth bars
- Stacked area chart of projected portfolio growth
- Risk Score Gauge — SVG semi-circle meter with animated needle

**Scenarios (Monte Carlo)**
- Fan chart showing Optimistic (+1.5σ), Base, and Pessimistic (−1σ) growth projections
- Three scenario summary cards with projected totals

**Insights**
- **Goal Tracker** — add personal savings goals with deadlines; see on-track / behind status and years to goal
- **Smart Rebalancing Panel** — compare your current vs. optimal allocation with one-click simulation

### 🤖 AI Chat Interface
- Personalized greeting using your name
- Context-aware responses about your specific portfolio
- Answers about risk scores, rebalancing, Monte Carlo, and goals
- LogOut button to reset all data and start fresh

### 📰 Live News Sentiment Ticker
- Auto-scrolling financial news with bullish 📈 / bearish 📉 / neutral indicators
- Color-coded percentage changes per asset class
- Pauses on hover

### ✨ UI / UX
- Per-asset **neon glow** hover effects (blue / purple / emerald / amber)
- Animated number counters with cubic ease-out
- Shimmer gradient on projected values
- Fade-in-up card entrance animations
- CSS keyframe ticker animation

---

## 🛠 Tech Stack

- **Framework**: [Next.js 13](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives (Slider, Slot)
- **Charts**: [Recharts](https://recharts.org/) (AreaChart, ComposedChart)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Persistence**: Browser `localStorage` (no backend required)
- **Language**: TypeScript

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 16.x
- npm ≥ 8.x

### Installation

```bash
# Clone the repo
git clone https://github.com/syed-safwan-Master/AI-Personal-Finance-Assistant.git
cd AI-Personal-Finance-Assistant

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Dark theme, glow animations, ticker keyframes
│   ├── layout.tsx           # Root layout with Inter font & dark mode
│   └── page.tsx             # Onboarding gate + main layout
│
├── components/
│   ├── chat/
│   │   └── ChatInterface.tsx        # AI chat sidebar
│   ├── dashboard/
│   │   ├── AssetCard.tsx            # Editable asset card with glow
│   │   ├── FinancialDashboard.tsx   # Main tabbed dashboard
│   │   ├── GoalTracker.tsx          # Personal goals with localStorage
│   │   ├── MonteCarloChart.tsx      # Fan projection chart
│   │   ├── NewsSentimentTicker.tsx  # Scrolling news ticker
│   │   ├── PortfolioChart.tsx       # Stacked area growth chart
│   │   ├── RebalancePanel.tsx       # Smart rebalancing suggestions
│   │   └── RiskScoreMeter.tsx       # SVG arc gauge
│   ├── onboarding/
│   │   └── OnboardingSetup.tsx      # 2-step first-time setup
│   └── ui/
│       ├── badge.tsx | button.tsx | card.tsx | input.tsx | slider.tsx
│
├── lib/
│   └── utils.ts             # cn() utility for class merging
│
└── services/
    ├── api.ts               # Pure calculations (projections, Monte Carlo, rebalancing)
    └── storage.ts           # localStorage CRUD for profile, balances, and goals
```

---

## 🗺 Roadmap

- [ ] Transaction history log per asset
- [ ] Monthly contribution tracker
- [ ] Export portfolio as PDF
- [ ] Real market data integration (Alpha Vantage / Yahoo Finance)
- [ ] Multi-portfolio support

---

## 📄 License

MIT © [Syed Safwan](https://github.com/syed-safwan-Master)
