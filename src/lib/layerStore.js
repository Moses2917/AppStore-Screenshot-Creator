import { writable, derived, get } from 'svelte/store'

// Layer types
export const LayerType = {
  IMAGE: 'image',
  TEXT: 'text',
  SHAPE: 'shape',
  ADJUSTMENT: 'adjustment',
  GROUP: 'group'
}

// Blend modes matching Canvas API globalCompositeOperation
export const BlendMode = {
  NORMAL: 'source-over',
  MULTIPLY: 'multiply',
  SCREEN: 'screen',
  OVERLAY: 'overlay',
  DARKEN: 'darken',
  LIGHTEN: 'lighten',
  COLOR_DODGE: 'color-dodge',
  COLOR_BURN: 'color-burn',
  HARD_LIGHT: 'hard-light',
  SOFT_LIGHT: 'soft-light',
  DIFFERENCE: 'difference',
  EXCLUSION: 'exclusion',
  HUE: 'hue',
  SATURATION: 'saturation',
  COLOR: 'color',
  LUMINOSITY: 'luminosity'
}

// Tools
export const Tool = {
  SELECT: 'select',
  MOVE: 'move',
  TRANSFORM: 'transform',
  CROP: 'crop',
  TEXT: 'text',
  SHAPE: 'shape',
  ZOOM: 'zoom',
  PAN: 'pan'
}

// Create a unique ID
let layerIdCounter = 0
export function generateLayerId() {
  return `layer_${Date.now()}_${layerIdCounter++}`
}

// Create a new layer
export function createLayer(type, data = {}) {
  return {
    id: generateLayerId(),
    name: data.name || `${type} Layer ${layerIdCounter}`,
    type,
    visible: true,
    opacity: 1,
    blendMode: BlendMode.NORMAL,
    locked: false,
    position: data.position || { x: 0, y: 0 },
    scale: data.scale || { x: 1, y: 1 },
    rotation: data.rotation || 0,
    filters: data.filters || [],
    data: data.layerData || {}
  }
}

// Document state
export const document = writable({
  canvas: {
    width: 1242,
    height: 2208,
    backgroundColor: '#ffffff',
    zoom: 1,
    pan: { x: 0, y: 0 }
  },
  layers: [],
  selectedLayerIds: [],
  activeToolId: Tool.SELECT
})

// Derived stores
export const layers = derived(document, $doc => $doc.layers)
export const selectedLayerIds = derived(document, $doc => $doc.selectedLayerIds)
export const selectedLayers = derived(document, $doc =>
  $doc.layers.filter(layer => $doc.selectedLayerIds.includes(layer.id))
)
export const canvas = derived(document, $doc => $doc.canvas)
export const activeTool = derived(document, $doc => $doc.activeToolId)

// History state for undo/redo
export const history = writable({
  past: [],
  present: null,
  future: []
})

export const canUndo = derived(history, $history => $history.past.length > 0)
export const canRedo = derived(history, $history => $history.future.length > 0)

