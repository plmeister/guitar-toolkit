import type { NoteEvent } from "../note";
import { STANDARD_TUNING } from "../guitar";
import type { Chord } from "./chord";
import { scoreVoicing } from "./voicingScore";

export type Voicing = {
  notes: NoteEvent[];
};

const MAX_FRET_SPAN = 4;

function isChordTone(pc: number, chordPcs: Set<number>) {
  return chordPcs.has(pc % 12);
}

export function generateVoicings(chord: Chord): Voicing[] {
  const results: Voicing[] = [];

  const chordPcs = new Set(chord.intervals.map((i) => (chord.root + i) % 12));

  for (let startFret = 0; startFret <= 12; startFret++) {
    const notes: NoteEvent[] = [];

    for (let string = 0; string < 6; string++) {
      let chosen: NoteEvent | null = null;

      const openMidi = STANDARD_TUNING[string];

      for (let fret = startFret; fret < startFret + 12; fret++) {
        const midi = openMidi + fret;
        const pc = midi % 12;

        if (!isChordTone(pc, chordPcs)) continue;

        chosen = { string, fret, midi };
        break;
      }

      if (chosen) notes.push(chosen);
    }

    if (notes.length < 3) continue;

    const frets = notes.map((n) => n.fret);
    const span = Math.max(...frets) - Math.min(...frets);

    if (span > MAX_FRET_SPAN) continue;

    results.push({ notes });
  }

  const scored = results.map((v) => ({ ...v, score: scoreVoicing(v) }));

  return scored.sort((a, b) => b.score - a.score);
}
