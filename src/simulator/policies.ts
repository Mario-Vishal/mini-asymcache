import { PolicyConfig, PolicyName } from "./types";

export const POLICY_DESCRIPTIONS: Record<PolicyName, string> = {
  LRU: "Evict least recently used block",
  LFU: "Evict least frequently used block",
  "Position-aware": "Evict lower-importance segments first",
  "Latency-aware": "Evict blocks with lowest latency-aware weighted score"
};

export function normalizeWeights(weights: Partial<PolicyConfig>): PolicyConfig {
  return {
    policyName: weights.policyName ?? "Latency-aware",
    alpha: weights.alpha ?? 1,
    beta: weights.beta ?? 1,
    gamma: weights.gamma ?? 1,
    delta: weights.delta ?? 1
  };
}
