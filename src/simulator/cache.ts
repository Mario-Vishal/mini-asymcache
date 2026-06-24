import { CacheBlock, PolicyConfig } from "./types";

function safeDenominator(value: number): number {
  return value <= 0 ? 1 : value;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function computeEvictionScore(block: CacheBlock, blocks: CacheBlock[], policy: PolicyConfig, now: number): number {
  if (policy.policyName === "LRU") {
    return block.lastAccessTime;
  }

  if (policy.policyName === "LFU") {
    return block.accessCount;
  }

  if (policy.policyName === "Position-aware") {
    return 1 - block.positionImportance;
  }

  const maxRecency = now - Math.min(...blocks.map((b) => b.lastAccessTime));
  const maxFreq = Math.max(...blocks.map((b) => b.accessCount));
  const maxRecompute = Math.max(...blocks.map((b) => b.recomputeCostMs));
  const maxPosition = Math.max(...blocks.map((b) => b.positionImportance));

  const recencyNorm = clamp01((now - block.lastAccessTime) / safeDenominator(maxRecency));
  const freqNorm = clamp01((maxFreq - block.accessCount + 1) / safeDenominator(maxFreq));
  const recomputeNorm = clamp01(block.recomputeCostMs / safeDenominator(maxRecompute));
  const positionNorm = clamp01((maxPosition - block.positionImportance + 1) / safeDenominator(maxPosition));

  return (
    policy.alpha * recencyNorm +
    policy.beta * freqNorm +
    policy.gamma * recomputeNorm +
    policy.delta * positionNorm
  );
}

export function pickEvictionCandidate(blocks: CacheBlock[], policy: PolicyConfig, now: number): CacheBlock | null {
  if (blocks.length === 0) {
    return null;
  }

  let best = blocks[0];
  let bestScore = computeEvictionScore(best, blocks, policy, now);

  for (const block of blocks.slice(1)) {
    const score = computeEvictionScore(block, blocks, policy, now);
    if (score < bestScore) {
      best = block;
      bestScore = score;
    }
  }

  return best;
}
