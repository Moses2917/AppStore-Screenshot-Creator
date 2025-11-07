<script>
  import { createEventDispatcher } from 'svelte'
  import { exportPresets } from './templates'
  import { isExporting, exportProgress } from './stores'

  const dispatch = createEventDispatcher()

  export let show = false
  export let isBatch = false
  export let preselectedSize = null

  let selectedPreset = 'appStore'
  let selectedSize = null
  let format = 'png'
  let quality = 1.0
  let customWidth = 1290
  let customHeight = 2796

  // If a size was preselected from the carousel, use it
  $: if (show && preselectedSize) {
    customWidth = preselectedSize.width
    customHeight = preselectedSize.height
    if (preselectedSize.category === 'Custom') {
      selectedPreset = 'custom'
    }
  }

  $: if (show && selectedPreset && exportPresets[selectedPreset]) {
    const sizes = Object.keys(exportPresets[selectedPreset].sizes)
    if (sizes.length > 0 && !selectedSize) {
      selectedSize = sizes[0]
    }
  }

  function close() {
    show = false
    dispatch('close')
  }

  function handleExport() {
    const options = {
      format,
      quality: format === 'jpg' ? quality : 1.0,
      scale: 2
    }

    if (selectedPreset !== 'custom' && selectedSize) {
      const size = exportPresets[selectedPreset].sizes[selectedSize]
      options.width = size.width
      options.height = size.height
    } else if (selectedPreset === 'custom') {
      options.width = customWidth
      options.height = customHeight
    }

    dispatch('export', { options, isBatch })
    close()
  }
</script>

{#if show}
  <div class="modal-overlay" on:click={close}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2>{isBatch ? 'Batch Export' : 'Export Screenshot'}</h2>
        <button class="close-btn" on:click={close}>×</button>
      </div>

      <div class="modal-body">
        {#if $isExporting}
          <div class="export-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: {$exportProgress}%" />
            </div>
            <p>Exporting... {Math.round($exportProgress)}%</p>
          </div>
        {:else}
          <div class="form-group">
            <label>Preset</label>
            <select bind:value={selectedPreset}>
              {#each Object.entries(exportPresets) as [key, preset]}
                <option value={key}>{preset.name}</option>
              {/each}
            </select>
          </div>

          {#if selectedPreset !== 'custom'}
            <div class="form-group">
              <label>Size</label>
              <select bind:value={selectedSize}>
                {#each Object.entries(exportPresets[selectedPreset].sizes) as [name, size]}
                  <option value={name}>{name} ({size.width}×{size.height})</option>
                {/each}
              </select>
            </div>
          {:else}
            <div class="form-row">
              <div class="form-group">
                <label>Width (px)</label>
                <input type="number" bind:value={customWidth} min="1" />
              </div>
              <div class="form-group">
                <label>Height (px)</label>
                <input type="number" bind:value={customHeight} min="1" />
              </div>
            </div>
          {/if}

          <div class="form-group">
            <label>Format</label>
            <select bind:value={format}>
              <option value="png">PNG</option>
              <option value="jpg">JPEG</option>
            </select>
          </div>

          {#if format === 'jpg'}
            <div class="form-group">
              <label>Quality ({Math.round(quality * 100)}%)</label>
              <input type="range" bind:value={quality} min="0.1" max="1" step="0.1" />
            </div>
          {/if}

          {#if isBatch}
            <p class="batch-info">
              This will export all screenshots with the same settings.
            </p>
          {/if}
        {/if}
      </div>

      <div class="modal-footer">
        <button class="secondary" on:click={close}>Cancel</button>
        <button class="primary" on:click={handleExport} disabled={$isExporting}>
          {isBatch ? 'Export All' : 'Export'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: #1a1a1a;
    border-radius: 12px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: inherit;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .form-group select,
  .form-group input {
    width: 100%;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.2);
    color: inherit;
    font-size: 1rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-footer button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s;
    border: none;
  }

  .modal-footer button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .modal-footer button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .primary {
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 153, 255, 0.3);
  }

  .primary:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(0, 153, 255, 0.5);
  }

  .secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: inherit;
  }

  .batch-info {
    padding: 1rem;
    background: rgba(0, 153, 255, 0.1);
    border-radius: 6px;
    border-left: 3px solid #0099ff;
    margin-top: 1rem;
  }

  .export-progress {
    text-align: center;
    padding: 2rem;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 1rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00d4ff, #0099ff);
    transition: width 0.3s ease;
  }
</style>
