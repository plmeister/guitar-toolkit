<script lang="ts">
  import type { NoteEvent } from "$lib/audio/note";

  let { notes = [], name = "" } = $props<{
    notes: NoteEvent[];
    name?: string;
  }>();

  const strings = ["E", "A", "D", "G", "B", "e"];
  const fretCount = 5;

  const width = 240;
  const height = 180;

  const xStep = width / (strings.length - 1);
  const yStep = height / fretCount;

  const frets = $derived(notes.map((n: NoteEvent) => n.fret));
  const validFrets = $derived(
    frets.filter((f: number | null): f is number => f !== null && f > 0),
  );

  const minFret = $derived(validFrets.length ? Math.min(...validFrets) : 1);
  const maxFret = $derived(validFrets.length ? Math.max(...validFrets) : 4);

  const startFret = $derived(maxFret <= 4 ? 1 : minFret);

  function x(stringIndex: number) {
    return stringIndex * xStep;
  }

  function y(fret: number) {
    return (fret - startFret + 0.5) * yStep;
  }
</script>

<div class="diagram">
  {#if name}
    <div class="title">{name}</div>
  {/if}

  <!-- OPEN STRINGS -->
  <div class="open">
    {#each frets as f}
      <div class="open-cell">
        {#if f === null}×{:else if f === 0}○{/if}
      </div>
    {/each}
  </div>

  <!-- ABSOLUTE CANVAS -->
  <div class="board">
    <!-- nut -->
    <div class="nut"></div>

    <!-- frets -->
    {#each Array(fretCount) as _, i}
      <div class="fret" style="top: {i * yStep}px"></div>
    {/each}

    <!-- strings -->
    {#each strings as _, i}
      <div class="string" style="left: {x(i)}px"></div>
    {/each}

    <!-- dots -->

    {#each frets as fret, stringIndex}
      {#if fret !== null && fret > 0}
        <div
          class="dot"
          style="left: {x(stringIndex)}px;top: {y(fret)}px"
        ></div>
      {/if}
    {/each}
  </div>

  <!-- labels -->
  <div class="labels">
    {#each strings as n, s}
      <div class="label" style="left: {x(s)}px">{n}</div>
    {/each}
  </div>

  {#if startFret > 1}
    <div class="position">{startFret}fr</div>
  {/if}
</div>

<style>
  .diagram {
    width: 240px;
    margin: 1rem auto;
    font-family: system-ui;
  }

  .title {
    text-align: center;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .open {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 14px;
  }

  .board {
    position: relative;
    width: 240px;
    height: 180px;
    border: 1px solid #444;
  }

  .nut {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: #ddd;
  }

  .fret {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: #555;
  }

  .string {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #777;
  }

  .dot {
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #3b82f6;
    transform: translate(-50%, -50%);
  }

  .labels {
    position: relative;
    display: flex;
    justify-content: space-between;
    width: 240px;
    margin-top: 6px;
  }

  .label {
    position: absolute;
    font-size: 12px;
    opacity: 0.7;
    width: 40px;
    text-align: center;
    transform: translateX(-20px);
  }

  .position {
    text-align: center;
    margin-top: 4px;
    opacity: 0.6;
    font-size: 0.85rem;
  }
</style>
