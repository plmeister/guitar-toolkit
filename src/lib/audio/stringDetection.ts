import type { Tuning, GuitarString } from "./guitarTunings";

export type StringMatch = {
  string: GuitarString;
  cents: number;
  frequency: number;
};

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
