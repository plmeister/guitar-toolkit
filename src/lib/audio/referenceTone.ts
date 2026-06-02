import { getAudioContext } from "./audioEngine";
import { pluckString } from "./pluck";

export function playReferenceTone(frequency: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  pluckString(ctx, frequency);
}
