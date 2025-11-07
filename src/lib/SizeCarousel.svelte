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
    margin-bottom: 3rem;
    opacity: 0;
    animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .carousel-header {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .carousel-header h3 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: rgba(255, 255, 255, 0.95);
  }

  .carousel-header p {
    font-size: 1rem;
    opacity: 0.6;
    font-weight: 400;
    letter-spacing: 0.01em;
  }

  .carousel-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .scroll-btn {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 10;
    opacity: 0.8;
  }

  .scroll-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    opacity: 1;
    transform: scale(1.05);
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
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .carousel-scroll::-webkit-scrollbar {
    display: none;
  }

  .size-items {
    display: flex;
    gap: 1.25rem;
    padding: 0.5rem 0 2rem;
  }

  .size-item {
    flex-shrink: 0;
    width: 160px;
    padding: 1.25rem 1rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
    overflow: hidden;
    opacity: 0;
    animation: slideInCard 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .size-item:nth-child(1) { animation-delay: 0.1s; }
  .size-item:nth-child(2) { animation-delay: 0.15s; }
  .size-item:nth-child(3) { animation-delay: 0.2s; }
  .size-item:nth-child(4) { animation-delay: 0.25s; }
  .size-item:nth-child(5) { animation-delay: 0.3s; }
  .size-item:nth-child(6) { animation-delay: 0.35s; }
  .size-item:nth-child(7) { animation-delay: 0.4s; }
  .size-item:nth-child(8) { animation-delay: 0.45s; }

  @keyframes slideInCard {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .size-item::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0), rgba(0, 212, 255, 0.4));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .size-item:hover {
    transform: translateY(-8px) scale(1.02);
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 212, 255, 0.1);
  }

  .size-item:hover::after {
    opacity: 1;
  }

  .size-item.selected {
    background: rgba(0, 212, 255, 0.15);
    border-color: rgba(0, 212, 255, 0.5);
    box-shadow: 0 20px 50px rgba(0, 212, 255, 0.3), 0 0 0 1px rgba(0, 212, 255, 0.3);
    transform: translateY(-8px) scale(1.02);
  }

  .size-item.selected::after {
    opacity: 1;
  }

  .size-category {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.5;
    font-weight: 600;
  }

  .size-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    min-height: 2.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .size-dimensions {
    font-size: 0.7rem;
    opacity: 0.4;
    font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .size-preview {
    margin-top: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    padding: 0.25rem;
  }

  .preview-box {
    max-width: 100%;
    max-height: 100%;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.4), rgba(0, 153, 255, 0.6));
    border-radius: 4px;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .size-item:hover .preview-box {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.6), rgba(0, 153, 255, 0.8));
    transform: scale(1.05);
  }

  .size-item.selected .preview-box {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.8), rgba(0, 153, 255, 1));
    transform: scale(1.05);
  }

  .custom-item {
    background: rgba(255, 255, 255, 0.04);
    border: 1px dashed rgba(255, 255, 255, 0.2);
  }

  .custom-item:hover {
    border-style: solid;
    border-color: rgba(0, 212, 255, 0.4);
    background: rgba(255, 255, 255, 0.07);
  }

  .custom-icon {
    font-size: 2rem;
    margin-top: 0.25rem;
    opacity: 0.7;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .custom-item:hover .custom-icon {
    opacity: 1;
    transform: scale(1.1);
  }

  .custom-input-panel {
    margin-top: 2.5rem;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 16px;
    opacity: 0;
    animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .custom-input-panel h4 {
    margin-bottom: 1.5rem;
    color: rgba(255, 255, 255, 0.95);
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: -0.02em;
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
    font-size: 0.85rem;
    font-weight: 500;
    opacity: 0.6;
    letter-spacing: 0.01em;
  }

  .input-group input {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(0, 0, 0, 0.3);
    color: rgba(255, 255, 255, 0.95);
    font-size: 1rem;
    font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
    font-weight: 500;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .input-group input:focus {
    outline: none;
    border-color: rgba(0, 212, 255, 0.5);
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.15);
    background: rgba(0, 0, 0, 0.4);
  }

  .apply-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.8), rgba(0, 153, 255, 0.9));
    border: none;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
    letter-spacing: -0.01em;
  }

  .apply-btn:hover {
    transform: translateY(-2px);
    background: linear-gradient(135deg, rgba(0, 212, 255, 1), rgba(0, 153, 255, 1));
    box-shadow: 0 12px 24px rgba(0, 212, 255, 0.4);
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
