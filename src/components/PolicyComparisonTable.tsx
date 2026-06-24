import { SimulationOutput } from "../simulator/types";

interface Props {
  runs: SimulationOutput[];
}

export function PolicyComparisonTable({ runs }: Props) {
  if (runs.length === 0) {
    return <p className="text-sm text-slate-300">No runs yet. Start a simulation to view policy comparisons.</p>;
  }

  const bestBy = {
    hitRate: Math.max(...runs.map((run) => run.result.hitRate)),
    ttft: Math.min(...runs.map((run) => run.result.estimatedTTFTMs)),
    tpot: Math.min(...runs.map((run) => run.result.estimatedTPOTMs)),
    latency: Math.min(...runs.map((run) => run.result.totalLatencyMs)),
    recompute: Math.min(...runs.map((run) => run.result.recomputeCostMs)),
    miss: Math.min(...runs.map((run) => run.result.missRate)),
    mem: Math.min(...runs.map((run) => run.result.avgMemoryUtilization))
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="policy-table min-w-full text-sm">
        <thead>
          <tr>
            <th>Policy</th>
            <th>Hit Rate</th>
            <th>Miss Rate</th>
            <th>Evictions</th>
            <th>Recompute Cost</th>
            <th>Estimated TTFT</th>
            <th>Estimated TPOT</th>
            <th>Total Latency</th>
            <th>Memory Utilization</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.policy.policyName}>
              <td className="font-medium text-white">{run.policy.policyName}</td>
              <td className={`${run.result.hitRate === bestBy.hitRate ? "font-semibold text-emerald-300" : ""}`}>
                {(run.result.hitRate * 100).toFixed(1)}%
              </td>
              <td className={`${run.result.missRate === bestBy.miss ? "font-semibold text-cyan-300" : ""}`}>
                {(run.result.missRate * 100).toFixed(1)}%
              </td>
              <td>{run.result.evictions}</td>
              <td className={`${run.result.recomputeCostMs === bestBy.recompute ? "font-semibold text-amber-300" : ""}`}>
                {run.result.recomputeCostMs.toFixed(2)} ms
              </td>
              <td className={`${run.result.estimatedTTFTMs === bestBy.ttft ? "font-semibold text-fuchsia-300" : ""}`}>
                {run.result.estimatedTTFTMs.toFixed(2)} ms
              </td>
              <td className={`${run.result.estimatedTPOTMs === bestBy.tpot ? "font-semibold text-blue-300" : ""}`}>
                {run.result.estimatedTPOTMs.toFixed(2)} ms
              </td>
              <td className={`${run.result.totalLatencyMs === bestBy.latency ? "font-semibold text-emerald-300" : ""}`}>
                {run.result.totalLatencyMs.toFixed(2)} ms
              </td>
              <td className={`${run.result.avgMemoryUtilization === bestBy.mem ? "font-semibold text-fuchsia-300" : ""}`}>
                {run.result.avgMemoryUtilization.toFixed(2)} MB
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}