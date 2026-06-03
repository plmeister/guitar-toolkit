import type { StringMatch, Tuning } from "$lib/types";

let stringScores = new Map<string, number>();
let lastUpdate = 0;

const DECAY_MS = 120;
const DECAY_FACTOR = 0.6;
const SWITCH_THRESHOLD = 25;

export function detectString(
  frequency: number,
  tuning: Tuning,
): StringMatch | null {
  if (!frequency || frequency < 20) return null;

  const now = performance.now();

  // decay old state
  if (now - lastUpdate > DECAY_MS) {
    for (const [k, v] of stringScores) {
      stringScores.set(k, v * DECAY_FACTOR);
    }
  }

  lastUpdate = now;

  const strings = tuning.strings;

  let bestString = "";
  let bestScore = -Infinity;
  let bestCents = 0;

  for (const s of strings) {
    const cents = 1200 * Math.log2(frequency / s.frequency);
    const score = Math.max(0, 100 - Math.abs(cents));

    stringScores.set(s.name, (stringScores.get(s.name) ?? 0) + score);

    if (stringScores.get(s.name)! > bestScore) {
      bestScore = stringScores.get(s.name)!;
      bestString = s.name;
      bestCents = cents;
    }
  }

  const sorted = [...stringScores.entries()].sort((a, b) => b[1] - a[1]);

  const top = sorted[0];
  if (!top) return null;

  const current = sorted[1];

  // hysteresis: prevent rapid flips
  if (current && top[1] - current[1] < SWITCH_THRESHOLD) {
    return {
      string: tuning.strings.find((s) => s.name === bestString)!,
      cents: bestCents,
    };
  }

  return {
    string: tuning.strings.find((s) => s.name === top[0])!,
    cents: bestCents,
  };
}
