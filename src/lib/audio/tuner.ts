import { getAudioContext } from "./audioEngine";
import { detectPitch } from "./pitchDetection";

export type PitchUpdate = {
  frequency: number;
};

export type StablePitchUpdate = {
  frequency: number;
};

export class Tuner {
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;

  // FAST path (needle)
  private fastRecent: number[] = [];
  private fastSmoothed: number | null = null;

  // SLOW path (lock / string decisions)
  private slowRecent: number[] = [];
  private slowSmoothed: number | null = null;

  // stability tracking
  private lastStableFreq: number | null = null;
  private stableFrames = 0;

  // attack / release handling
  private attackFrames = 0;
  private releaseFrames = 0;

  // config
  private readonly WINDOW = 5;
  private readonly MIN_CONFIDENCE = 0.55;

  private readonly FAST_ALPHA = 0.25;
  private readonly SLOW_ALPHA = 0.15;

  private readonly LOCK_FRAMES = 4;
  private readonly MIN_DELTA_HZ = 2.0;

  private readonly ATTACK_LIMIT = 4; // ~50–80ms
  private readonly RELEASE_LIMIT = 6; // fade-out window

  async start(
    onPitch: (p: PitchUpdate) => void,
    onStablePitch?: (p: StablePitchUpdate) => void,
  ) {
    if (this.animationFrame) return;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const context = getAudioContext();
    if (!context) return;

    const source = context.createMediaStreamSource(this.stream);

    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 4096;

    source.connect(this.analyser);

    const buffer = new Float32Array(this.analyser.fftSize);

    const loop = () => {
      if (!this.analyser) return;

      this.analyser.getFloatTimeDomainData(buffer);

      const result = detectPitch(buffer, context.sampleRate);

      // -------------------------
      // NO SIGNAL / LOW CONFIDENCE
      // -------------------------
      if (!result || result.confidence < this.MIN_CONFIDENCE) {
        this.attackFrames = 0;
        this.releaseFrames++;

        if (
          this.releaseFrames < this.RELEASE_LIMIT &&
          this.fastSmoothed != null
        ) {
          onPitch({ frequency: this.fastSmoothed });
        }

        this.animationFrame = requestAnimationFrame(loop);
        return;
      }

      this.releaseFrames = 0;
      this.attackFrames++;

      // -------------------------
      // ATTACK SUPPRESSION
      // -------------------------
      if (this.attackFrames < this.ATTACK_LIMIT) {
        this.animationFrame = requestAnimationFrame(loop);
        return;
      }

      // -------------------------
      // OCTAVE AMBIGUITY RESOLVER
      // -------------------------
      let freq = this.resolveOctave(result.frequency);

      // -------------------------
      // FAST PATH (needle)
      // -------------------------
      this.fastRecent.push(freq);
      if (this.fastRecent.length > this.WINDOW) {
        this.fastRecent.shift();
      }

      const fastMedian = median(this.fastRecent);

      this.fastSmoothed =
        this.fastSmoothed == null
          ? fastMedian
          : this.FAST_ALPHA * fastMedian +
            (1 - this.FAST_ALPHA) * this.fastSmoothed;

      onPitch({ frequency: this.fastSmoothed });

      // -------------------------
      // SLOW PATH (lock / string)
      // -------------------------
      this.slowRecent.push(freq);
      if (this.slowRecent.length > this.WINDOW) {
        this.slowRecent.shift();
      }

      const slowMedian = median(this.slowRecent);

      this.slowSmoothed =
        this.slowSmoothed == null
          ? slowMedian
          : this.SLOW_ALPHA * slowMedian +
            (1 - this.SLOW_ALPHA) * this.slowSmoothed;

      const stableFreq = this.slowSmoothed;

      // -------------------------
      // STABILITY GATE (string lock trigger)
      // -------------------------
      if (
        this.lastStableFreq &&
        Math.abs(stableFreq - this.lastStableFreq) < this.MIN_DELTA_HZ
      ) {
        this.stableFrames++;
      } else {
        this.stableFrames = 0;
      }

      this.lastStableFreq = stableFreq;

      if (this.stableFrames >= this.LOCK_FRAMES && onStablePitch) {
        onStablePitch({ frequency: stableFreq });
      }

      this.animationFrame = requestAnimationFrame(loop);
    };

    loop();
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }

    this.fastRecent = [];
    this.slowRecent = [];
    this.fastSmoothed = null;
    this.slowSmoothed = null;

    this.lastStableFreq = null;
    this.stableFrames = 0;

    this.attackFrames = 0;
    this.releaseFrames = 0;
  }

  // -------------------------
  // OVERTONE / OCTAVE HANDLING
  // -------------------------
  private resolveOctave(freq: number): number {
    const candidates: number[] = [];

    for (let i = -1; i <= 1; i++) {
      const f = freq * Math.pow(2, i);
      if (f >= 60 && f <= 500) {
        candidates.push(f);
      }
    }

    // default fallback
    if (!this.slowSmoothed) return freq;

    // choose closest to recent stable value
    return candidates.sort(
      (a, b) =>
        Math.abs(a - this.slowSmoothed!) - Math.abs(b - this.slowSmoothed!),
    )[0];
  }
}

// -------------------------
// util
// -------------------------
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
