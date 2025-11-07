<script>
  import { createEventDispatcher } from 'svelte'
  import { presetSizes } from './templates'

  export let selectedSize = null

  const dispatch = createEventDispatcher()
  let scrollContainer = null
  let showCustomInput = false
  let customWidth = 1920
  let customHeight = 1080

  // Group sizes by category
  const categories = [...new Set(presetSizes.map(s => s.category))]

  function selectSize(size) {
    selectedSize = size
    showCustomInput = false
    dispatch('select', size)
  }

  function selectCustom() {
    showCustomInput = true
    selectedSize = null
  }

  function applyCustomSize() {
    const customSize = {
      name: 'Custom',
      width: parseInt(customWidth),
      height: parseInt(customHeight),
      category: 'Custom'
    }
    selectedSize = customSize
    dispatch('select', customSize)
  }

  function scrollLeft() {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  function scrollRight() {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }
</script>

<div class="size-carousel-wrapper">
  <div class="carousel-header">
    <h3>Select Export Size</h3>
    <p>Choose a preset size or create a custom dimension</p>
  </div>

  <div class="carousel-container">
    <button class="scroll-btn left" on:click={scrollLeft} aria-label="Scroll left">
      ‹
    </button>

    <div class="carousel-scroll" bind:this={scrollContainer}>
      <div class="size-items">
        {#each presetSizes as size}
          <button
            class="size-item"
            class:selected={selectedSize?.name === size.name}
            on:click={() => selectSize(size)}
            title="{size.width} × {size.height}"
          >
            <div class="size-category">{size.category}</div>
            <div class="size-name">{size.name}</div>
            <div class="size-dimensions">{size.width} × {size.height}</div>
            <div class="size-preview">
              <div
                class="preview-box"
                style="aspect-ratio: {size.width / size.height};"
              ></div>
            </div>
          </button>
        {/each}

        <!-- Custom Size Card -->
        <button
          class="size-item custom-item"
          class:selected={showCustomInput}
          on:click={selectCustom}
        >
          <div class="size-category">Custom</div>
          <div class="size-name">Custom Size</div>
          <div class="size-dimensions">Your dimensions</div>
          <div class="custom-icon">⚙️</div>
        </button>
      </div>
    </div>

    <button class="scroll-btn right" on:click={scrollRight} aria-label="Scroll right">
      ›
    </button>
  </div>

  {#if showCustomInput}
    <div class="custom-input-panel">
      <h4>Custom Dimensions</h4>
      <div class="custom-inputs">
        <div class="input-group">
          <label for="width">Width (px)</label>
          <input
            id="width"
            type="number"
            bind:value={customWidth}
            min="1"
            max="10000"
          />
        </div>
        <div class="input-group">
          <label for="height">Height (px)</label>
          <input
            id="height"
            type="number"
            bind:value={customHeight}
            min="1"
            max="10000"
          />
        </div>
        <button class="apply-btn" on:click={applyCustomSize}>
          Apply Custom Size
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .size-carousel-wrapper {
    width: 100%;
    margin-bottom: 2rem;
  }

  .carousel-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .carousel-header h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .carousel-header p {
    font-size: 0.95rem;
    opacity: 0.7;
  }

  .carousel-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .scroll-btn {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(0, 153, 255, 0.3);
    z-index: 10;
  }

  .scroll-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 153, 255, 0.5);
  }

  .scroll-btn:active {
    transform: scale(0.95);
  }

  .carousel-scroll {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: #0099ff rgba(255, 255, 255, 0.1);
  }

  .carousel-scroll::-webkit-scrollbar {
    height: 8px;
  }

  .carousel-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .carousel-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    border-radius: 4px;
  }

  .carousel-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #00e0ff 0%, #00aaff 100%);
  }

  .size-items {
    display: flex;
    gap: 1rem;
    padding: 1rem 0;
  }

  .size-item {
    flex-shrink: 0;
    width: 180px;
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .size-item:hover {
    transform: translateY(-4px);
    background: rgba(0, 153, 255, 0.1);
    border-color: #0099ff;
    box-shadow: 0 8px 24px rgba(0, 153, 255, 0.3);
  }

  .size-item.selected {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 153, 255, 0.2) 100%);
    border-color: #00d4ff;
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.4);
  }

  .size-category {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.6;
    font-weight: 600;
    color: #00d4ff;
  }

  .size-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: inherit;
    min-height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .size-dimensions {
    font-size: 0.75rem;
    opacity: 0.5;
    font-family: 'Courier New', monospace;
  }

  .size-preview {
    margin-top: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
  }

  .preview-box {
    max-width: 100%;
    max-height: 100%;
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    border-radius: 4px;
    opacity: 0.6;
  }

  .custom-item {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%);
    border: 2px dashed rgba(255, 255, 255, 0.3);
  }

  .custom-item:hover {
    border-style: solid;
  }

  .custom-icon {
    font-size: 2rem;
    margin-top: 0.5rem;
  }

  .custom-input-panel {
    margin-top: 2rem;
    padding: 1.5rem;
    background: rgba(0, 153, 255, 0.1);
    border: 2px solid #0099ff;
    border-radius: 12px;
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .custom-input-panel h4 {
    margin-bottom: 1rem;
    color: #00d4ff;
  }

  .custom-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 1rem;
    align-items: end;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-group label {
    font-size: 0.9rem;
    font-weight: 500;
    opacity: 0.8;
  }

  .input-group input {
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.3);
    color: inherit;
    font-size: 1rem;
    font-family: 'Courier New', monospace;
  }

  .input-group input:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2);
  }

  .apply-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    border: none;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
  }

  .apply-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
  }

  .apply-btn:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    .custom-inputs {
      grid-template-columns: 1fr;
    }

    .size-item {
      width: 160px;
    }

    .scroll-btn {
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
    }
  }
</style>
