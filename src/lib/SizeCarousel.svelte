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
    animation: fadeIn 0.6s ease;
  }

  .carousel-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .carousel-header h3 {
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .carousel-header p {
    font-size: 1rem;
    opacity: 0.75;
    font-weight: 500;
  }

  .carousel-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .scroll-btn {
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--primary-gradient);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-primary);
    z-index: 10;
    font-weight: bold;
  }

  .scroll-btn:hover {
    transform: scale(1.15) rotate(5deg);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.6);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .scroll-btn:active {
    transform: scale(1) rotate(0deg);
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
    width: 190px;
    padding: 1.5rem;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 2px solid var(--glass-border);
    border-radius: 16px;
    cursor: pointer;
    transition: all var(--transition-normal);
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    position: relative;
    overflow: hidden;
  }

  .size-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--primary-gradient);
    transform: scaleX(0);
    transition: transform var(--transition-normal);
  }

  .size-item:hover::before {
    transform: scaleX(1);
  }

  .size-item:hover {
    transform: translateY(-6px);
    background: rgba(0, 153, 255, 0.15);
    border-color: var(--primary-color);
    box-shadow: 0 12px 32px rgba(0, 153, 255, 0.4);
  }

  .size-item.selected {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.25) 0%, rgba(0, 153, 255, 0.25) 100%);
    border-color: var(--primary-color);
    box-shadow: 0 12px 40px rgba(0, 212, 255, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1);
    transform: translateY(-6px);
  }

  .size-item.selected::before {
    transform: scaleX(1);
  }

  .size-category {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.7;
    font-weight: 700;
    color: var(--primary-color);
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }

  .size-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: inherit;
    min-height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1.3;
  }

  .size-dimensions {
    font-size: 0.75rem;
    opacity: 0.6;
    font-family: 'Courier New', monospace;
    font-weight: 600;
  }

  .size-preview {
    margin-top: 0.75rem;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    padding: 0.5rem;
  }

  .preview-box {
    max-width: 100%;
    max-height: 100%;
    background: var(--primary-gradient);
    border-radius: 6px;
    opacity: 0.7;
    box-shadow: 0 4px 12px rgba(0, 153, 255, 0.3);
    transition: all var(--transition-normal);
  }

  .size-item:hover .preview-box {
    opacity: 1;
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.5);
  }

  .custom-item {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%);
    border: 2px dashed rgba(255, 255, 255, 0.3);
  }

  .custom-item:hover {
    border-style: solid;
    border-color: var(--primary-color);
  }

  .custom-icon {
    font-size: 2.5rem;
    margin-top: 0.5rem;
    filter: drop-shadow(0 2px 8px rgba(0, 153, 255, 0.5));
  }

  .custom-input-panel {
    margin-top: 2rem;
    padding: 2rem;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border: 2px solid var(--primary-color);
    border-radius: 16px;
    animation: slideDown 0.4s ease;
    box-shadow: 0 8px 32px rgba(0, 153, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .custom-input-panel h4 {
    margin-bottom: 1.5rem;
    color: var(--primary-color);
    font-size: 1.2rem;
    font-weight: 700;
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }

  .custom-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 1.25rem;
    align-items: end;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .input-group label {
    font-size: 0.9rem;
    font-weight: 600;
    opacity: 0.9;
  }

  .input-group input {
    padding: 0.85rem 1rem;
    border-radius: 10px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.4);
    color: inherit;
    font-size: 1rem;
    font-family: 'Courier New', monospace;
    font-weight: 600;
    transition: all var(--transition-normal);
  }

  .input-group input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.25);
    background: rgba(0, 0, 0, 0.5);
  }

  .apply-btn {
    padding: 0.85rem 1.75rem;
    border-radius: 12px;
    background: var(--primary-gradient);
    border: none;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: all var(--transition-normal);
    white-space: nowrap;
    box-shadow: var(--shadow-primary);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .apply-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.6);
  }

  .apply-btn:active {
    transform: translateY(-1px) scale(1);
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
