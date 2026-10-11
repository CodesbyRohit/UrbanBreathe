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

UrbanBreathe turns air-quality data into decision support for Indian cities. It applies the CPCB National AQI method to modelled CAMS data (via Open-Meteo), shows a 72-hour model forecast, descriptive source context, illustrative intervention scenarios, a situation brief and multilingual citizen guidance — and labels every value with its data basis.

> **Data basis:** air-quality values are CAMS model output (about 45 km grid over India), not station measurements. The index shown is a *NAQI-method estimate from modelled data*, not an official CPCB station AQI. See [docs/methodology/naqi.md](docs/methodology/naqi.md).

**Who it's for:** Smart City Command Centre operators, Municipal Corporation environmental cells, and State Pollution Control Board analysts.

**Why it matters:** 900+ monitoring stations exist across India. Almost none translate to actionable decisions. UrbanBreathe closes that gap by consolidating scattered data into a unified operational picture.

**What's different:** Every module states its data basis and limitations. No machine-learning models are used; the index follows the published CPCB method, and outputs that cannot be supported by the available data (source percentages, health-impact counts, forecast accuracy) are not produced.

Built for the **ET AI Hackathon 2.0 — Grand Finale**.

### Key Capabilities

| Capability | Description |
|---|---|
| **Current Conditions** | NAQI-method estimate (CPCB method, 24 h / 8 h means) from modelled CAMS data, 6 pollutants in µg/m³, modelled weather, last-24 h PM series |
| **Source Context** | Descriptive indicators (PM2.5/PM10 ratio, dominant pollutant) — no source apportionment |
| **72-Hour Model Forecast** | CAMS model forecast with NAQI-method estimates; not evaluated against observations |
| **Scenario Explorer** | Illustrative arithmetic with uncited placeholder reductions; no health or cost estimates |
| **Executive Brief** | Situation summary with data basis, CPCB-sourced actions and limitations |
| **Citizen Advisory** | CPCB health statements and general precautions (EN, HI, BN, TE) |
| **City Comparison** | Cross-city NAQI estimates and model-forecast peaks |
| **City Priority List** | Cities ranked by NAQI estimate (screening aid, not an enforcement recommendation) |

## Features

### 🎬 Optional presentation intro

The dashboard opens directly. An optional intro (tap gate, boot animation and browser speech narration) can be started from the header. It is presentation-only and does not connect to any system.

### 📊 Current Conditions

- NAQI-method estimate computed with the CPCB method (24-hour means; 8-hour for O₃ and CO; ≥ 3 pollutants including PM2.5 or PM10; ≥ 16 valid hours) from modelled CAMS data; shows "insufficient data" instead of a number when requirements are not met
- PM2.5, PM10, NO₂, O₃, SO₂, CO hourly values in µg/m³ with per-pollutant CPCB sub-indices
- Modelled weather: temperature, humidity, wind, pressure, visibility
- Last-24-hour modelled PM2.5/PM10 chart
- Data-basis badge on every view; DEMO banner when the server runs in demo mode

### 🔬 Source Context

- No source apportionment: that needs speciated measurements and receptor/dispersion modelling, which are not available
- Descriptive indicators from the 24-hour means (PM2.5/PM10 ratio, dominant pollutant) with caveats
- Common urban source categories listed for context, without quantities

### 🔮 72-Hour Model Forecast

- CAMS model forecast passed through unchanged, with a NAQI-method estimate per hour
- No accuracy or confidence is claimed: the forecast has not been evaluated against observations or a persistence baseline

### 🏛️ Policy Intervention Simulator

Explore 8 interventions as illustrative scenarios. Uncited placeholder reduction fractions are applied to the current modelled means and the NAQI method is re-applied — this is not a prediction:

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

Outputs: current vs scenario NAQI estimate and PM2.5 24-hour mean, with the assumptions used. No health, exposure or cost figures are produced.

### 📝 Executive Brief

- Situation summary built from the same data as the dashboard: NAQI-method estimate, dominant pollutant, model-forecast peak (not evaluated), source context, CPCB health statement
- Recommended actions quote CPCB guidance (CUPS/82/2014-15 §3.4) for Very Poor/Severe; Delhi additionally gets a pointer to the GRAP stage notified by CAQM
- Lists its limitations; print / save as PDF via the browser

### 🗣️ Citizen Advisory

