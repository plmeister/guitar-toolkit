import { getAudioContext } from "./audioEngine";

export async function playFrequency(frequency: number, duration = 0.5) {
  const ctx = await getAudioContext();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
}
