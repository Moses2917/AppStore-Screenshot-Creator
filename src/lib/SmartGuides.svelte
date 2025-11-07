<script>
  import { guides, grid, canvas, layerActions } from './layerStore'

  let draggedGuide = null
  let draggedGuideType = null // 'horizontal' or 'vertical'
  let draggedGuideOriginalPos = null

  function handleGuideMouseDown(type, position, event) {
    if ($guides.locked) return

    event.preventDefault()
    draggedGuide = position
    draggedGuideType = type
    draggedGuideOriginalPos = position

    window.addEventListener('mousemove', handleGuideMouseMove)
    window.addEventListener('mouseup', handleGuideMouseUp)
  }

  function handleGuideMouseMove(event) {
    if (!draggedGuide || !draggedGuideType) return

    const canvas = event.target.closest('.canvas-wrapper')
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()

    if (draggedGuideType === 'horizontal') {
      const newY = event.clientY - rect.top
      draggedGuide = newY
    } else {
      const newX = event.clientX - rect.left
      draggedGuide = newX
    }
  }

  function handleGuideMouseUp() {
    if (draggedGuide !== null && draggedGuideOriginalPos !== null) {
      // Update guide position
      if (draggedGuideType === 'horizontal') {
        layerActions.moveHorizontalGuide(draggedGuideOriginalPos, draggedGuide)
      } else {
        layerActions.moveVerticalGuide(draggedGuideOriginalPos, draggedGuide)
      }
    }

    draggedGuide = null
    draggedGuideType = null
    draggedGuideOriginalPos = null

    window.removeEventListener('mousemove', handleGuideMouseMove)
    window.removeEventListener('mouseup', handleGuideMouseUp)
  }

  function handleGuideDoubleClick(type, position) {
    if ($guides.locked) return

    if (type === 'horizontal') {
      layerActions.removeHorizontalGuide(position)
    } else {
      layerActions.removeVerticalGuide(position)
    }
  }

  // Generate grid lines
  $: gridLines = (() => {
    if (!$grid.enabled || !$grid.visible) return { horizontal: [], vertical: [] }

    const horizontal = []
    const vertical = []
    const size = $grid.size

    // Generate horizontal lines
    for (let y = 0; y <= $canvas.height; y += size) {
      horizontal.push(y)
    }

    // Generate vertical lines
    for (let x = 0; x <= $canvas.width; x += size) {
      vertical.push(x)
    }

    return { horizontal, vertical }
  })()
</script>

<div class="smart-guides-overlay">
  <!-- Grid -->
  {#if $grid.enabled && $grid.visible}
    <svg class="grid-layer" width={$canvas.width} height={$canvas.height}>
      <!-- Vertical grid lines -->
      {#each gridLines.vertical as x}
        <line
          x1={x}
          y1={0}
          x2={x}
          y2={$canvas.height}
          class="grid-line"
        />
      {/each}

      <!-- Horizontal grid lines -->
      {#each gridLines.horizontal as y}
        <line
          x1={0}
          y1={y}
          x2={$canvas.width}
          y2={y}
          class="grid-line"
        />
      {/each}
    </svg>
  {/if}

  <!-- Guides -->
  {#if $guides.visible}
    <!-- Horizontal guides -->
    {#each $guides.horizontal as y}
      <div
        class="guide guide-horizontal"
        class:locked={$guides.locked}
        style="top: {y}px"
        on:mousedown={(e) => handleGuideMouseDown('horizontal', y, e)}
        on:dblclick={() => handleGuideDoubleClick('horizontal', y)}
        role="separator"
        tabindex="0"
      >
        <div class="guide-label">{Math.round(y)}px</div>
      </div>
    {/each}

    <!-- Vertical guides -->
    {#each $guides.vertical as x}
      <div
        class="guide guide-vertical"
        class:locked={$guides.locked}
        style="left: {x}px"
        on:mousedown={(e) => handleGuideMouseDown('vertical', x, e)}
        on:dblclick={() => handleGuideDoubleClick('vertical', x)}
        role="separator"
        tabindex="0"
      >
        <div class="guide-label">{Math.round(x)}px</div>
      </div>
    {/each}

    <!-- Dragged guide preview -->
    {#if draggedGuide !== null && draggedGuideType}
      <div
        class="guide guide-{draggedGuideType} guide-dragging"
        style={draggedGuideType === 'horizontal' ? `top: ${draggedGuide}px` : `left: ${draggedGuide}px`}
      >
        <div class="guide-label">{Math.round(draggedGuide)}px</div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .smart-guides-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 100;
  }

  .grid-layer {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  .grid-line {
    stroke: rgba(0, 153, 255, 0.15);
    stroke-width: 1;
    shape-rendering: crispEdges;
  }

  .guide {
    position: absolute;
    pointer-events: auto;
    z-index: 1000;
    transition: opacity 0.2s;
  }

  .guide-horizontal {
    left: 0;
    right: 0;
    height: 1px;
    background: #00ff88;
    box-shadow: 0 0 4px rgba(0, 255, 136, 0.5);
    cursor: ns-resize;
  }

  .guide-vertical {
    top: 0;
    bottom: 0;
    width: 1px;
    background: #00ff88;
    box-shadow: 0 0 4px rgba(0, 255, 136, 0.5);
    cursor: ew-resize;
  }

  .guide.locked {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .guide-dragging {
    background: #0099ff;
    box-shadow: 0 0 8px rgba(0, 153, 255, 0.8);
    z-index: 1001;
  }

  .guide:hover .guide-label,
  .guide-dragging .guide-label {
    opacity: 1;
  }

  .guide-label {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: #00ff88;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .guide-horizontal .guide-label {
    left: 8px;
    top: 2px;
  }

  .guide-vertical .guide-label {
    top: 8px;
    left: 2px;
    writing-mode: vertical-lr;
    text-orientation: mixed;
  }

  .guide-dragging .guide-label {
    color: #0099ff;
    opacity: 1;
  }
</style>
