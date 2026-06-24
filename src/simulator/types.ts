export type PolicyName = "LRU" | "LFU" | "Position-aware" | "Latency-aware";

export type WorkloadType = "Short Chat" | "Long Context" | "Mixed Production";

export type EventType = "HIT" | "MISS" | "INSERT" | "EVICT" | "RECOMPUTE";

export interface ContextSegment {
  segmentId: string;
  segmentKey: string;
  startToken: number;
  endToken: number;
  tokenCount: number;
  positionImportance: number;
}

export interface Request {
  requestId: string;
  promptLength: number;
  outputLength: number;
  contextSegments: ContextSegment[];
  reuseProbability: number;
  accessPattern: "prefix-heavy" | "balanced" | "suffix-heavy";
}

export interface CacheBlock {
  blockId: string;
  requestId: string;
  segmentId: string;
  startToken: number;
  endToken: number;
  sizeMb: number;
  lastAccessTime: number;
  accessCount: number;
  recomputeCostMs: number;
  positionImportance: number;
  createdAt: number;
  status: "idle" | "hit" | "miss" | "insert" | "evict" | "recompute";
  segmentKey: string;
}

export interface CacheEvent {
  eventId: string;
  timestamp: number;
  requestId: string;
  blockId: string;
  policy: PolicyName;
  eventType: EventType;
  memoryUsedMb: number;
  latencyPenaltyMs: number;
  details?: string;
}

export interface PolicyResult {
  policyName: PolicyName;
  hitRate: number;
  missRate: number;
  evictions: number;
  recomputeTokens: number;
  recomputeCostMs: number;
  estimatedTTFTMs: number;
  estimatedTPOTMs: number;
  totalLatencyMs: number;
  peakMemoryMb: number;
  avgMemoryUtilization: number;
}

export interface PolicyConfig {
  policyName: PolicyName;
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
}

export interface EngineConfig {
  capacityMb: number;
  blockSizeTokens: number;
  prefillCostPerToken: number;
  decodeCostPerToken: number;
  recomputeCostPerToken: number;
  cacheMissPenaltyPerMiss: number;
  tokenToMemoryRatio: number;
  seed: number;
}

export interface SimulationMemoryPoint {
  timestamp: number;
  memoryUsedMb: number;
  totalLatencyMs: number;
}

export interface SimulationOutput {
  policy: PolicyConfig;
  events: CacheEvent[];
  timeline: SimulationMemoryPoint[];
  finalBlocks: CacheBlock[];
  result: PolicyResult;
}

export interface WorkloadConfig {
  workloadType: WorkloadType;
  numRequests: number;
  avgPromptLength: number;
  avgOutputLength: number;
  blockSizeTokens: number;
  reuseProbability: number;
}
