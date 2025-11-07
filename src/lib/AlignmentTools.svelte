<script>
  import { selectedLayers, canvas, layerActions } from './layerStore'

  function alignLeft() {
    if ($selectedLayers.length < 2) return

    const leftmost = Math.min(...$selectedLayers.map(l => l.position.x))
    $selectedLayers.forEach(layer => {
      layerActions.updateLayer(layer.id, {
        position: { ...layer.position, x: leftmost }
      })
    })
    layerActions.saveHistory()
  }

  function alignCenter() {
    if ($selectedLayers.length < 2) return

    const centerX = $selectedLayers.reduce((sum, l) => sum + l.position.x, 0) / $selectedLayers.length
    $selectedLayers.forEach(layer => {
      layerActions.updateLayer(layer.id, {
        position: { ...layer.position, x: centerX }
      })
    })
    layerActions.saveHistory()
  }

  function alignRight() {
    if ($selectedLayers.length < 2) return

    const rightmost = Math.max(...$selectedLayers.map(l => l.position.x))
    $selectedLayers.forEach(layer => {
      layerActions.updateLayer(layer.id, {
        position: { ...layer.position, x: rightmost }
      })
    })
    layerActions.saveHistory()
  }

  function alignTop() {
    if ($selectedLayers.length < 2) return

    const topmost = Math.min(...$selectedLayers.map(l => l.position.y))
    $selectedLayers.forEach(layer => {
      layerActions.updateLayer(layer.id, {
        position: { ...layer.position, y: topmost }
      })
    })
    layerActions.saveHistory()
  }

  function alignMiddle() {
    if ($selectedLayers.length < 2) return

    const centerY = $selectedLayers.reduce((sum, l) => sum + l.position.y, 0) / $selectedLayers.length
    $selectedLayers.forEach(layer => {
      layerActions.updateLayer(layer.id, {
        position: { ...layer.position, y: centerY }
      })
    })
    layerActions.saveHistory()
  }

  function alignBottom() {
    if ($selectedLayers.length < 2) return

    const bottommost = Math.max(...$selectedLayers.map(l => l.position.y))
    $selectedLayers.forEach(layer => {
      layerActions.updateLayer(layer.id, {
        position: { ...layer.position, y: bottommost }
      })
    })
    layerActions.saveHistory()
  }

  function alignToCanvasCenter() {
    if ($selectedLayers.length === 0) return

    $selectedLayers.forEach(layer => {
      layerActions.updateLayer(layer.id, {
        position: {
          x: ($canvas.width / 2),
          y: ($canvas.height / 2)
        }
      })
    })
    layerActions.saveHistory()
  }

  function distributeHorizontally() {
    if ($selectedLayers.length < 3) return

    const sorted = [...$selectedLayers].sort((a, b) => a.position.x - b.position.x)
    const leftmost = sorted[0].position.x
    const rightmost = sorted[sorted.length - 1].position.x
    const spacing = (rightmost - leftmost) / (sorted.length - 1)

    sorted.forEach((layer, i) => {
      layerActions.updateLayer(layer.id, {
        position: { ...layer.position, x: leftmost + spacing * i }
      })
    })
    layerActions.saveHistory()
  }

  function distributeVertically() {
    if ($selectedLayers.length < 3) return

    const sorted = [...$selectedLayers].sort((a, b) => a.position.y - b.position.y)
    const topmost = sorted[0].position.y
    const bottommost = sorted[sorted.length - 1].position.y
    const spacing = (bottommost - topmost) / (sorted.length - 1)

    sorted.forEach((layer, i) => {
      layerActions.updateLayer(layer.id, {
        position: { ...layer.position, y: topmost + spacing * i }
      })
    })
    layerActions.saveHistory()
  }
</script>

<div class="alignment-tools">
  <div class="tool-section">
    <h4>Align</h4>
    <div class="tool-grid">
      <button
        class="tool-btn"
        on:click={alignLeft}
        disabled={$selectedLayers.length < 2}
        title="Align Left"
      >
        ⬅
      </button>
      <button
        class="tool-btn"
        on:click={alignCenter}
        disabled={$selectedLayers.length < 2}
        title="Align Center"
      >
        ↔
      </button>
      <button
        class="tool-btn"
        on:click={alignRight}
        disabled={$selectedLayers.length < 2}
        title="Align Right"
      >
        ➡
      </button>
      <button
        class="tool-btn"
        on:click={alignTop}
        disabled={$selectedLayers.length < 2}
        title="Align Top"
      >
        ⬆
      </button>
      <button
        class="tool-btn"
        on:click={alignMiddle}
        disabled={$selectedLayers.length < 2}
        title="Align Middle"
      >
        ↕
      </button>
      <button
        class="tool-btn"
        on:click={alignBottom}
        disabled={$selectedLayers.length < 2}
        title="Align Bottom"
      >
        ⬇
      </button>
    </div>
  </div>

  <div class="tool-section">
    <h4>Distribute</h4>
    <div class="tool-grid">
      <button
        class="tool-btn"
        on:click={distributeHorizontally}
        disabled={$selectedLayers.length < 3}
        title="Distribute Horizontally"
      >
        ⬌
      </button>
      <button
        class="tool-btn"
        on:click={distributeVertically}
        disabled={$selectedLayers.length < 3}
        title="Distribute Vertically"
      >
        ⬍
      </button>
    </div>
  </div>

  <div class="tool-section">
    <button
      class="tool-btn full-width"
      on:click={alignToCanvasCenter}
      disabled={$selectedLayers.length === 0}
      title="Center on Canvas"
    >
      ⊙ Center
    </button>
  </div>
</div>

<style>
  .alignment-tools {
    background: rgba(20, 20, 30, 0.95);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1rem;
  }

  .tool-section {
    margin-bottom: 1rem;
  }

  .tool-section:last-child {
    margin-bottom: 0;
  }

  .tool-section h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.8;
  }

  .tool-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .tool-btn {
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: inherit;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tool-btn:hover:not(:disabled) {
    background: rgba(0, 153, 255, 0.2);
    border-color: #0099ff;
    transform: translateY(-1px);
  }

  .tool-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .tool-btn.full-width {
    width: 100%;
    font-size: 0.9rem;
  }
</style>
