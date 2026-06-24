import { describe, expect, it } from "vitest";
import { PolicyConfig } from "../src/simulator/types";
import { runSinglePolicy } from "../src/simulator/engine";
import { normalizeWeights } from "../src/simulator/policies";

describe("cache capacity behavior", () => {
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

  const requestTemplate = (id: string, segmentId: string, tokenCount: number, start = 1) => ({
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
        positionImportance: 0.5
      }
    ]
  });

  it("respects configured capacity", () => {
    const reqs = [
      requestTemplate("r1", "s1", 3),
      requestTemplate("r2", "s2", 3),
      requestTemplate("r3", "s3", 3)
    ];
    const policy: PolicyConfig = normalizeWeights({
      policyName: "LRU",
      alpha: 1,
      beta: 0,
      gamma: 0,
      delta: 0
    });
    const out = runSinglePolicy({ policy, requests: reqs, config: baseConfig });
    expect(out.result.peakMemoryMb).toBeLessThanOrEqual(baseConfig.capacityMb + 1e-6);
    expect(out.result.avgMemoryUtilization).toBeLessThanOrEqual(baseConfig.capacityMb);
  });
});
