import type { StringMatch, Tuning } from "$lib/types";

export function detectString(
  frequency: number,
  tuning: Tuning,
): StringMatch | null {
  let best: StringMatch | null = null;
  let bestScore = Infinity;

  for (const string of tuning.strings) {
    const cents = 1200 * Math.log2(frequency / string.frequency);

    const score = Math.abs(cents);

    if (score < bestScore) {
      bestScore = score;
      best = {
        string,
        cents,
        frequency,
      };
    }
  }

  return best;
}
