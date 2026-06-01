<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
</script>

<h1>Guitar Toolkit</h1>

<div class="menu">
  <button onclick={() => goto(resolve("/tuner"))}> Tuner </button>

  <button onclick={() => goto(resolve("/metronome"))}> Metronome </button>
  <button onclick={() => goto(resolve("/chords"))}> Chords </button>
</div>

<style>
  .menu {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 200px;
  }

  button {
    font-size: 1.2rem;
    padding: 0.75rem;
  }
</style>
