<script lang="ts">
  import { Tuner } from "$lib/audio/tuner";
  import { STANDARD_TUNING, playString } from "$lib/audio/guitarTunings";
  import { detectString } from "$lib/audio/stringDetection";

  const tuner = new Tuner();

  let running = $state(false);

  let frequency = $state(0);

  let detectedString = $state("");
  let cents = $state(0);

  let selectedString = $state(STANDARD_TUNING.strings[5]);

  let displayString = $state("");
  let displayCents = $state(0);

  let lastString = "";
  let holdCount = 0;

  async function start() {
    await tuner.start(({ frequency: freq }) => {
      frequency = freq;

      const match = detectString(freq, STANDARD_TUNING);

      if (!match) return;

      detectedString = match.string.name;
      cents = match.cents;

      updateStability(match.string.name, match.cents);
    });

    running = true;
  }

  function stop() {
    tuner.stop();
    running = false;
  }

  function updateStability(name: string, c: number) {
    if (name === lastString) {
      holdCount++;
    } else {
      holdCount = 0;
      lastString = name;
    }

    if (holdCount >= 3) {
      displayString = name;
      displayCents = c;
    }
  }

  function guidance(cents: number) {
    if (Math.abs(cents) < 5) return "in tune";
    return cents > 0 ? "tune down" : "tune up";
  }

  function centsPosition() {
    const clamped = Math.max(-50, Math.min(50, displayCents));
    return clamped + 50;
  }

  function playSelected() {
    playString(selectedString);
  }
</script>

<h2>Tuner</h2>

{#if !running}
  <button onclick={start}>Start</button>
{:else}
  <button onclick={stop}>Stop</button>
{/if}

<!-- STRING SELECTOR / DIAGRAM -->
<div class="strings">
  {#each STANDARD_TUNING.strings as s}
    <button
      class:selected={selectedString.name === s.name}
      onclick={() => (selectedString = s)}
    >
      {s.name}
    </button>
  {/each}
</div>

<button onclick={playSelected}> Play Reference Tone </button>

<!-- MAIN DISPLAY -->
<div class="display">
  <div class="string">
    {displayString || detectedString}
  </div>

  <div class="freq">
    {frequency.toFixed(1)} Hz
  </div>

  <div class="cents">
    {displayCents.toFixed(1)} cents
  </div>

  <div class="guide">
    {guidance(displayCents)}
  </div>
</div>

<!-- TUNING BAR -->
<div class="bar">
  <div class="needle" style:left="{centsPosition()}%"></div>
</div>

<style>
  .strings {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .strings button {
    padding: 0.4rem 0.6rem;
  }

  .strings button.selected {
    background: #333;
    color: white;
  }

  .display {
    text-align: center;
    margin: 2rem 0;
  }

  .string {
    font-size: 4rem;
    font-weight: bold;
  }

  .guide {
    margin-top: 0.5rem;
    font-size: 1.5rem;
    opacity: 0.8;
  }

  .bar {
    position: relative;
    height: 20px;
    border: 1px solid #999;
    border-radius: 6px;
    margin-top: 1.5rem;
  }

  .needle {
    position: absolute;
    top: -5px;
    width: 4px;
    height: 30px;
    background: red;
    transform: translateX(-50%);
  }
</style>
