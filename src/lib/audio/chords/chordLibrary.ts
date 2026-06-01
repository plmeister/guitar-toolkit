export type Note = string;

export type ChordType = "major" | "minor" | "7" | "maj7" | "sus2" | "sus4";

export interface ChordDefinition {
  name: string;
  intervals: number[];
}

export const CHORDS: Record<ChordType, ChordDefinition> = {
  major: { name: "Major", intervals: [0, 4, 7] },
  minor: { name: "Minor", intervals: [0, 3, 7] },
  "7": { name: "Dominant 7", intervals: [0, 4, 7, 10] },
  maj7: { name: "Major 7", intervals: [0, 4, 7, 11] },
  sus2: { name: "Sus2", intervals: [0, 2, 7] },
  sus4: { name: "Sus4", intervals: [0, 5, 7] },
};

export const NOTES: Note[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
