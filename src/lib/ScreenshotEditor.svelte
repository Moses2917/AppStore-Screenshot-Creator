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
  import SizeCarousel from './SizeCarousel.svelte'
  import EditorTabs from './EditorTabs.svelte'

  let canvasRef = null
  let showExportModal = false
  let showKeyboardShortcuts = false
  let isBatchExport = false
  let projectName = ''
  let savedProjects = []
  let selectedExportSize = null
  let activeTab = 'design'

  $: config = $currentScreenshot?.config || {}
  $: hasScreenshots = $screenshots.length > 0

  // Reactive styles
  $: backgroundStyle = !config ? '' :
    config.backgroundType === 'gradient'
      ? `background: ${generateGradient(config.gradientColors, config.gradientAngle)};`
      : `background-color: ${config.backgroundColor};`

  $: textStyle = !config ? '' :
    `color: ${config.textColor};
     font-size: ${config.fontSize}px;
     font-family: ${config.fontFamily};
     font-weight: ${config.fontWeight};
     ${config.textShadow ? 'text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);' : ''}`

  $: imageStyle = !config ? '' :
    `filter: ${applyImageFilters(config)};
     ${config.rotation ? `transform: rotate(${config.rotation}deg);` : ''}`

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

  // Drag and drop functionality with performance optimization
  let draggedElement = null
  let dragOffset = { x: 0, y: 0 }
  let dragStartPosition = { x: 0, y: 0 }
  let currentDragElement = null
  let lastFrameTime = 0
  const FRAME_DELAY = 1000 / 60 // 60fps throttle

  function startDrag(element, event) {
    event.preventDefault()
    draggedElement = element
    currentDragElement = event.currentTarget

    const rect = canvasRef.getBoundingClientRect()
    const elementRect = event.target.getBoundingClientRect()

    // Calculate offset from element center
    dragOffset.x = event.clientX - elementRect.left - elementRect.width / 2
    dragOffset.y = event.clientY - elementRect.top - elementRect.height / 2

    // Store initial position
    if (element.type === 'textTop') {
      dragStartPosition = { ...config.textTopPosition } || { x: 50, y: 15 }
    } else if (element.type === 'textBottom') {
      dragStartPosition = { ...config.textBottomPosition } || { x: 50, y: 85 }
    } else if (element.type === 'device') {
      dragStartPosition = { ...config.devicePosition } || { x: 50, y: 50 }
    } else if (element.type === 'decorativeImage') {
      const img = config.decorativeImages?.find(i => i.id === element.id)
      dragStartPosition = img ? { x: img.x, y: img.y } : { x: 50, y: 50 }
    }

    window.addEventListener('mousemove', handleDrag)
    window.addEventListener('mouseup', stopDrag)
  }

  function handleDrag(event) {
    if (!draggedElement || !canvasRef || !currentDragElement) return

    // Throttle to 60fps
    const now = Date.now()
    if (now - lastFrameTime < FRAME_DELAY) return
    lastFrameTime = now

    const rect = canvasRef.getBoundingClientRect()
    const x = ((event.clientX - rect.left - dragOffset.x) / rect.width) * 100
    const y = ((event.clientY - rect.top - dragOffset.y) / rect.height) * 100

    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x))
    const clampedY = Math.max(0, Math.min(100, y))

    // Apply visual update directly via CSS (no store update)
    currentDragElement.style.left = `${clampedX}%`
    currentDragElement.style.top = `${clampedY}%`
  }

  function stopDrag() {
    if (!draggedElement || !canvasRef || !currentDragElement) {
      draggedElement = null
      currentDragElement = null
      window.removeEventListener('mousemove', handleDrag)
      window.removeEventListener('mouseup', stopDrag)
      return
    }

    // Get final position from element style
    const finalX = parseFloat(currentDragElement.style.left) || dragStartPosition.x
    const finalY = parseFloat(currentDragElement.style.top) || dragStartPosition.y

    // Only update store once at the end
    if (draggedElement.type === 'textTop') {
      updateConfig('textTopPosition', { x: finalX, y: finalY })
    } else if (draggedElement.type === 'textBottom') {
      updateConfig('textBottomPosition', { x: finalX, y: finalY })
    } else if (draggedElement.type === 'device') {
      updateConfig('devicePosition', { x: finalX, y: finalY })
    } else if (draggedElement.type === 'decorativeImage') {
      updateDecorativeImage(draggedElement.id, { x: finalX, y: finalY })
    }

    draggedElement = null
    currentDragElement = null
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
    event.stopPropagation() // Prevent drag handler from triggering
    const img = config.decorativeImages?.find(i => i.id === id)
    if (!img) return

    const startX = event.clientX
    const startY = event.clientY
    const startWidth = img.width
    const startHeight = img.height
    const resizeElement = event.currentTarget.parentElement.querySelector('img')
    let lastResizeTime = 0
    const RESIZE_FRAME_DELAY = 1000 / 60 // 60fps throttle

    function handleResize(e) {
      // Throttle to 60fps
      const now = Date.now()
      if (now - lastResizeTime < RESIZE_FRAME_DELAY) return
      lastResizeTime = now

      // Calculate delta in pixels instead of percentages
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      let newWidth = startWidth + deltaX
      let newHeight = startHeight + deltaY

      // Maintain aspect ratio if shift is held
      if (e.shiftKey) {
        const aspectRatio = startWidth / startHeight
        newHeight = newWidth / aspectRatio
      }

      // Apply visual update directly via CSS (no store update)
      const clampedWidth = Math.max(50, newWidth)
      const clampedHeight = Math.max(50, newHeight)
      resizeElement.style.width = `${clampedWidth}px`
      resizeElement.style.height = `${clampedHeight}px`
    }

    function stopResize() {
      // Update store only once at the end
      const finalWidth = parseFloat(resizeElement.style.width) || startWidth
      const finalHeight = parseFloat(resizeElement.style.height) || startHeight

      updateDecorativeImage(id, {
        width: Math.max(50, finalWidth),
        height: Math.max(50, finalHeight)
      })

      window.removeEventListener('mousemove', handleResize)
      window.removeEventListener('mouseup', stopResize)
    }

    window.addEventListener('mousemove', handleResize)
    window.addEventListener('mouseup', stopResize)
  }

  function handleSizeSelect(event) {
    selectedExportSize = event.detail
  }
