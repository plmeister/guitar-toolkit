import { midiToFreq } from "../pitch";
import { getAudioContext } from "../audioEngine";
import { pluckString } from "../pluck";

export function playChord(
  ctx: AudioContext,
  frequencies: number[],
  direction: "down" | "up" = "down",
) {
  const now = ctx.currentTime;

  const ordered =
    direction === "down" ? frequencies : [...frequencies].reverse();

  ordered.forEach((freq, i) => {
    pluckString(ctx, freq, now + i * 0.025);
  });
}
