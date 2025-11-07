<script>
  import { createEventDispatcher } from 'svelte'

  export let pages = []
  export let currentPageIndex = 0

  const dispatch = createEventDispatcher()

  let showAddButton = false
  let addButtonTimeout

  function handleAddPage() {
    dispatch('addPage')
  }

  function handleSelectPage(index) {
    dispatch('selectPage', index)
  }

  function handleDeletePage(index, event) {
    event.stopPropagation()
    if (pages.length > 1) {
      dispatch('deletePage', index)
    }
  }

  function handleMouseEnterLeft() {
    clearTimeout(addButtonTimeout)
    showAddButton = true
  }

  function handleMouseLeaveLeft() {
    addButtonTimeout = setTimeout(() => {
      showAddButton = false
    }, 300)
  }
</script>

<div class="page-navigator">
  <div
    class="add-page-trigger"
    on:mouseenter={handleMouseEnterLeft}
    on:mouseleave={handleMouseLeaveLeft}
  >
    <button
      class="add-page-btn"
      class:visible={showAddButton}
      on:click={handleAddPage}
      title="Add new page"
    >
      <span class="plus-icon">+</span>
    </button>
  </div>

  <div class="pages-container">
    {#each pages as page, index}
      <div
        class="page-item"
        class:active={index === currentPageIndex}
        on:click={() => handleSelectPage(index)}
        role="button"
        tabindex="0"
      >
        <div class="page-preview">
          <div class="page-number">{index + 1}</div>
          {#if pages.length > 1}
            <button
              class="delete-page-btn"
              on:click={(e) => handleDeletePage(index, e)}
              title="Delete page"
            >
              ×
            </button>
          {/if}
        </div>
        <div class="page-label">Page {index + 1}</div>
      </div>
    {/each}
  </div>
</div>

<style>
  .page-navigator {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
  }

  .add-page-trigger {
    position: relative;
    width: 60px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .add-page-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0099ff, #0066cc);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 2rem;
    font-weight: 300;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    opacity: 0;
    transform: scale(0.5);
    box-shadow: 0 4px 15px rgba(0, 153, 255, 0);
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .add-page-btn.visible {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(0, 153, 255, 0.4);
  }

  .add-page-btn:hover {
    background: linear-gradient(135deg, #00bbff, #0088ee);
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(0, 153, 255, 0.6);
  }

  .add-page-btn:active {
    transform: scale(0.95);
  }

  .plus-icon {
    margin-top: -4px;
  }

  .pages-container {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    padding: 0.25rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 153, 255, 0.5) rgba(255, 255, 255, 0.1);
  }

  .pages-container::-webkit-scrollbar {
    height: 6px;
  }

  .pages-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .pages-container::-webkit-scrollbar-thumb {
    background: rgba(0, 153, 255, 0.5);
    border-radius: 3px;
  }

  .pages-container::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 153, 255, 0.7);
  }

  .page-item {
    flex-shrink: 0;
    cursor: pointer;
    transition: all 0.2s;
  }

  .page-preview {
    position: relative;
    width: 60px;
    height: 90px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    overflow: hidden;
  }

  .page-item:hover .page-preview {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 153, 255, 0.4);
    transform: translateY(-2px);
  }

  .page-item.active .page-preview {
    background: rgba(0, 153, 255, 0.2);
    border-color: #0099ff;
    box-shadow: 0 0 20px rgba(0, 153, 255, 0.3);
  }

  .page-number {
    font-size: 1.5rem;
    font-weight: 700;
    opacity: 0.6;
  }

  .delete-page-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255, 0, 0, 0.8);
    border: none;
    color: white;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .page-item:hover .delete-page-btn {
    opacity: 1;
  }

  .delete-page-btn:hover {
    background: rgba(255, 0, 0, 1);
    transform: scale(1.1);
  }

  .page-label {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    text-align: center;
    opacity: 0.7;
  }

  .page-item.active .page-label {
    opacity: 1;
    color: #00d4ff;
    font-weight: 600;
  }
</style>
