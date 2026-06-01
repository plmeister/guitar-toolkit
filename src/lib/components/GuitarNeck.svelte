<script lang="ts">
  import type { GuitarString } from "$lib/types";

  export let strings: GuitarString[] = [];
  export let centsByString: Record<string, number> = {};
  export let selected: GuitarString | null = null;
  export let onSelect: (s: GuitarString) => void = () => {};
</script>

<div class="neck">
  {#each strings as s (s.name)}
    <button
      class="string-row"
      class:selected={selected?.name === s.name}
      onclick={() => onSelect(s)}
    >
      <div class="label">{s.name}</div>

      <div class="rail">
        <div
          class="marker"
          style:left="{50 + (centsByString[s.name] ?? 0) / 2}%"
        ></div>
      </div>

      <div class="value">
        {(centsByString[s.name] ?? 0).toFixed(0)}¢
      </div>
    </button>
  {/each}
</div>

<style>
  .neck {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
  }

  .string-row {
    all: unset;
    display: grid;
    grid-template-columns: 60px 1fr 60px;
    align-items: center;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
  }

  .string-row.selected {
    background: rgba(255, 255, 255, 0.08);
  }

  .label {
    font-weight: bold;
    text-align: right;
    padding-right: 10px;
  }

  .rail {
    position: relative;
    height: 10px;
    background: #222;
    border-radius: 5px;
  }

  .marker {
    position: absolute;
    top: -3px;
    width: 6px;
    height: 16px;
    background: red;
    transform: translateX(-50%);
  }

  .value {
    font-size: 12px;
    opacity: 0.7;
    text-align: left;
    padding-left: 10px;
  }
</style>
