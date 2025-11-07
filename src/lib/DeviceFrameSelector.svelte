<script>
  import { createEventDispatcher } from 'svelte'
  import { deviceFrames, DeviceCategory, getAllCategories, getDevicesByCategory } from './deviceFrames'

  const dispatch = createEventDispatcher()

  export let show = false

  let selectedCategory = DeviceCategory.IPHONE
  let selectedDevice = null

  $: filteredDevices = getDevicesByCategory(selectedCategory)

  function handleSelectDevice(device) {
    selectedDevice = device
  }

  function handleConfirm() {
    if (selectedDevice) {
      dispatch('select', selectedDevice)
      show = false
    }
  }

  function handleClose() {
    show = false
    dispatch('close')
  }
</script>

{#if show}
  <div class="modal-overlay" on:click={handleClose}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2>📱 Choose Device Frame</h2>
        <p>Select a device to wrap your screenshot</p>
        <button class="close-btn" on:click={handleClose}>×</button>
      </div>

      <!-- Category Tabs -->
      <div class="category-tabs">
        {#each getAllCategories() as category}
          <button
            class="category-tab"
            class:active={selectedCategory === category}
            on:click={() => selectedCategory = category}
          >
            {category}
          </button>
        {/each}
      </div>

      <!-- Device Grid -->
      <div class="device-grid">
        {#each filteredDevices as device}
          <button
            class="device-card"
            class:selected={selectedDevice?.id === device.id}
            on:click={() => handleSelectDevice(device)}
          >
            <!-- Device Preview (simplified frame illustration) -->
            <div class="device-preview">
              <div class="device-frame" style="--corner-radius: {device.cornerRadius}px; background: {device.color}">
                <div class="device-screen">
                  {#if device.hasDynamicIsland}
                    <div class="dynamic-island"></div>
                  {:else if device.hasNotch}
                    <div class="notch"></div>
                  {/if}
                </div>
                {#if device.hasHomeButton}
                  <div class="home-button"></div>
                {/if}
              </div>
            </div>

            <!-- Device Info -->
            <div class="device-info">
              <div class="device-name">{device.name}</div>
              <div class="device-size">{device.displaySize}</div>
              <div class="device-res">{device.screenSize.width}×{device.screenSize.height}</div>
            </div>
          </button>
        {/each}
      </div>

      <!-- Actions -->
      <div class="modal-footer">
        <button class="btn-secondary" on:click={handleClose}>
          Cancel
        </button>
        <button
          class="btn-primary"
          on:click={handleConfirm}
          disabled={!selectedDevice}
        >
          Add Device Frame
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    background: linear-gradient(135deg, rgba(30, 30, 50, 0.98), rgba(20, 20, 40, 0.98));
    border-radius: 20px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    max-width: 900px;
    width: 90%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    position: relative;
    padding: 2rem 2.5rem 1.5rem;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-header h2 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    background: linear-gradient(135deg, #00d4ff, #0099ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .modal-header p {
    margin: 0;
    opacity: 0.7;
    font-size: 1rem;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1.5rem;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .close-btn:hover {
    background: rgba(255, 0, 0, 0.3);
    transform: scale(1.1);
  }

  .category-tabs {
    display: flex;
    gap: 0.5rem;
    padding: 1.5rem 2rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    overflow-x: auto;
  }

  .category-tab {
    padding: 0.5rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: inherit;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .category-tab:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .category-tab.active {
    background: rgba(0, 153, 255, 0.3);
    border-color: #0099ff;
    box-shadow: 0 0 15px rgba(0, 153, 255, 0.3);
  }

  .device-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
    padding: 2rem;
    overflow-y: auto;
    flex: 1;
  }

  .device-card {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .device-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 153, 255, 0.4);
    transform: translateY(-2px);
  }

  .device-card.selected {
    background: rgba(0, 153, 255, 0.2);
    border-color: #0099ff;
    box-shadow: 0 0 20px rgba(0, 153, 255, 0.3);
  }

  .device-preview {
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .device-frame {
    width: 60px;
    height: 120px;
    border-radius: var(--corner-radius);
    padding: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    position: relative;
  }

  .device-screen {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: calc(var(--corner-radius) - 4px);
    position: relative;
  }

  .dynamic-island {
    position: absolute;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 6px;
    background: #000;
    border-radius: 8px;
  }

  .notch {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 8px;
    background: #000;
    border-radius: 0 0 8px 8px;
  }

  .home-button {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }

  .device-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .device-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #fff;
  }

  .device-size {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .device-res {
    font-size: 0.7rem;
    font-family: 'Courier New', monospace;
    opacity: 0.5;
  }

  .modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1.5rem 2.5rem 2.5rem;
    justify-content: flex-end;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .btn-secondary,
  .btn-primary {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .btn-primary {
    background: linear-gradient(135deg, #0099ff, #0066cc);
    color: white;
    box-shadow: 0 4px 15px rgba(0, 153, 255, 0.3);
  }

  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #00bbff, #0088ee);
    box-shadow: 0 6px 25px rgba(0, 153, 255, 0.5);
    transform: translateY(-2px);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
