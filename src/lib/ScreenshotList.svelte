<script>
  import { screenshots, currentScreenshotIndex } from './stores'

  export let onSelect
  export let onDelete

  function selectScreenshot(index) {
    currentScreenshotIndex.set(index)
    if (onSelect) onSelect(index)
  }

  function deleteScreenshot(index, event) {
    event.stopPropagation()
    if (onDelete) onDelete(index)
  }
</script>

<div class="screenshot-list">
  <h3>Screenshots ({$screenshots.length})</h3>
  <div class="list-container">
    {#each $screenshots as screenshot, index}
      <div
        class="screenshot-item"
        class:active={index === $currentScreenshotIndex}
        on:click={() => selectScreenshot(index)}
        role="button"
        tabindex="0"
      >
        <img src={screenshot.image} alt="Screenshot {index + 1}" />
        <div class="screenshot-overlay">
          <span class="screenshot-number">{index + 1}</span>
          <button
            class="delete-btn"
            on:click={(e) => deleteScreenshot(index, e)}
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .screenshot-list {
    margin-bottom: 1.5rem;
  }

  .screenshot-list h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    opacity: 0.8;
  }

  .list-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }

  .screenshot-item {
    position: relative;
    aspect-ratio: 9 / 16;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
  }

  .screenshot-item:hover {
    transform: scale(1.05);
  }

  .screenshot-item.active {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
  }

  .screenshot-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .screenshot-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .screenshot-item:hover .screenshot-overlay,
  .screenshot-item.active .screenshot-overlay {
    opacity: 1;
  }

  .screenshot-number {
    font-weight: bold;
    font-size: 1.2rem;
  }

  .delete-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(255, 0, 0, 0.8);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .delete-btn:hover {
    background: rgba(255, 0, 0, 1);
  }
</style>
