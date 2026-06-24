import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BASE_ENGINE_CONFIG, POLICY_PRESETS, WORKLOAD_PRESETS } from "./simulator/presets";
import { runSinglePolicy } from "./simulator/engine";
import { generateRequests } from "./simulator/workload";
import { PolicyName, SimulationOutput } from "./simulator/types";
import { Header } from "./components/Header";
import { ControlPanel } from "./components/ControlPanel";
import { ExplanationPanel } from "./components/ExplanationPanel";
import { CacheVisualizer } from "./components/CacheVisualizer";
import { RequestTimeline } from "./components/RequestTimeline";
import { PolicyComparisonTable } from "./components/PolicyComparisonTable";
import { MetricsCards } from "./components/MetricsCards";
import { InsightsPanel } from "./components/InsightsPanel";
import { ArchitectureDiagram } from "./components/ArchitectureDiagram";
import { ChartsPanel } from "./components/ChartsPanel";

interface RunState {
  outputs: SimulationOutput[];
  policy: string;
}

interface ControlState {
  workloadType: keyof typeof WORKLOAD_PRESETS;
  numRequests: number;
  capacityMb: number;
  blockSizeTokens: number;
  avgPromptLength: number;
  avgOutputLength: number;
  reuseProbability: number;
  selectedPolicy: PolicyName;
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
}

const defaultControls: ControlState = {
  workloadType: "Short Chat",
  numRequests: WORKLOAD_PRESETS["Short Chat"].numRequests,
  capacityMb: BASE_ENGINE_CONFIG.capacityMb,
  blockSizeTokens: BASE_ENGINE_CONFIG.blockSizeTokens,
  avgPromptLength: WORKLOAD_PRESETS["Short Chat"].avgPromptLength,
  avgOutputLength: WORKLOAD_PRESETS["Short Chat"].avgOutputLength,
  reuseProbability: WORKLOAD_PRESETS["Short Chat"].reuseProbability * 100,
  selectedPolicy: "Latency-aware",
  alpha: 1,
  beta: 0.7,
  gamma: 1.2,
  delta: 1
};

function deriveInsights(runs: SimulationOutput[]): string[] {
  if (runs.length === 0) {
    return ["Run the simulation to generate insights."];
  }

  const fastest = runs.reduce((best, current) => (current.result.totalLatencyMs < best.result.totalLatencyMs ? current : best));
  const leastRecompute = runs.reduce((best, current) => (current.result.recomputeCostMs < best.result.recomputeCostMs ? current : best));
  const highestHit = runs.reduce((best, current) => (current.result.hitRate > best.result.hitRate ? current : best));
  const tpotSpread = Math.max(...runs.map((run) => run.result.estimatedTPOTMs)) - Math.min(...runs.map((run) => run.result.estimatedTPOTMs));
  const ttftSpread = Math.max(...runs.map((run) => run.result.estimatedTTFTMs)) - Math.min(...runs.map((run) => run.result.estimatedTTFTMs));

  return [
    `${fastest.policy.policyName} reached the lowest total latency in this run.`,
    `${highestHit.policy.policyName} had the best hit rate, but ${
      fastest.policy.policyName === highestHit.policy.policyName ? "also" : "not always"
    } this was the fastest policy.`,
    `${leastRecompute.policy.policyName} reduced recompute cost the most.`,
    `TTFT spread was ${ttftSpread.toFixed(1)} ms.`,
    `TPOT spread was ${(tpotSpread).toFixed(2)} ms/token.`
  ];
}

