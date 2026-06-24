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
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-slate-200">
            <th className="p-2">Policy</th>
            <th className="p-2">Hit Rate</th>
            <th className="p-2">Miss Rate</th>
            <th className="p-2">Evictions</th>
            <th className="p-2">Recompute Cost</th>
            <th className="p-2">Estimated TTFT</th>
            <th className="p-2">Estimated TPOT</th>
            <th className="p-2">Total Latency</th>
            <th className="p-2">Memory Utilization</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.policy.policyName} className="border-t border-white/10">
              <td className="p-2 font-medium text-white">{run.policy.policyName}</td>
              <td className={`p-2 ${run.result.hitRate === bestBy.hitRate ? "font-bold text-emerald-300" : ""}`}>
                {(run.result.hitRate * 100).toFixed(1)}%
              </td>
              <td className={`p-2 ${run.result.missRate === bestBy.miss ? "font-bold text-cyan-300" : ""}`}>
                {(run.result.missRate * 100).toFixed(1)}%
              </td>
              <td className="p-2 text-right">{run.result.evictions}</td>
              <td className={`p-2 ${run.result.recomputeCostMs === bestBy.recompute ? "font-bold text-amber-300" : ""}`}>
                {run.result.recomputeCostMs.toFixed(2)} ms
              </td>
              <td className={`p-2 ${run.result.estimatedTTFTMs === bestBy.ttft ? "font-bold text-fuchsia-300" : ""}`}>
                {run.result.estimatedTTFTMs.toFixed(2)} ms
              </td>
              <td className={`p-2 ${run.result.estimatedTPOTMs === bestBy.tpot ? "font-bold text-blue-300" : ""}`}>
                {run.result.estimatedTPOTMs.toFixed(2)} ms
              </td>
              <td className={`p-2 ${run.result.totalLatencyMs === bestBy.latency ? "font-bold text-emerald-300" : ""}`}>
                {run.result.totalLatencyMs.toFixed(2)} ms
              </td>
              <td className={`p-2 ${run.result.avgMemoryUtilization === bestBy.mem ? "font-bold text-fuchsia-300" : ""}`}>
                {run.result.avgMemoryUtilization.toFixed(2)} MB
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
