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
      return `background: ${generateGradient(config.gradientColors, config.gradientAngle)};`
    }
    return `background-color: ${config.backgroundColor};`
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

  // Drag and drop functionality
  let draggedElement = null
  let dragOffset = { x: 0, y: 0 }
  let canvasContainer = null

  function startDrag(element, event) {
    event.preventDefault()
    draggedElement = element

    const rect = canvasContainer.getBoundingClientRect()
    const elementRect = event.target.getBoundingClientRect()

    // Calculate offset from element center
    dragOffset.x = event.clientX - elementRect.left - elementRect.width / 2
    dragOffset.y = event.clientY - elementRect.top - elementRect.height / 2

    window.addEventListener('mousemove', handleDrag)
    window.addEventListener('mouseup', stopDrag)
  }

  function handleDrag(event) {
    if (!draggedElement || !canvasContainer) return

    const rect = canvasContainer.getBoundingClientRect()
    const x = ((event.clientX - rect.left - dragOffset.x) / rect.width) * 100
    const y = ((event.clientY - rect.top - dragOffset.y) / rect.height) * 100

    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x))
    const clampedY = Math.max(0, Math.min(100, y))

    if (draggedElement.type === 'textTop') {
      updateConfig('textTopPosition', { x: clampedX, y: clampedY })
    } else if (draggedElement.type === 'textBottom') {
      updateConfig('textBottomPosition', { x: clampedX, y: clampedY })
    } else if (draggedElement.type === 'device') {
      updateConfig('devicePosition', { x: clampedX, y: clampedY })
    } else if (draggedElement.type === 'decorativeImage') {
      updateDecorativeImage(draggedElement.id, { x: clampedX, y: clampedY })
    }
  }

  function stopDrag() {
    draggedElement = null
    window.removeEventListener('mousemove', handleDrag)
    window.removeEventListener('mouseup', stopDrag)
  }

  function handleDecorativeImageUpload(event) {
    const files = Array.from(event.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          src: e.target.result,
          x: 50,
          y: 50,
          width: 150,
          height: 150
        }
        const decorativeImages = [...(config.decorativeImages || []), newImage]
        updateConfig('decorativeImages', decorativeImages)
      }
      reader.readAsDataURL(file)
    })
    event.target.value = '' // Reset input
  }

  function updateDecorativeImage(id, updates) {
    const decorativeImages = (config.decorativeImages || []).map(img =>
      img.id === id ? { ...img, ...updates } : img
    )
    updateConfig('decorativeImages', decorativeImages)
  }

  function deleteDecorativeImage(id) {
    const decorativeImages = (config.decorativeImages || []).filter(img => img.id !== id)
    updateConfig('decorativeImages', decorativeImages)
  }

  function resizeDecorativeImage(id, event, corner) {
    event.preventDefault()
    const img = config.decorativeImages?.find(i => i.id === id)
    if (!img) return

    const startX = event.clientX
    const startY = event.clientY
    const startWidth = img.width
    const startHeight = img.height
    const rect = canvasContainer.getBoundingClientRect()

    function handleResize(e) {
      const deltaX = ((e.clientX - startX) / rect.width) * 100
      const deltaY = ((e.clientY - startY) / rect.height) * 100

      let newWidth = startWidth + deltaX
      let newHeight = startHeight + deltaY

      // Maintain aspect ratio if shift is held
      if (e.shiftKey) {
        const aspectRatio = startWidth / startHeight
        newHeight = newWidth / aspectRatio
      }

      updateDecorativeImage(id, {
        width: Math.max(50, newWidth),
        height: Math.max(50, newHeight)
      })
    }

    function stopResize() {
      window.removeEventListener('mousemove', handleResize)
      window.removeEventListener('mouseup', stopResize)
    }

    window.addEventListener('mousemove', handleResize)
    window.addEventListener('mouseup', stopResize)
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
          <h3>Decorative Images</h3>
          <p style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 1rem;">Add stickers, logos, or graphics to your screenshot</p>

          <div class="control-group">
            <label class="file-upload-label">
              <input type="file" accept="image/*" multiple on:change={handleDecorativeImageUpload} style="display: none;" />
              <button class="btn-secondary" on:click={(e) => e.target.previousElementSibling.click()}>
                + Add Decorative Image
              </button>
            </label>
          </div>

          {#if config.decorativeImages && config.decorativeImages.length > 0}
            <div class="decorative-images-list">
              {#each config.decorativeImages as img, index}
                <div class="decorative-image-item">
                  <img src={img.src} alt="Decorative" />
                  <div class="decorative-image-info">
                    <span>Image {index + 1}</span>
                    <button class="delete-btn" on:click={() => deleteDecorativeImage(img.id)}>×</button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
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
      <div class="canvas-container" bind:this={canvasRef} bind:this={canvasContainer} style={getBackgroundStyle()}>
        {#if config.textTop}
          <div
            class="text-overlay draggable"
            style="{getTextStyle()} position: absolute; left: {config.textTopPosition?.x || 50}%; top: {config.textTopPosition?.y || 15}%; transform: translate(-50%, -50%); cursor: move;"
            on:mousedown={(e) => startDrag({ type: 'textTop' }, e)}
            role="button"
            tabindex="0"
          >
            {config.textTop}
            <div class="drag-hint">Drag to move</div>
          </div>
        {/if}

        <div
          class="device-wrapper draggable"
          style="position: absolute; left: {config.devicePosition?.x || 50}%; top: {config.devicePosition?.y || 50}%; transform: translate(-50%, -50%); cursor: move;"
          on:mousedown={(e) => startDrag({ type: 'device' }, e)}
          role="button"
          tabindex="0"
        >
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
          <div class="drag-hint">Drag to move</div>
        </div>

        {#if config.textBottom}
          <div
            class="text-overlay draggable"
            style="{getTextStyle()} position: absolute; left: {config.textBottomPosition?.x || 50}%; top: {config.textBottomPosition?.y || 85}%; transform: translate(-50%, -50%); cursor: move;"
            on:mousedown={(e) => startDrag({ type: 'textBottom' }, e)}
            role="button"
            tabindex="0"
          >
            {config.textBottom}
            <div class="drag-hint">Drag to move</div>
          </div>
        {/if}

        {#if config.decorativeImages}
          {#each config.decorativeImages as img}
            <div
              class="decorative-image draggable"
              style="position: absolute; left: {img.x}%; top: {img.y}%; transform: translate(-50%, -50%); cursor: move;"
              on:mousedown={(e) => startDrag({ type: 'decorativeImage', id: img.id }, e)}
              role="button"
              tabindex="0"
            >
              <img src={img.src} alt="Decorative" style="width: {img.width}px; height: {img.height}px; pointer-events: none;" />
              <div class="resize-handle" on:mousedown={(e) => resizeDecorativeImage(img.id, e, 'br')}>⋰</div>
              <div class="delete-handle" on:click={() => deleteDecorativeImage(img.id)}>×</div>
              <div class="drag-hint">Drag to move • Shift+Drag corner to resize</div>
            </div>
          {/each}
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
    position: relative;
    min-width: 800px;
    min-height: 700px;
    overflow: hidden;
  }

  .text-overlay {
    text-align: center;
    margin: 0;
    max-width: 80%;
    padding: 0.5rem 1rem;
    user-select: none;
  }

  .device-wrapper {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }

  .draggable {
    transition: box-shadow 0.2s;
  }

  .draggable:hover {
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.5);
    border-radius: 8px;
  }

  .draggable:hover .drag-hint {
    opacity: 1;
  }

  .drag-hint {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    z-index: 1000;
  }

  .decorative-image {
    position: relative;
    display: inline-block;
  }

  .decorative-image img {
    display: block;
    border-radius: 4px;
  }

  .resize-handle {
    position: absolute;
    bottom: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    background: #667eea;
    border-radius: 50%;
    cursor: nwse-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.7rem;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 10;
  }

  .decorative-image:hover .resize-handle {
    opacity: 1;
  }

  .delete-handle {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: rgba(255, 0, 0, 0.8);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    line-height: 1;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 10;
  }

  .decorative-image:hover .delete-handle {
    opacity: 1;
  }

  .delete-handle:hover {
    background: rgba(255, 0, 0, 1);
  }

  .decorative-images-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .decorative-image-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .decorative-image-item img {
    width: 100%;
    height: 80px;
    object-fit: cover;
    display: block;
  }

  .decorative-image-info {
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
  }

  .decorative-image-info .delete-btn {
    background: rgba(255, 0, 0, 0.2);
    border: none;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0;
  }

  .decorative-image-info .delete-btn:hover {
    background: rgba(255, 0, 0, 0.5);
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