</script>

<div class="size-carousel-section">
  <SizeCarousel on:select={handleSizeSelect} bind:selectedSize={selectedExportSize} />
</div>

<div class="editor-container" class:no-screenshots={!hasScreenshots}>
  {#if hasScreenshots}
    <div class="controls">
      <div class="controls-header">
        <ScreenshotList onSelect={selectScreenshot} onDelete={deleteScreenshot} />
      </div>

      {#if $currentScreenshot}
        <EditorTabs bind:activeTab>
          {#if activeTab === 'design'}
          <div class="tab-content">
            <div class="control-section">
              <h3>Templates</h3>
              <TemplateSelector on:select={selectTemplate} />
            </div>

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
                <label>Frame Style</label>
                <select value={config.deviceFrame} on:change={(e) => updateConfig('deviceFrame', e.target.value)}>
                  <option value="iphone">iPhone</option>
                  <option value="ipad">iPad</option>
                  <option value="none">No Frame</option>
                </select>
              </div>
            </div>
          </div>
          {/if}

          {#if activeTab === 'text'}
          <div class="tab-content">
            <div class="control-section">
              <h3>Text Content</h3>

              <div class="control-group">
                <label>Top Text</label>
                <input type="text" value={config.textTop} on:input={(e) => updateConfig('textTop', e.target.value)} placeholder="Enter top text" />
              </div>

              <div class="control-group">
                <label>Bottom Text</label>
                <input type="text" value={config.textBottom} on:input={(e) => updateConfig('textBottom', e.target.value)} placeholder="Enter bottom text" />
              </div>
            </div>

            <div class="control-section">
              <h3>Typography</h3>

              <div class="control-group">
                <label>Font Family</label>
                <select value={config.fontFamily} on:change={(e) => updateConfig('fontFamily', e.target.value)}>
                  {#each fontFamilies as font}
                    <option value={font.value}>{font.name}</option>
                  {/each}
                </select>
              </div>

              <div class="control-group">
                <label>Font Size ({config.fontSize}px)</label>
                <input type="range" min="16" max="72" value={config.fontSize} on:input={(e) => updateConfig('fontSize', parseInt(e.target.value))} />
              </div>

              <div class="control-group">
                <label>Font Weight</label>
                <select value={config.fontWeight} on:change={(e) => updateConfig('fontWeight', e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="900">Black</option>
                </select>
              </div>
            </div>

            <div class="control-section">
              <h3>Text Styling</h3>

              <div class="control-group">
                <label>Text Color</label>
                <input type="color" value={config.textColor} on:input={(e) => updateConfig('textColor', e.target.value)} />
              </div>

              <div class="control-group checkbox">
                <label>
                  <input type="checkbox" checked={config.textShadow} on:change={(e) => updateConfig('textShadow', e.target.checked)} />
                  Enable Text Shadow
                </label>
              </div>
            </div>
          </div>
          {/if}

          {#if activeTab === 'effects'}
          <div class="tab-content">
            <div class="control-section">
              <h3>Color Adjustments</h3>

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
            </div>

            <div class="control-section">
              <h3>Transform</h3>

              <div class="control-group">
                <label>Rotation ({config.rotation}°)</label>
                <input type="range" min="-180" max="180" value={config.rotation} on:input={(e) => updateConfig('rotation', parseInt(e.target.value))} />
              </div>
            </div>

            <div class="effect-presets">
              <h3>Quick Presets</h3>
              <div class="preset-grid">
                <button class="preset-btn" on:click={() => {
                  updateConfig('brightness', 100)
                  updateConfig('contrast', 100)
                  updateConfig('saturation', 100)
                  updateConfig('rotation', 0)
                }}>
                  Reset All
                </button>
                <button class="preset-btn" on:click={() => {
                  updateConfig('brightness', 120)
                  updateConfig('contrast', 110)
                  updateConfig('saturation', 90)
                }}>
                  Vibrant
                </button>
                <button class="preset-btn" on:click={() => {
                  updateConfig('brightness', 95)
                  updateConfig('contrast', 115)
                  updateConfig('saturation', 80)
                }}>
                  Dramatic
                </button>
                <button class="preset-btn" on:click={() => {
                  updateConfig('saturation', 0)
                }}>
                  B&W
                </button>
              </div>
            </div>
          </div>
          {/if}

          {#if activeTab === 'decorations'}
          <div class="tab-content">
            <div class="control-section">
              <h3>Add Decorations</h3>
              <p class="section-description">Enhance your screenshot with stickers, logos, or custom graphics</p>

              <div class="control-group">
                <label class="file-upload-label">
                  <input type="file" accept="image/*" multiple on:change={handleDecorativeImageUpload} style="display: none;" />
                  <button class="btn-upload" on:click={(e) => e.target.previousElementSibling.click()}>
                    <span class="upload-icon">📤</span>
                    <span>Upload Decorative Image</span>
                  </button>
                </label>
              </div>
            </div>

            {#if config.decorativeImages && config.decorativeImages.length > 0}
              <div class="control-section">
                <h3>Manage Decorations ({config.decorativeImages.length})</h3>
                <div class="decorative-images-list">
                  {#each config.decorativeImages as img, index}
                    <div class="decorative-image-item">
                      <img src={img.src} alt="Decorative" />
                      <div class="decorative-image-info">
                        <div class="image-details">
                          <span class="image-label">Image {index + 1}</span>
                          <span class="image-size">{img.width}×{img.height}px</span>
                        </div>
                        <button class="delete-btn" on:click={() => deleteDecorativeImage(img.id)}>×</button>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {:else}
              <div class="empty-decorations">
                <div class="empty-icon">🖼️</div>
                <p>No decorations added yet</p>
                <p class="empty-hint">Upload images to add decorative elements to your screenshot</p>
              </div>
            {/if}
          </div>
          {/if}

          {#if activeTab === 'projects'}
          <div class="tab-content">
            <div class="control-section">
              <h3>Save Project</h3>

              <div class="control-group">
                <label>Project Name</label>
                <input type="text" bind:value={projectName} placeholder="Enter project name" />
              </div>

              <button class="btn-save-project" on:click={handleSaveProject}>
                <span class="save-icon">💾</span>
                Save Current Project
              </button>
            </div>

            {#if savedProjects.length > 0}
              <div class="control-section">
                <h3>Saved Projects ({savedProjects.length})</h3>
                <div class="saved-projects">
                  {#each savedProjects as project}
                    <div class="project-item">
                      <button class="project-name" on:click={() => handleLoadProject(project)}>
                        <span class="project-icon">📁</span>
                        <span class="project-text">{project}</span>
                      </button>
                      <button class="project-delete" on:click={() => handleDeleteProject(project)}>×</button>
                    </div>
                  {/each}
                </div>
              </div>
            {:else}
              <div class="empty-projects">
                <div class="empty-icon">💾</div>
                <p>No saved projects</p>
                <p class="empty-hint">Save your work to reload it later</p>
              </div>
            {/if}
          </div>
          {/if}
        </EditorTabs>

        <div class="controls-footer">
          {#if selectedExportSize}
            <div class="selected-size-info">
              <span class="size-label">Export as:</span>
              <span class="size-value">{selectedExportSize.name}</span>
              <span class="size-dims">{selectedExportSize.width} × {selectedExportSize.height}</span>
            </div>
          {/if}
          <div class="action-buttons">
            <button class="btn-primary" on:click={() => openExportModal(false)}>
              <span class="btn-icon">📸</span>
              Export Current
            </button>
            <button class="btn-primary" on:click={() => openExportModal(true)}>
              <span class="btn-icon">📦</span>
              Batch Export All
            </button>
            <button class="btn-secondary" on:click={duplicateScreenshot}>
              <span class="btn-icon">📋</span>
              Duplicate
            </button>
            <button class="btn-secondary" on:click={() => showKeyboardShortcuts = true}>
              <span class="btn-icon">⌨️</span>
              Shortcuts
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <div class="preview">
    {#if hasScreenshots && $currentScreenshot}
      <div class="canvas-container" bind:this={canvasRef} style={backgroundStyle}>
        {#if config.textTop}
          <div
            class="text-overlay draggable"
            style="{textStyle} position: absolute; left: {config.textTopPosition?.x || 50}%; top: {config.textTopPosition?.y || 15}%; transform: translate(-50%, -50%); cursor: move;"
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
              <img src={$currentScreenshot.image} alt="Screenshot" style={imageStyle} />
            </div>
          {:else if config.deviceFrame === 'ipad'}
            <div class="device-frame ipad">
              <img src={$currentScreenshot.image} alt="Screenshot" style={imageStyle} />
            </div>
          {:else}
            <img src={$currentScreenshot.image} alt="Screenshot" class="no-frame" style={imageStyle} />
          {/if}
          <div class="drag-hint">Drag to move</div>
        </div>

        {#if config.textBottom}
          <div
            class="text-overlay draggable"
            style="{textStyle} position: absolute; left: {config.textBottomPosition?.x || 50}%; top: {config.textBottomPosition?.y || 85}%; transform: translate(-50%, -50%); cursor: move;"
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

<ExportModal bind:show={showExportModal} {isBatchExport} preselectedSize={selectedExportSize} on:export={handleExport} />
<KeyboardShortcuts bind:show={showKeyboardShortcuts} />

<style>
  .size-carousel-section {
    margin-bottom: 3rem;
    padding: 2.5rem 2rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    opacity: 0;
    animation: fadeInSection 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes fadeInSection {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .editor-container {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 2rem;
    align-items: start;
    animation: fadeIn 0.6s ease 0.2s both;
  }

  .editor-container.no-screenshots {
    grid-template-columns: 1fr;
  }

  .controls {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    padding: 2rem;
    border-radius: 20px;
    border: 1px solid var(--glass-border);
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-lg);
    position: sticky;
    top: 1rem;
    min-height: 0;
  }

  .controls-header {
    flex-shrink: 0;
    margin-bottom: 1.5rem;
  }

  .controls :global(.tabs-container) {
    flex: 1;
    min-height: 0;
  }

  .controls-footer {
    flex-shrink: 0;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 2px solid rgba(255, 255, 255, 0.1);
  }

  .tab-content {
    animation: fadeIn 0.3s ease;
  }

  .control-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all var(--transition-normal);
  }

  .control-section:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(0, 153, 255, 0.3);
  }

  .control-section:last-of-type {
    margin-bottom: 0;
  }

  .control-section h3 {
    font-size: 0.85rem;
    text-transform: uppercase;
    opacity: 0.7;
    margin-bottom: 1.25rem;
    letter-spacing: 1px;
    font-weight: 700;
    color: var(--primary-color);
  }

  .control-group {
    margin-bottom: 1.25rem;
  }

  .control-group label {
    display: block;
    margin-bottom: 0.6rem;
    font-weight: 600;
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .control-group.checkbox label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
  }

  .control-group input[type="text"],
  .control-group select {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(0, 0, 0, 0.3);
    color: inherit;
    font-size: 0.95rem;
    transition: all var(--transition-normal);
  }

  .control-group input[type="text"]:focus,
  .control-group select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2);
    background: rgba(0, 0, 0, 0.4);
  }

  .control-group input[type="color"] {
    width: 100%;
    height: 48px;
    border-radius: 10px;
    border: 2px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    transition: all var(--transition-normal);
  }

  .control-group input[type="color"]:hover {
    border-color: var(--primary-color);
    transform: scale(1.02);
  }

  .control-group input[type="range"] {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
    outline: none;
    -webkit-appearance: none;
  }

  .control-group input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--primary-gradient);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 153, 255, 0.5);
  }

  .control-group input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--primary-gradient);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 153, 255, 0.5);
  }

  .control-group input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: var(--primary-color);
  }

  .gradient-colors {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .selected-size-info {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 153, 255, 0.15) 100%);
    border: 2px solid #00d4ff;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .size-label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.7;
    margin-bottom: 0.25rem;
  }

  .size-value {
    display: block;
    font-size: 1rem;
    font-weight: 600;
    color: #00d4ff;
    margin-bottom: 0.25rem;
  }

  .size-dims {
    display: block;
    font-size: 0.85rem;
    font-family: 'Courier New', monospace;
    opacity: 0.6;
  }

  .section-description {
    font-size: 0.85rem;
    opacity: 0.7;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    animation: slideIn 0.5s ease;
  }

  .btn-icon {
    margin-right: 0.5rem;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all var(--transition-normal);
    border: none;
    font-size: 1rem;
    position: relative;
    overflow: hidden;
  }

  .btn-primary:hover,
  .btn-secondary:hover {
    transform: translateY(-3px);
  }

  .btn-primary:active,
  .btn-secondary:active {
    transform: translateY(-1px);
  }

  .btn-primary {
    background: var(--primary-gradient);
    color: white;
    box-shadow: var(--shadow-primary);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .btn-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  .btn-primary:hover::before {
    left: 100%;
  }

  .btn-primary:hover {
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.5);
  }

  .btn-secondary {
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 2px solid var(--glass-border);
    color: inherit;
  }

  .btn-secondary:hover {
    border-color: var(--primary-color);
    background: rgba(0, 153, 255, 0.15);
    box-shadow: var(--shadow-md);
  }

  .btn-upload,
  .btn-save-project {
    width: 100%;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-normal);
    border: 2px dashed var(--glass-border);
    background: rgba(255, 255, 255, 0.03);
    color: inherit;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-upload:hover,
  .btn-save-project:hover {
    border-color: var(--primary-color);
    background: rgba(0, 153, 255, 0.1);
    transform: translateY(-2px);
  }

  .upload-icon,
  .save-icon {
    font-size: 1.2rem;
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
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all var(--transition-normal);
  }

  .project-item:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 153, 255, 0.3);
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .project-name:hover {
    color: #00d4ff;
  }

  .project-icon {
    font-size: 1.1rem;
  }

  .project-text {
    flex: 1;
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
    padding: 2rem;
  }

  .canvas-container {
    padding: 3rem;
    border-radius: 20px;
    position: relative;
    min-width: 800px;
    min-height: 700px;
    overflow: hidden;
    box-shadow: var(--shadow-lg), inset 0 1px 1px rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.1);
    transition: all var(--transition-normal);
  }

  .canvas-container:hover {
    box-shadow: var(--shadow-lg), 0 0 40px rgba(0, 153, 255, 0.2);
    border-color: rgba(0, 153, 255, 0.3);
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
    transition: all var(--transition-normal);
    border-radius: 12px;
  }

  .draggable:hover {
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.6), 0 4px 20px rgba(0, 212, 255, 0.3);
    backdrop-filter: blur(4px);
  }

  .draggable:active {
    cursor: grabbing;
    box-shadow: 0 0 0 3px rgba(0, 255, 150, 0.6), 0 8px 30px rgba(0, 255, 150, 0.4);
  }

  .draggable:hover .drag-hint {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  .drag-hint {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%) translateY(-5px);
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.95), rgba(0, 153, 255, 0.95));
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
    opacity: 0;
    transition: all var(--transition-normal);
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
    background: #0099ff;
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

  .effect-presets {
    margin-top: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .effect-presets h3 {
    font-size: 0.85rem;
    text-transform: uppercase;
    opacity: 0.7;
    margin-bottom: 1rem;
    letter-spacing: 1px;
    font-weight: 700;
    color: var(--primary-color);
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .preset-btn {
    padding: 0.75rem;
    background: rgba(0, 153, 255, 0.1);
    border: 1px solid rgba(0, 153, 255, 0.3);
    border-radius: 8px;
    color: #00d4ff;
    cursor: pointer;
    transition: all var(--transition-normal);
    font-weight: 600;
    font-size: 0.85rem;
  }

  .preset-btn:hover {
    background: rgba(0, 153, 255, 0.2);
    border-color: #00d4ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
  }

  .empty-decorations,
  .empty-projects {
    text-align: center;
    padding: 3rem 2rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 2px dashed rgba(255, 255, 255, 0.1);
    margin-top: 1.5rem;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-decorations p,
  .empty-projects p {
    font-size: 0.95rem;
    opacity: 0.7;
    margin: 0.5rem 0;
  }

  .empty-hint {
    font-size: 0.85rem !important;
    opacity: 0.5 !important;
  }

  .decorative-images-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .decorative-image-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all var(--transition-normal);
  }

  .decorative-image-item:hover {
    border-color: rgba(0, 153, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
  }

  .decorative-image-item img {
    width: 100%;
    height: 80px;
    object-fit: cover;
    display: block;
  }

  .decorative-image-info {
    padding: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
  }

  .image-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .image-label {
    font-weight: 600;
  }

  .image-size {
    font-size: 0.75rem;
    opacity: 0.6;
    font-family: 'Courier New', monospace;
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
    animation: fadeIn 0.6s ease;
  }

  .empty-content {
    max-width: 600px;
    width: 100%;
    text-align: center;
    padding: 3rem;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    border: 2px solid var(--glass-border);
    box-shadow: var(--shadow-lg);
    animation: fadeIn 0.8s ease 0.2s both;
  }

  .empty-content h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .empty-content p {
    font-size: 1.2rem;
    opacity: 0.8;
    margin-bottom: 2rem;
    line-height: 1.6;
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
