# 🌍 AirLens — Global Air Quality Intelligence Platform

**Real-time PM2.5 visualization on a 3D globe · Policy impact analysis across 66 countries · Satellite-based air quality estimation**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Try_AirLens-2ea44f?style=for-the-badge)](https://joymin5655.github.io/AirLens/)
> 🔗 **[Try AirLens Live →](https://joymin5655.github.io/AirLens/)**
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Data Pipeline](https://img.shields.io/badge/Data-Auto--updated-orange)](https://github.com/joymin5655/AirLens/actions)

---

## Why AirLens?

Air pollution is the world's largest environmental health risk, responsible for an estimated **6.7 million premature deaths annually** (WHO, 2024). Governments across the globe have implemented various policies to combat this crisis — from vehicle emission standards to industrial regulations, clean energy transitions to urban green zones.

**But how do we know if these policies actually work?**

Measuring the real impact of environmental policies is surprisingly difficult:
- **Natural variation** — air quality fluctuates due to weather, seasons, and geography
- **Multiple factors** — economic changes, population shifts, and neighboring countries' emissions all play a role
- **Data gaps** — over 90% of the world's population lives in areas without ground-based air quality monitors
- **Delayed effects** — policy impacts may take years to become statistically measurable

**AirLens addresses these challenges** by combining real-time sensor data, satellite observations, and statistical analysis to provide transparent, data-driven answers about whether environmental policies are making a real difference.

---

## What AirLens Does

### 🌐 3D Globe — See air quality everywhere, at a glance
Interactive Three.js globe displaying real-time PM2.5 levels from monitoring stations worldwide. Satellite AOD data fills in the gaps where ground sensors don't exist. Click any location for detailed readings and trends.

### 📊 Policy Impact Analysis — 66 countries, data-driven insights
Compare air quality before and after policy implementation across 66 countries. Difference-in-Differences (DID) methodology helps separate policy effects from natural variation. Each country profile includes policy timeline, PM2.5 trends, and change metrics.

### 📈 Today Dashboard — Your city, right now
Real-time city-level air quality cards with EPA-standard color coding, hourly sparklines, and WHO guideline comparisons. Know instantly whether the air you're breathing is safe.

### 📷 Camera AI — Estimate air quality from a photo *(Experimental)*
Upload a sky photo and receive an estimated air quality category. Deep learning analyzes haze patterns, visibility, and color — all processed in your browser. Your photo never leaves your device.

### 🛰️ Satellite Estimation — Where sensors can't reach
Satellite Aerosol Optical Depth (AOD) data, combined with weather conditions, provides PM2.5 estimates for regions with no ground monitoring. All estimates include uncertainty ranges.

---

## Data Sources

| Source | What it provides | Update |
|--------|-----------------|--------|
| [WAQI](https://waqi.info/) | Real-time AQI from 12,000+ stations | Daily (automated) |
| [OpenAQ](https://openaq.org/) | PM2.5 observation time series | Weekly (automated) |
| [NASA Earthdata](https://earthdata.nasa.gov/) | Satellite AOD imagery | Weekly (automated) |
| [Open-Meteo](https://open-meteo.com/) | Weather variables (temp, humidity, wind) | On-demand |
| [World Bank](https://data.worldbank.org/) | Country statistics (GDP, population) | Monthly |

All data collection is fully automated via **GitHub Actions** — no manual intervention required.

---

## Analysis Models — Why We Use Them

| # | Model | Why | Status |
|---|-------|-----|--------|
| 1 | **Policy Impact Analysis** | Statistically separates policy effects from natural PM2.5 variation using DID methodology | ✅ 66 countries |
| 2 | **Satellite → PM2.5** | Fills the global monitoring gap — 90%+ of the world lacks ground sensors | 🔬 Developing |
| 3 | **Camera AI** | Enables anyone with a smartphone to estimate air quality from a sky photo | ⚗️ Experimental |
| 4 | **Data Quality Score** | Not all sensor data is equally reliable — DQSS rates each source 0–100 | ✅ Active |
| 5 | **Bayesian Reliability** | Sensors degrade over time — tracks trustworthiness as data accumulates | 📋 Planned |
| 6 | **Anomaly Detection** | Auto-identifies sensor malfunctions and data errors before they skew results | 📋 Planned |

> ML training code and model artifacts are maintained in a private development workspace.

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
| **Data Pipeline** | Node.js + Python (automated) |

**No build step required** — pure ES modules served directly.

---

## Core Values

- **Transparency** — All data sources, uncertainties, and quality scores are explicitly shown
- **Scientific Integrity** — Predictions are presented as supplementary estimates, never as ground truth
- **Reproducibility** — Fixed seeds, version control, preprocessing logs
- **Honest Uncertainty** — Experimental features are clearly labeled; no fabricated metrics
- **Privacy** — Camera photos are processed in-browser only; no data is sent to any server

---

## License

MIT License — See [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>AirLens</strong> — Making air quality data accessible, transparent, and actionable.<br>
  <a href="https://joymin5655.github.io/AirLens/">🌐 Try the Live Demo</a>
</p>
