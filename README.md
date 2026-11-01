# AtlasIQ — Every Place. Deeper Intelligence.

> An AI-powered geospatial and location intelligence platform built for the FORGE Hackathon.

AtlasIQ aggregates multi-sector planetary indicators—from climate resilience and groundwater stress to renewable energy yield, socioeconomic health, and transportation access—to help planners, researchers, and enterprises evaluate locations with empirical rigor.

---

## 🧭 Project Roadmap

- **Phase 1: Project Foundation, Premium UI & Frontend Stability** *(Current Phase)*
  - Establish Vite + React + TypeScript + Tailwind CSS application shell.
  - Implement full responsive sidebar navigation and unified page layouts.
  - Deliver Overview, Location Explorer, 9 Domain Modules, Comparative, Scenario, and Assistant views with honest empty states and data transparency standards.
- **Phase 2: Geocoding & Interactive Geospatial Mapping** *(Prompt 2)*
  - Integrate Leaflet / React-Leaflet interactive map, Nominatim geocoding, and Open-Meteo live weather & climate telemetry.
- **Phase 3: Multi-Location Comparison & Normalized Benchmarking** *(Prompt 3)*
  - Side-by-side indicator deltas, radar charts, and comparative percentile distributions.
- **Phase 4: Grounded AI Location Assistant** *(Prompt 4)*
  - LLM integration with function calling and citations grounded in verified telemetry.
- **Phase 5: Resource Gap Analysis & Scenario Stress Testing** *(Prompt 5)*
  - Algorithmic commodity balance models and forward projection simulation engines.
- **Phase 6: Production Hardening, Caching & Deployment** *(Prompt 6)*
  - Edge optimization, response caching, performance auditing, and final verification.

---

## 🛠️ Technology Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3.4
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