const getBarData = (runs: SimulationOutput[]) => {
  if (runs.length === 0) {
    return [];
  }

  const bestLatency = Math.max(1, Math.min(...runs.map((run) => run.result.totalLatencyMs)));
  const bestRecompute = Math.max(1, Math.min(...runs.map((run) => run.result.recomputeCostMs)));
  const bestTpot = Math.max(1e-6, Math.min(...runs.map((run) => run.result.estimatedTPOTMs)));
  const bestTtft = Math.max(1e-6, Math.min(...runs.map((run) => run.result.estimatedTTFTMs)));

  return runs.map((run) => ({
    policy: run.policy.policyName,
    latency: Number(run.result.totalLatencyMs.toFixed(2)),
    hitRate: Number((run.result.hitRate * 100).toFixed(1)),
    recompute: Number(run.result.recomputeCostMs.toFixed(2)),
    memory: Number(run.result.avgMemoryUtilization.toFixed(2)),
    latencyGap: Number((run.result.totalLatencyMs - bestLatency).toFixed(2)),
    recomputeGap: Number((run.result.recomputeCostMs - bestRecompute).toFixed(2)),
    tpotGap: Number((run.result.estimatedTPOTMs - bestTpot).toFixed(2)),
    ttftGap: Number((run.result.estimatedTTFTMs - bestTtft).toFixed(2)),
    latencyIndex: Number(((run.result.totalLatencyMs / bestLatency) * 100).toFixed(1))
  }));
};

function almostEqual(a: number, b: number, epsilon = 1e-6): boolean {
  return Math.abs(a - b) <= epsilon;
}

