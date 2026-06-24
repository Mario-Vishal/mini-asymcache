# Mini-AsymCache

Mini-AsymCache is a ready-to-run educational React + TypeScript simulator that visualizes how KV-cache eviction strategies affect serving latency in LLM inference.

It is intentionally pedagogical: the goal is to compare **latency-aware cache policy behavior**, not reproduce production GPU kernels.

## Demo idea

Run the app locally and simulate:
- Short chat workloads
- Long-context workloads
- Mixed production workloads

Use the control panel to compare:
- LRU
- LFU
- Position-aware
- Latency-aware (Asym-inspired)

## Setup

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev`: start Vite dev server
- `npm run build`: production build
- `npm run preview`: preview build
- `npm test`: run Vitest tests

## Architecture overview

- `src/simulator/` contains:
  - synthetic workload generation
  - cache block model
  - policy implementations
  - latency and event simulation engine
- `src/components/` contains dashboard views:
  - control panel, metrics, cache visualizer, timeline, charting, comparison table, and insights.
- Simulator outputs events for `HIT`, `MISS`, `INSERT`, `EVICT`, and `RECOMPUTE`.

## Policies implemented

- LRU: least recently used
- LFU: least frequently used
- Position-aware: prefers preserving high-importance segments
- Latency-aware Asym-inspired: weighted score

## Simulator assumptions

The simulator uses simple formulas for:
- token to memory conversion
- prefill and decode costs
- recomputation penalties
- TTFT and TPOT estimation
- memory pressure and cache misses

They are intentionally simplified and should be treated as **education-only estimates**.

## Metrics

- Hit rate
- Miss rate
- Evictions
- Recompute cost
- Estimated TTFT
- Estimated TPOT
- Total latency
- Peak memory and utilization

## Limitations

- No real CUDA kernels
- No vLLM/TensorRT-LLM integration
- No production scheduler / distributed runtime modeling
- Not a validated benchmark of a specific paper configuration

## Policy comparison claim disclaimer

This project is an educational simulator inspired by recent KV-cache management research. It is not a full reproduction of AsymCache and does not implement custom GPU kernels, production attention kernels, or real LLM serving internals.