- CPCB health statement for the current category (CUPS/82/2014-15, Table 3.12)
- General, profile-based precautions in English, हिन्दी (Hindi), বাংলা (Bengali), తెలుగు (Telugu); not medical advice
- National emergency number 112; local helplines should be taken from state/city administrations

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
| **Index method** | CPCB National AQI (CUPS/82/2014-15) implemented in `server/domain/naqi.js` |
| **Tests** | Node.js built-in test runner (`npm test`) |
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
│  providers/openMeteo   → CAMS + weather adapter (timeout, cache,    │
│                          schema/unit checks)                        │
│  domain/naqi, units, season → CPCB NAQI, unit conversion, seasons   │
│  services/cityAirQuality → provider data + NAQI per city            │
│  services/forecast, sourceIndicators, scenario, brief, advisory     │
│  http/validation, errors → request validation, JSON errors          │
│                                                                     │
│  Data: cities.js (10 cities), demoFixtures.js (DATA_MODE=demo only) │
└─────────────────────────────────────────────────────────────────────┘
```

### User Flow

```
[Page load]
    ↓
[Dashboard]  (optional presentation intro available from the header)
    ├── Current Conditions  (NAQI-method estimate, modelled data)
    ├── Source Context  (indicators, no apportionment)
    ├── Model Forecast  (72 h CAMS outlook, not evaluated)
    ├── Scenario Explorer  (illustrative)
    ├── City Priority List  (ranked by NAQI estimate)
    ├── City Comparison
    ├── Executive Brief
    └── Citizen Advisory  (CPCB health statements, 4 languages)
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

### Tests

```bash
npm test          # API, NAQI and frontend utility tests (Node's built-in runner)
npm run typecheck # TypeScript checks
```

### Demo mode

Set `DATA_MODE=demo` for the API server to serve deterministic, clearly labelled demo fixtures instead of live Open-Meteo data. The UI shows a DEMO banner.

### Build for Production

```bash
npm run build
# → Output in ./dist/ (ready for Vercel/deployment)
```

---

## Usage

1. **Open the app** — The dashboard opens directly. Use **Intro** in the header for the optional presentation intro.

2. **Select a city** — Choose from 10 major Indian cities via the CitySelector dropdown or the interactive India map.

3. **Check current conditions** — The dashboard shows the NAQI-method estimate from modelled data, 6 pollutant values, modelled weather and the last 24 hours of PM.

4. **Review source context** — Descriptive indicators and common source categories; contributions are not estimated.

5. **View the forecast** — The 72-hour CAMS model forecast with NAQI-method estimates (not evaluated).

6. **Explore scenarios** — Select interventions to see illustrative arithmetic based on placeholder assumptions.

7. **Generate a brief** — A situation summary with data basis and limitations, printable as PDF.

8. **Check advisories** — CPCB health statements and general precautions in 4 languages.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cities` | List all supported cities |
| `GET` | `/api/cities/:id` | Get city details |
| `GET` | `/api/air-quality/:cityId` | NAQI-method estimate, hourly concentrations, modelled weather, provenance |
| `GET` | `/api/sources/:cityId` | Source context indicators (no apportionment) |
| `GET` | `/api/forecast/:cityId` | 72-hour CAMS model forecast (not evaluated) |
| `GET` | `/api/simulation/interventions` | Available policy interventions |
| `POST` | `/api/simulation/run` | Illustrative scenario |
| `POST` | `/api/brief/generate` | Situation brief |
| `GET` | `/api/advisory/:cityId` | Citizen advisory (`?lang=en/hi/bn/te`) |

Errors are JSON: `{ "error": { "code", "message" } }` — e.g. 400 invalid input, 404 unknown city, 503 when the data provider is unavailable (no substitute data is served).
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
- **Error**: Clear error message; no substitute data is shown
- **Cards**: Hover lift (+2px), shadow enhancement, border glow

### Responsiveness

- **Desktop** (1280px+): Full sidebar, multi-column layouts, full chart width
- **Tablet** (768px+): Collapsible sidebar overlay, adjusted grid
- **Mobile** (<768px): Bottom navigation drawer, stacked cards, simplified charts

### Design Principles

- **Transparent algorithms** over black-box outputs — every score and projection is verifiable in source
- **Modular frontend architecture** — lazy-loaded modules with independent data fetching
- **Deterministic and auditable calculations** — heuristic engines with visible coefficients
- **Honest degradation** — when the provider is unreachable the app says so; demo fixtures are used only in explicit demo mode and are labelled DEMO
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
    ├── app.js                 # Express app (routes, JSON error handling)
    ├── index.js               # Local server entry (listens on PORT)
    ├── config.js              # DATA_MODE and upstream timeouts
    ├── data/
    │   ├── cities.js          # City coordinates, time zone & metadata
    │   └── demoFixtures.js    # Illustrative values for DATA_MODE=demo only
    ├── domain/
    │   ├── naqi.js            # CPCB National AQI method
    │   ├── units.js           # Unit conversions
    │   └── season.js          # IMD-convention seasons in city time zone
    ├── http/                  # Request validation and JSON errors
    ├── providers/
    │   └── openMeteo.js       # CAMS air quality + weather adapter
    ├── routes/                # API route handlers
    └── services/              # cityAirQuality, forecast, sourceIndicators,
                               # scenario, brief, advisory
tests/                         # node:test suites (server + frontend utilities)
docs/methodology/naqi.md       # NAQI sources, rules and open questions
```

