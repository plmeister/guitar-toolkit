<script lang="ts">
  import GuitarNeck from "$lib/components/GuitarNeck.svelte";
  import { STANDARD_TUNING, DROP_D } from "$lib/audio/guitarTunings";
  import type { Tuning } from "$lib/types";
  import { AudioSource } from "$lib/audio/tuner/audioSource";
  import { TunerEngine } from "$lib/audio/tuner/tunerEngine";
  import { playReferenceTone } from "$lib/audio/referenceTone";

  const tunings: Tuning[] = [STANDARD_TUNING, DROP_D];

  let activeTuning = $state(STANDARD_TUNING);
  let selectedString = $state(STANDARD_TUNING.strings[5]);

  let running = $state(false);
  let frequency = $state(0);
  let detectedString = $state("");
  let centsByString = $state<Record<string, number>>({});

  let audioContext: AudioContext;
  let analyser: AnalyserNode;
  let engine: TunerEngine;

  async function initAudio() {
    if (!audioContext) {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const audioSource = new AudioSource(analyser);
    engine = new TunerEngine(audioSource, activeTuning);

    engine.on("state", (s) => (running = s.running));
    engine.on("frequency", (f) => (frequency = f.frequency));
    engine.on("match", (m) => (detectedString = m.string.name));
    engine.on("stableMatch", (m) => {
      centsByString = {
        ...centsByString,
        [m.string.name]: m.cents,
      };
    });
  }

  function setTuning(t: Tuning) {
    activeTuning = t;
    selectedString = t.strings[Math.min(5, t.strings.length - 1)];
    engine?.setTuning(t);
  }

  async function start() {
    if (!engine) await initAudio();
    engine.start();
  }

  function stop() {
    engine.stop();
  }

  function guidance(cents: number) {
    if (Math.abs(cents) < 5) return "in tune";
    return cents > 0 ? "tune down" : "tune up";
  }

  function centsPosition() {
    const c = centsByString[detectedString] ?? 0;
    const clamped = Math.max(-50, Math.min(50, c));
    return clamped + 50;
  }
</script>

<div class="tuner">
  <!-- HEADER CONTROLS -->
  <div class="controls">
    <select bind:value={activeTuning} onchange={() => setTuning(activeTuning)}>
      {#each tunings as t}
        <option value={t}>{t.name}</option>
      {/each}
    </select>

    {#if !running}
      <button onclick={start}>Start</button>
    {:else}
      <button onclick={stop}>Stop</button>
    {/if}
  </div>

  <!-- GUITAR NECK -->
  <GuitarNeck
    strings={activeTuning.strings}
    {centsByString}
    selected={selectedString.name}
    onSelect={(s) => {
      selectedString = s;
      playReferenceTone(s.frequency);
    }}
  />

  <!-- DISPLAY -->
  <div class="display">
    <div class="string">{detectedString || selectedString.name}</div>
    <div class="freq">{frequency.toFixed(1)} Hz</div>
    <div class="guide">{guidance(centsByString[detectedString] ?? 0)}</div>
  </div>

  <!-- TUNING BAR -->
  <div class="bar">
    <div class="needle" style:left="{centsPosition()}%"></div>
  </div>
</div>

<style>
  .tuner {
    max-width: 520px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    gap: 0.5rem;
  }

  select,
  button {
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    padding: 0.4rem 0.6rem;
    border-radius: 8px;
  }

  .display {
    text-align: center;
    padding: 1.5rem;
    margin: 1.5rem 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
  }

  .string {
    font-size: 3.5rem;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .freq {
    color: var(--muted);
    margin-top: 0.25rem;
  }

  .guide {
    margin-top: 0.75rem;
    font-size: 1.2rem;
    color: var(--text);
  }

  .bar {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 999px;
    height: 10px;
    position: relative;
    margin-top: 1.5rem;
  }

  .needle {
    position: absolute;
    top: -6px;
    width: 3px;
    height: 22px;
    background: var(--accent);
    transform: translateX(-50%);
    box-shadow: 0 0 10px var(--accent);
  }
</style>
