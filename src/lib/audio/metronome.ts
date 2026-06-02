import { getAudioContext } from "./audioEngine";

export class Metronome {
  private bpm = 120;

  private currentBeat = 0;

  private nextNoteTime = 0;

  private schedulerId: number | null = null;

  private readonly lookAheadMs = 25;
  private readonly scheduleAheadTime = 0.1;

  private enableHaptics = true;

  setBpm(bpm: number) {
    this.bpm = bpm;
  }

  setEnableHaptics(enable: boolean) {
    this.enableHaptics = enable;
  }

  async start() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;

    const context = getAudioContext();
    if (!context) return;

    this.currentBeat = 0;
    this.nextNoteTime = context.currentTime;

    this.schedulerId = window.setInterval(
      () => this.scheduler(),
      this.lookAheadMs,
    );
  }

  private async scheduler() {
    const context = getAudioContext();
    if (!context) return;

    while (this.nextNoteTime < context.currentTime + this.scheduleAheadTime) {
      this.scheduleClick(this.currentBeat, this.nextNoteTime, context);

      this.advanceBeat();
    }
  }

  private isRunning = false;
  onBeat?: (beat: number, barBeat: boolean) => void;

  private emitBeat(beat: number, time: number, context: AudioContext) {
    const delayMs = Math.max(0, (time - context.currentTime) * 1000);

    window.setTimeout(() => {
      this.onBeat?.(beat, beat === 0);
      if (this.enableHaptics && navigator.vibrate) {
        if (beat === 0) {
          navigator.vibrate([20, 40, 20]);
        } else {
          navigator.vibrate(8);
        }
      }
    }, delayMs);
  }

  private scheduleClick(beat: number, time: number, context: AudioContext) {
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.frequency.value = beat === 0 ? 1400 : 1000;

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start(time);
    osc.stop(time + 0.05);

    this.emitBeat(beat, time, context);
  }

  private advanceBeat() {
    const secondsPerBeat = 60 / this.bpm;
    this.nextNoteTime += secondsPerBeat;
    this.currentBeat = (this.currentBeat + 1) % 4;
  }

  stop() {
    if (this.schedulerId !== null) {
      clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
    this.isRunning = false;
  }
}
