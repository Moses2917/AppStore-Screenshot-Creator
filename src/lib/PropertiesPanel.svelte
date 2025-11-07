<script>
  import { selectedLayers, layerActions, LayerType } from './layerStore'

  $: selectedLayer = $selectedLayers.length === 1 ? $selectedLayers[0] : null

  function updatePosition(axis, value) {
    if (!selectedLayer) return
    const newPosition = { ...selectedLayer.position, [axis]: parseFloat(value) }
    layerActions.updateLayer(selectedLayer.id, { position: newPosition })
  }

  function updateScale(axis, value) {
    if (!selectedLayer) return
    const newScale = { ...selectedLayer.scale, [axis]: parseFloat(value) }
    layerActions.updateLayer(selectedLayer.id, { scale: newScale })
  }

  function updateRotation(value) {
    if (!selectedLayer) return
    layerActions.updateLayer(selectedLayer.id, { rotation: parseFloat(value) })
  }

  function updateName(value) {
    if (!selectedLayer) return
    layerActions.updateLayer(selectedLayer.id, { name: value })
  }

  function addFilter(filterType) {
    if (!selectedLayer) return
    const newFilters = [...selectedLayer.filters, { type: filterType, value: 0.5 }]
    layerActions.updateLayer(selectedLayer.id, { filters: newFilters })
  }

  function updateFilter(index, value) {
    if (!selectedLayer) return
    const newFilters = [...selectedLayer.filters]
    newFilters[index] = { ...newFilters[index], value: parseFloat(value) }
    layerActions.updateLayer(selectedLayer.id, { filters: newFilters })
  }

  function removeFilter(index) {
    if (!selectedLayer) return
    const newFilters = selectedLayer.filters.filter((_, i) => i !== index)
    layerActions.updateLayer(selectedLayer.id, { filters: newFilters })
  }

  const filterTypes = [
    { id: 'brightness', name: 'Brightness', min: -1, max: 1, step: 0.1 },
    { id: 'contrast', name: 'Contrast', min: -1, max: 1, step: 0.1 },
    { id: 'saturation', name: 'Saturation', min: -1, max: 1, step: 0.1 },
    { id: 'blur', name: 'Blur', min: 0, max: 1, step: 0.05 },
    { id: 'grayscale', name: 'Grayscale', min: 0, max: 1, step: 0.1 },
    { id: 'sepia', name: 'Sepia', min: 0, max: 1, step: 0.1 }
  ]
</script>