---

## Technical Approach & Roadmap

This section provides an honest account of the technical methods used and their limitations relative to production-grade air quality systems. Nothing in this codebase claims or implies ML training, trained models, or ML-derived parameters.

### Source Attribution

**Current method:** None — source contributions are not estimated. The earlier weighted heuristic produced percentages and confidence scores without a valid basis and was removed. Descriptive indicators are shown instead.

**What a production system would use (v2):** A trained Random Forest model with source-receptor matrices derived from historical monitoring data. This would require a training dataset of historical pollutant concentrations paired with known source activity periods, a feature engineering pipeline, and regular retraining.

**Honest statement:** No source attribution is made. Doing it properly requires speciated measurements and receptor or dispersion modelling.

### Forecasting

**Current method:** The CAMS global model forecast served by Open-Meteo, passed through unchanged, with the CPCB NAQI method applied to running means. (An earlier heuristic based on a sine curve and random noise was removed.)

**What a production system would use (v2):** A Temporal Convolutional Network trained on multi-year historical AQI and meteorological data.

**Honest statement:** No accuracy is claimed. Evaluation against station observations and a persistence baseline is planned but not done.

### Spatial Resolution

**Current resolution:** City-level point data. Each city is represented by a single coordinate pair.

**What a production system would use (v2):** 1km×1km grid resolution with spatial interpolation.

**Honest statement:** No gridded resolution or spatial interpolation. The platform operates at city-centroid granularity.

### What This Prototype Does Implement

- **CPCB NAQI calculation** (`server/domain/naqi.js`): breakpoints from CUPS/82/2014-15 Table 3.11, 24-hour / 8-hour running means, the three-pollutant and 16-hour requirements, and an explicit `insufficient_data` result. Sources and open questions: [docs/methodology/naqi.md](docs/methodology/naqi.md).
- **Provenance labelling**: every response carries its data basis (`modelled` CAMS data or `demo` fixtures); fixtures are never substituted for failed live requests.
- **Anomaly detection is not implemented** — it needs a historical baseline. The API reports it as unavailable.
- **Scenarios are illustrative** — uncited placeholder reduction fractions, no health or cost outputs.

### v2 Roadmap

| Component | v1 Method | v2 Target | Data/Infrastructure Needed |
|---|---|---|---|
| Source attribution | None (descriptive indicators only) | Random Forest with source-receptor matrices | Historical pollutant + source activity data |
| Forecasting | CAMS model forecast (not evaluated) | TCN with meteorological covariates | 2-5 years hourly CPCB data |
| Spatial resolution | City-centroid point | 1km×1km gridded | Station network density, satellite data |
| Dispersion modeling | None | Gaussian plume (AERMOD) | Emissions inventory, met tower data |

### Future Work

- **CPCB real-time API integration** — replace Open-Meteo proxy with government live feeds
- **Satellite aerosol ingestion** — integrate Sentinel-5P / MODIS AOD products for regional coverage
- **Random Forest source attribution** — train on historical monitoring data when labelled datasets become available
- **Forecast evaluation and improvement** — evaluate the CAMS forecast against station data and a persistence baseline before attempting bias correction or other models
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

- **Data source**: CAMS model output via Open-Meteo (about 45 km grid), not station measurements; the NAQI shown is an estimate, not the official CPCB station AQI. Open-Meteo's free tier is for non-commercial use.
- **City coverage**: Currently supports 10 major Indian cities. Adding more cities requires new coordinate/baseline data.
- **Forecast accuracy**: CAMS model forecast, not evaluated against observations or a baseline.
- **Source attribution**: Not performed; indicators only.
- **Anomaly detection**: Not implemented (requires a historical baseline).
- **Demo mode**: `DATA_MODE=demo` serves labelled illustrative fixtures without calling Open-Meteo.
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
