<script>
  import { createEventDispatcher } from 'svelte'
  import { templates } from './templates'
  import { generateGradient } from './utils'

  const dispatch = createEventDispatcher()

  function selectTemplate(template) {
    dispatch('select', template)
  }

  function getBackgroundStyle(config) {
    if (config.backgroundType === 'gradient') {
      return `background: ${generateGradient(config.gradientColors, config.gradientAngle)}`
    }
    return `background-color: ${config.backgroundColor}`
  }
</script>

<div class="template-selector">
  <h3>Templates</h3>
  <div class="templates-grid">
    {#each templates as template}
      <button
        class="template-card"
        on:click={() => selectTemplate(template)}
        title={template.name}
      >
        <div class="template-preview" style={getBackgroundStyle(template.config)}>
          <div class="preview-device" />
        </div>
        <span class="template-name">{template.name}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .template-selector {
    margin-bottom: 1.5rem;
  }

  .template-selector h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    opacity: 0.8;
  }

  .templates-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .template-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .template-card:hover {
    border-color: #667eea;
    transform: translateY(-2px);
  }

  .template-preview {
    aspect-ratio: 16 / 9;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .preview-device {
    width: 30%;
    aspect-ratio: 9 / 16;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 3px;
  }

  .template-name {
    font-size: 0.85rem;
    display: block;
  }
</style>
