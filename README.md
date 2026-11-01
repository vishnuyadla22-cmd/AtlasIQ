# AtlasIQ — Every Place. Deeper Intelligence.

> An AI-powered geospatial and location intelligence platform built for the FORGE Hackathon.

AtlasIQ aggregates multi-sector planetary indicators—from climate resilience and groundwater stress to renewable energy yield, socioeconomic health, and transportation access—to help planners, researchers, and enterprises evaluate locations with empirical rigor.

---

## 🧭 Project Roadmap

- **Phase 1: Project Foundation, Premium UI & Frontend Stability** *(Completed)*
  - Established Vite + React + TypeScript + Tailwind CSS application shell.
  - Implemented full responsive sidebar navigation and unified page layouts.
  - Delivered Overview, Location Explorer, 9 Domain Modules, Comparative, Scenario, and Assistant views with honest empty states and data transparency standards.
- **Phase 2: Geocoding & Interactive Geospatial Mapping** *(Completed)*
  - Integrated Leaflet / React-Leaflet interactive map with custom AtlasIQ pins and coordinate popups.
  - OpenStreetMap Nominatim geocoding engine with client-side caching and Open-Meteo geocoding fallback.
  - Real-time Open-Meteo weather integration: current surface conditions (temp, feels like, humidity, precipitation, wind) and 5-day numerical model forecasts.
  - Fixed core sector indicator card crowding and clarified multi-tier location resolution states.
- **Phase 3: Expanded Location Intelligence, Comparisons & Data Integrity** *(Completed)*
  - Corrected weather data provenance labels (Reported Current Conditions vs. Forecasts; avoided unverified direct measurement claims).
  - Expanded domain data architecture across all 9 sectors with transparent scientific classification (`provider_reported_current`, `model_analysis`, `forecast`, `unavailable`).
  - Integrated live Copernicus CAMS air quality (US AQI, PM2.5, PM10) and solar irradiance models.
  - Delivered comprehensive side-by-side Location Comparison with deterministic deltas, candidate verification, and missing data integrity (missing values never treated as zero).
  - Generated factual intelligence summaries based strictly on verified numerical data.
- **Phase 4: Persistent Location State + Grounded AI Location Assistant** *(Completed)*
  - **Objective A: Cross-Domain Persistent Location State:**
    - Established unified `LocationContext` sharing resolved active location and live telemetry across all 9 intelligence domain modules.
    - Synchronized with `localStorage` and URL parameters (`?q=...`) for instant page-refresh and direct navigation restoration.
    - Isolated Compare Locations so two-location comparisons remain completely independent of the shared active location.
  - **Objective B: Evidence-Grounded AI Intelligence Assistant:**
    - Developed natural-language assistant grounded strictly in actual AtlasIQ data (Open-Meteo, Copernicus CAMS, FAO-56 agrometeorology).
    - Zero-hallucination deterministic fallback engine supporting single-location weather/AQI/solar queries, comparative evaluations, and explanations of unavailable domains (e.g. WRI Aqueduct).
    - Structured citations, provenance tiers (`model_analysis`, `provider_reported_current`, `forecast`, `unavailable`), and documented limitations.
- **Phase 5: Real Data Integration and Analytical Engines** *(Completed)*
  - **Water Resources & Hydrology:** Integrated Copernicus GloFAS Daily River Discharge (m³/s) via Open-Meteo Flood API and ECMWF Land surface volumetric soil moisture (0–7cm, 7–28cm, 28–100cm). Transparently maintained WRI Aqueduct 4.0 baseline water stress, NASA GRACE-FO gravimetry, and GRDC station hydrographs as *Integration Pending* with documented GIS requirements.
  - **Natural Hazards & Seismology:** Integrated live USGS Earthquake Hazards Program telemetry (events ≥ M2.5 within 250 km, peak magnitude, nearest event proximity), strictly separating real seismometer network records from staged commercial mineral reserves (USGS MRDS).
  - **Economy & Cost of Living:** Integrated official sovereign accounts from World Bank Open Data API (GDP per capita, inflation rate, total population, urbanization share, labor force participation) with explicit `National` scope labeling, never fabricating or interpolating city-level living costs.
  - **Healthcare & Education:** Integrated official World Bank / WHO national public health metrics (physicians density, health expenditure % of GDP, hospital beds per 1,000 residents, life expectancy at birth).
  - **Transportation & Infrastructure:** Integrated World Bank / ITU national connectivity indicators (fixed broadband subscriptions per 100 people, Logistics Performance Index, electrical grid access %, internet penetration %).
  - **Energy & Utilities:** Integrated World Bank / IEA renewable energy consumption share (% of total final energy) alongside Open-Meteo DNI/GTI solar irradiance models.
  - **Refactored Presentation & Visualizations:** Fixed layout and independent sidebar/content scrolling behavior, prevented metric card text overlap, and replaced empty chart axes with honest "Data Integration Pending" empty states.
  - **Cross-Domain Comparison & Grounded AI Assistant:** Extended comparative evaluation matrix and the deterministic AI assistant to answer economic, hydrological, public health, logistics, and seismic questions with explicit citations, provenance tiers, and geographic scope boundaries.
