<script>
  import { onMount } from 'svelte'
  import { document, layerActions, canUndo, canRedo, createLayer, LayerType, Tool } from './layerStore'
  import LayersPanel from './LayersPanel.svelte'
  import ToolsPanel from './ToolsPanel.svelte'
  import PropertiesPanel from './PropertiesPanel.svelte'
  import FabricCanvas from './FabricCanvas.svelte'

  let fabricCanvas
  let fileInput

  onMount(() => {
    // Add keyboard shortcuts
    window.addEventListener('keydown', handleKeyboard)
    return () => {
      window.removeEventListener('keydown', handleKeyboard)
    }
  })

  function handleKeyboard(event) {
    // Don't trigger shortcuts when typing
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return
    }

    // Undo/Redo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault()
      if (event.shiftKey) {
        layerActions.redo()
      } else {
        layerActions.undo()
      }
    }

    // Tool shortcuts
    const toolShortcuts = {
      'v': Tool.SELECT,
      'm': Tool.MOVE,
      't': Tool.TEXT,
      'c': Tool.CROP,
      'z': Tool.ZOOM,
      'h': Tool.PAN
    }

    if (toolShortcuts[event.key.toLowerCase()]) {
      event.preventDefault()
      layerActions.setActiveTool(toolShortcuts[event.key.toLowerCase()])
    }

    // Delete layer
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const selectedIds = $document.selectedLayerIds
      if (selectedIds.length > 0) {
        event.preventDefault()
        selectedIds.forEach(id => layerActions.removeLayer(id))
      }
    }

    // Duplicate layer
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault()
      const selectedIds = $document.selectedLayerIds
      if (selectedIds.length === 1) {
        layerActions.duplicateLayer(selectedIds[0])
      }
    }
  }

  function handleImageUpload(event) {
    const files = Array.from(event.target.files)

    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target.result

        const imageLayer = createLayer(LayerType.IMAGE, {
          name: file.name.replace(/\.[^/.]+$/, ""),
          layerData: {
            imageUrl,
            originalWidth: null,
            originalHeight: null
          }
        })

        layerActions.addLayer(imageLayer)
      }
      reader.readAsDataURL(file)
    })

    event.target.value = '' // Reset input
  }

  function addTextLayer() {
    const textLayer = createLayer(LayerType.TEXT, {
      name: 'New Text',
      position: { x: 100, y: 100 },
      layerData: {
        text: 'Double click to edit',
        fontSize: 32,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'normal'
      }
    })

    layerActions.addLayer(textLayer)
    layerActions.setActiveTool(Tool.TEXT)
  }

  function addShapeLayer(shapeType) {
    const shapeLayer = createLayer(LayerType.SHAPE, {
      name: `${shapeType} Shape`,
      position: { x: 200, y: 200 },
      layerData: {
        shapeType,
        width: 100,
        height: 100,
        radius: 50,
        fill: '#0099ff',
        stroke: '#000000',
        strokeWidth: 0
      }
    })

    layerActions.addLayer(shapeLayer)
  }

  function handleExport() {
    if (!fabricCanvas) return

    const dataURL = fabricCanvas.exportCanvas('png', 1)
    const link = document.createElement('a')
    link.download = 'export.png'
    link.href = dataURL
    link.click()
  }

  function handleZoomIn() {
    if (fabricCanvas) fabricCanvas.zoomIn()
  }

  function handleZoomOut() {
    if (fabricCanvas) fabricCanvas.zoomOut()
  }

  function handleZoomFit() {
    if (fabricCanvas) fabricCanvas.zoomToFit()
  }

  function triggerFileUpload() {
    fileInput.click()
  }
</script>

<div class="layer-editor">
  <!-- Top Toolbar -->
  <div class="toolbar">
    <div class="toolbar-section">
      <button class="toolbar-btn" on:click={triggerFileUpload} title="Add Image">
        📁 Open
      </button>
      <input
        type="file"
        bind:this={fileInput}
        on:change={handleImageUpload}
        accept="image/*"
        multiple
        style="display: none;"
      />

      <button class="toolbar-btn" on:click={addTextLayer} title="Add Text Layer">
        T Text
      </button>

      <div class="dropdown">
        <button class="toolbar-btn">□ Shape ▾</button>
        <div class="dropdown-content">
          <button on:click={() => addShapeLayer('rectangle')}>Rectangle</button>
          <button on:click={() => addShapeLayer('circle')}>Circle</button>
        </div>
      </div>
    </div>

    <div class="toolbar-section">
      <button
        class="toolbar-btn"
        on:click={() => layerActions.undo()}
        disabled={!$canUndo}
        title="Undo (Ctrl+Z)"
      >
        ↶
      </button>
      <button
        class="toolbar-btn"
        on:click={() => layerActions.redo()}
        disabled={!$canRedo}
        title="Redo (Ctrl+Shift+Z)"
      >
        ↷
      </button>
    </div>

    <div class="toolbar-section">
      <button class="toolbar-btn" on:click={handleZoomOut} title="Zoom Out">
        🔍-
      </button>
      <button class="toolbar-btn" on:click={handleZoomFit} title="Zoom to Fit">
        ⊡
      </button>
      <button class="toolbar-btn" on:click={handleZoomIn} title="Zoom In">
        🔍+
      </button>
    </div>

    <div class="toolbar-section">
      <button class="toolbar-btn primary" on:click={handleExport} title="Export">
        💾 Export
      </button>
    </div>
  </div>

  <!-- Main Editor Area -->
  <div class="editor-main">
    <!-- Left Sidebar: Tools -->
    <div class="sidebar sidebar-left">
      <ToolsPanel />
    </div>

    <!-- Center: Canvas -->
    <div class="canvas-area">
      <FabricCanvas bind:this={fabricCanvas} />
    </div>

    <!-- Right Sidebar: Layers + Properties -->
    <div class="sidebar sidebar-right">
      <div class="sidebar-panel">
        <LayersPanel />
      </div>
      <div class="sidebar-panel">
        <PropertiesPanel />
      </div>
    </div>
  </div>
</div>

<style>
  .layer-editor {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #fff;
    overflow: hidden;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    gap: 1rem;
  }

  .toolbar-section {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .toolbar-btn {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: inherit;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .toolbar-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(0, 153, 255, 0.5);
  }

  .toolbar-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .toolbar-btn.primary {
    background: linear-gradient(135deg, #0099ff, #0066cc);
    border-color: #0099ff;
    font-weight: 600;
  }

  .toolbar-btn.primary:hover {
    background: linear-gradient(135deg, #00bbff, #0088ee);
    box-shadow: 0 4px 12px rgba(0, 153, 255, 0.3);
  }

  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.25rem;
    background: rgba(20, 20, 30, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    min-width: 150px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  .dropdown:hover .dropdown-content {
    display: block;
  }

  .dropdown-content button {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
  }

  .dropdown-content button:hover {
    background: rgba(0, 153, 255, 0.2);
  }

  .editor-main {
    display: grid;
    grid-template-columns: 200px 1fr 350px;
    gap: 1rem;
    padding: 1rem;
    flex: 1;
    overflow: hidden;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
  }

  .sidebar-left {
    min-width: 200px;
  }

  .sidebar-right {
    min-width: 350px;
  }

  .sidebar-panel {
    flex: 1;
    min-height: 300px;
    overflow: hidden;
  }

  .canvas-area {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 1400px) {
    .editor-main {
      grid-template-columns: 180px 1fr 300px;
    }
  }

  @media (max-width: 1024px) {
    .editor-main {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr auto;
    }

    .sidebar {
      max-height: 200px;
    }
  }
</style>
