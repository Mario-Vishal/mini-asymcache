import { EngineConfig, PolicyConfig, WorkloadConfig, PolicyName, WorkloadType } from "./types";

export const POLICY_LIST: PolicyName[] = ["LRU", "LFU", "Position-aware", "Latency-aware"];

export const BASE_ENGINE_CONFIG: EngineConfig = {
  capacityMb: 512,
  blockSizeTokens: 256,
  prefillCostPerToken: 0.045,
  decodeCostPerToken: 0.065,
  recomputeCostPerToken: 0.08,
  cacheMissPenaltyPerMiss: 1.2,
  tokenToMemoryRatio: 0.00036,
  seed: 20260624
};

export const WORKLOAD_PRESETS: Record<WorkloadType, WorkloadConfig> = {
  "Short Chat": {
    workloadType: "Short Chat",
    numRequests: 32,
    avgPromptLength: 1280,
    avgOutputLength: 256,
    blockSizeTokens: 256,
    reuseProbability: 0.35
  },
  "Long Context": {
    workloadType: "Long Context",
    numRequests: 32,
    avgPromptLength: 20000,
    avgOutputLength: 384,
    blockSizeTokens: 256,
    reuseProbability: 0.25
  },
  "Mixed Production": {
    workloadType: "Mixed Production",
    numRequests: 36,
    avgPromptLength: 5600,
    avgOutputLength: 420,
    blockSizeTokens: 256,
    reuseProbability: 0.30
  }
};

export const POLICY_PRESETS: PolicyConfig[] = [
  { policyName: "LRU", alpha: 1, beta: 0, gamma: 0, delta: 0 },
  { policyName: "LFU", alpha: 0, beta: 1, gamma: 0, delta: 0 },
  { policyName: "Position-aware", alpha: 0.2, beta: 0.1, gamma: 0.2, delta: 0.5 },
  { policyName: "Latency-aware", alpha: 1, beta: 0.7, gamma: 1.2, delta: 1 }
];
