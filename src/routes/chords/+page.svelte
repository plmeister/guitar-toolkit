<script lang="ts">
  import { CHORDS, NOTES } from "$lib/audio/chords/chordLibrary";
  import ChordDiagram from "$lib/components/ChordDiagram.svelte";
  import { playChord } from "$lib/audio/chords/playChord";
  import { generateVoicings } from "$lib/audio/chords/voicing";
  import { getAudioContext } from "$lib/audio/audioEngine";

  let root = $state("C");
  let type: keyof typeof CHORDS = $state("major");

  const chord = $derived(CHORDS[type]);

  const highlighted = $derived(
    NOTES.map((_, i) => {
      const rootIndex = NOTES.indexOf(root);
      return chord.intervals.map((iv) => NOTES[(rootIndex + iv) % 12]);
    }).flat(),
  );

  const chordModel = $derived({
    root: NOTES.indexOf(root),
    intervals: chord.intervals,
  });

  const voicings = $derived(generateVoicings(chordModel));

  let selectedVoicing = $state(0);

  let ctx = getAudioContext();
</script>

<div class="controls">
  <select bind:value={root}>
    {#each NOTES as n}
      <option value={n}>{n}</option>
    {/each}
  </select>

  <select bind:value={type}>
    {#each Object.keys(CHORDS) as t}
      <option value={t}>{CHORDS[t as keyof typeof CHORDS].name}</option>
    {/each}
  </select>

  <button onclick={() => playChord(ctx, chord.intervals)}> Play </button>
</div>

<div class="info">
  <p>
    Intervals: {chord.intervals.join(", ")}, Notes:
    {chord.intervals
      .map((i) => NOTES[(NOTES.indexOf(root) + i) % 12])
      .join(" - ")}
  </p>
</div>
{#each voicings as v, i}
  <button onclick={() => (selectedVoicing = i)}>
    Voicing {i + 1}
  </button>
{/each}
<ChordDiagram
  name={`${root} ${type}`}
  notes={voicings[selectedVoicing].notes}
/>

<style>
  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .info {
    font-size: 1.2rem;
  }
</style>
