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

UrbanBreathe is a government-grade operational platform that enables municipal authorities to **monitor**, **predict**, **simulate**, and **respond** to air pollution across 10 major Indian cities. It combines real-time AQI monitoring with heuristic pollutant-source correlation for attribution, 72-hour forecasting, policy intervention simulation, automated executive reporting, and multilingual citizen advisories — all within a premium, command-centre-grade interface.

Built for the **ET AI Hackathon 2.0 — Grand Finale**.

### Key Capabilities

| Capability | Description |
|---|---|
| **Live Monitoring** | Real-time AQI, 6 pollutants, weather conditions, trend charts |
| **Source Attribution** | Heuristic multi-factor pollution source correlation with confidence scoring |
| **72-Hour AQI Forecast** | 72-hour AQI forecast with diurnal cycle modeling and confidence bands |
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

### 🔬 Source Attribution
- Estimates pollution contributions from 5+ source categories (traffic, industry, biomass burning, dust/construction, others)
- Confidence scoring per source with seasonal adjustment
- Interactive bar + pie chart visualization
- Science-based mitigation recommendations with actionable steps
- Performance metrics (year-over-year comparison)

### 🔮 72-Hour AQI Forecast
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
| **Correlation Engine** | Heuristic multi-factor pollution source correlation in Node.js |
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

4. **Analyze pollution sources** — Visit the Source Attribution module to see estimated contributions from traffic, industry, biomass burning, and more.

5. **View the forecast** — 72-Hour AQI Forecast shows a 72-hour projection with confidence bands and an hourly breakdown table.

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
| `GET` | `/api/sources/:cityId` | Source attribution analysis |
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

## Technical Approach & Roadmap

This section provides an honest account of the technical methods used and their limitations relative to the approaches specified in production-grade air quality systems. Nothing in this codebase claims or implies ML training, trained models, or ML-derived parameters.

### Source Attribution

**Current method:** Weighted multi-factor heuristic correlation. The engine compares current pollutant concentrations (PM2.5, PM10, NO₂, SO₂, CO, O₃) against predefined source profiles that map pollutants to source categories (traffic, industry, biomass burning, dust, others). Each source gets a confidence score based on how many of its indicator pollutants exceed a threshold. Seasonal multipliers adjust contributions (e.g. biomass burning weighted higher in winter).

**What a production system would use (v2):** A trained Random Forest model with source-receptor matrices derived from historical monitoring data. This would require:
- A training dataset of historical pollutant concentrations paired with known source activity periods (e.g. crop burning seasons, traffic data, industrial production indexes)
- A feature engineering pipeline to construct source-receptor coefficients from spatial correlation patterns
- A trained Random Forest regressor outputting source contribution percentages with calibrated confidence intervals
- Regular retraining as new monitoring data becomes available

**Honest statement:** This is a heuristic rule-based system. There is no trained ML model, no training dataset, and no source-receptor matrix in this codebase. The heuristic provides reasonable directional estimates but has no learning component.

### Forecasting

**Current method:** Heuristic diurnal cycle model with seasonal multipliers. The forecast applies a sinusoidal diurnal curve (peaking post-midnight, troughing mid-afternoon) modulated by seasonal amplitude/variance parameters, plus a linear trend factor and uniform random noise. No historical data is used — the forecast extrapolates from the single current AQI reading.

**What a production system would use (v2):** A Temporal Convolutional Network (TCN) trained on multi-year historical AQI and meteorological data. This would require:
- 2-5 years of historical hourly AQI data per city from CPCB monitoring stations
- Meteorological covariates (wind speed/direction, temperature, humidity, boundary layer height)
- A TCN architecture with dilated causal convolutions to capture multi-scale temporal patterns
- Train/validation/test split with temporal cross-validation
- A model serving pipeline for hourly inference

**Honest statement:** The current forecast is not a TCN or any ML model. It is a deterministic heuristic that assumes daily periodicity and random noise. It is useful for directional trend indication but has measured forecast error that would not meet regulatory standards.

### Spatial Resolution

**Current resolution:** City-level point data. Each city is represented by a single coordinate pair. All readings and forecasts apply uniformly across the entire city.

**What a production system would use (v2):** 1km×1km grid resolution with spatial interpolation. This would require:
- A dense network of monitoring stations or satellite-derived pollution surfaces
- Kriging or inverse-distance weighting interpolation between stations
- A gridded output format (GeoTIFF or similar) for visualization
- Integration with atmospheric dispersion models to account for pollutant transport

