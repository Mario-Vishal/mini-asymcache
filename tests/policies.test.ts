import { describe, expect, it } from "vitest";
import { PolicyConfig } from "../src/simulator/types";
import { runSinglePolicy } from "../src/simulator/engine";
import { normalizeWeights } from "../src/simulator/policies";

const baseConfig = {
  capacityMb: 4,
  blockSizeTokens: 2,
  prefillCostPerToken: 0.045,
  decodeCostPerToken: 0.065,
  recomputeCostPerToken: 0.08,
  cacheMissPenaltyPerMiss: 1.2,
  tokenToMemoryRatio: 1,
  seed: 1
};

function req(
  id: string,
  segmentId: string,
  tokenCount: number,
  start = 1,
  positionImportance = 0.5
) {
  return {
    requestId: id,
    promptLength: tokenCount,
    outputLength: 16,
    accessPattern: "balanced" as const,
    reuseProbability: 0,
    contextSegments: [
      {
        segmentId,
        segmentKey: segmentId,
        startToken: start,
        endToken: start + tokenCount - 1,
        tokenCount,
        positionImportance
      }
    ]
  };
}

describe("cache eviction policies", () => {
  it("LRU evicts least-recently-used block", () => {
    const policy: PolicyConfig = normalizeWeights({
      policyName: "LRU",
      alpha: 1,
      beta: 0,
      gamma: 0,
      delta: 0
    });

    const requests = [req("r1", "A", 2), req("r2", "B", 2), req("r1", "A", 2), req("r3", "C", 2)];
    const out = runSinglePolicy({ policy, requests, config: baseConfig });
    const blockIds = out.finalBlocks.map((b) => b.segmentKey);
    expect(blockIds.includes("A")).toBe(true);
    expect(blockIds.includes("B")).toBe(false);
    expect(blockIds.includes("C")).toBe(true);
  });

  it("LFU evicts least-frequently-used block", () => {
    const policy: PolicyConfig = normalizeWeights({
      policyName: "LFU",
      alpha: 0,
      beta: 1,
      gamma: 0,
      delta: 0
    });

    const requests = [req("r1", "A", 2), req("r1", "A", 2), req("r2", "B", 2), req("r3", "C", 2)];
    const out = runSinglePolicy({ policy, requests, config: baseConfig });
    const blockIds = out.finalBlocks.map((b) => b.segmentKey);
    expect(blockIds.includes("A")).toBe(true);
    expect(blockIds.includes("B")).toBe(false);
    expect(blockIds.includes("C")).toBe(true);
  });

  it("latency-aware keeps high recompute-cost blocks", () => {
    const policy: PolicyConfig = normalizeWeights({
      policyName: "Latency-aware",
      alpha: 1,
      beta: 0.8,
      gamma: 2,
      delta: 0.5
    });

    const requests = [
      req("r1", "low", 2, 1, 0.2),
      req("r2", "high", 2, 1, 0.95),
      req("r3", "mid", 2, 1, 0.2)
    ];
    const out = runSinglePolicy({ policy, requests, config: baseConfig });
    const remaining = out.finalBlocks.map((b) => b.segmentKey);
    expect(remaining.includes("high")).toBe(true);
    expect(remaining.includes("mid")).toBe(true);
    expect(remaining.includes("low")).toBe(false);
  });
});
