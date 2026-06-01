import { playFrequency } from "./tones";
import type { GuitarString, Tuning } from "$lib/types";

export const STANDARD_TUNING: Tuning = {
  name: "Standard",
  strings: [
    { name: "E4", frequency: 329.63 }, // 1st string
    { name: "B3", frequency: 246.94 },
    { name: "G3", frequency: 196.0 },
    { name: "D3", frequency: 146.83 },
    { name: "A2", frequency: 110.0 },
    { name: "E2", frequency: 82.41 }, // 6th string
  ],
};

export const DROP_D: Tuning = {
  name: "Drop D",
  strings: [
    { name: "D2", frequency: 73.42 },
    ...STANDARD_TUNING.strings.slice(1),
  ],
};

export function playString(string: GuitarString) {
  return playFrequency(string.frequency, 0.6);
}
