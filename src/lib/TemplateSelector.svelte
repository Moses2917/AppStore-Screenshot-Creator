<script>
  import { createEventDispatcher } from 'svelte'
  import { getAllTemplateCategories, getTemplatesByCategory } from './templates'

  const dispatch = createEventDispatcher()

  export let show = false

  let selectedCategory = 'App Store'
  let selectedTemplate = null

  $: filteredTemplates = getTemplatesByCategory(selectedCategory)

  function handleSelectTemplate(template) {
    selectedTemplate = template
  }

  function handleConfirm() {
    if (selectedTemplate) {
      dispatch('select', selectedTemplate)
      show = false
      selectedTemplate = null
    }
  }

  function handleClose() {
    show = false
    selectedTemplate = null
    dispatch('close')
  }
</script>

{#if show}
  <div class="modal-overlay" on:click={handleClose}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2>🎨 Choose Template</h2>
        <p>Start with a professionally designed template</p>
        <button class="close-btn" on:click={handleClose}>×</button>
      </div>

      <!-- Category Tabs -->
      <div class="category-tabs">
        {#each getAllTemplateCategories() as category}
          <button
            class="category-tab"
            class:active={selectedCategory === category}
            on:click={() => selectedCategory = category}
          >
            {category}
          </button>
        {/each}
      </div>

      <!-- Template Grid -->
      <div class="template-grid">
        {#each filteredTemplates as template}
          <button
            class="template-card"
            class:selected={selectedTemplate?.id === template.id}
            on:click={() => handleSelectTemplate(template)}
          >
            <!-- Template Preview -->
            <div class="template-preview">
              <div
                class="preview-canvas"
                style="background: {template.backgroundColor}; aspect-ratio: {template.canvasSize.width}/{template.canvasSize.height}"
              >
                <div class="preview-overlay">
                  <div class="preview-size">
                    {template.canvasSize.width}×{template.canvasSize.height}
                  </div>
                </div>
              </div>
            </div>

            <!-- Template Info -->
            <div class="template-info">
              <div class="template-name">{template.name}</div>
              <div class="template-description">{template.description}</div>
              <div class="template-layers">
                {template.layers.length} layer{template.layers.length !== 1 ? 's' : ''}
              </div>
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
          disabled={!selectedTemplate}
        >
          Use Template
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
    max-width: 1000px;
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

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
    padding: 2rem;
    overflow-y: auto;
    flex: 1;
  }

  .template-card {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .template-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 153, 255, 0.4);
    transform: translateY(-2px);
  }

  .template-card.selected {
    background: rgba(0, 153, 255, 0.2);
    border-color: #0099ff;
    box-shadow: 0 0 20px rgba(0, 153, 255, 0.3);
  }

  .template-preview {
    width: 100%;
  }

  .preview-canvas {
    width: 100%;
    max-height: 200px;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .preview-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .template-card:hover .preview-overlay {
    opacity: 1;
  }

  .preview-size {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: 'Courier New', monospace;
  }

  .template-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .template-name {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
  }

  .template-description {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
  }

  .template-layers {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    font-family: 'Courier New', monospace;
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