**Honest statement:** There is no gridded resolution or spatial interpolation. The platform operates at city-centroid granularity.

### Atmospheric Dispersion Modeling

**Current method:** None. The platform does not model how pollutants move through the atmosphere.

**What a production system would use (v2):** Gaussian plume or Lagrangian puff dispersion models (e.g. AERMOD, CALPUFF). This would require:
- Meteorological data (wind fields, mixing height, stability class)
- Emissions inventory with source locations, stack parameters, and temporal profiles
- A dispersion model engine that solves the advection-diffusion equation
- Integration with the gridded concentration field for visualization

**Honest statement:** No dispersion modeling is implemented. The platform treats each city's pollution as a closed system without transport from upwind sources.

### What This Prototype Does Implement

While the ML/AI components are heuristic (as disclosed above), several modules in this platform implement real, functioning decision-support logic that is deterministic, transparent, and immediately usable by command centre operators — no ML required:

- **Anomaly Detection** (`detectAnomaly` in `forecastService.js`): Compares current AQI readings against a city-specific diurnal expectation model. If the deviation exceeds 40% of the expected value, the system flags it as an anomaly with direction (above/below normal), deviation percentage, and expected range — all computed deterministically from the city's baseline AQI, time of day, and seasonal parameters. This is genuine automation of a human analyst's pattern-recognition workflow, not an ML approximation.

- **Enforcement Prioritization Scoring** (`EnforcementIntelligence.tsx`): Ranks pollution anomalies by severity, duration, and geographic spread using a deterministic scoring function. Produces prioritized enforcement actions (e.g. which industrial zones to inspect first) based on transparent rules that can be audited and adjusted by municipal staff without needing to retrain a model.

- **Policy Simulation** (`simulationEngine.js`): An 8-intervention impact model that computes projected AQI improvement, PM2.5 reduction, hospital admissions averted, population exposure, and implementation cost — all from a deterministic mapping of intervention type to pollutant impact coefficients, health impact rates, and population data. The model is transparent: every coefficient and formula is visible in source code, and results are reproducible given the same inputs.

These modules represent real decision-support engineering — they automate analytical workflows that would otherwise require manual analyst effort, in a verifiable, deterministic way that is appropriate for government decision-making.

### Why This Scope

This prototype was built for a hackathon with a 4-week timeline. The heuristic approach was an intentional scope decision: it provides meaningful directional intelligence (which sources dominate, whether AQI is trending up/down, which interventions have the largest expected impact) without the multi-month data collection and model development that production ML would require. Every heuristic is transparent, deterministic, and auditable — tradeoffs were made transparently in favor of a working, verifiable prototype over an aspirational but incomplete ML pipeline. The heuristic approach was an intentional scope decision: it provides meaningful directional intelligence (which sources dominate, whether AQI is trending up/down, which interventions have the largest expected impact) without the multi-month data collection and model development that production ML would require. Every heuristic is transparent, deterministic, and auditable — tradeoffs were made transparently in favor of a working, verifiable prototype over an aspirational but incomplete ML pipeline.

### v2 Roadmap

| Component | v1 Method | v2 Target | Data/Infrastructure Needed |
|---|---|---|---|
| Source attribution | Weighted multi-factor heuristic | Random Forest with source-receptor matrices | Historical pollutant + source activity data, feature pipeline, training infrastructure |
| Forecasting | Diurnal cycle heuristic | TCN with meteorological covariates | 2-5 years hourly CPCB data, met station feeds, GPU training |
| Spatial resolution | City-centroid point | 1km×1km gridded | Station network density, satellite data, interpolation engine |
| Dispersion modeling | None | Gaussian plume (AERMOD) | Emissions inventory, met tower data, dispersion model license |

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

- **Forecast accuracy**: Forecasting uses a heuristic diurnal cycle model with seasonal adjustment — not a trained machine learning model (e.g. TCN). For production use, this should be replaced with ML-based ensemble models trained on historical CPCB data.

- **Source attribution**: The source correlation engine uses a weighted multi-factor heuristic — not a trained Random Forest model with source-receptor matrices. Real-world deployments would replace this with ML-based source attribution trained on local emissions inventories and satellite imagery.

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
