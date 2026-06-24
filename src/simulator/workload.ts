import { ContextSegment, Request, WorkloadType } from "./types";

interface WorkloadRange {
  promptMin: number;
  promptMax: number;
  outputMin: number;
  outputMax: number;
  reuseRange: [number, number];
}

const WORKLOAD_RANGES: Record<WorkloadType, WorkloadRange> = {
  "Short Chat": {
    promptMin: 512,
    promptMax: 2048,
    outputMin: 128,
    outputMax: 512,
    reuseRange: [0.2, 0.55]
  },
  "Long Context": {
    promptMin: 8192,
    promptMax: 64000,
    outputMin: 256,
    outputMax: 1024,
    reuseRange: [0.05, 0.35]
  },
  "Mixed Production": {
    promptMin: 512,
    promptMax: 64000,
    outputMin: 128,
    outputMax: 1024,
    reuseRange: [0.1, 0.45]
  }
};

function lcg(seed: number) {
  let state = Math.abs(seed) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function pickWeighted<T>(items: T[], randomValue: number): T {
  return items[Math.floor(randomValue * items.length)];
}

export function generateRequests(
  workloadType: WorkloadType,
  numRequests: number,
  blockSizeTokens: number,
  seed = 1,
  avgPromptLength?: number,
  avgOutputLength?: number,
  avgReuse?: number
): Request[] {
  const rng = lcg(seed);
  const ranges = WORKLOAD_RANGES[workloadType];
  const requests: Request[] = [];
  const globalSegmentPool: ContextSegment[] = [];

  for (let requestIdx = 0; requestIdx < numRequests; requestIdx++) {
    let promptLength: number;
    if (workloadType === "Mixed Production") {
      const mix = rng();
      if (mix < 0.35) {
        promptLength = Math.round(600 + rng() * (2048 - 600));
      } else if (mix < 0.75) {
        promptLength = Math.round(2048 + rng() * (12000 - 2048));
      } else {
        promptLength = Math.round(12000 + rng() * (64000 - 12000));
      }
    } else {
      const basePrompt = avgPromptLength ?? (ranges.promptMin + ranges.promptMax) / 2;
      const span = Math.max(300, Math.min(ranges.promptMax - ranges.promptMin, basePrompt * 0.45));
      const lo = Math.max(ranges.promptMin, basePrompt - span);
      const hi = Math.min(ranges.promptMax, basePrompt + span);
      promptLength = Math.round(lo + rng() * (hi - lo));
    }

    const outputBase = avgOutputLength ?? (ranges.outputMin + ranges.outputMax) / 2;
    const outputSpan = Math.max(32, Math.min(ranges.outputMax - ranges.outputMin, outputBase * 0.45));
    const outputLo = Math.max(ranges.outputMin, outputBase - outputSpan);
    const outputHi = Math.min(ranges.outputMax, outputBase + outputSpan);
    const outputLength = Math.round(outputLo + rng() * (outputHi - outputLo));

    const reuseMean = avgReuse ?? (ranges.reuseRange[0] + ranges.reuseRange[1]) / 2;
    const jitter = rng() * 0.08;
    const reuseProbability = clamp(Math.min(ranges.reuseRange[1], Math.max(ranges.reuseRange[0], reuseMean + (jitter - 0.04))), 0, 1);
    const accessPatternSeed = rng();
    const accessPattern: Request["accessPattern"] = accessPatternSeed < 0.33 ? "prefix-heavy" : accessPatternSeed < 0.66 ? "balanced" : "suffix-heavy";

    const segmentCount = Math.max(2, Math.round(promptLength / blockSizeTokens));
    const segments: ContextSegment[] = [];
    let tokenCursor = 0;

    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
      const remaining = Math.max(1, promptLength - tokenCursor);
      const segmentTokens = segmentIndex === segmentCount - 1 ? remaining : Math.max(64, Math.round(remaining / (segmentCount - segmentIndex)));
      const startToken = tokenCursor + 1;
      const endToken = startToken + segmentTokens - 1;
      tokenCursor += segmentTokens;

      const positionImportance =
        workloadType === "Short Chat"
          ? (segmentIndex + 1) / segmentCount
          : workloadType === "Long Context"
            ? 0.35 + 0.65 * ((segmentIndex + 1) / segmentCount)
            : 0.2 + 0.8 * ((segmentIndex + 1) / segmentCount);

      const willReuse = rng() < reuseProbability && globalSegmentPool.length > 0;
      const segmentSeed = willReuse ? pickWeighted(globalSegmentPool, rng()) : undefined;
      const segmentKey = willReuse && segmentSeed ? segmentSeed.segmentKey : `req-${requestIdx}-seg-${segmentIndex}`;

      const segment: ContextSegment = {
        segmentId: segmentSeed ? segmentSeed.segmentId : `${requestIdx}-${segmentIndex}`,
        segmentKey,
        startToken,
        endToken,
        tokenCount: segmentTokens,
        positionImportance
      };

      segments.push(segment);
      if (rng() < 0.75 && globalSegmentPool.length < 1200) {
        globalSegmentPool.push(segment);
      }
    }

    requests.push({
      requestId: `req-${requestIdx}`,
      promptLength,
      outputLength: outputLength === 0 ? 1 : outputLength,
      contextSegments: segments,
      reuseProbability,
      accessPattern
    });
  }

  return requests;
}
