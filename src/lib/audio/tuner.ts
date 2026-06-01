import { getAudioContext } from "./audioEngine";
import { detectPitch } from "./pitchDetection";
import { STANDARD_TUNING } from "$lib/audio/guitarTunings";
import { detectString } from "$lib/audio/stringDetection";
export type PitchUpdate = {
  frequency: number;
};

export class Tuner {
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;

  private recent: number[] = [];
  private lastStableNote: string | null = null;
  private sameNoteCount = 0;

  async start(onPitch: (p: PitchUpdate) => void) {
    if (this.animationFrame) return;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const context = await getAudioContext();

    const source = context.createMediaStreamSource(this.stream);

    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 4096;

    source.connect(this.analyser);

    const buffer = new Float32Array(this.analyser.fftSize);

    const loop = () => {
      if (!this.analyser) return;

      this.analyser.getFloatTimeDomainData(buffer);

      const result = detectPitch(buffer, context.sampleRate);

      if (result && result.confidence > 0.55) {
        this.recent.push(result.frequency);

        if (this.recent.length > 7) {
          this.recent.shift();
        }

        const freq = median(this.recent);

        onPitch({ frequency: freq });
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

    this.recent = [];
    this.lastStableNote = null;
    this.sameNoteCount = 0;
  }
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
