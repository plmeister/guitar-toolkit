import Pitchfinder from "pitchfinder";

export type PitchResult = {
  frequency: number;
  confidence: number;
};

type ProbabilityPitch = {
  freq: number;
  probability: number;
};

const detectorCache = new Map<number, ReturnType<typeof Pitchfinder.Macleod>>();

export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
): PitchResult | null {
  const rms = calculateRms(buffer);

  if (rms < 0.01) {
    return null;
  }

  let detector = detectorCache.get(sampleRate);

  if (!detector) {
    detector = Pitchfinder.Macleod({ sampleRate });
    detectorCache.set(sampleRate, detector);
  }

  const result = detector(buffer) as ProbabilityPitch | null;

  if (!result) {
    return null;
  }

  const { freq, probability } = result;

  if (!Number.isFinite(freq) || freq < 70 || freq > 400) {
    return null;
  }

  return {
    frequency: freq,
    confidence: probability ?? 0,
  };
}

function calculateRms(buffer: Float32Array): number {
  let sum = 0;

  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }

  return Math.sqrt(sum / buffer.length);
}
