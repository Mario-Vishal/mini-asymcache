# Mini-AsymCache

<div align="center">

![Status](https://img.shields.io/badge/status-Active-success)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.18-339933?logo=node.js)](https://nodejs.org/)

**Mini-AsymCache** is a visual, browser-based simulator for understanding KV-cache eviction tradeoffs in LLM serving.

**Paper credit:** Multi-Segment Attention: Enabling Efficient KV-Cache Management for Faster Large Language Model Serving.  
**Paper link:** https://arxiv.org/search/?query=Multi-Segment%20Attention%3A%20Enabling%20Efficient%20KV-Cache%20Management%20for%20Faster%20Large%20Language%20Model%20Serving&searchtype=title&abstracts=show&order=-announced_date_first&size=10

![Mini-AsymCache main page](images/main-page.png)

![Cache visualizer](images/cache-visualizer.png)

</div>

![Policy comparison table](images/table.png)

![Performance charts](images/charts.png)

---

## Quick overview

Mini-AsymCache is a systems-focused simulator for LLM cache management tradeoffs.

- Fast onboarding and predictable local workflow.
- Policy-level analytics: latency, TTFT, TPOT, recompute, hits/misses, and memory.
- Tuning controls for latency-aware scoring parameters (alpha, beta, gamma, delta).
- Designed for understanding behavior, not for claiming production benchmark speedups.

---

## Why this project looks modern

- Clear dashboard sections with dedicated visualization areas.
- Data-driven comparison table and chart suite.
- Scenario-driven stress controls for reproducible behavior changes.
- Compact architecture and simulation docs for fast onboarding.
- Ready-to-read repo structure for contributors.

---

## What this project models

- Synthetic request generation and workload presets
- Request context segmentation and reuse simulation
- Cache hit/miss/insert/recompute/evict event lifecycle
- Eviction behavior for LRU, LFU, Position-aware, and Latency-aware policies
- Latency-aware weighted scoring for practical experimentation
- Visual policy deltas and timeline evolution

### Explicitly not modeled

- Real CUDA kernels or GPU attention kernels
- Production serving stacks (vLLM/TensorRT-LLM)
- Full real-time scheduling and cluster-level orchestration
- Exact benchmark parity with research prototypes

---

## Main sections in this repo

- Interactive simulator application
  - `src/` (UI + interactions + charts + visualizers)
- Simulation engine
  - `src/simulator/` (engine, workload generation, cache policies, metrics)
- Communication drafts
  - `articles/linkedin_post.md`
  - `articles/medium_draft.md`
- Supporting notes
  - `docs/paper_notes.md`
- Validation
  - `tests/policies.test.ts`

---

## Start in 60 seconds

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173/
```

Optional:

```bash
npm run build
npm run preview
npm test
```

---

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Vitest

---

## Repository map

```text
mini-asymcache/
  src/
    components/
      ArchitectureDiagram.tsx
      CacheVisualizer.tsx
      ChartsPanel.tsx
      ControlPanel.tsx
      ExplanationPanel.tsx
      Header.tsx
      InsightsPanel.tsx
      MetricsCards.tsx
      PolicyComparisonTable.tsx
      RequestTimeline.tsx
    simulator/
      cache.ts
      engine.ts
      metrics.ts
      policies.ts
      presets.ts
      types.ts
      workload.ts
    App.tsx
    main.tsx
    styles/
      index.css
  articles/
    linkedin_post.md
    medium_draft.md
  docs/
    paper_notes.md
  tests/
    policies.test.ts
  images/
    main-page.png
    table.png
    charts.png
    cache-visualizer.png
  package.json
  README.md
```

---

## Disclaimer

This project is an educational simulator inspired by asymmetric KV-cache management research.
It is intended for intuition building, not as an exact reproduction of research-grade serving systems.

