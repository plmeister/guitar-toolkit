<script lang="ts">
  import { Metronome } from "$lib/audio/metronome";
  import { onDestroy, onMount } from "svelte";

  const metronome = new Metronome();

  let bpm = $state(120);
  let isRunning = $state(false);
  let beat = $state(0);
  let pulseId = $state(0);

  let knobEl: HTMLDivElement;

  onMount(() => {
    knobEl?.focus();
  });

  metronome.onBeat = (b) => {
    beat = b;
    pulseId += 1;
  };

  const MIN_BPM = 40;
  const MAX_BPM = 240;

  let dragging = false;
  let lastY = 0;

  // sync BPM to engine
  $effect(() => {
    metronome.setBpm(bpm);
  });

  function start() {
    metronome.setBpm(bpm);
    metronome.start();
    isRunning = true;
  }

  function stop() {
    metronome.stop();
    isRunning = false;
  }

  function toggle() {
    isRunning ? stop() : start();
  }

  let moved = false;
  let inputMode: "drag" | "wheel" | null = null;

  function onPointerDown(e: PointerEvent) {
    dragging = true;
    moved = false;
    lastY = e.clientY;
    inputMode = "drag";

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return;

    const delta = lastY - e.clientY;
    if (Math.abs(delta) > 2) moved = true;

    lastY = e.clientY;

    bpm = Math.max(MIN_BPM, Math.min(MAX_BPM, bpm + Math.round(delta * 0.5)));
  }

  function onPointerUp(e: PointerEvent) {
    dragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    if (!moved) toggle(); // treat as tap only if no drag
  }

  function onWheel(e: WheelEvent) {
    if (dragging) return;
    e.preventDefault();
    inputMode = "wheel";

    const delta = Math.sign(e.deltaY);

    // wheel up = faster, down = slower (invert if you prefer)
    bpm = Math.max(MIN_BPM, Math.min(MAX_BPM, bpm - delta));
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowUp") {
      bpm = Math.min(MAX_BPM, bpm + 1);
    }

    if (e.key === "ArrowDown") {
      bpm = Math.max(MIN_BPM, bpm - 1);
    }

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  }

  const START_ANGLE = -135;
  const END_ANGLE = 135;

  const angle = $derived(
    START_ANGLE +
      ((bpm - MIN_BPM) / (MAX_BPM - MIN_BPM)) * (END_ANGLE - START_ANGLE),
  );
  onDestroy(() => {
    metronome.stop();
  });
</script>

<div class="wrap">
  <!-- beat indicators -->
  <!--<div class="beats">
    {#each Array(4) as _, i}
      <div class="beat-dot {i === beat ? 'active' : ''}"></div>
    {/each}
  </div>-->

  <!-- circular control -->
  <div
    bind:this={knobEl}
    class="knob {isRunning ? 'running' : 'stopped'}"
    role="button"
    tabindex="0"
    aria-label="Metronome control"
    aria-pressed={isRunning}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onkeydown={onKeyDown}
    onwheel={onWheel}
  >
    {#key pulseId}
      <div class="indicator" style="transform: rotate({angle}deg)">
        <div class="needle {beat === 0 ? 'accent' : ''}"></div>
      </div>
    {/key}

    <div class="center">
      <div class="bpm">{bpm}</div>
      <div class="label">BPM</div>
    </div>

    <div class="scale min">
      <span>40</span>
    </div>

    <div class="scale max">
      <span>240</span>
    </div>

    <div class="tick min"></div>
    <div class="tick max"></div>
  </div>

  <div class="hint">tap = start/stop · drag = tempo</div>
</div>

<style>
  @keyframes beatPulse {
    0% {
      transform: translate(-50%, -50%) translateY(-61px) scale(1);
      box-shadow: 0 0 0 rgba(59, 130, 246, 0);
    }

    35% {
      transform: translate(-50%, -50%) translateY(-61px) scale(1.55);
      box-shadow: 0 0 16px rgba(59, 130, 246, 0.9);
    }

    100% {
      transform: translate(-50%, -50%) translateY(-61px) scale(1);
      box-shadow: 0 0 0 rgba(59, 130, 246, 0);
    }
  }
  .wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    user-select: none;
  }

  /* knob */
  .knob {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    position: relative;
    display: grid;
    place-items: center;
    background: #0f0f0f;
    border: 2px solid #333;
    cursor: pointer;
    touch-action: none;
  }

  .knob:focus {
    outline: 2px solid rgba(59, 130, 246, 0.8);
    outline-offset: 4px;
  }

  .knob.running {
    border-color: #22c55e;
  }

  .knob.stopped {
    border-color: #ef4444;
  }
  .indicator {
    position: absolute;
    inset: 0;

    transform-origin: center center;

    pointer-events: none;
  }
  .needle {
    position: absolute;

    width: 12px;
    height: 12px;

    border-radius: 50%;
    background: #3b82f6;

    left: 50%;
    top: 50%;

    transform: translate(-50%, -50%) translateY(-61px);

    animation: beatPulse 90ms ease-out;
  }

  .needle.accent {
    background: gold;
  }

  .center {
    text-align: center;
  }

  .bpm {
    font-size: 30px;
    font-weight: 600;
    color: white;
  }

  .label {
    font-size: 10px;
    opacity: 0.6;
    letter-spacing: 1px;
  }

  .hint {
    font-size: 11px;
    opacity: 0.5;
  }

  .scale {
    position: absolute;
    font-size: 12px;
    opacity: 0.7;
  }

  .scale.min {
    left: -10px;
    bottom: 25px;
  }

  .scale.max {
    right: -10px;
    bottom: 25px;
  }

  .tick {
    position: absolute;
    width: 2px;
    height: 12px;
    background: #aaa;
  }

  .tick.min {
    transform: rotate(-135deg) translateY(-75px);
  }

  .tick.max {
    transform: rotate(135deg) translateY(-75px);
  }
</style>
