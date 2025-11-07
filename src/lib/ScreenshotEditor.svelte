<script>
  import { onMount } from 'svelte'
  import { screenshots, currentScreenshotIndex, currentScreenshot, isExporting, exportProgress, createScreenshot, saveProject, loadProject, getSavedProjects, deleteProject } from './stores'
  import { exportScreenshot, batchExport, generateGradient, applyImageFilters, handleKeyboardShortcut } from './utils'
  import { fontFamilies } from './templates'
  import FileUpload from './FileUpload.svelte'
  import ScreenshotList from './ScreenshotList.svelte'
  import TemplateSelector from './TemplateSelector.svelte'
  import ExportModal from './ExportModal.svelte'
  import KeyboardShortcuts from './KeyboardShortcuts.svelte'

  let canvasRef = null
  let showExportModal = false
  let showKeyboardShortcuts = false
  let isBatchExport = false
  let projectName = ''
  let savedProjects = []

  $: config = $currentScreenshot?.config || {}
  $: hasScreenshots = $screenshots.length > 0

  onMount(() => {
    savedProjects = getSavedProjects()

    // Keyboard shortcuts
    window.addEventListener('keydown', handleKeyboard)
    return () => {
      window.removeEventListener('keydown', handleKeyboard)
    }
  })

  function handleKeyboard(event) {
    // Don't trigger shortcuts when typing in inputs
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return
    }

    handleKeyboardShortcut(event, {
      'ctrl+s': handleSaveProject,
      'ctrl+e': () => openExportModal(false),
      'ctrl+shift+e': () => openExportModal(true),
      'ctrl+d': duplicateScreenshot,
      'delete': deleteCurrentScreenshot,
      'ctrl+arrowleft': previousScreenshot,
      'ctrl+arrowright': nextScreenshot,
      '?': () => showKeyboardShortcuts = true
    })
  }

  function handleUpload(event) {
    const { images } = event.detail
    const newScreenshots = images.map(img => createScreenshot(img))
    screenshots.update(s => [...s, ...newScreenshots])

    if ($screenshots.length === newScreenshots.length) {
      currentScreenshotIndex.set(0)
    }
  }

  function selectScreenshot(index) {
    currentScreenshotIndex.set(index)
  }

  function deleteScreenshot(index) {
    screenshots.update(s => {
      const newScreenshots = s.filter((_, i) => i !== index)
      if ($currentScreenshotIndex >= newScreenshots.length) {
        currentScreenshotIndex.set(Math.max(0, newScreenshots.length - 1))
      }
      return newScreenshots
    })
  }

  function deleteCurrentScreenshot() {
    if ($currentScreenshot) {
      deleteScreenshot($currentScreenshotIndex)
    }
  }

  function duplicateScreenshot() {
    if ($currentScreenshot) {
      const duplicate = createScreenshot($currentScreenshot.image)
      duplicate.config = { ...$currentScreenshot.config }
      screenshots.update(s => [...s, duplicate])
    }
  }

  function previousScreenshot() {
    if ($currentScreenshotIndex > 0) {
      currentScreenshotIndex.update(i => i - 1)
    }
  }

  function nextScreenshot() {
    if ($currentScreenshotIndex < $screenshots.length - 1) {
      currentScreenshotIndex.update(i => i + 1)
    }
  }

  function selectTemplate(event) {
    const template = event.detail
    if ($currentScreenshot) {
      screenshots.update(s => {
        s[$currentScreenshotIndex].config = {
          ...s[$currentScreenshotIndex].config,
          ...template.config
        }
        return s
      })
    }
  }

  function updateConfig(key, value) {
    if ($currentScreenshot) {
      screenshots.update(s => {
        s[$currentScreenshotIndex].config[key] = value
        return s
      })
    }
  }

  function openExportModal(batch) {
    isBatchExport = batch
    showExportModal = true
  }

  async function handleExport(event) {
    const { options, isBatch } = event.detail

    isExporting.set(true)
    exportProgress.set(0)

    try {
      if (isBatch) {
        const elements = $screenshots.map((_, index) => {
          return { element: document.querySelectorAll('.canvas-container')[index] || canvasRef }
        })

        await batchExport(elements, options, (progress) => {
          exportProgress.set(progress)
        })
      } else {
        await exportScreenshot(canvasRef, options)
        exportProgress.set(100)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Error exporting screenshot. Please try again.')
    } finally {
      isExporting.set(false)
      exportProgress.set(0)
    }
  }

  function handleSaveProject() {
    if (!projectName) {
      projectName = prompt('Enter project name:')
    }
    if (projectName) {
      saveProject(projectName)
      savedProjects = getSavedProjects()
      alert(`Project "${projectName}" saved!`)
    }
  }

  function handleLoadProject(name) {
    loadProject(name)
    projectName = name
  }

  function handleDeleteProject(name) {
    if (confirm(`Delete project "${name}"?`)) {
      deleteProject(name)
      savedProjects = getSavedProjects()
      if (projectName === name) {
        projectName = ''
      }
    }
  }

  function getBackgroundStyle() {
    if (!config) return ''

    if (config.backgroundType === 'gradient') {
      return `background: ${generateGradient(config.gradientColors, config.gradientAngle)}`
    }
    return `background-color: ${config.backgroundColor}`
  }

  function getTextStyle() {
    if (!config) return ''

    let style = `
      color: ${config.textColor};
      font-size: ${config.fontSize}px;
      font-family: ${config.fontFamily};
      font-weight: ${config.fontWeight};
    `

    if (config.textShadow) {
      style += 'text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);'
    }

    return style
  }

  function getImageStyle() {
    if (!config) return ''

    const filters = applyImageFilters(config)
    let style = `filter: ${filters};`

    if (config.rotation) {
      style += `transform: rotate(${config.rotation}deg);`
    }

    return style
  }
</script>

<div class="editor-container" class:no-screenshots={!hasScreenshots}>
  {#if hasScreenshots}
    <div class="controls">
      <ScreenshotList onSelect={selectScreenshot} onDelete={deleteScreenshot} />

      {#if $currentScreenshot}
        <TemplateSelector on:select={selectTemplate} />

        <div class="control-section">
          <h3>Background</h3>

          <div class="control-group">
            <label>Type</label>
            <select value={config.backgroundType} on:change={(e) => updateConfig('backgroundType', e.target.value)}>
              <option value="solid">Solid</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>

          {#if config.backgroundType === 'solid'}
            <div class="control-group">
              <label>Color</label>
              <input type="color" value={config.backgroundColor} on:input={(e) => updateConfig('backgroundColor', e.target.value)} />
            </div>
          {:else}
            <div class="control-group">
              <label>Gradient Colors</label>
              <div class="gradient-colors">
                <input type="color" value={config.gradientColors[0]} on:input={(e) => {
                  const colors = [...config.gradientColors]
                  colors[0] = e.target.value
                  updateConfig('gradientColors', colors)
                }} />
                <input type="color" value={config.gradientColors[1]} on:input={(e) => {
                  const colors = [...config.gradientColors]
                  colors[1] = e.target.value
                  updateConfig('gradientColors', colors)
                }} />
              </div>
            </div>
            <div class="control-group">
              <label>Angle ({config.gradientAngle}°)</label>
              <input type="range" min="0" max="360" value={config.gradientAngle} on:input={(e) => updateConfig('gradientAngle', parseInt(e.target.value))} />
            </div>
          {/if}
        </div>

        <div class="control-section">
          <h3>Device Frame</h3>
          <div class="control-group">
            <select value={config.deviceFrame} on:change={(e) => updateConfig('deviceFrame', e.target.value)}>
              <option value="iphone">iPhone</option>
              <option value="ipad">iPad</option>
              <option value="none">No Frame</option>
            </select>
          </div>
        </div>

        <div class="control-section">
          <h3>Text</h3>

          <div class="control-group">
            <label>Top Text</label>
            <input type="text" value={config.textTop} on:input={(e) => updateConfig('textTop', e.target.value)} placeholder="Enter text" />
          </div>

          <div class="control-group">
            <label>Bottom Text</label>
            <input type="text" value={config.textBottom} on:input={(e) => updateConfig('textBottom', e.target.value)} placeholder="Enter text" />
          </div>

          <div class="control-group">
            <label>Font</label>
            <select value={config.fontFamily} on:change={(e) => updateConfig('fontFamily', e.target.value)}>
              {#each fontFamilies as font}
                <option value={font.value}>{font.name}</option>
              {/each}
            </select>
          </div>

          <div class="control-group">
            <label>Size ({config.fontSize}px)</label>
            <input type="range" min="16" max="72" value={config.fontSize} on:input={(e) => updateConfig('fontSize', parseInt(e.target.value))} />
          </div>

          <div class="control-group">
            <label>Weight</label>
            <select value={config.fontWeight} on:change={(e) => updateConfig('fontWeight', e.target.value)}>
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="900">Black</option>
            </select>
          </div>

          <div class="control-group">
            <label>Color</label>
            <input type="color" value={config.textColor} on:input={(e) => updateConfig('textColor', e.target.value)} />
          </div>

          <div class="control-group checkbox">
            <label>
              <input type="checkbox" checked={config.textShadow} on:change={(e) => updateConfig('textShadow', e.target.checked)} />
              Text Shadow
            </label>
          </div>
        </div>

        <div class="control-section">
          <h3>Image Adjustments</h3>

          <div class="control-group">
            <label>Brightness ({config.brightness}%)</label>
            <input type="range" min="0" max="200" value={config.brightness} on:input={(e) => updateConfig('brightness', parseInt(e.target.value))} />
          </div>

          <div class="control-group">
            <label>Contrast ({config.contrast}%)</label>
            <input type="range" min="0" max="200" value={config.contrast} on:input={(e) => updateConfig('contrast', parseInt(e.target.value))} />
          </div>

          <div class="control-group">
            <label>Saturation ({config.saturation}%)</label>
            <input type="range" min="0" max="200" value={config.saturation} on:input={(e) => updateConfig('saturation', parseInt(e.target.value))} />
          </div>

          <div class="control-group">
            <label>Rotation ({config.rotation}°)</label>
            <input type="range" min="-180" max="180" value={config.rotation} on:input={(e) => updateConfig('rotation', parseInt(e.target.value))} />
          </div>
        </div>

        <div class="control-section">
          <h3>Projects</h3>

          <div class="control-group">
            <input type="text" bind:value={projectName} placeholder="Project name" />
          </div>

          <button class="btn-secondary" on:click={handleSaveProject}>Save Project</button>

          {#if savedProjects.length > 0}
            <div class="saved-projects">
              {#each savedProjects as project}
                <div class="project-item">
                  <button class="project-name" on:click={() => handleLoadProject(project)}>
                    {project}
                  </button>
                  <button class="project-delete" on:click={() => handleDeleteProject(project)}>×</button>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <div class="action-buttons">
          <button class="btn-primary" on:click={() => openExportModal(false)}>
            Export Current
          </button>
          <button class="btn-primary" on:click={() => openExportModal(true)}>
            Batch Export All
          </button>
          <button class="btn-secondary" on:click={duplicateScreenshot}>
            Duplicate
          </button>
          <button class="btn-secondary" on:click={() => showKeyboardShortcuts = true}>
            Shortcuts (?)
          </button>
        </div>
      {/if}
    </div>
  {/if}

  <div class="preview">
    {#if hasScreenshots && $currentScreenshot}
      <div class="canvas-container" bind:this={canvasRef} style={getBackgroundStyle()}>
        {#if config.textTop}
          <h2 class="text-overlay top" style={getTextStyle()}>{config.textTop}</h2>
        {/if}

        <div class="device-wrapper">
          {#if config.deviceFrame === 'iphone'}
            <div class="device-frame iphone">
              <img src={$currentScreenshot.image} alt="Screenshot" style={getImageStyle()} />
            </div>
          {:else if config.deviceFrame === 'ipad'}
            <div class="device-frame ipad">
              <img src={$currentScreenshot.image} alt="Screenshot" style={getImageStyle()} />
            </div>
          {:else}
            <img src={$currentScreenshot.image} alt="Screenshot" class="no-frame" style={getImageStyle()} />
          {/if}
        </div>

        {#if config.textBottom}
          <h2 class="text-overlay bottom" style={getTextStyle()}>{config.textBottom}</h2>
        {/if}
      </div>
    {:else if !hasScreenshots}
      <div class="empty-state">
        <div class="empty-content">
          <h2>Get Started</h2>
          <p>Upload your screenshots to create beautiful App Store images</p>
          <FileUpload on:upload={handleUpload} />
        </div>
      </div>
    {/if}
  </div>
</div>

<ExportModal bind:show={showExportModal} {isBatchExport} on:export={handleExport} />
<KeyboardShortcuts bind:show={showKeyboardShortcuts} />

<style>
  .editor-container {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 2rem;
    align-items: start;
  }

  .editor-container.no-screenshots {
    grid-template-columns: 1fr;
  }

  .controls {
    background: rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-height: 90vh;
    overflow-y: auto;
  }

  .control-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .control-section:last-of-type {
    border-bottom: none;
  }

  .control-section h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    opacity: 0.6;
    margin-bottom: 1rem;
    letter-spacing: 0.5px;
  }

  .control-group {
    margin-bottom: 1rem;
  }

  .control-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .control-group.checkbox label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .control-group input[type="text"],
  .control-group select {
    width: 100%;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.2);
    color: inherit;
    font-size: 0.95rem;
  }

  .control-group input[type="color"] {
    width: 100%;
    height: 40px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
  }

  .control-group input[type="range"] {
    width: 100%;
  }

  .control-group input[type="checkbox"] {
    width: auto;
  }

  .gradient-colors {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 0.8rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s;
    border: none;
    font-size: 0.95rem;
  }

  .btn-primary:hover,
  .btn-secondary:hover {
    transform: translateY(-2px);
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: inherit;
  }

  .saved-projects {
    margin-top: 1rem;
    max-height: 150px;
    overflow-y: auto;
  }

  .project-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }

  .project-name {
    flex: 1;
    background: none;
    border: none;
    color: inherit;
    text-align: left;
    cursor: pointer;
    padding: 0;
    font-size: 0.9rem;
  }

  .project-name:hover {
    color: #667eea;
  }

  .project-delete {
    background: rgba(255, 0, 0, 0.2);
    border: none;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
    padding: 0;
  }

  .project-delete:hover {
    background: rgba(255, 0, 0, 0.5);
  }

  .preview {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 600px;
  }

  .canvas-container {
    padding: 3rem;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    min-width: 600px;
  }

  .text-overlay {
    text-align: center;
    margin: 0;
    max-width: 80%;
  }

  .device-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .device-frame {
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    background: #000;
  }

  .device-frame.iphone {
    width: 390px;
    height: 844px;
    border-radius: 47px;
  }

  .device-frame.ipad {
    width: 600px;
    height: 800px;
    border-radius: 18px;
  }

  .device-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .no-frame {
    max-width: 100%;
    max-height: 800px;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  .empty-state {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
  }

  .empty-content {
    max-width: 600px;
    width: 100%;
    text-align: center;
  }

  .empty-content h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .empty-content p {
    font-size: 1.2rem;
    opacity: 0.7;
    margin-bottom: 2rem;
  }

  @media (max-width: 1024px) {
    .editor-container {
      grid-template-columns: 1fr;
    }

    .controls {
      max-height: none;
    }
  }
</style>