- **Phase 6: Complete Testing, Security, Deployment and Final Verification** *(Completed)*
  - **Full Security Audit:** Zero exposed credentials, zero hardcoded secrets, and pure client-side HTTPS communication with open scientific telemetry APIs.
  - **Deployment Configuration:** Added `vercel.json` SPA rewrite rules to ensure seamless deep-linking and browser navigation across all routes.
  - **Build & Typecheck Hardening:** Verified 0 TypeScript errors (`npm run typecheck`) and validated production bundle generation (`npm run build`).
  - **Verified Functionality:** Confirmed end-to-end operation across Location Explorer, Leaflet interactive mapping, cross-domain active location persistence, 2-location independent comparison, 9 intelligence domain views, and the grounded AI Assistant.

---

## 🛠️ Technology Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3.4
- **Maps:** Leaflet v1.9 & React Leaflet v4 with OpenStreetMap Tiles
- **Geocoding:** OSM Nominatim & Open-Meteo Geocoding
- **Weather & Solar Telemetry:** Open-Meteo Weather & Solar API
- **Air Quality:** Copernicus Atmosphere Monitoring Service (CAMS) via Open-Meteo
- **Hydrological Telemetry:** Copernicus GloFAS Daily River Discharge & ECMWF Land Surface Soil Moisture
- **Seismic Telemetry:** USGS Earthquake Hazards Program API
- **Socioeconomic Accounts:** World Bank Open Data API (National Scope)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Charts:** Recharts (visualization foundation)

---

## 📂 Project Architecture

```
Forge-2/
├── public/                 # Static public assets
├── src/
│   ├── components/
│   │   ├── common/         # Reusable UI primitives (Button, Card, MetricCard, SearchInput, StatusPill, etc.)
│   │   └── layout/         # Application shell (AppLayout, Sidebar, Header, MobileNav)
│   ├── data/               # Domain metadata, schemas, and indicator catalogs
│   ├── pages/              # Primary application views
│   │   ├── intelligence/   # 9 domain intelligence module views
│   │   ├── OverviewPage.tsx
│   │   ├── LocationExplorerPage.tsx
│   │   ├── CompareLocationsPage.tsx
│   │   ├── ResourceGapAnalysisPage.tsx
│   │   ├── ScenarioSimulatorPage.tsx
│   │   ├── AIAssistantPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── types/              # Domain TypeScript types & data integrity contracts
│   ├── App.tsx             # Route definitions & router configuration
│   ├── main.tsx            # Application entrypoint
│   └── index.css           # Tailwind base styles and custom scrollbars
├── index.html              # HTML template & metadata
├── tailwind.config.js      # Design tokens & color system
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite bundler configuration
└── package.json            # Dependencies & build scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18 (Tested on v24.13)
- npm >= 9

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`.

### Production Build & Type Checking

```bash
npm run typecheck
npm run build
```

---

## 🛡️ Data Transparency & Verification Tiers

AtlasIQ explicitly flags the verification origin of every indicator:
1. **Measured Data:** Directly verified via meteorological sensors or satellite telemetry.
2. **Statistical Estimate:** Derived through spatial interpolation or regression algorithms.
3. **Simulation / Model:** Prospective climatic or socioeconomic projections.
4. **Awaiting Location Input:** Unpopulated indicator awaiting target coordinate resolution.
