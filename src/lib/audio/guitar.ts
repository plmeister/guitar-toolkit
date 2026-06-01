export const STANDARD_TUNING = [
  40, // E2
  45, // A2
  50, // D3
  55, // G3
  59, // B3
  64, // E4
];

export function midiToFret(string: number, midi: number) {
  return midi - STANDARD_TUNING[string];
}

export function fretToMidi(string: number, fret: number) {
  return STANDARD_TUNING[string] + fret;
}
