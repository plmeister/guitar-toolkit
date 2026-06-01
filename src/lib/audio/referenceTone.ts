let refCtx: AudioContext | null = null;

export function playReference(frequency: number) {
  if (!refCtx) refCtx = new AudioContext();

  const osc = refCtx.createOscillator();
  const gain = refCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = frequency;

  gain.gain.value = 0.2;

  osc.connect(gain);
  gain.connect(refCtx.destination);

  osc.start();
  osc.stop(refCtx.currentTime + 1);
}
