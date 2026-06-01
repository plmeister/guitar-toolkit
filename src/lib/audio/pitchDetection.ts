export type PitchResult = {
  frequency: number;
  confidence: number;
};

export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
): PitchResult | null {
  const rms = calculateRms(buffer);

  if (rms < 0.01) {
    return null;
  }

  const minFreq = 70;
  const maxFreq = 400;

  const minPeriod = Math.floor(sampleRate / maxFreq);
  const maxPeriod = Math.floor(sampleRate / minFreq);

  const tauEstimate = yinDifference(buffer, minPeriod, maxPeriod);

  if (!tauEstimate) {
    return null;
  }

  const frequency = sampleRate / tauEstimate.period;

  return {
    frequency,
    confidence: tauEstimate.confidence,
  };
}

/**
 * Simplified YIN-style difference search
 */
function yinDifference(
  buffer: Float32Array,
  minTau: number,
  maxTau: number,
): { period: number; confidence: number } | null {
  const n = buffer.length;

  let bestTau = -1;
  let bestScore = Infinity;

  for (let tau = minTau; tau <= maxTau; tau++) {
    let sum = 0;

    for (let i = 0; i < n - tau; i++) {
      const d = buffer[i] - buffer[i + tau];
      sum += d * d;
    }

    const score = sum / (n - tau);

    if (score < bestScore) {
      bestScore = score;
      bestTau = tau;
    }
  }

  if (bestTau === -1) {
    return null;
  }

  // crude but effective confidence measure
  const confidence = Math.max(0, 1 - bestScore * 10);

  if (confidence < 0.4) {
    return null;
  }

  return {
    period: bestTau,
    confidence,
  };
}

function calculateRms(buffer: Float32Array): number {
  let sum = 0;

  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }

  return Math.sqrt(sum / buffer.length);
}
