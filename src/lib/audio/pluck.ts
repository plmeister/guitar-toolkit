export function pluckString(
  ctx: AudioContext,
  frequency: number,
  when = ctx.currentTime,
  duration = 2.5,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, when);

  // simple clickless envelope
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.3, when + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(when);
  osc.stop(when + duration);
}
