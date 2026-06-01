let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let unlocked = false;

export function getAudioContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();

    masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(ctx.destination);
  }

  return ctx;
}

export function getMasterGain(): GainNode {
  if (!masterGain) {
    getAudioContext();
  }
  return masterGain!;
}

export async function unlockAudio(): Promise<void> {
  const c = getAudioContext();

  if (c.state === "suspended") {
    await c.resume();
  }

  unlocked = true;
}

export function isAudioUnlocked() {
  return unlocked;
}
