export type Chord = {
  root: number; // MIDI root OR pitch class (keep consistent in your app)
  intervals: number[]; // e.g. [0,4,7]
};
