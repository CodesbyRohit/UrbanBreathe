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

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Design System](#design-system)
- [Supported Cities](#supported-cities)
- [Project Structure](#project-structure)
- [Technical Approach & Roadmap](#technical-approach--roadmap)
- [Performance & Quality Metrics](#performance--quality-metrics)
- [Browser Compatibility](#browser-compatibility)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Overview

UrbanBreathe transforms live air-quality data into operational decisions for Smart City Command Centres. It combines real-time monitoring, transparent source attribution, forecast projection, policy simulation, executive reporting, and multilingual public advisories into a single decision-support dashboard.

**Who it's for:** Smart City Command Centre operators, Municipal Corporation environmental cells, and State Pollution Control Board analysts.

**Why it matters:** 900+ monitoring stations exist across India. Almost none translate to actionable decisions. UrbanBreathe closes that gap by consolidating scattered data into a unified operational picture.

**What's different:** Every module is transparent and auditable — heuristic engines replace opaque ML black boxes, making every score, forecast, and recommendation verifiable by analysts without data science expertise.

Built for the **ET AI Hackathon 2.0 — Grand Finale**.

### Key Capabilities

| Capability | Description |
|---|---|
| **Live Monitoring** | Real-time AQI, 6 pollutants, weather conditions, trend charts |
| **Source Attribution** | Heuristic multi-factor pollution source correlation with confidence scoring |
| **72-Hour AQI Forecast** | Diurnal cycle projection with seasonal adjustment and confidence bands |
| **Policy Simulator** | Test 8 intervention types with projected impact on AQI, health, and cost |
| **Executive Briefing** | Auto-generated government-ready situational reports |
| **Citizen Advisory** | Multilingual health advisories (EN, HI, BN, TE) with emergency alerts |
| **Comparative Intelligence** | Cross-city AQI ranking and trend comparison |
| **Enforcement Intelligence** | Deterministic anomaly detection with drill-down analytics |

## Features

### 🎬 InitGate + Voice Boot Sequence

On every page load, users are greeted with a full-screen command centre interface featuring:
- **Ambient background** — animated digital Earth glow, floating particles, grid overlay, city network connection lines (all CSS/SVG — no canvas, GPU-friendly)
- **Holographic activation ring** — conic-gradient rotating border with hover glow and press animation
- Tap anywhere to initialize the speech engine and begin the cinematic boot sequence

The **BootSequence** then plays a premium terminal-style animation with:
- 8 system modules appearing sequentially: Satellite Network, AQI Sensors, Weather Models, Forecast Engine, Decision Intelligence, Emergency Network, Smart City Nodes, Citizen Advisory
- Animated progress bar with gradient fill
- Per-module status indicators (○ → ▼ → ONLINE/CONNECTED/SYNCED)
- **Voice narration** — browser-native speech synthesis narrates each module's status
- Voice mute/unmute toggle (preference persisted via `sessionStorage`)
- Skip button to bypass the sequence
- Always plays on every fresh page load (no stale session state)

### 📊 Live Environmental Monitoring

- Real-time AQI display with color-coded gauge (Good → Severe)
- PM2.5, PM10, NO₂, O₃, SO₂, CO readings with severity indicators
- Weather overlay: temperature, humidity, wind, pressure, visibility
- Timeline chart with Recharts for AQI trend analysis
- Deterministic anomaly detection badges with automatic highlighting
- Manual refresh with loading skeletons and error recovery
- **Staggered card entrance animations** — cards appear sequentially with 120ms intervals
- **Card-hover microinteractions** — hover lift, shadow enhancement, border glow, press animation

### 🔬 Source Attribution

- Estimates pollution contributions from 5+ source categories (traffic, industry, biomass burning, dust/construction, others)
- Weighted multi-factor heuristic correlation with confidence scoring and seasonal adjustment
- Interactive bar + pie chart visualization
- Mitigation recommendations with actionable steps

### 🔮 72-Hour AQI Forecast

- Diurnal cycle projection with seasonal trend analysis
- Confidence scoring per forecast window
- Detailed hourly forecast table
- Alert badges for predicted "Poor" or worse conditions
- Visual confidence bands on forecast chart

### 🏛️ Policy Intervention Simulator

Test 8 different policy interventions with deterministic impact modeling:

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
- Clean print styling (Ctrl+P / `window.print`)

### 🗣️ Citizen Advisory

- Multilingual support: English, हिन्दी (Hindi), বাংলা (Bengali), తెలుగు (Telugu)
- Category-specific health precautions (Sensitive Groups, General Public)
- AQI category guidance with color-coded recommendations
- Emergency alerts with prominent callouts

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
| **Styling** | Tailwind CSS 3.4, Custom design tokens, CSS animations |
| **Charts** | Recharts 2.x (line, bar, pie, area, gauge) |
| **Icons** | Lucide React |
| **Voice** | Browser-native SpeechSynthesis (Web Speech API) |
| **Backend** | Node.js, Express 5 |
| **Data APIs** | Open-Meteo (free, no API key required) |
| **Correlation Engine** | Heuristic multi-factor pollution source correlation in Node.js |
| **Deployment** | Vercel (frontend + serverless API) |
| **Fonts** | Inter (UI), JetBrains Mono (data) |
| **Accessibility** | ARIA labels, keyboard navigation, focus rings, WCAG-compliant contrast |

---

## Architecture

The application follows a client-server architecture with lazy-loaded frontend modules and a modular Express backend.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                          │
│                                                                     │
│  AppShell                                                            │
│    ├── InitGate → BootSequence → Dashboard                          │
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
│  Services: speechService (singleton promise-based speech synthesis)   │
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
│    ├── sourceAttribution   → Heuristic correlation engine             │
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
[Every Page Load]
    ↓
[InitGate]  ← Tap anywhere → initializes speech engine
    ↓
[BootSequence]  ← Cinematic 8-module boot animation (~3.7s)
    ↓  (auto-completes or user skips)
[Zoom Transition]  ← Smooth 0.8s zoom-in to dashboard
    ↓
[Dashboard]
    ├── LiveMonitoring  (real-time AQI + weather)
    ├── SourceAttribution  (contribution analysis)
    ├── PredictiveIntelligence  (72h forecast)
    ├── PolicySimulator  (intervention testing)
    ├── EnforcementIntelligence  (anomalies)
    ├── ComparativeIntelligence  (city comparisons)
    ├── ExecutiveBrief  (auto-report)
    └── CitizenAdvisory  (multilingual guidance)
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

1. **Open the app** — On every page load, tap the InitGate screen to begin the cinematic boot sequence with voice narration.

2. **Select a city** — Choose from 10 major Indian cities via the CitySelector dropdown or the interactive India map.

3. **Monitor live conditions** — The Dashboard shows real-time AQI with a color-coded gauge, 6 pollutant readings, weather conditions, and a timeline chart.

4. **Analyze pollution sources** — Visit the Source Attribution module to see estimated contributions from traffic, industry, biomass burning, and more.

5. **View the forecast** — 72-Hour AQI Forecast shows a diurnal cycle projection with confidence bands and an hourly breakdown table.

6. **Test policy interventions** — In the Policy Simulator, select one or more interventions and click "Run Simulation" to see projected impacts.

7. **Generate a brief** — The Executive Brief module auto-creates a government-ready report you can print as PDF.

8. **Check advisories** — The Citizen Advisory module provides health guidance in 4 languages.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cities` | List all supported cities |
| `GET` | `/api/cities/:id` | Get city details |
| `GET` | `/api/air-quality/:cityId?lat=&lon=` | Live air quality data |
| `GET` | `/api/sources/:cityId` | Source attribution analysis |
| `GET` | `/api/forecast/:cityId` | 72-hour AQI forecast |
| `GET` | `/api/simulation/interventions` | Available policy interventions |
| `POST` | `/api/simulation/run` | Run policy simulation |
| `POST` | `/api/brief/generate` | Generate executive decision brief |
| `GET` | `/api/advisory/:cityId` | Citizen health advisory (supports `?lang=hi/bn/te`) |
| `GET` | `/api/health` | API health check |

---

## Design System

UrbanBreathe uses a premium government-grade design language optimized for command centre operations:

| Token | Value | Usage |
|---|---|---|
| **Primary** | `#3b91e8` (brand blue) | Actions, links, active states |
| **Text** | `#0f172a` → `#f1f5f9` | Light/Dark mode text |
| **Surface** | `#ffffff` → `#0f172a` | Light/Dark mode backgrounds |
| **Font** | Inter, system sans-serif | General UI |
| **Mono** | JetBrains Mono | AQI values, status lines, metrics |
| **Radius** | `rounded-xl` (0.75rem) | Cards, containers |
| **Cards** | White/slate-900, `card-hover` microinteractions | Content containers |

### States & Feedback

- **Loading**: Skeleton shimmer with theme-aware colors
- **Empty**: Contextual guidance message
- **Error**: Clear error message with fallback data
- **Cards**: Hover lift (+2px), shadow enhancement, border glow

### Responsiveness

- **Desktop** (1280px+): Full sidebar, multi-column layouts, full chart width
- **Tablet** (768px+): Collapsible sidebar overlay, adjusted grid
- **Mobile** (<768px): Bottom navigation drawer, stacked cards, simplified charts

### Design Principles

- **Transparent algorithms** over black-box outputs — every score and projection is verifiable in source
- **Modular frontend architecture** — lazy-loaded modules with independent data fetching
- **Deterministic and auditable calculations** — heuristic engines with visible coefficients
- **Graceful degradation** — fallback data when APIs are unreachable
- **Accessibility-first interface** — keyboard navigation, ARIA labels, WCAG-compliant contrast

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
├── vite.config.ts             # Vite bundler config (+ API proxy to :3001)
├── tailwind.config.js         # Tailwind CSS custom theme + animations
├── tsconfig.json              # TypeScript config
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
│   ├── App.tsx                # Root component
│   ├── main.tsx               # React entry point
│   ├── index.css              # Tailwind + custom CSS (ambient, holographic, microinteractions)
│   ├── vite-env.d.ts          # Vite type declarations
│   │
│   ├── types/                 # TypeScript interfaces
│   │   └── index.ts
│   │
│   ├── utils/                 # Shared utilities
│   │   ├── constants.ts       # AQI thresholds, colors, categories
│   │   └── formatters.ts      # Date, number, string formatters
│   │
│   ├── services/              # API client + speech
│   │   ├── api.ts             # Typed fetch wrapper
│   │   └── speechService.ts   # Singleton promise-based speech synthesis
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useCityData.ts     # City + AQI data fetching
│   │   ├── useSources.ts      # Source attribution data
│   │   ├── useForecast.ts     # Forecast data
│   │   ├── useSimulation.ts   # Policy simulation
│   │   └── useTheme.ts        # Dark/light theme toggle
│   │
│   ├── lib/                   # External integrations
│   │   └── firebase.ts        # Firebase config (optional)
│   │
│   └── components/            # UI components
│       ├── layout/            # Shell, navigation, headers
│       │   ├── AppShell.tsx   # Main app shell with routing
│       │   ├── InitGate.tsx   # Holographic tap-to-initialize
│       │   ├── BootSequence.tsx # Cinematic 8-module boot animation
│       │   ├── AmbientBackground.tsx # Particles, grid, earth glow
│       │   ├── Sidebar.tsx    # Navigation sidebar
│       │   └── Header.tsx     # Top bar with theme toggle
│       │
│       ├── landing/           # Landing page
│       │   ├── CompactLanding.tsx # Hero + stats + CTA
│       │   └── ImpactSection.tsx  # Impact metric cards
│       │
│       ├── common/            # Shared components
│       │   ├── CitySelector.tsx  # Accessible custom listbox
│       │   ├── IndiaMap.tsx      # Interactive SVG map
│       │   └── MetricCard.tsx    # Stat display card
│       │
│       ├── dashboard/         # Live monitoring
│       │   ├── LiveMonitoring.tsx
│       │   ├── AQIGauge.tsx
│       │   └── PollutantCard.tsx
│       │
│       ├── source-attribution/
│       │   └── SourceAttribution.tsx
│       │
│       ├── forecast/
│       │   └── PredictiveIntelligence.tsx
│       │
│       ├── simulator/
│       │   ├── PolicySimulator.tsx
│       │
│       ├── enforcement/
│       │   └── EnforcementIntelligence.tsx
│       │
│       ├── comparative/
│       │   └── ComparativeIntelligence.tsx
│       │
│       ├── executive-brief/
│       │   └── ExecutiveBrief.tsx
│       │
│       └── citizen-advisory/
│           └── CitizenAdvisory.tsx
│
└── server/                    # Backend source
    ├── index.js               # Express server entry
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
    ├── services/              # Business logic engines
    │   ├── briefGenerator.js
    │   ├── forecastService.js
    │   ├── openMeteoService.js
    │   ├── simulationEngine.js
    │   └── sourceAttribution.js
    └── utils/
        └── calculations.js    # CPCB/EPA AQI formulas
```

---

## Technical Approach & Roadmap

This section provides an honest account of the technical methods used and their limitations relative to production-grade air quality systems. Nothing in this codebase claims or implies ML training, trained models, or ML-derived parameters.

### Source Attribution

**Current method:** Weighted multi-factor heuristic correlation. The engine compares current pollutant concentrations (PM2.5, PM10, NO₂, SO₂, CO, O₃) against predefined source profiles that map pollutants to source categories (traffic, industry, biomass burning, dust, others). Each source gets a confidence score based on how many of its indicator pollutants exceed a threshold. Seasonal multipliers adjust contributions (e.g. biomass burning weighted higher in winter).

**What a production system would use (v2):** A trained Random Forest model with source-receptor matrices derived from historical monitoring data. This would require a training dataset of historical pollutant concentrations paired with known source activity periods, a feature engineering pipeline, and regular retraining.

**Honest statement:** This is a heuristic rule-based system. There is no trained ML model, no training dataset, and no source-receptor matrix. The heuristic provides reasonable directional estimates but has no learning component.

### Forecasting

**Current method:** Heuristic diurnal cycle model with seasonal multipliers. The forecast applies a sinusoidal diurnal curve modulated by seasonal amplitude/variance parameters, a linear trend factor, and random noise. No historical data is used — the forecast extrapolates from the single current AQI reading.

**What a production system would use (v2):** A Temporal Convolutional Network trained on multi-year historical AQI and meteorological data.

**Honest statement:** The forecast is not an ML model. It is a deterministic heuristic that assumes daily periodicity. Useful for directional trend indication but not regulatory-grade accuracy.

### Spatial Resolution

**Current resolution:** City-level point data. Each city is represented by a single coordinate pair.

**What a production system would use (v2):** 1km×1km grid resolution with spatial interpolation.

**Honest statement:** No gridded resolution or spatial interpolation. The platform operates at city-centroid granularity.

### What This Prototype Does Implement

While the analysis components are heuristic (as disclosed above), several modules implement real, functioning decision-support logic that is deterministic, transparent, and immediately usable:

- **Anomaly Detection** (`detectAnomaly` in `forecastService.js`): Compares current AQI readings against a city-specific diurnal expectation model. If deviation exceeds 40%, the system flags it with direction (above/below normal), deviation percentage, and expected range — all computed deterministically from baseline AQI, time of day, and seasonal parameters.

- **Enforcement Prioritization** (`EnforcementIntelligence.tsx`): Ranks pollution anomalies by severity, duration, and geographic spread using a deterministic scoring function.

- **Policy Simulation** (`simulationEngine.js`): An 8-intervention impact model computing projected AQI improvement, PM2.5 reduction, hospital admissions averted, population exposure, and implementation cost — all from deterministic mappings. Every coefficient and formula is visible in source code.

**Why heuristics were chosen:** Heuristic models were intentionally selected for this prototype because no publicly available labelled source-attribution dataset exists for Indian cities that would support supervised training within the hackathon timeframe. This constraint is common across Smart City projects — the methodology above documents the approach transparently.

### v2 Roadmap

| Component | v1 Method | v2 Target | Data/Infrastructure Needed |
|---|---|---|---|
| Source attribution | Weighted multi-factor heuristic | Random Forest with source-receptor matrices | Historical pollutant + source activity data |
| Forecasting | Diurnal cycle heuristic | TCN with meteorological covariates | 2-5 years hourly CPCB data |
| Spatial resolution | City-centroid point | 1km×1km gridded | Station network density, satellite data |
| Dispersion modeling | None | Gaussian plume (AERMOD) | Emissions inventory, met tower data |

### Future Work

- **CPCB real-time API integration** — replace Open-Meteo proxy with government live feeds
- **Satellite aerosol ingestion** — integrate Sentinel-5P / MODIS AOD products for regional coverage
- **Random Forest source attribution** — train on historical monitoring data when labelled datasets become available
- **Temporal forecasting models** — replace diurnal heuristic with TCN or LSTM ensemble
- **Geospatial heatmaps** — 1km×1km gridded concentration maps with spatial interpolation
- **Mobile incident reporting** — citizen-facing companion app for photo-submitted pollution reports

---

## Performance & Quality Metrics

| Metric | Score |
|---|---|
| ♿ Accessibility | **100/100** |
| 🏆 Best Practices | **100/100** |
| 🔍 SEO | **100/100** |
| ⚡ Performance | **94/100** |
| ✅ TypeScript errors | **Zero** |
| 🔇 Console warnings | **Zero** |
| 📦 Source files | **55+ TypeScript/React + Express backend** |
| 🏗️ Architecture | Modular, typed, lazy-loaded, server-client |

> Measured via [Lighthouse](https://developer.chrome.com/docs/lighthouse/) on production build. Results may vary based on network conditions and device capabilities.

---

## Browser Compatibility

| Browser | Status | Notes |
|---|---|---|
| Google Chrome (latest) | ✅ Recommended | Full speech synthesis support, best experience |
| Microsoft Edge (latest) | ✅ Supported | Speech synthesis quality varies |
| Mozilla Firefox (latest) | ✅ Supported | Speech synthesis may require extra user interaction |
| Safari (latest) | ✅ Supported | Speech synthesis quality varies |

> Voice narration uses the browser-native [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API). Chrome provides the most consistent experience across all features.

---

## Known Limitations

- **Data source**: Uses Open-Meteo as a data proxy. A production deployment would integrate CPCB live feeds directly for higher accuracy.
- **City coverage**: Currently supports 10 major Indian cities. Adding more cities requires new coordinate/baseline data.
- **Forecast accuracy**: Heuristic diurnal model — not a trained ML model. Should be replaced with ML-based ensemble models for production use.
- **Source attribution**: Heuristic correlation — not a trained Random Forest model with source-receptor matrices.
- **Mobile optimization**: Desktop-optimized for command centre use. Usable on mobile but data-dense views are best on larger screens.
- **Offline support**: No offline mode — requires active internet connection.
- **Speech synthesis**: Voice narration uses browser-native SpeechSynthesis. Quality varies by browser and OS. Chrome provides the best experience.

---

## License

**MIT** — Built for **ET AI Hackathon 2.0 — Grand Finale** by [CodesbyRohit](https://github.com/CodesbyRohit).

*UrbanBreathe — Breathing intelligence into every decision™*

---

<div align="center">
  <sub>Designed for transparent, auditable environmental decision support.</sub>
</div>
