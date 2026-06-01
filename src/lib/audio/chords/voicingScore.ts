import type { NoteEvent } from "../note";

export type Voicing = {
  notes: NoteEvent[];
  score?: number;
};

function fretSpan(notes: NoteEvent[]) {
  const frets = notes.map((n) => n.fret);
  return Math.max(...frets) - Math.min(...frets);
}

function averageFret(notes: NoteEvent[]) {
  return notes.reduce((s, n) => s + n.fret, 0) / notes.length;
}

function hasBarreLikeShape(notes: NoteEvent[]) {
  const map = new Map<number, number>();

  for (const n of notes) {
    map.set(n.fret, (map.get(n.fret) ?? 0) + 1);
  }

  return Array.from(map.values()).some((v) => v >= 3);
}
export function scoreVoicing(v: Voicing): number {
  const notes = v.notes;

  if (notes.length < 3) return -Infinity;

  const span = fretSpan(notes);
  const avg = averageFret(notes);
  const barreBonus = hasBarreLikeShape(notes) ? 2 : 0;

  // penalties
  const spanPenalty = span * 2;
  const positionPenalty = avg * 0.5;

  // reward completeness slightly
  const completenessBonus = notes.length * 0.3;

  return completenessBonus + barreBonus - spanPenalty - positionPenalty;
}
