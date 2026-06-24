# Mini-AsymCache

Mini-AsymCache is a browser-based simulator for KV-cache behavior in LLM serving workflows.

### Credits

This simulator is inspired by ideas from the paper:
- [Multi-Segment Attention: Enabling Efficient KV-Cache Management for Faster Large Language Model Serving (AsymCache)](https://arxiv.org/abs/2606.02964)

The original paper's work on latency-aware policy design and position-aware recomputation is reflected in the simulator's educational model and policy comparison workflow.

It models request streams, memory pressure, recomputation, and latency-sensitive cache decisions so you can compare eviction policies and visualize tradeoffs visually before implementing a production strategy.

The project is intentionally educational and structured for readability and experimentation, not production infrastructure.

## Demo

- URL: open the app from local dev server at `http://localhost:5173/`
- Inputs: workloads, capacity, block size, prompt/output mix, and policy weights
- Outputs: cache timeline, hit/miss behavior, estimated TTFT/TPOT, policy table, and recommendation summaries

## Repository layout

- `src/` core TypeScript/React app
  - `src/components/` dashboard UI (controls, charts, timeline, table, metrics cards, visualizer)
  - `src/simulator/` simulation engine (workload, cache model, policies, metrics)
- `tests/` Vitest coverage for policies, cache behavior, and metrics
- `articles/` drafted LinkedIn and Medium content for project communication
- `docs/` research notes and architecture references
- `dist/` generated production build artifacts (ignored by default in CI workflows unless needed)

## Local setup

```bash
npm install
npm run dev
```

## Available scripts

```bash
npm run dev      # start Vite dev server
npm run build    # compile production build
npm run preview  # serve compiled output locally
npm test         # run Vitest suite
```

## Scope of this implementation

- Build a browser-friendly, interactive simulator that demonstrates how different cache eviction policies respond to workload mix changes.
- Implement configurable workloads and policy knobs (`alpha`, `beta`, `gamma`, `delta`) for latency-aware exploration.
- Provide event-level visibility (`HIT`, `MISS`, `INSERT`, `EVICT`, `RECOMPUTE`) and summary metrics for TTFT, TPOT, and pressure-driven behavior.
- Support side-by-side policy comparison on identical generated request streams.

## What is not covered (out of scope)

- Reproducing AsymCache GPU kernels, CUDA kernels, or low-level inference engine integration.
- Full integration with production serving stacks (vLLM, TensorRT-LLM, TRT, etc.).
- Real profiling on GPUs / real model checkpoints / real hardware scheduling behavior.
- Exact implementation details and optimizations from the original paper (this is intentionally an educational approximation).
- Benchmark claims as a validated systems reproduction; numbers are simulation-based estimates for teaching and comparison.

## Policies implemented

- `LRU` – least recently used
- `LFU` – least frequently used
- `Position-aware` – preserves valuable positional segments
- `Latency-aware` – score-based policy with tunable `alpha`, `beta`, `gamma`, and `delta`

## Metrics

- Hit rate
- Miss rate
- Eviction and recomputation counts
- Estimated TTFT and TPOT
- Request latency components and peak memory pressure

## Technical assumptions

- Token-to-memory model is a simplified educational approximation.
- Recomputation and serving costs are estimated, not measured from real inference backends.
- Cache events are logged as: `HIT`, `MISS`, `INSERT`, `EVICT`, `RECOMPUTE`.
- Results are for comparison and teaching, not a direct production benchmark of any single paper or library implementation.

## Publishing this repository on GitHub

This repo was intentionally created to keep implementation and communication assets together:

- code-first app in the root (no extra nested project wrapper)
- clean, searchable file layout
- reproducible setup in `package.json`

## Contributing

Contributions are welcome in the form of:

- new workload presets
- policy variants
- metric extensions
- UI/UX clarity improvements

---

License and governance notes: this project is educational by design and can be forked/modded freely unless otherwise configured by the maintainer.
