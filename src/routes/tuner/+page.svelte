<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Tuner from "$lib/components/Tuner.svelte";

  let mounted = $state(false);

  onMount(() => {
    mounted = true;
  });

  onDestroy(() => {
    mounted = false;
  });
</script>

{#if mounted}
  <Tuner />
{/if}
