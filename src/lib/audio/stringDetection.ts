import type { StringMatch, Tuning } from "$lib/types";
let lastString: string | null = null;

const HYSTERESIS_CENTS = 25; // key tuning knob

export function detectString(
  frequency: number,
  tuning: Tuning,
): StringMatch | null {
  if (!frequency || frequency < 20) return null;

  const strings = tuning.strings;

  // 1. compute candidates with cents distance
  const candidates = strings.map((s: any) => {
    const cents = 1200 * Math.log2(frequency / s.frequency);

    return {
      string: s,
      cents,
      absCents: Math.abs(cents),
    };
  });

  // 2. sort by closeness
  candidates.sort((a, b) => a.absCents - b.absCents);

  const best = candidates[0];

  if (!best) return null;

  // 3. first run
  if (!lastString) {
    lastString = best.string.name;
    return {
      string: best.string,
      cents: best.cents,
    };
  }

  const current = candidates.find((c) => c.string.name === lastString);

  if (!current) {
    lastString = best.string.name;
    return {
      string: best.string,
      cents: best.cents,
    };
  }

  // 4. hysteresis rule:
  // only switch if clearly better by threshold
  const shouldSwitch =
    best.string.name !== lastString &&
    current.absCents - best.absCents > HYSTERESIS_CENTS;

  if (shouldSwitch) {
    lastString = best.string.name;
    return {
      string: best.string,
      cents: best.cents,
    };
  }

  // 5. otherwise stick to current string
  return {
    string: current.string,
    cents: current.cents,
  };
}