<div class="properties-panel">
  <div class="panel-header">
    <h3>Properties</h3>
  </div>

  {#if selectedLayer}
    <div class="properties-content">
      <!-- Layer Name -->
      <div class="property-section">
        <label>Layer Name</label>
        <input
          type="text"
          value={selectedLayer.name}
          on:input={(e) => updateName(e.target.value)}
          class="text-input"
        />
      </div>

      <!-- Transform -->
      <div class="property-section">
        <h4>Transform</h4>

        <div class="property-row">
          <label>Position X</label>
          <input
            type="number"
            value={selectedLayer.position.x}
            on:input={(e) => updatePosition('x', e.target.value)}
            class="number-input"
          />
        </div>

        <div class="property-row">
          <label>Position Y</label>
          <input
            type="number"
            value={selectedLayer.position.y}
            on:input={(e) => updatePosition('y', e.target.value)}
            class="number-input"
          />
        </div>

        <div class="property-row">
          <label>Scale X</label>
          <input
            type="number"
            value={selectedLayer.scale.x}
            min="0.1"
            max="10"
            step="0.1"
            on:input={(e) => updateScale('x', e.target.value)}
            class="number-input"
          />
        </div>

        <div class="property-row">
          <label>Scale Y</label>
          <input
            type="number"
            value={selectedLayer.scale.y}
            min="0.1"
            max="10"
            step="0.1"
            on:input={(e) => updateScale('y', e.target.value)}
            class="number-input"
          />
        </div>

        <div class="property-row">
          <label>Rotation ({selectedLayer.rotation}°)</label>
          <input
            type="range"
            value={selectedLayer.rotation}
            min="-180"
            max="180"
            on:input={(e) => updateRotation(e.target.value)}
            class="slider-input"
          />
        </div>
      </div>

      <!-- Filters (only for image layers) -->
      {#if selectedLayer.type === LayerType.IMAGE}
        <div class="property-section">
          <h4>Filters</h4>

          {#each selectedLayer.filters as filter, index}
            {@const filterDef = filterTypes.find(f => f.id === filter.type)}
            <div class="filter-item">
              <div class="filter-header">
                <span class="filter-name">{filterDef?.name || filter.type}</span>
                <button
                  class="remove-btn"
                  on:click={() => removeFilter(index)}
                  title="Remove filter"
                >
                  ×
                </button>
              </div>
              <div class="filter-control">
                <input
                  type="range"
                  value={filter.value}
                  min={filterDef?.min || 0}
                  max={filterDef?.max || 1}
                  step={filterDef?.step || 0.1}
                  on:input={(e) => updateFilter(index, e.target.value)}
                  class="slider-input"
                />
                <span class="filter-value">{filter.value.toFixed(2)}</span>
              </div>
            </div>
          {/each}

          <div class="add-filter">
            <label>Add Filter</label>
            <select on:change={(e) => { addFilter(e.target.value); e.target.value = '' }} class="select-input">
              <option value="">Select filter...</option>
              {#each filterTypes as filterType}
                <option value={filterType.id}>{filterType.name}</option>
              {/each}
            </select>
          </div>
        </div>
      {/if}

      <!-- Text Properties (only for text layers) -->
      {#if selectedLayer.type === LayerType.TEXT}
        <div class="property-section">
          <h4>Text</h4>

          <div class="property-row">
            <label>Font Size</label>
            <input
              type="number"
              value={selectedLayer.data.fontSize || 24}
              on:input={(e) => layerActions.updateLayer(selectedLayer.id, {
                data: { ...selectedLayer.data, fontSize: parseInt(e.target.value) }
              })}
              class="number-input"
            />
          </div>

          <div class="property-row">
            <label>Color</label>
            <input
              type="color"
              value={selectedLayer.data.color || '#000000'}
              on:input={(e) => layerActions.updateLayer(selectedLayer.id, {
                data: { ...selectedLayer.data, color: e.target.value }
              })}
              class="color-input"
            />
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="empty-state">
      <p>No layer selected</p>
      <p class="hint">Select a layer to view its properties</p>
    </div>
  {/if}
</div>

<style>
  .properties-panel {
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

  .properties-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .property-section {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }

  .property-section h4 {
    margin: 0 0 1rem 0;
    font-size: 0.85rem;
    text-transform: uppercase;
    opacity: 0.7;
    letter-spacing: 0.5px;
  }

  .property-section label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .property-row {
    margin-bottom: 1rem;
  }

  .text-input,
  .number-input,
  .select-input {
    width: 100%;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: inherit;
    font-size: 0.9rem;
  }

  .number-input {
    width: 100%;
  }

  .color-input {
    width: 100%;
    height: 40px;
    padding: 0.25rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    cursor: pointer;
  }

  .slider-input {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    outline: none;
  }

  .slider-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #0099ff;
    cursor: pointer;
  }

  .slider-input::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #0099ff;
    cursor: pointer;
    border: none;
  }

  .filter-item {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .filter-name {
    font-size: 0.85rem;
    font-weight: 600;
  }

  .remove-btn {
    width: 20px;
    height: 20px;
    padding: 0;
    background: rgba(255, 0, 0, 0.3);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
    transition: background 0.2s;
  }

  .remove-btn:hover {
    background: rgba(255, 0, 0, 0.6);
  }

  .filter-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-value {
    font-size: 0.75rem;
    opacity: 0.7;
    min-width: 40px;
    text-align: right;
  }

  .add-filter {
    margin-top: 1rem;
  }

  .empty-state {
    padding: 3rem 2rem;
    text-align: center;
    opacity: 0.6;
  }

  .empty-state p {
    margin: 0.5rem 0;
  }

  .hint {
    font-size: 0.85rem;
    opacity: 0.7;
  }
</style>