// Layer management functions
export const layerActions = {
  // Add a new layer
  addLayer(layer, index = -1) {
    document.update($doc => {
      const newLayers = [...$doc.layers]
      if (index === -1) {
        newLayers.push(layer)
      } else {
        newLayers.splice(index, 0, layer)
      }

      this.saveHistory()

      return {
        ...$doc,
        layers: newLayers,
        selectedLayerIds: [layer.id]
      }
    })
  },

  // Remove layer(s)
  removeLayer(layerId) {
    document.update($doc => {
      const newLayers = $doc.layers.filter(l => l.id !== layerId)
      const newSelectedIds = $doc.selectedLayerIds.filter(id => id !== layerId)

      this.saveHistory()

      return {
        ...$doc,
        layers: newLayers,
        selectedLayerIds: newSelectedIds
      }
    })
  },

  // Update layer properties
  updateLayer(layerId, updates) {
    document.update($doc => {
      const newLayers = $doc.layers.map(layer =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      )

      return {
        ...$doc,
        layers: newLayers
      }
    })
  },

  // Duplicate layer
  duplicateLayer(layerId) {
    const $doc = get(document)
    const layer = $doc.layers.find(l => l.id === layerId)
    if (!layer) return

    const duplicate = {
      ...layer,
      id: generateLayerId(),
      name: `${layer.name} copy`,
      position: {
        x: layer.position.x + 10,
        y: layer.position.y + 10
      }
    }

    const index = $doc.layers.findIndex(l => l.id === layerId)
    this.addLayer(duplicate, index + 1)
  },

  // Move layer up in z-index
  moveLayerUp(layerId) {
    document.update($doc => {
      const index = $doc.layers.findIndex(l => l.id === layerId)
      if (index === $doc.layers.length - 1) return $doc // Already at top

      const newLayers = [...$doc.layers]
      const [layer] = newLayers.splice(index, 1)
      newLayers.splice(index + 1, 0, layer)

      this.saveHistory()

      return { ...$doc, layers: newLayers }
    })
  },

  // Move layer down in z-index
  moveLayerDown(layerId) {
    document.update($doc => {
      const index = $doc.layers.findIndex(l => l.id === layerId)
      if (index === 0) return $doc // Already at bottom

      const newLayers = [...$doc.layers]
      const [layer] = newLayers.splice(index, 1)
      newLayers.splice(index - 1, 0, layer)

      this.saveHistory()

      return { ...$doc, layers: newLayers }
    })
  },

  // Move layer to top
  moveLayerToTop(layerId) {
    document.update($doc => {
      const index = $doc.layers.findIndex(l => l.id === layerId)
      if (index === $doc.layers.length - 1) return $doc

      const newLayers = [...$doc.layers]
      const [layer] = newLayers.splice(index, 1)
      newLayers.push(layer)

      this.saveHistory()

      return { ...$doc, layers: newLayers }
    })
  },

  // Move layer to bottom
  moveLayerToBottom(layerId) {
    document.update($doc => {
      const index = $doc.layers.findIndex(l => l.id === layerId)
      if (index === 0) return $doc

      const newLayers = [...$doc.layers]
      const [layer] = newLayers.splice(index, 1)
      newLayers.unshift(layer)

      this.saveHistory()

      return { ...$doc, layers: newLayers }
    })
  },

  // Toggle layer visibility
  toggleVisibility(layerId) {
    document.update($doc => {
      const newLayers = $doc.layers.map(layer =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
      return { ...$doc, layers: newLayers }
    })
  },

  // Toggle layer lock
  toggleLock(layerId) {
    document.update($doc => {
      const newLayers = $doc.layers.map(layer =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
      return { ...$doc, layers: newLayers }
    })
  },

  // Select layer(s)
  selectLayer(layerId, addToSelection = false) {
    document.update($doc => {
      let newSelectedIds
      if (addToSelection) {
        if ($doc.selectedLayerIds.includes(layerId)) {
          newSelectedIds = $doc.selectedLayerIds.filter(id => id !== layerId)
        } else {
          newSelectedIds = [...$doc.selectedLayerIds, layerId]
        }
      } else {
        newSelectedIds = [layerId]
      }

      return { ...$doc, selectedLayerIds: newSelectedIds }
    })
  },

  // Deselect all layers
  deselectAll() {
    document.update($doc => ({
      ...$doc,
      selectedLayerIds: []
    }))
  },

  // Reorder layers (for drag-and-drop in layers panel)
  reorderLayers(fromIndex, toIndex) {
    document.update($doc => {
      const newLayers = [...$doc.layers]
      const [layer] = newLayers.splice(fromIndex, 1)
      newLayers.splice(toIndex, 0, layer)

      this.saveHistory()

      return { ...$doc, layers: newLayers }
    })
  },

  // Set active tool
  setActiveTool(toolId) {
    document.update($doc => ({
      ...$doc,
      activeToolId: toolId
    }))
  },

  // Update canvas properties
  updateCanvas(updates) {
    document.update($doc => ({
      ...$doc,
      canvas: { ...$doc.canvas, ...updates }
    }))
  },

  // Save current state to history
  saveHistory() {
    const $doc = get(document)
    const $history = get(history)

    history.set({
      past: [...$history.past, $history.present].filter(Boolean).slice(-50), // Keep last 50 states
      present: JSON.parse(JSON.stringify($doc)),
      future: []
    })
  },

  // Undo
  undo() {
    const $history = get(history)
    if ($history.past.length === 0) return

    const previous = $history.past[$history.past.length - 1]
    const newPast = $history.past.slice(0, -1)

    history.set({
      past: newPast,
      present: previous,
      future: [$history.present, ...$history.future]
    })

    document.set(previous)
  },

  // Redo
  redo() {
    const $history = get(history)
    if ($history.future.length === 0) return

    const next = $history.future[0]
    const newFuture = $history.future.slice(1)

    history.set({
      past: [...$history.past, $history.present],
      present: next,
      future: newFuture
    })

    document.set(next)
  }
}

// Initialize history with current state
document.subscribe($doc => {
  const $history = get(history)
  if (!$history.present) {
    history.update($h => ({
      ...$h,
      present: JSON.parse(JSON.stringify($doc))
    }))
  }
})

export default {
  document,
  layers,
  selectedLayerIds,
  selectedLayers,
  canvas,
  activeTool,
  history,
  canUndo,
  canRedo,
  layerActions,
  createLayer,
  LayerType,
  BlendMode,
  Tool
}
