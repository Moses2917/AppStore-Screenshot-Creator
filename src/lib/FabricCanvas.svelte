<script>
  import { onMount, onDestroy } from 'svelte'
  import * as fabric from 'fabric'
  import { document, layers, canvas, activeTool, selectedLayerIds, layerActions, LayerType, Tool, pages, currentPageIndex } from './layerStore'

  let canvasElement
  let fabricCanvas
  let layerObjects = new Map() // Map layer IDs to Fabric objects

  onMount(() => {
    initCanvas()
    renderAllLayers()
  })

  onDestroy(() => {
    if (fabricCanvas) {
      fabricCanvas.dispose()
    }
  })

  function initCanvas() {
    fabricCanvas = new fabric.Canvas(canvasElement, {
      width: $canvas.width,
      height: $canvas.height,
      backgroundColor: $canvas.backgroundColor,
      preserveObjectStacking: true,
      selection: true
    })

    // Handle object selection
    fabricCanvas.on('selection:created', handleSelection)
    fabricCanvas.on('selection:updated', handleSelection)
    fabricCanvas.on('selection:cleared', () => layerActions.deselectAll())

    // Handle object modifications
    fabricCanvas.on('object:modified', handleObjectModified)
    fabricCanvas.on('object:moving', handleObjectMoving)
    fabricCanvas.on('object:scaling', handleObjectScaling)
    fabricCanvas.on('object:rotating', handleObjectRotating)
  }

  function handleSelection(e) {
    const selected = e.selected || []
    const layerIds = selected
      .map(obj => obj.layerId)
      .filter(Boolean)

    if (layerIds.length > 0) {
      layerActions.selectLayer(layerIds[0], false)
    }
  }

  function handleObjectModified(e) {
    const obj = e.target
    if (!obj || !obj.layerId) return

    updateLayerFromObject(obj)
    layerActions.saveHistory()
  }

  function handleObjectMoving(e) {
    const obj = e.target
    if (!obj || !obj.layerId) return
    // Real-time update (debounced via Fabric.js)
    updateLayerFromObject(obj, false)
  }

  function handleObjectScaling(e) {
    const obj = e.target
    if (!obj || !obj.layerId) return
    updateLayerFromObject(obj, false)
  }

  function handleObjectRotating(e) {
    const obj = e.target
    if (!obj || !obj.layerId) return
    updateLayerFromObject(obj, false)
  }

  function updateLayerFromObject(obj, saveHistory = true) {
    const updates = {
      position: { x: obj.left, y: obj.top },
      scale: { x: obj.scaleX, y: obj.scaleY },
      rotation: obj.angle
    }

    layerActions.updateLayer(obj.layerId, updates)
  }

  // Render all layers
  function renderAllLayers() {
    if (!fabricCanvas) return

    // Clear existing objects
    fabricCanvas.clear()
    fabricCanvas.backgroundColor = $canvas.backgroundColor
    layerObjects.clear()

    // Collect all layers to render on current page
    const layersToRender = []

    // Add layers from current page
    $layers.forEach(layer => {
      if (layer.visible) {
        layersToRender.push({ layer, fromCurrentPage: true })
      }
    })

    // Add layers from other pages that span to current page
    $pages.forEach((page, pageIndex) => {
      if (pageIndex !== $currentPageIndex) {
        page.layers.forEach(layer => {
          if (layer.visible && layer.spanPages && layer.spanPages.includes($currentPageIndex)) {
            layersToRender.push({ layer, fromCurrentPage: false })
          }
        })
      }
    })

    // Render each layer in order
    layersToRender.forEach(({ layer }) => {
      renderLayer(layer)
    })

    fabricCanvas.renderAll()
  }

  function renderLayer(layer) {
    switch (layer.type) {
      case LayerType.IMAGE:
        renderImageLayer(layer)
        break
      case LayerType.TEXT:
        renderTextLayer(layer)
        break
      case LayerType.SHAPE:
        renderShapeLayer(layer)
        break
    }
  }

  function renderImageLayer(layer) {
    if (!layer.data.imageUrl) return

    fabric.Image.fromURL(layer.data.imageUrl, (img) => {
      // If image has default position (0,0) and default scale (1,1), center it and scale to fit
      const isDefaultPosition = layer.position.x === 0 && layer.position.y === 0
      const isDefaultScale = layer.scale.x === 1 && layer.scale.y === 1

      if (isDefaultPosition && isDefaultScale) {
        // Scale image to fit within canvas (max 80% of canvas dimensions)
        const maxWidth = $canvas.width * 0.8
        const maxHeight = $canvas.height * 0.8
        const scaleX = maxWidth / img.width
        const scaleY = maxHeight / img.height
        const scale = Math.min(scaleX, scaleY, 1) // Don't upscale

        // Center the image
        const left = ($canvas.width - img.width * scale) / 2
        const top = ($canvas.height - img.height * scale) / 2

        // Update layer position and scale
        layer.position.x = left
        layer.position.y = top
        layer.scale.x = scale
        layer.scale.y = scale
      }

      configureObject(img, layer)
      applyFilters(img, layer.filters)

      fabricCanvas.add(img)
      layerObjects.set(layer.id, img)
      fabricCanvas.renderAll()
    }, { crossOrigin: 'anonymous' })
  }

  function renderTextLayer(layer) {
    const text = new fabric.IText(layer.data.text || 'Text', {
      fontSize: layer.data.fontSize || 24,
      fill: layer.data.color || '#000000',
      fontFamily: layer.data.fontFamily || 'Arial',
      fontWeight: layer.data.fontWeight || 'normal'
    })

    configureObject(text, layer)
    fabricCanvas.add(text)
    layerObjects.set(layer.id, text)
  }

  function renderShapeLayer(layer) {
    let shape

    switch (layer.data.shapeType) {
      case 'rectangle':
        shape = new fabric.Rect({
          width: layer.data.width || 100,
          height: layer.data.height || 100,
          fill: layer.data.fill || '#0099ff',
          stroke: layer.data.stroke || '#000000',
          strokeWidth: layer.data.strokeWidth || 0
        })
        break
      case 'circle':
        shape = new fabric.Circle({
          radius: layer.data.radius || 50,
          fill: layer.data.fill || '#0099ff',
          stroke: layer.data.stroke || '#000000',
          strokeWidth: layer.data.strokeWidth || 0
        })
        break
    }

    if (shape) {
      configureObject(shape, layer)
      fabricCanvas.add(shape)
      layerObjects.set(layer.id, shape)
    }
  }

  function configureObject(obj, layer) {
    obj.layerId = layer.id
    obj.left = layer.position.x
    obj.top = layer.position.y
    obj.scaleX = layer.scale.x
    obj.scaleY = layer.scale.y
    obj.angle = layer.rotation
    obj.opacity = layer.opacity
    obj.globalCompositeOperation = layer.blendMode
    obj.selectable = !layer.locked
    obj.evented = !layer.locked
    obj.hasControls = true
    obj.hasBorders = true
  }

  function applyFilters(img, filters) {
    if (!filters || filters.length === 0) return

    img.filters = filters.map(filter => {
      switch (filter.type) {
        case 'brightness':
          return new fabric.Image.filters.Brightness({ brightness: filter.value })
        case 'contrast':
          return new fabric.Image.filters.Contrast({ contrast: filter.value })
        case 'saturation':
          return new fabric.Image.filters.Saturation({ saturation: filter.value })
        case 'blur':
          return new fabric.Image.filters.Blur({ blur: filter.value })
        case 'grayscale':
          return new fabric.Image.filters.Grayscale()
        case 'sepia':
          return new fabric.Image.filters.Sepia()
        default:
          return null
      }
    }).filter(Boolean)

    img.applyFilters()
  }

  // Update canvas when layers change or page changes
  $: if (fabricCanvas && ($layers || $pages || $currentPageIndex >= 0)) {
    renderAllLayers()
  }

  // Update canvas properties
  $: if (fabricCanvas && $canvas) {
    const needsResize =
      fabricCanvas.width !== $canvas.width ||
      fabricCanvas.height !== $canvas.height

    fabricCanvas.setWidth($canvas.width)
    fabricCanvas.setHeight($canvas.height)
    fabricCanvas.setBackgroundColor($canvas.backgroundColor, () => {
      if (needsResize) {
        // Re-render all layers when canvas size changes
        renderAllLayers()
      } else {
        fabricCanvas.renderAll()
      }
    })
  }

  // Update selection
  $: if (fabricCanvas && $selectedLayerIds) {
    const selectedObjects = $selectedLayerIds
      .map(id => layerObjects.get(id))
      .filter(Boolean)

    if (selectedObjects.length > 0) {
      fabricCanvas.setActiveObject(selectedObjects[0])
    } else {
      fabricCanvas.discardActiveObject()
    }
    fabricCanvas.renderAll()
  }

  // Handle tool changes
  $: if (fabricCanvas && $activeTool) {
    handleToolChange($activeTool)
  }

  function handleToolChange(tool) {
    switch (tool) {
      case Tool.SELECT:
        fabricCanvas.selection = true
        fabricCanvas.forEachObject(obj => {
          obj.selectable = !obj.locked
        })
        break
      case Tool.MOVE:
        fabricCanvas.selection = true
        fabricCanvas.forEachObject(obj => {
          obj.hasControls = false
          obj.selectable = !obj.locked
        })
        break
      case Tool.PAN:
        fabricCanvas.selection = false
        fabricCanvas.forEachObject(obj => {
          obj.selectable = false
        })
        break
      case Tool.ZOOM:
        fabricCanvas.selection = false
        break
    }
  }

  // Export canvas as image
  export function exportCanvas(format = 'png', quality = 1) {
    if (!fabricCanvas) return null

    return fabricCanvas.toDataURL({
      format,
      quality,
      multiplier: 1
    })
  }

  // Zoom controls
  export function zoomIn() {
    const zoom = fabricCanvas.getZoom()
    fabricCanvas.setZoom(Math.min(zoom * 1.1, 5))
  }

  export function zoomOut() {
    const zoom = fabricCanvas.getZoom()
    fabricCanvas.setZoom(Math.max(zoom * 0.9, 0.1))
  }

  export function zoomToFit() {
    fabricCanvas.setZoom(1)
    fabricCanvas.viewportTransform = [1, 0, 0, 1, 0, 0]
    fabricCanvas.renderAll()
  }
</script>

<div class="canvas-wrapper">
  <canvas bind:this={canvasElement}></canvas>
</div>

<style>
  .canvas-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background:
      linear-gradient(45deg, #333 25%, transparent 25%),
      linear-gradient(-45deg, #333 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #333 75%),
      linear-gradient(-45deg, transparent 75%, #333 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-color: #2a2a2a;
    overflow: auto;
    position: relative;
  }

  canvas {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
</style>
