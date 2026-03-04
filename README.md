# CreatorCash – Monetization Dashboard

A real-time creator monetization dashboard built with React, TypeScript, and Vite. Simulates a TikTok-style earnings platform with live WebSocket data, inline ad injection, a sponsored brand marketplace, and A/B testing analytics.

---

## Features

- **Live Earnings Feed** — Simulated WebSocket streams RPM, CPM, view counts, and ad impressions every 1.5 s (throttled to 4 s when tab is hidden)
- **Payout Projections** — Daily / weekly / monthly / yearly estimates with a confidence bar derived from engagement rate
- **30-Day Performance Graph** — Interactive area chart with toggleable metrics (Earnings, RPM, CPM, Views)
- **Hourly Breakdown Table** — 120-row sortable/filterable earnings table with trend indicators
- **Sponsored Marketplace** — Swipeable brand deal carousel with accept/reject gestures, category filters, and audience-match scoring
- **Inline Ad Engine** — Deterministic ad injection into the video feed every 3 posts, with impression logging and revenue projection
- **A/B Testing Panel** — Live two-proportion z-test confidence calculations, pause/resume controls, and uplift tracking
- **Dark / Light Mode** — CSS custom properties theme switching via `data-theme` attribute

---

## Tech Stack

| Layer | Library |
|---|---|
| UI | React 18.3 + TypeScript 5.5 (strict) |
| Build | Vite 5.4 (code-split: react / charts / motion / lucide) |
| Charts | Recharts 2.12 |
| Animation | Framer Motion 11.3 |
| Icons | Lucide React 0.447 |
| Styling | Plain CSS with CSS custom properties |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Production build → dist/
npm run build

# Preview the production build locally
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── ABTesting/        # ABTestPanel, TestVariantCard
│   ├── Dashboard/        # EarningsDashboard, MetricsCard, MetricsTable,
│   │                     #   PayoutProjection, PerformanceGraph
│   ├── Marketplace/      # SponsoredMarketplace, DealCarousel, DealCard
│   ├── VideoFeed/        # VideoFeed, VideoCard, InlineAdCard
│   └── common/           # Header, NavTabs
├── hooks/
│   ├── useWebSocket.ts   # Simulated WS with visibility-based throttling
│   └── useEarnings.ts    # Projection + metrics derived from live snapshot
├── services/
│   ├── mockData.ts       # Data generators (history, deals, videos, A/B tests)
│   ├── adEngine.ts       # InlineAdEngine class — ad selection & injection
│   └── abTesting.ts      # ABTestingFramework — z-test stats, variant assignment
├── types/
│   └── index.ts          # All shared TypeScript interfaces and types
├── App.tsx
├── main.tsx
└── index.css             # All styles — CSS custom properties, dark/light themes
```

---

## Deployment

The production build outputs a fully static site to `dist/`. Deploy to any static host:

**Netlify / Vercel / GitHub Pages**
```bash
npm run build
# deploy the dist/ folder
```

No server-side rendering or API routes — all data is generated client-side.

---

## Creator Profile

Default profile: **Jems Dorviene** (`@jemsDorviene`) · Pro tier · 284.7K followers
