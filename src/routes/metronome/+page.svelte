<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Metronome from "$lib/components/Metronome.svelte";

  let mounted = $state(false);

  onMount(() => {
    mounted = true;
  });

  onDestroy(() => {
    mounted = false;
  });
</script>

{#if mounted}
  <Metronome />
{/if}
