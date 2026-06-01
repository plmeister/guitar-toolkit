<script lang="ts">
  import { Metronome } from "$lib/audio/metronome";
  import { onDestroy } from "svelte";

  const metronome = new Metronome();

  let bpm = $state(120);

  $effect(() => {
    metronome.setBpm(bpm);
  });

  function start() {
    metronome.setBpm(bpm);
    metronome.start();
  }

  function stop() {
    metronome.stop();
  }

  onDestroy(() => {
    metronome.stop();
  });
</script>

<input type="range" min="40" max="240" bind:value={bpm} />

<p>{bpm} BPM</p>

<button onclick={start}> Start </button>

<button onclick={stop}> Stop </button>
