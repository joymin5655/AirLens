# 🌍 AirLens — Global Air Quality Intelligence Platform

**Real-time PM2.5 visualization on a 3D globe · Policy impact analysis across 68 countries · Satellite-based air quality estimation**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-GitHub_Pages-2ea44f)](https://joymin5655.github.io/AirLens/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Data Pipeline](https://img.shields.io/badge/Data-Auto--updated-orange)](https://github.com/joymin5655/AirLens/actions)

---

## What is AirLens?

AirLens is a web-based platform that visualizes global air quality (PM2.5) data on an interactive 3D globe, analyzes the effectiveness of environmental policies using data-driven methods, and provides satellite-based PM2.5 estimates for regions lacking ground sensors.

Built entirely with public, open-access data sources and hosted on GitHub Pages at zero cost.

---

## Features

### 🌐 3D Globe Visualization
Interactive Three.js globe displaying real-time PM2.5 levels from thousands of monitoring stations worldwide. Click any station to view detailed air quality data with 7-day trend sparklines.
### 📊 Policy Impact Analysis
Pre/Post comparison of air quality changes across **68 countries** with policy intervention data. Each country profile includes policy timeline, PM2.5 trends, and statistical change metrics (DID-lite methodology).

### 📈 Today Dashboard
Real-time city-level air quality cards with EPA-standard color coding, hourly sparklines, and WHO guideline comparison.

### 📷 Camera AI (Experimental)
Image-based air quality classification using deep learning. Upload a photo and receive an estimated air quality category — clearly marked as experimental.

### 🛰️ Satellite AOD Layer
Aerosol Optical Depth (AOD) data from NASA Earthdata overlaid on the globe, providing supplementary air quality estimates for sensor-sparse regions.

### 🌐 Multi-language Support
EN · KO · JA · ZH · ES · FR

---

## Data Sources

| Source | Type | Update Frequency |
|--------|------|-----------------|
| [WAQI](https://waqi.info/) | Real-time AQI from 12,000+ stations | Daily (automated) |
| [OpenAQ](https://openaq.org/) | PM2.5 observation time series | Weekly (automated) |
| [NASA Earthdata](https://earthdata.nasa.gov/) | MAIAC AOD satellite imagery | Weekly (automated) |
| [Open-Meteo](https://open-meteo.com/) | Weather variables (temp, humidity, wind) | On-demand |
| [World Bank](https://data.worldbank.org/) | Country statistics (GDP, population) | Monthly |

All data collection is automated via **GitHub Actions** — no manual intervention required.
---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **3D Visualization** | Three.js (WebGL) |
| **Charts** | Chart.js |
| **Styling** | Tailwind CSS |
| **Architecture** | Vanilla ES6 Modules, Mixin pattern |
| **CI/CD** | GitHub Actions |
| **Hosting** | GitHub Pages |
| **Data Pipeline** | Node.js (WAQI), Python (OpenAQ, Earthdata) |

**No build step required** — pure ES modules served directly.

---

## Project Structure

```
AirLens/
├── app/                        # Main application
│   ├── index.html              # Landing / Today dashboard
│   ├── globe.html              # 3D Globe (core page)
│   ├── policy.html             # Policy analysis (68 countries)
│   ├── camera.html             # Camera AI (experimental)
│   ├── settings.html           # User preferences
│   ├── about.html              # Project info & methodology
│   ├── js/
│   │   ├── utils/config.js     # Centralized configuration
│   │   ├── services/           # Data service layer
│   │   ├── globe/              # Globe modules (8 mixins)
│   │   └── analysis/           # ML analysis modules
│   ├── css/                    # Stylesheets (5 files)
│   └── data/                   # Static JSON data (~85 files)
│       ├── waqi/               # Real-time WAQI data
│       ├── openaq/             # OpenAQ time series
│       ├── earthdata/          # NASA AOD samples
│       ├── policy-impact/      # 68 country policy JSONs
│       └── predictions/        # ML prediction grid
├── scripts/                    # Data collection scripts
│   ├── fetch-waqi-data.js      # WAQI fetcher (Node.js)
│   └── python/                 # OpenAQ, Earthdata, policy builders
├── .github/workflows/          # CI/CD pipelines
│   ├── deploy.yml              # GitHub Pages deployment
│   └── update_airdata.yml      # Automated data collection
├── index.html                  # Root redirect → app/
└── package.json
```

**Codebase:** ~60 JS files, ~15,500 lines | ~85 JSON data files | 68 country policy datasets
---

## Architecture Highlights

**Centralized Configuration** — All thresholds, API endpoints, EPA/WHO standards, and cache TTLs consolidated in a single `config.js`. Zero hardcoded values across the codebase.

**Mixin-based Globe** — The 3D globe is decomposed into 8 composable modules (core, earth, markers, data, UI, charts, layers, interaction) following a mixin pattern for maintainability.

**Service Layer** — `fusionService.js` merges data from WAQI, OpenAQ, Earthdata, and Open-Meteo into a unified format with intelligent caching and fallback handling.

**Automated Data Pipeline** — GitHub Actions workflows run on schedule to fetch fresh data, commit to the repo, and trigger automatic redeployment.

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/joymin5655/AirLens.git
cd AirLens

# Serve locally (any static server works)
npx http-server app -p 8080

# Or use the included script
./serve_local.sh
```

Then open `http://localhost:8080` in your browser.

> **Note:** Some features (WAQI real-time data) require API tokens configured as environment variables. The app gracefully falls back to cached/static data when tokens are unavailable.
---

## ML Models & Analysis (Development)

AirLens includes 6 ML models/engines developed in a separate local workspace:

| # | Model | Status | Target Method |
|---|-------|--------|---------------|
| 1 | AOD → PM2.5 Estimation | Temporary linear regression | XGBoost Quantile + GTWR |
| 2 | Policy Impact Analysis | DID-lite (68 countries) ✅ | Synthetic DID |
| 3 | Camera AI | Experimental (DINOv2) | DINOv2-Reg + PINN + CORN |
| 4 | Data Quality Score (DQSS) | Rule-based 5-component | PARAAD Bi-LSTM |
| 5 | Bayesian Reliability | Designed | Beta distribution + BNN |
| 6 | Anomaly Detection | Designed | Deep iForest + LSTM-AE |

ML training code, notebooks, and model artifacts are maintained in a private development workspace and are not included in this repository.

---

## Automated Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `deploy.yml` | Push to `main` | Deploy to GitHub Pages |
| `update_airdata.yml` | Daily / Weekly schedule | Fetch WAQI, OpenAQ, Earthdata |

Data pipelines use sequential job execution with retry logic to prevent conflicts.

---

## Core Values

- **Transparency** — All data sources, uncertainties, and quality scores are explicitly shown
- **Scientific Integrity** — Predictions are presented as supplementary estimates, never as ground truth
- **Reproducibility** — Fixed seeds, version control, preprocessing logs
- **Honest Uncertainty** — Experimental features are clearly labeled; no fabricated metrics

---

## License

MIT License — See [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>AirLens</strong> — Making air quality data accessible, transparent, and actionable.
</p>