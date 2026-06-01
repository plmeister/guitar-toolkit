import { midiToFreq, noteToMidi } from "../pitch.ts";

let ctx: AudioContext | null = null;

export function playChord(root: string, intervals: number[]) {
  if (!ctx) ctx = new AudioContext();

  const now = ctx.currentTime;

  intervals.forEach((interval, i) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();

    const midi = noteToMidi(root, 4) + interval;
    const freq = midiToFreq(midi);

    osc.frequency.value = freq;
    osc.type = "sine";

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx!.destination);

    osc.start(now + i * 0.05); // slight arpeggio spread
    osc.stop(now + 1.3);
  });
}
