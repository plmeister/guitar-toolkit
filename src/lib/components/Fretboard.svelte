<script lang="ts">
  import type { NoteEvent } from "$lib/audio/note";

  export let notes: NoteEvent[] = [];

  const strings = ["E", "A", "D", "G", "B", "e"];
</script>

<div class="board">
  {#each notes as n}
    <div
      class="dot"
      style="left: {n.string * 40}px; top: {n.fret * 30}px"
    ></div>
  {/each}
</div>

<style>
  .board {
    position: relative;
    width: 240px;
    height: 180px;
    border: 1px solid #444;
  }

  .dot {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #3b82f6;
    transform: translate(-50%, -50%);
  }
</style>
