import { NOTES } from "./chords/chordLibrary";

export function noteToMidi(note: string, octave = 4): number {
  const index = NOTES.indexOf(note);
  if (index === -1) throw new Error(`Invalid note: ${note}`);
  return 12 * (octave + 1) + index;
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
