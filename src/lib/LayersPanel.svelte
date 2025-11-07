<script>
  import { layers, selectedLayerIds, layerActions, LayerType, BlendMode } from './layerStore'

  let draggedLayerIndex = null
  let dragOverIndex = null

  function handleLayerClick(layerId, event) {
    const addToSelection = event.ctrlKey || event.metaKey
    layerActions.selectLayer(layerId, addToSelection)
  }

  function handleDragStart(event, index) {
    draggedLayerIndex = index
    event.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(event, index) {
    event.preventDefault()
    dragOverIndex = index
  }

  function handleDrop(event, index) {
    event.preventDefault()
    if (draggedLayerIndex !== null && draggedLayerIndex !== index) {
      layerActions.reorderLayers(draggedLayerIndex, index)
    }
    draggedLayerIndex = null
    dragOverIndex = null
  }

  function handleDragEnd() {
    draggedLayerIndex = null
    dragOverIndex = null
  }

  function getLayerIcon(type) {
    const icons = {
      [LayerType.IMAGE]: '🖼️',
      [LayerType.TEXT]: 'T',
      [LayerType.SHAPE]: '□',
      [LayerType.ADJUSTMENT]: '🎨',
      [LayerType.GROUP]: '📁'
    }
    return icons[type] || '📄'
  }

  function handleContextMenu(event, layerId) {
    event.preventDefault()
    // TODO: Show context menu
  }

  function handleOpacityChange(layerId, event) {
    const opacity = parseFloat(event.target.value)
    layerActions.updateLayer(layerId, { opacity })
  }

  function handleBlendModeChange(layerId, event) {
    const blendMode = event.target.value
    layerActions.updateLayer(layerId, { blendMode })
  }
</script>

<div class="layers-panel">
  <div class="panel-header">
    <h3>Layers</h3>
  </div>

  <div class="layers-list">
    {#each $layers.slice().reverse() as layer, index}
      {@const reversedIndex = $layers.length - 1 - index}
      {@const isSelected = $selectedLayerIds.includes(layer.id)}
      {@const isDraggedOver = dragOverIndex === reversedIndex}

      <div
        class="layer-item"
        class:selected={isSelected}
        class:drag-over={isDraggedOver}
        draggable="true"
        on:dragstart={(e) => handleDragStart(e, reversedIndex)}
        on:dragover={(e) => handleDragOver(e, reversedIndex)}
        on:drop={(e) => handleDrop(e, reversedIndex)}
        on:dragend={handleDragEnd}
        on:click={(e) => handleLayerClick(layer.id, e)}
        on:contextmenu={(e) => handleContextMenu(e, layer.id)}
        role="button"
        tabindex="0"
      >
        <div class="layer-controls">
          <button
            class="visibility-btn"
            class:visible={layer.visible}
            on:click|stopPropagation={() => layerActions.toggleVisibility(layer.id)}
            title="Toggle visibility"
          >
            {layer.visible ? '👁️' : '🚫'}
          </button>

          <button
            class="lock-btn"
            class:locked={layer.locked}
            on:click|stopPropagation={() => layerActions.toggleLock(layer.id)}
            title="Toggle lock"
          >
            {layer.locked ? '🔒' : '🔓'}
          </button>
        </div>

        <div class="layer-preview">
          {#if layer.type === LayerType.IMAGE && layer.data.imageUrl}
            <img src={layer.data.imageUrl} alt={layer.name} class="layer-thumbnail" />
          {:else}
            <span class="layer-icon">{getLayerIcon(layer.type)}</span>
          {/if}
        </div>

        <div class="layer-info">
          <div class="layer-name">{layer.name}</div>
          <div class="layer-properties">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={layer.opacity}
              on:input={(e) => handleOpacityChange(layer.id, e)}
              on:click|stopPropagation
              class="opacity-slider"
              title="Opacity"
            />
            <span class="opacity-value">{Math.round(layer.opacity * 100)}%</span>
          </div>
        </div>

        {#if isSelected && $selectedLayerIds.length === 1}
          <div class="layer-blend-mode">
            <select
              value={layer.blendMode}
              on:change={(e) => handleBlendModeChange(layer.id, e)}
              on:click|stopPropagation
              class="blend-select"
            >
              <option value={BlendMode.NORMAL}>Normal</option>
              <option value={BlendMode.MULTIPLY}>Multiply</option>
              <option value={BlendMode.SCREEN}>Screen</option>
              <option value={BlendMode.OVERLAY}>Overlay</option>
              <option value={BlendMode.DARKEN}>Darken</option>
              <option value={BlendMode.LIGHTEN}>Lighten</option>
              <option value={BlendMode.COLOR_DODGE}>Color Dodge</option>
              <option value={BlendMode.COLOR_BURN}>Color Burn</option>
              <option value={BlendMode.HARD_LIGHT}>Hard Light</option>
              <option value={BlendMode.SOFT_LIGHT}>Soft Light</option>
              <option value={BlendMode.DIFFERENCE}>Difference</option>
              <option value={BlendMode.EXCLUSION}>Exclusion</option>
            </select>
          </div>
        {/if}
      </div>
    {/each}

    {#if $layers.length === 0}
      <div class="empty-state">
        <p>No layers yet</p>
        <p class="hint">Upload an image to get started</p>
      </div>
    {/if}
  </div>

  <div class="panel-footer">
    <button
      class="action-btn"
      on:click={() => layerActions.removeLayer($selectedLayerIds[0])}
      disabled={$selectedLayerIds.length === 0}
      title="Delete layer"
    >
      🗑️
    </button>

    <button
      class="action-btn"
      on:click={() => layerActions.duplicateLayer($selectedLayerIds[0])}
      disabled={$selectedLayerIds.length !== 1}
      title="Duplicate layer"
    >
      📋
    </button>

    <button
      class="action-btn"
      on:click={() => layerActions.moveLayerUp($selectedLayerIds[0])}
      disabled={$selectedLayerIds.length !== 1}
      title="Move layer up"
    >
      ⬆️
    </button>

    <button
      class="action-btn"
      on:click={() => layerActions.moveLayerDown($selectedLayerIds[0])}
      disabled={$selectedLayerIds.length !== 1}
      title="Move layer down"
    >
      ⬇️
    </button>
  </div>
</div>

<style>
  .layers-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: rgba(20, 20, 30, 0.95);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  .panel-header {
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .panel-header h3 {
    margin: 0;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.9;
  }

  .layers-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .layer-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  }

  .layer-item:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 153, 255, 0.3);
  }

  .layer-item.selected {
    background: rgba(0, 153, 255, 0.2);
    border-color: #0099ff;
  }

  .layer-item.drag-over {
    border-color: #00ff88;
    border-style: dashed;
  }

  .layer-controls {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .visibility-btn,
  .lock-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    opacity: 0.6;
    transition: opacity 0.2s;
  }

  .visibility-btn:hover,
  .lock-btn:hover {
    opacity: 1;
  }

  .visibility-btn.visible,
  .lock-btn.locked {
    opacity: 1;
  }

  .layer-preview {
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .layer-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .layer-icon {
    font-size: 1.2rem;
  }

  .layer-info {
    flex: 1;
    min-width: 0;
  }

  .layer-name {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .layer-properties {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .opacity-slider {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    outline: none;
  }

  .opacity-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #0099ff;
    cursor: pointer;
  }

  .opacity-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #0099ff;
    cursor: pointer;
    border: none;
  }

  .opacity-value {
    font-size: 0.75rem;
    opacity: 0.7;
    min-width: 35px;
    text-align: right;
  }

  .layer-blend-mode {
    position: absolute;
    bottom: -30px;
    left: 0;
    right: 0;
    padding: 0.5rem;
    background: rgba(20, 20, 30, 0.98);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 10;
  }

  .blend-select {
    width: 100%;
    padding: 0.4rem;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: inherit;
    font-size: 0.85rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    opacity: 0.6;
  }

  .empty-state p {
    margin: 0.5rem 0;
  }

  .hint {
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .panel-footer {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
  }

  .action-btn {
    flex: 1;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: inherit;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:hover:not(:disabled) {
    background: rgba(0, 153, 255, 0.2);
    border-color: #0099ff;
  }

  .action-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
