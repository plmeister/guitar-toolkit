import { getAudioContext } from "./audioEngine";
import { onDestroy } from "svelte";

export class Metronome {
  private bpm = 120;
  private timerId: number | null = null;

  private currentBeat = 0;

  private nextNoteTime = 0;

  private schedulerId: number | null = null;

  private readonly lookAheadMs = 25;
  private readonly scheduleAheadTime = 0.1;

  setBpm(bpm: number) {
    this.bpm = bpm;
  }

  async start() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;

    const context = await getAudioContext();

    this.currentBeat = 0;
    this.nextNoteTime = context.currentTime;

    this.schedulerId = window.setInterval(
      () => this.scheduler(),
      this.lookAheadMs,
    );
  }

  private async scheduler() {
    const context = await getAudioContext();

    while (this.nextNoteTime < context.currentTime + this.scheduleAheadTime) {
      this.scheduleClick(this.currentBeat, this.nextNoteTime);

      this.advanceBeat();
    }
  }

  private isRunning = false;
  onBeat?: (beat: number) => void;

  private async scheduleClick(beat: number, time: number) {
    const context = await getAudioContext();

    const osc = context.createOscillator();

    const gain = context.createGain();

    osc.frequency.value = beat === 0 ? 1400 : 1000;

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start(time);
    osc.stop(time + 0.05);

    this.onBeat?.(beat);
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
