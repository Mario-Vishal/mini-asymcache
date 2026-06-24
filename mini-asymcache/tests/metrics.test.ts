import { describe, expect, it } from "vitest";
import { PolicyConfig, Request } from "../src/simulator/types";
import { runSinglePolicy } from "../src/simulator/engine";
import { normalizeWeights } from "../src/simulator/policies";

describe("metrics sanity", () => {
  it("never produces negative metrics", () => {
    const policy: PolicyConfig = normalizeWeights({
      policyName: "Position-aware",
      alpha: 0,
      beta: 0,
      gamma: 0,
      delta: 1
    });

    const reqs: Request[] = [
      {
        requestId: "r1",
        promptLength: 3000,
        outputLength: 100,
        reuseProbability: 0,
        accessPattern: "suffix-heavy",
        contextSegments: [
          {
            segmentId: "s1",
            segmentKey: "s1",
            startToken: 1,
            endToken: 3000,
            tokenCount: 3000,
            positionImportance: 0.9
          }
        ]
      }
    ];

    const out = runSinglePolicy({
      policy,
      requests: reqs,
      config: {
        capacityMb: 2,
        blockSizeTokens: 2,
        prefillCostPerToken: 0.045,
        decodeCostPerToken: 0.065,
        recomputeCostPerToken: 0.08,
        cacheMissPenaltyPerMiss: 1.2,
        tokenToMemoryRatio: 1,
        seed: 123
      }
    });

    const m = out.result;
    expect(m.hitRate).toBeGreaterThanOrEqual(0);
    expect(m.missRate).toBeGreaterThanOrEqual(0);
    expect(m.estimatedTTFTMs).toBeGreaterThanOrEqual(0);
    expect(m.estimatedTPOTMs).toBeGreaterThanOrEqual(0);
    expect(m.recomputeCostMs).toBeGreaterThanOrEqual(0);
    expect(m.totalLatencyMs).toBeGreaterThanOrEqual(0);
    expect(m.avgMemoryUtilization).toBeGreaterThanOrEqual(0);
  });
});
