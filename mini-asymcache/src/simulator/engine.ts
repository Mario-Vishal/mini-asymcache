import {
  CacheBlock,
  CacheEvent,
  EngineConfig,
  EventType,
  PolicyConfig,
  PolicyResult,
  Request,
  SimulationMemoryPoint,
  SimulationOutput
} from "./types";
import { computePolicyResult } from "./metrics";
import { pickEvictionCandidate } from "./cache";

let globalEventCounter = 0;

export interface SimulatorRunInput {
  policy: PolicyConfig;
  requests: Request[];
  config: EngineConfig;
}

export interface SimulatorRun {
  output: SimulationOutput;
}

function blockIdFromSegment(requestId: string, segmentKey: string) {
  return `${requestId}-${segmentKey}`;
}

function statusForEvent(eventType: EventType): CacheBlock["status"] {
  switch (eventType) {
    case "HIT":
      return "hit";
    case "MISS":
      return "miss";
    case "INSERT":
    case "RECOMPUTE":
      return "recompute";
    case "EVICT":
      return "evict";
    default:
      return "idle";
  }
}

function createCacheEvent(
  requestId: string,
  blockId: string,
  policy: PolicyConfig["policyName"],
  eventType: EventType,
  now: number,
  memoryUsedMb: number,
  latencyPenaltyMs: number,
  details?: string
): CacheEvent {
  globalEventCounter += 1;
  return {
    eventId: `evt-${globalEventCounter}`,
    timestamp: now,
    requestId,
    blockId,
    policy,
    eventType,
    memoryUsedMb,
    latencyPenaltyMs,
    details
  };
}

function blockSizeMb(tokenCount: number, config: EngineConfig) {
  return Math.max(0.5, tokenCount * config.tokenToMemoryRatio);
}

export function runSinglePolicy({ policy, requests, config }: SimulatorRunInput): SimulationOutput {
  const cache = new Map<string, CacheBlock>();
  const events: CacheEvent[] = [];
  const timeline: SimulationMemoryPoint[] = [];
  const memorySamples: number[] = [];
  let now = 0;

  let totalHits = 0;
  let totalMisses = 0;
  let totalRecomputeTokens = 0;
  let totalRecomputeCost = 0;
  let totalTTFT = 0;
  let totalOutputTokens = 0;
  let totalLatency = 0;
  let totalEvictions = 0;
  let peakMemoryMb = 0;

  for (const request of requests) {
    const requestBasePrefillMs = request.promptLength * config.prefillCostPerToken;
    const requestOutputTokens = request.outputLength;
    const requestBaseDecodeMs = requestOutputTokens * config.decodeCostPerToken;
    const currentEvents: CacheEvent[] = [];
    let requestRecomputeCost = 0;
    let missCount = 0;

    for (const segment of request.contextSegments) {
      now++;
      const key = `${segment.segmentKey}`;
      const blockId = blockIdFromSegment(request.requestId, key);
      const existing = cache.get(key);

      if (existing) {
        existing.lastAccessTime = now;
        existing.accessCount += 1;
        existing.status = "hit";
        totalHits += 1;
        const event = createCacheEvent(
          request.requestId,
          existing.blockId,
          policy.policyName,
          "HIT",
          now,
          memoryUsed(cache),
          0,
          `request=${request.requestId}, segment=${segment.segmentId}`
        );
        events.push(event);
        currentEvents.push(event);
        continue;
      }

      missCount++;
      totalMisses += 1;
      const missTokens = segment.tokenCount;
      const recomputeCostMs = missTokens * config.recomputeCostPerToken * (1 + segment.positionImportance);
      requestRecomputeCost += recomputeCostMs;
      totalRecomputeCost += recomputeCostMs;
      totalRecomputeTokens += missTokens;

      const newBlock: CacheBlock = {
        blockId,
        requestId: request.requestId,
        segmentId: segment.segmentId,
        segmentKey: key,
        startToken: segment.startToken,
        endToken: segment.endToken,
        sizeMb: blockSizeMb(segment.tokenCount, config),
        lastAccessTime: now,
        accessCount: 1,
        recomputeCostMs,
        positionImportance: segment.positionImportance,
        createdAt: now,
        status: "miss"
      };
      cache.set(key, newBlock);

      const missEvent = createCacheEvent(request.requestId, blockId, policy.policyName, "MISS", now, 0, 0, "cache miss");
      const insertEvent = createCacheEvent(
        request.requestId,
        blockId,
        policy.policyName,
        "INSERT",
        now,
        memoryUsed(cache),
        recomputeCostMs,
        "inserted from synthetic miss"
      );
      events.push(missEvent, insertEvent);
      currentEvents.push(missEvent, insertEvent);

      let recomputeEvent = createCacheEvent(
        request.requestId,
        blockId,
        policy.policyName,
        "RECOMPUTE",
        now,
        memoryUsed(cache),
        recomputeCostMs,
        `segment=${segment.segmentId}`
      );

      events.push(recomputeEvent);
      currentEvents.push(recomputeEvent);

      while (memoryUsed(cache) > config.capacityMb) {
        const blocks = Array.from(cache.values());
        const victim = pickEvictionCandidate(blocks, policy, now);
        if (!victim) {
          break;
        }

        cache.delete(victim.segmentKey);
        totalEvictions++;
        const evictEvent = createCacheEvent(
          request.requestId,
          victim.blockId,
          policy.policyName,
          "EVICT",
          now,
          memoryUsed(cache),
          0,
          "evicted for capacity"
        );
        events.push(evictEvent);
        currentEvents.push(evictEvent);
      }
    }

    const requestMissPenalty = missCount * config.cacheMissPenaltyPerMiss;
    const ttftMs = requestBasePrefillMs + requestRecomputeCost + requestMissPenalty;
    const tpotMs = request.outputLength > 0 ? requestBaseDecodeMs / request.outputLength + requestMissPenalty / request.outputLength : requestBaseDecodeMs;
    const requestLatencyMs = ttftMs + request.outputLength * tpotMs;

    totalTTFT += ttftMs;
    totalLatency += requestLatencyMs;
    totalOutputTokens += requestOutputTokens;

    for (const segment of request.contextSegments) {
      timeline.push({
        timestamp: now,
        memoryUsedMb: memoryUsed(cache),
        totalLatencyMs: totalLatency
      });
      memorySamples.push(memoryUsed(cache));
      peakMemoryMb = Math.max(peakMemoryMb, memoryUsed(cache));
    }
  }

  const result = computePolicyResult(
    policy.policyName,
    totalHits,
    totalMisses,
    requests.length,
    totalRecomputeTokens,
    totalRecomputeCost,
    totalTTFT,
    totalLatency,
    peakMemoryMb,
    memorySamples,
    totalOutputTokens
  );

  return {
    policy,
    events,
    timeline,
    finalBlocks: Array.from(cache.values()),
    result: {
      ...result,
      evictions: totalEvictions
    }
  };
}

function memoryUsed(cache: Map<string, CacheBlock>): number {
  let total = 0;
  for (const block of cache.values()) {
    total += block.sizeMb;
  }
  return Number(total.toFixed(4));
}
