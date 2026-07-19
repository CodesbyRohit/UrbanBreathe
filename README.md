<div align="center">

# 🌬️ UrbanBreathe

**Smart City Air Quality Decision Intelligence Platform**

[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-000000?style=flat-square&logo=vercel)](https://urban-breathe-nine.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![ET AI Hackathon](https://img.shields.io/badge/ET%20AI%20Hackathon-2.0-8B5CF6?style=flat-square)](https://hackathon.economictimes.com)

**Transform raw air quality data into actionable environmental intelligence — built for Smart City Command Centres, Municipal Corporations, and Pollution Control Boards.**

[🚀 Live Demo](https://urban-breathe-nine.vercel.app) &nbsp;·&nbsp; [📖 Features](#features) &nbsp;·&nbsp; [⚡ Quick Start](#installation) &nbsp;·&nbsp; [🏛️ Architecture](#architecture)

https://github.com/user-attachments/assets/placeholder

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Design System](#design-system)
- [Supported Cities](#supported-cities)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Overview

UrbanBreathe is a government-grade operational platform that enables municipal authorities to **monitor**, **predict**, **simulate**, and **respond** to air pollution across 10 major Indian cities. It combines real-time AQI monitoring with explainable AI for source attribution, 72-hour forecasting, policy intervention simulation, automated executive reporting, and multilingual citizen advisories — all within a premium, command-centre-grade interface.

Built for the **ET AI Hackathon 2.0 — Grand Finale**.

### Key Capabilities

| Capability | Description |
|---|---|
| **Live Monitoring** | Real-time AQI, 6 pollutants, weather conditions, trend charts |
| **AI Source Attribution** | Explainable multi-factor pollution source estimation with confidence scoring |
| **Predictive Intelligence** | 72-hour AQI forecast with diurnal cycle modeling and confidence bands |
| **Policy Simulator** | Test 8 intervention types with real-time impact projections |
| **Executive Briefing** | Auto-generated government-ready situational reports with PDF export |
| **Citizen Advisory** | Multilingual health advisories (EN, HI, BN, TE) with emergency alerts |
| **Comparative Intelligence** | Cross-city AQI ranking and trend comparison |
| **Enforcement Intelligence** | Anomaly detection with drill-down analytics |

---

## Features

### 🎬 InitGate + AI Voice Boot Sequence
On first load, users are greeted with a full-screen **InitGate** that unlocks the experience with a single tap — priming the browser's speech engine via the Web Speech API. The **BootSequence** then plays a JARVIS/FRIDAY-style animated intro with:
- Rotating HUD ring with decorative satellite dots
- Typewriter status lines with dramatic all-caps text
- **AI voice briefing** — calmly narrates each line using browser-native speech synthesis
- Voice mute/unmute toggle (persisted via `sessionStorage`)
- Fallback text-only mode if speech is unavailable or muted
- One-time per session (skippable, dismissable)

### 📊 Live Environmental Monitoring
- Real-time AQI display with color-coded gauge (Good → Severe)
- PM2.5, PM10, NO₂, O₃, SO₂, CO readings with severity indicators
- Weather overlay: temperature, humidity, wind, pressure, visibility
- Timeline chart with Recharts for AQI trend analysis
- Anomaly detection badges with automatic highlighting
- Auto-refresh with loading skeletons and error recovery

### 🔬 AI Source Attribution
- Estimates pollution contributions from 5+ source categories (traffic, industry, biomass burning, dust/construction, others)
- Confidence scoring per source with seasonal adjustment
- Interactive bar + pie chart visualization
- Science-based mitigation recommendations with actionable steps
- Performance metrics (year-over-year comparison)

### 🔮 Predictive Intelligence
- 72-hour AQI forecasting system with:
  - Diurnal cycle modeling & seasonal trend analysis
  - Confidence scoring per forecast window
  - Detailed hourly forecast table
  - Alert badges for predicted "Poor" or worse conditions
  - Visual confidence bands on forecast chart

### 🏛️ Policy Intervention Simulator
Test 8 different policy interventions with real-time impact modeling:

| Intervention | Impact Area |
|---|---|
| 🚧 Construction Ban | PM10 reduction |
| 🏭 Industrial Restrictions | PM2.5, NO₂ reduction |
| 🚛 Heavy Vehicle Diversion | PM, NO₂ reduction |
| 🚌 Public Transit Boost | Multi-pollutant |
| 💧 Dust Suppression | PM10 reduction |
| 🌿 Urban Greening | Long-term reduction |
| 🚗 Odd-Even Scheme | Short-term traffic reduction |
| 🔥 Biomass Burning Ban | Seasonal PM2.5 reduction |

Output metrics: Projected AQI, PM2.5 reduction, hospital admissions averted, population exposure, implementation cost.

### 📝 Executive Decision Brief
- Auto-generates government-ready situational reports with:
  - Executive summary with key metrics
  - Current situation analysis with comparative context
  - Source attribution breakdown
  - Forecast outlook with key alerts
  - Prioritized recommendations (immediate, short-term, long-term)
  - Expected outcomes with/without intervention comparison
  - Public advisory recommendations
- Clean print styling and PDF export (Ctrl+P / window.print)

### 🗣️ Citizen Advisory
- Multilingual support: English, हिन्दी (Hindi), বাংলা (Bengali), తెలుగు (Telugu)
- Category-specific health precautions (Sensitive Groups, General Public)
- AQI category guidance with color-coded recommendations
- Emergency alerts with prominent callouts
- Emergency contact information

### 🗺️ Interactive India Map
- SVG-based India outline with accurate geographic path
- 10 city markers plotted via lat/long coordinate projection
- Color-coded by AQI severity (Good → Severe)
- Click-to-navigate city selection
- Label collision avoidance for closely-located cities

### 🌗 Theme Support
- Dark/Light mode toggle persisted in `sessionStorage`
- Full theme-aware design system with custom CSS variables
- Card-based layouts that adapt gracefully to both themes

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript 5.5, Vite 5 |
| **Styling** | Tailwind CSS 3.4, Custom design tokens |
| **Charts** | Recharts 2.x (line, bar, pie, area, gauge) |
| **Icons** | Lucide React |
| **Animations** | CSS transitions, SVG animations, Web Speech API |
| **AI Voice** | Browser-native SpeechSynthesis (no dependencies) |
| **Backend** | Node.js, Express 5 |
| **Data APIs** | Open-Meteo (free, no API key required) |
| **AI Engine** | Custom explainable models in Node.js |
| **Deployment** | Vercel (frontend + serverless API) |
| **Fonts** | Inter (UI), JetBrains Mono (data) |

---

## Architecture

The application follows a standard client-server architecture with lazy-loaded frontend modules and a modular Express backend.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                          │
│                                                                     │
│  AppShell                                                            │
│    ├── InitGate → BootSequence → CompactLanding → Dashboard          │
│    │                                                                 │
│    ├── Sidebar (navigation) + Header (city selector, theme toggle)   │
│    │                                                                 │
│    ├── LiveMonitoring (AQI gauge, pollutant cards, timeline chart)   │
│    ├── SourceAttribution (bar chart, pie chart, source details)      │
│    ├── PredictiveIntelligence (forecast chart, hourly table)         │
│    ├── PolicySimulator (intervention cards, impact results)          │
│    ├── EnforcementIntelligence (anomaly detection, drill-down)       │
│    ├── ComparativeIntelligence (city ranking, cross-city trends)     │
│    ├── ExecutiveBrief (situational report, print/export)             │
│    └── CitizenAdvisory (multilingual, category guidance, emergency)  │
│                                                                     │
│  Hooks: useCityData, useSources, useForecast, useSimulation,         │
│         useTheme                                                     │
│  Utils: constants (AQI thresholds, colors), formatters               │
│  Types: TypeScript interfaces for all domain entities                │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTP (proxy /api via Vite)
┌──────────────────────────▼──────────────────────────────────────────┐
│                   Backend (Express.js)                              │
│                                                                     │
│  Routes:                                                             │
│    ├── cities       → GET /api/cities, /api/cities/:id              │
│    ├── air-quality  → GET /api/air-quality/:cityId                  │
│    ├── sources      → GET /api/sources/:cityId                      │
│    ├── forecast     → GET /api/forecast/:cityId                     │
│    ├── simulation   → GET interventions, POST run                   │
│    ├── brief        → POST /api/brief/generate                      │
│    ├── advisory     → GET /api/advisory/:cityId                     │
│    └── health       → GET /api/health                               │
│                                                                     │
│  Services:                                                           │
│    ├── openMeteoService    → Fetch + fallback data pipeline          │
│    ├── sourceAttribution   → AI engine (multi-factor correlation)   │
│    ├── forecastService     → Diurnal cycle + seasonal model         │
│    ├── simulationEngine    → Policy intervention impact model       │
│    └── briefGenerator      → Natural language report synthesis      │
│                                                                     │
│  Data: cities.js (10 cities), fallbackData.js (curated AQI)         │
│  Utils: calculations.js (CPCB/EPA AQI formulas)                     │
└─────────────────────────────────────────────────────────────────────┘
```

### User Flow

```
[New User]
    ↓
[InitGate]  ← Tap anywhere → unlocks speech engine
    ↓
[BootSequence]  ← AI voice briefing + HUD animation (~2.7s)
    ↓
[CompactLanding]  ← Hero, stats, India map, impact cards
    ↓  (click "Enter Command Centre")
[Dashboard]
    ├── LiveMonitoring  (real-time AQI + weather)
    ├── SourceAttribution  (AI analysis)
    ├── PredictiveIntelligence  (72h forecast)
    ├── PolicySimulator  (intervention testing)
    ├── EnforcementIntelligence  (anomalies)
    ├── ComparativeIntelligence  (city comparisons)
    ├── ExecutiveBrief  (auto-report)
    └── CitizenAdvisory  (multilingual guidance)

[Returning User (same session)]  → Skips InitGate + BootSequence
                                → Goes directly to CompactLanding
```

---

## Installation

### Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** 9+

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/CodesbyRohit/UrbanBreathe.git
cd UrbanBreathe

# 2. Install all dependencies
npm install

# 3. (Optional) Copy environment file
cp .env.example .env

# 4. Start the frontend development server
npm run dev
# → Frontend available at http://localhost:5173

# 5. In a separate terminal, start the backend API server
npm run server
# → Backend API at http://localhost:3001

# 6. Or start both together
npm start
# → Runs both dev server + backend concurrently
```

### Build for Production

```bash
npm run build
# → Output in ./dist/ (ready for Vercel/deployment)
```

---

## Usage

1. **Open the app** — On first visit, tap the InitGate screen to begin, watch the BootSequence with AI voice narration, then see the landing page.

2. **Select a city** — Choose from 10 major Indian cities via the sidebar dropdown or the interactive India map.

3. **Monitor live conditions** — The Dashboard shows real-time AQI with a color-coded gauge, 6 pollutant readings, weather conditions, and a timeline chart.

4. **Analyze pollution sources** — Visit the Source Attribution module to see AI-estimated contributions from traffic, industry, biomass burning, and more.

5. **View the forecast** — Predictive Intelligence shows a 72-hour projection with confidence bands and an hourly breakdown table.

6. **Test policy interventions** — In the Policy Simulator, select one or more interventions and click "Run Simulation" to see projected impacts.

7. **Generate a brief** — The Executive Brief module auto-creates a government-ready report you can print or export as PDF.

8. **Check advisories** — The Citizen Advisory module provides health guidance in 4 languages.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cities` | List all supported cities |
| `GET` | `/api/cities/:id` | Get city details |
| `GET` | `/api/air-quality/:cityId?lat=&lon=` | Live air quality data |
| `GET` | `/api/sources/:cityId` | AI source attribution analysis |
| `GET` | `/api/forecast/:cityId` | 72-hour AQI forecast |
| `GET` | `/api/simulation/interventions` | Available policy interventions |
| `POST` | `/api/simulation/run` | Run policy simulation with selected interventions |
| `POST` | `/api/brief/generate` | Generate executive decision brief |
| `GET` | `/api/advisory/:cityId` | Citizen health advisory |
| `GET` | `/api/advisory/:cityId` | Multilingual advisory (?lang=hi/bn/te) |
| `GET` | `/api/health` | API health check |

---

## Design System

UrbanBreathe uses a premium government-grade design language optimized for command centre operations:

| Token | Value | Usage |
|---|---|---|
| **Primary** | `#3b91e8` (brand blue) | Actions, links, active states |
| **Teal** | `#14b8a6` | Success indicators, [OK] badges |
| **Base** | `#0f172a` → `#f8fafc` | Light/Dark backgrounds |
| **Font** | Inter, system sans-serif | General UI |
| **Mono** | JetBrains Mono | AQI values, status lines, metrics |
| **Cards** | White/slate-950, rounded-xl | Content containers |
| **Radius** | `xl` (1rem) → `2xl` (1.5rem) | Cards, dialogs |
| **Shadows** | Subtle `shadow-sm` → `shadow-lg` | Elevation hierarchy |

### States & Feedback

- **Loading**: Skeleton shimmer + pulse animation on cards and charts
- **Empty**: Illustrative message with contextual guidance
- **Error**: Clear error message with retry button
- **Success**: Green checkmark or [OK] badge with fade-in

### Responsiveness

- **Desktop** (1280px+): Full sidebar, multi-column layouts, full chart width
- **Tablet** (768px+): Collapsible sidebar overlay, adjusted grid
- **Mobile** (<768px): Bottom navigation drawer, stacked cards, simplified charts

---

## Supported Cities

| City | State | Coordinates | Dominant Pollutant |
|---|---|---|---|
| Delhi | Delhi | 28.61°N, 77.23°E | PM2.5 |
| Mumbai | Maharashtra | 19.08°N, 72.88°E | PM10 |
| Bengaluru | Karnataka | 12.97°N, 77.59°E | PM2.5 |
| Kolkata | West Bengal | 22.57°N, 88.36°E | PM10 |
| Chennai | Tamil Nadu | 13.08°N, 80.27°E | NO₂ |
| Hyderabad | Telangana | 17.39°N, 78.49°E | PM2.5 |
| Pune | Maharashtra | 18.52°N, 73.86°E | PM10 |
| Lucknow | Uttar Pradesh | 26.85°N, 80.95°E | PM2.5 |
| Ahmedabad | Gujarat | 23.02°N, 72.57°E | PM10 |
| Patna | Bihar | 25.59°N, 85.14°E | PM2.5 |

---

## Project Structure

```
urbanbreathe/
│
├── index.html                 # HTML entry point
├── package.json               # Dependencies & scripts
├── vite.config.ts             # Vite bundler config
├── tailwind.config.js         # Tailwind CSS custom theme
├── tsconfig.json              # TypeScript config
├── tsconfig.app.json          # App-specific TS config
├── tsconfig.node.json         # Node-specific TS config
├── postcss.config.js          # PostCSS with Tailwind + autoprefixer
├── vercel.json                # Vercel deployment config
├── .env.example               # Environment variable template
│
├── api/                       # Vercel serverless API entry
│   └── index.js
│
├── public/                    # Static assets
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── llms.txt
│
├── src/                       # Frontend source
│   ├── App.tsx                # Root component with Suspense
│   ├── main.tsx               # React entry point
│   ├── index.css              # Tailwind directives + custom CSS
│   ├── vite-env.d.ts          # Vite type declarations
│   │
│   ├── types/                 # TypeScript interfaces & types
│   │   └── index.ts
│   │
│   ├── utils/                 # Shared utilities
│   │   ├── constants.ts       # AQI thresholds, colors, categories
│   │   └── formatters.ts      # Date, number, string formatters
│   │
│   ├── services/              # API client
│   │   └── api.ts            # Typed fetch wrapper
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useCityData.ts    # City + AQI data fetching
│   │   ├── useSources.ts     # Source attribution data
│   │   ├── useForecast.ts    # Forecast data
│   │   ├── useSimulation.ts  # Policy simulation
│   │   └── useTheme.ts       # Dark/light theme toggle
│   │
│   ├── lib/                   # External integrations
│   │   └── firebase.ts       # Firebase config (optional)
│   │
│   └── components/            # UI components
│       ├── layout/            # Shell, navigation, headers
│       │   ├── AppShell.tsx   # Main app shell with routing
│       │   ├── InitGate.tsx   # Tap-to-initialize speech unlock
│       │   ├── BootSequence.tsx # AI voice boot animation
│       │   ├── Sidebar.tsx    # Navigation sidebar
│       │   └── Header.tsx     # Top bar with city selector
│       │
│       ├── landing/           # Landing page
│       │   ├── CompactLanding.tsx # Hero + stats + CTA
│       │   └── ImpactSection.tsx  # Impact metric cards
│       │
│       ├── common/            # Shared components
│       │   ├── CitySelector.tsx  # City dropdown
│       │   ├── IndiaMap.tsx      # Interactive SVG map
│       │   └── MetricCard.tsx    # Stat display card
│       │
│       ├── dashboard/         # Live monitoring
│       │   ├── LiveMonitoring.tsx
│       │   ├── AQIGauge.tsx
│       │   ├── PollutantCard.tsx
│       │   ├── TimelineChart.tsx
│       │   └── WeatherWidget.tsx
│       │
│       ├── source-attribution/ # AI source analysis
│       │   ├── SourceAttribution.tsx
│       │   ├── SourceChart.tsx
│       │   └── SourceDetail.tsx
│       │
│       ├── forecast/          # Predictive intelligence
│       │   ├── PredictiveIntelligence.tsx
│       │   ├── ForecastChart.tsx
│       │   └── ForecastTable.tsx
│       │
│       ├── simulator/         # Policy simulation
│       │   ├── PolicySimulator.tsx
│       │   ├── InterventionCard.tsx
│       │   └── SimulationResult.tsx
│       │
│       ├── enforcement/       # Enforcement intelligence
│       │   └── EnforcementIntelligence.tsx
│       │
│       ├── comparative/       # Cross-city comparisons
│       │   └── ComparativeIntelligence.tsx
│       │
│       ├── executive-brief/   # Auto-generated reports
│       │   └── ExecutiveBrief.tsx
│       │
│       └── citizen-advisory/  # Multilingual advisories
│           └── CitizenAdvisory.tsx
│
└── server/                    # Backend source
    ├── index.js               # Express server entry
    ├── api/                   # (alternative entry)
    │   └── server.js
    ├── data/                  # Static datasets
    │   ├── cities.js          # City coordinates & metadata
    │   └── fallbackData.js    # Curated AQI fallback data
    ├── routes/                # API route handlers
    │   ├── advisory.js
    │   ├── airQuality.js
    │   ├── brief.js
    │   ├── cities.js
    │   ├── forecast.js
    │   ├── simulation.js
    │   └── sources.js
    ├── services/              # Business logic & AI engines
    │   ├── briefGenerator.js
    │   ├── forecastService.js
    │   ├── openMeteoService.js
    │   ├── simulationEngine.js
    │   └── sourceAttribution.js
    └── utils/
        └── calculations.js    # CPCB/EPA AQI formulas
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Backend server port |
| `VITE_API_BASE_URL` | `http://localhost:3001` | API base URL (dev) |

> **Note**: Open-Meteo APIs used for air quality and weather data are **free and require no API key**. For production deployments, consider integrating with CPCB live feeds for higher accuracy.

---

## Known Limitations

- **Data source**: Uses Open-Meteo as a data proxy. A production deployment would integrate CPCB (Central Pollution Control Board) live feeds directly for higher accuracy and lower latency.

- **City coverage**: Currently supports 10 major Indian cities. Expanding to additional cities requires adding city coordinates and baseline AQI data.

- **Forecast accuracy**: Forecasting uses diurnal cycle modeling with seasonal adjustment. For production use, this should be augmented with ML-based ensemble models trained on historical data.

- **Source attribution**: AI source attribution uses multi-factor pollutant correlation. Real-world deployments would supplement with satellite imagery analysis and local emissions inventories.

- **Mobile optimization**: Desktop-optimized for command centre use. The app is usable on mobile but some data-dense views (forecast table, pollutant grid) are best viewed on larger screens.

- **Offline support**: No offline mode — requires an active internet connection to fetch data from the backend API.

- **Speech synthesis**: Voice briefing uses browser-native SpeechSynthesis. Voice quality varies by browser and OS. Chrome provides the best experience. Safari and Firefox may have fewer voice options.

---

## License

**MIT** — Built for **ET AI Hackathon 2.0 — Grand Finale** by [CodesbyRohit](https://github.com/CodesbyRohit).

*UrbanBreathe — Breathing intelligence into every decision™*

---

<div align="center">
  <sub>Built with ❤️ for cleaner air and smarter cities</sub>
</div>
