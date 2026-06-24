import { PolicyResult } from "./types";

export function computePolicyResult(
  policyName: string,
  totalHits: number,
  totalMisses: number,
  totalRequests: number,
  recomputeTokens: number,
  recomputeCostMs: number,
  totalTTFT: number,
  totalLatencyMs: number,
  peakMemoryMb: number,
  memorySamples: number[],
  totalOutputTokens: number
): PolicyResult {
  const accesses = Math.max(1, totalHits + totalMisses);
  const avgMemoryUtilization = memorySamples.length
    ? memorySamples.reduce((sum, usage) => sum + usage, 0) / memorySamples.length
    : 0;
  const totalPenaltyPerOutput = totalOutputTokens > 0 ? totalLatencyMs / totalOutputTokens : 0;

  return {
    policyName: policyName as PolicyResult["policyName"],
    hitRate: totalHits / accesses,
    missRate: totalMisses / accesses,
    evictions: Math.max(0, totalMisses - totalRequests * 0.15),
    recomputeTokens,
    recomputeCostMs,
    estimatedTTFTMs: totalTTFT / totalRequests,
    estimatedTPOTMs: totalPenaltyPerOutput,
    totalLatencyMs,
    peakMemoryMb,
    avgMemoryUtilization
  };
}
