const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export type NoteInfo = {
  note: string;
  octave: number;
  cents: number;
};
export function frequencyToNote(frequency: number) {
  const noteNumber = 12 * Math.log2(frequency / 440) + 69;

  const nearest = Math.round(noteNumber);

  const note = NOTES[((nearest % 12) + 12) % 12];

  const octave = Math.floor(nearest / 12) - 1;

  const cents = (noteNumber - nearest) * 100;

  return {
    note,
    octave,
    cents,
  };
}
