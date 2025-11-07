<script>
  import { canvas, layerActions } from './layerStore'

  const RULER_SIZE = 20

  function handleHorizontalRulerClick(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    layerActions.addVerticalGuide(x)
  }

  function handleVerticalRulerClick(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const y = event.clientY - rect.top
    layerActions.addHorizontalGuide(y)
  }

  // Generate tick marks for rulers
  $: horizontalTicks = (() => {
    const ticks = []
    const majorInterval = 100
    const minorInterval = 10

    for (let x = 0; x <= $canvas.width; x += minorInterval) {
      const isMajor = x % majorInterval === 0
      ticks.push({
        position: x,
        isMajor,
        label: isMajor ? x.toString() : ''
      })
    }

    return ticks
  })()

  $: verticalTicks = (() => {
    const ticks = []
    const majorInterval = 100
    const minorInterval = 10

    for (let y = 0; y <= $canvas.height; y += minorInterval) {
      const isMajor = y % majorInterval === 0
      ticks.push({
        position: y,
        isMajor,
        label: isMajor ? y.toString() : ''
      })
    }

    return ticks
  })()
</script>

<div class="rulers">
  <!-- Corner square -->
  <div class="ruler-corner"></div>

  <!-- Horizontal ruler -->
  <div
    class="ruler ruler-horizontal"
    style="left: {RULER_SIZE}px; width: {$canvas.width}px;"
    on:click={handleHorizontalRulerClick}
    title="Click to add vertical guide"
  >
    {#each horizontalTicks as tick}
      <div
        class="tick"
        class:major={tick.isMajor}
        style="left: {tick.position}px"
      >
        {#if tick.label}
          <span class="tick-label">{tick.label}</span>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Vertical ruler -->
  <div
    class="ruler ruler-vertical"
    style="top: {RULER_SIZE}px; height: {$canvas.height}px;"
    on:click={handleVerticalRulerClick}
    title="Click to add horizontal guide"
  >
    {#each verticalTicks as tick}
      <div
        class="tick tick-vertical"
        class:major={tick.isMajor}
        style="top: {tick.position}px"
      >
        {#if tick.label}
          <span class="tick-label">{tick.label}</span>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .rulers {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 200;
  }

  .ruler-corner {
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    background: rgba(20, 20, 30, 0.95);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    z-index: 201;
  }

  .ruler {
    position: absolute;
    background: rgba(20, 20, 30, 0.95);
    pointer-events: auto;
    cursor: crosshair;
  }

  .ruler-horizontal {
    top: 0;
    height: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .ruler-vertical {
    left: 0;
    width: 20px;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
  }

  .tick {
    position: absolute;
    height: 100%;
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    pointer-events: none;
  }

  .tick.major {
    border-left-color: rgba(255, 255, 255, 0.5);
  }

  .tick-vertical {
    width: 100%;
    height: auto;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .tick-vertical.major {
    border-top-color: rgba(255, 255, 255, 0.5);
  }

  .tick-label {
    position: absolute;
    font-size: 9px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
    white-space: nowrap;
  }

  .ruler-horizontal .tick-label {
    top: 2px;
    left: 2px;
  }

  .ruler-vertical .tick-label {
    top: 2px;
    left: 2px;
    writing-mode: vertical-lr;
    text-orientation: mixed;
  }
</style>
