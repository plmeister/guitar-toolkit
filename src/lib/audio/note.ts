export type NoteEvent = {
  string: number; // 0–5 (E A D G B e)
  fret: number; // 0 = open
  midi: number; // absolute pitch
  finger?: number;
};