function App() {
  const [controls, setControls] = useState<ControlState>(defaultControls);
  const [runState, setRunState] = useState<RunState | null>(null);

  const handleControlChange = (changes: Partial<ControlState>) => setControls((prev) => ({ ...prev, ...changes }));

  const runSimulation = (simulationControls: ControlState) => {
    const preset = WORKLOAD_PRESETS[simulationControls.workloadType];
    const requests = generateRequests(
      simulationControls.workloadType,
      simulationControls.numRequests,
      simulationControls.blockSizeTokens,
      BASE_ENGINE_CONFIG.seed,
      simulationControls.avgPromptLength || preset.avgPromptLength,
      simulationControls.avgOutputLength || preset.avgOutputLength,
      simulationControls.reuseProbability / 100
    );

    const outputs = POLICY_PRESETS.map((p) => {
      const policy = p.policyName === "Latency-aware"
        ? { ...p, alpha: simulationControls.alpha, beta: simulationControls.beta, gamma: simulationControls.gamma, delta: simulationControls.delta }
        : p;
      return runSinglePolicy({
        policy,
        requests,
        config: {
          ...BASE_ENGINE_CONFIG,
          capacityMb: simulationControls.capacityMb,
          blockSizeTokens: simulationControls.blockSizeTokens
        }
      });
    });

    setRunState({ outputs, policy: simulationControls.selectedPolicy });
  };

  const handleRunSimulation = () => {
    runSimulation(controls);
  };

  const handleRunStressPreset = () => {
    const stressedControls: ControlState = {
      ...controls,
      workloadType: "Mixed Production",
      numRequests: 96,
      capacityMb: 64,
      blockSizeTokens: 64,
      avgPromptLength: 5600,
      avgOutputLength: 420,
      reuseProbability: 12,
      selectedPolicy: "Latency-aware",
      alpha: 1,
      beta: 0.7,
      gamma: 1.2,
      delta: 1
    };

    setControls(stressedControls);
    runSimulation(stressedControls);
  };

  const handleReset = () => {
    setRunState(null);
    setControls(defaultControls);
  };

  const outputs = runState?.outputs ?? [];
  const selectedRun = outputs.find((run) => run.policy.policyName === runState?.policy);

  const metrics = useMemo(() => {
    if (!selectedRun) return null;
    return {
      hitRate: `${(selectedRun.result.hitRate * 100).toFixed(1)}%`,
      missRate: `${(selectedRun.result.missRate * 100).toFixed(1)}%`,
      recompute: `${selectedRun.result.recomputeCostMs.toFixed(1)} ms`,
      ttft: `${selectedRun.result.estimatedTTFTMs.toFixed(2)} ms`,
      tpot: `${selectedRun.result.estimatedTPOTMs.toFixed(2)} ms`,
      totalLatency: `${selectedRun.result.totalLatencyMs.toFixed(1)} ms`,
      peakMemory: `${selectedRun.result.peakMemoryMb.toFixed(2)} MB`
    };
  }, [selectedRun]);

  const memoryTimeline = useMemo(() => {
    if (!selectedRun) return [];
    return selectedRun.timeline.map((point) => ({
      name: `t${point.timestamp}`,
      memory: point.memoryUsedMb,
      latency: point.totalLatencyMs
    }));
  }, [selectedRun]);

  const comparisonData = useMemo(() => getBarData(outputs), [outputs]);
  const policyComparisonIsFlat = useMemo(() => {
    if (outputs.length <= 1) {
      return false;
    }

    const base = outputs[0].result;
    return !outputs.slice(1).some((run) => {
      const result = run.result;
      return (
        !almostEqual(result.hitRate, base.hitRate) ||
        !almostEqual(result.missRate, base.missRate) ||
        !almostEqual(result.totalLatencyMs, base.totalLatencyMs, 1e-4) ||
        !almostEqual(result.estimatedTTFTMs, base.estimatedTTFTMs, 1e-4) ||
        !almostEqual(result.estimatedTPOTMs, base.estimatedTPOTMs, 1e-4) ||
        !almostEqual(result.recomputeCostMs, base.recomputeCostMs, 1e-4) ||
        !almostEqual(result.avgMemoryUtilization, base.avgMemoryUtilization, 1e-6) ||
        !almostEqual(result.evictions, base.evictions, 1e-6)
      );
    });
  }, [outputs]);
  const insights = useMemo(() => deriveInsights(outputs), [outputs]);

  return (
    <div className="app-bg min-h-screen text-slateText">
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8">
        <div className="hero card glass">
          <h1 className="text-3xl font-bold text-white md:text-4xl">Mini-AsymCache</h1>
          <p className="mt-2 max-w-3xl text-sm text-cyan-100/90 md:text-base">
            A visual simulator for understanding KV-cache eviction, recomputation cost, and LLM serving latency.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs md:text-sm">
            {["GPU memory pressure", "Cache miss", "Recomputation", "TTFT", "TPOT"].map((segment) => (
              <span key={segment} className="badge">
                {segment}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <motion.section initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="card glass">
            <ControlPanel
              controls={controls}
              onChange={handleControlChange}
              onRun={handleRunSimulation}
              onReset={handleReset}
              onStressPreset={handleRunStressPreset}
            />
          </motion.section>

          <section className="space-y-4">
            <ExplanationPanel />
            {metrics && <MetricsCards metrics={metrics} />}
          </section>
        </div>

        {selectedRun && (
          <>
            <motion.section initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card glass">
              <h2 className="section-title">Cache Visualizer</h2>
              <CacheVisualizer
                blocks={selectedRun.finalBlocks}
                events={selectedRun.events}
                capacityMb={controls.capacityMb}
                totalEvictions={selectedRun.result.evictions}
              />
            </motion.section>

            <div className="grid gap-4 xl:grid-cols-2">
              <motion.section initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card glass">
                <h2 className="section-title">Request Timeline</h2>
                <RequestTimeline events={selectedRun.events} />
              </motion.section>

              <motion.section initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card glass">
                <h2 className="section-title">Architecture</h2>
                <ArchitectureDiagram />
              </motion.section>
            </div>

            <motion.section initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card glass">
              <h2 className="section-title">Policy Comparison</h2>
              {policyComparisonIsFlat ? (
                <div className="mb-3 rounded-lg border border-amber-300/35 bg-amber-300/10 px-3 py-2 text-xs text-amber-100 sm:text-sm">
                  All policies are currently identical because the run is not under enough cache pressure (or the difference is too small to detect).
                  <br />
                  The latency-aware sliders only change eviction behavior when evictions occur. Try the pressure preset above or reduce capacity / increase requests to expose differences.
                </div>
              ) : null}
              <PolicyComparisonTable runs={outputs} />
            </motion.section>

            <motion.section initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card glass">
              <h2 className="section-title">Charts</h2>
              <ChartsPanel comparisonData={comparisonData} memoryTimeline={memoryTimeline} />
            </motion.section>

            <motion.section initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card glass">
              <InsightsPanel insights={insights} />
            </motion.section>
          </>
        )}
      </main>
    </div>
  );
}

export { App };
export default App;
