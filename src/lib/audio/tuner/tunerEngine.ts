import { detectString } from "../stringDetection";
import { STANDARD_TUNING } from "../guitarTunings";
import type { Tuning } from "$lib/types";
import { Emitter } from "../utils/emitter";
import type { TunerEvents } from "./types";

export class TunerEngine extends Emitter<TunerEvents> {
  private source: any;
  private tuning: Tuning;

  private lastString: string | null = null;
  private candidateCount = 0;
  private lockedString: string | null = null;

  private smoothedFrequency = 0;
  private smoothingAlpha = 0.12;

  private lockThreshold = 4; // frames needed to lock note

  constructor(source: any, tuning: Tuning = STANDARD_TUNING) {
    super();
    this.source = source;
    this.tuning = tuning;
  }
  setTuning(tuning: Tuning) {
    this.tuning = tuning;

    // 🔥 critical: reset state
    this.lastString = null;
    this.candidateCount = 0;
    this.lockedString = null;

    this.emit("state", { running: true }); // optional re-sync
  }
  start() {
    this.emit("state", { running: true });

    this.source.start((frequency: number) => {
      this.smoothedFrequency = this.ema(this.smoothedFrequency, frequency);
      this.emit("frequency", { frequency: this.smoothedFrequency });

      const match = detectString(this.smoothedFrequency, this.tuning);
      if (!match) return;

      this.emit("match", match);

      this.updateStability(match.string.name, match.cents, match.string);
    });
  }

  stop() {
    this.source.stop();
    this.emit("state", { running: false });
  }
  private ema(prev: number, next: number): number {
    if (!prev) return next;
    return prev + this.smoothingAlpha * (next - prev);
  }

  private updateStability(name: string, cents: number, stringObj: any) {
    // 1. if string changes → reset candidate counter
    if (name !== this.lastString) {
      this.lastString = name;
      this.candidateCount = 0;
      return;
    }

    // 2. same string observed → increase confidence
    this.candidateCount++;

    // 3. only lock after threshold
    if (this.candidateCount === this.lockThreshold) {
      this.lockedString = name;

      this.emit("stableMatch", {
        string: stringObj,
        cents,
      });
    }
  }
}
