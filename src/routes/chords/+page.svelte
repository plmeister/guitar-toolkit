<script lang="ts">
  import { CHORDS, NOTES } from "$lib/audio/chords/chordLibrary";
  import ChordDiagram from "$lib/components/ChordDiagram.svelte";
  import { playChord } from "$lib/audio/chords/playChord";
  import { generateVoicings } from "$lib/audio/chords/voicing";

  let root = "C";
  let type: keyof typeof CHORDS = "major";

  $: chord = CHORDS[type];

  $: highlighted = NOTES.map((_, i) => {
    const rootIndex = NOTES.indexOf(root);
    return chord.intervals.map((iv) => NOTES[(rootIndex + iv) % 12]);
  }).flat();

  $: chordModel = {
    root: NOTES.indexOf(root),
    intervals: chord.intervals,
  };

  $: voicings = generateVoicings(chordModel);

  let selectedVoicing = 0;
</script>

<h1>Chord Library</h1>

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

  <button on:click={() => playChord(root, chord.intervals)}> Play </button>
</div>

<div class="info">
  <h2>{root} {chord.name}</h2>

  <p>Intervals: {chord.intervals.join(", ")}</p>

  <p>
    Notes:
    {chord.intervals
      .map((i) => NOTES[(NOTES.indexOf(root) + i) % 12])
      .join(" - ")}
  </p>
</div>
{#each voicings as v, i}
  <button on:click={() => (selectedVoicing = i)}>
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
