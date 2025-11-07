import { writable, derived, get } from 'svelte/store'

// Layer types
export const LayerType = {
  IMAGE: 'image',
  TEXT: 'text',
  SHAPE: 'shape',
  DEVICE_FRAME: 'device_frame',
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
    data: data.layerData || {},
    spanPages: data.spanPages || null // null means only current page, or array of page indices
  }
}

// Create a new page
export function createPage() {
  return {
    id: `page_${Date.now()}_${Math.random()}`,
    layers: [],
    selectedLayerIds: []
  }
}

// Document state with multi-page support
export const document = writable({
  canvas: {
    width: 1242,
    height: 2208,
    backgroundColor: '#ffffff',
    zoom: 1,
    pan: { x: 0, y: 0 }
  },
  pages: [createPage()],
  currentPageIndex: 0,
  activeToolId: Tool.SELECT,
  guides: {
    horizontal: [], // Array of y positions
    vertical: [], // Array of x positions
    visible: true,
    locked: false
  },
  grid: {
    enabled: false,
    size: 20, // Grid spacing in pixels
    subdivisions: 5,
    visible: true
  },
  snap: {
    enabled: true,
    toGuides: true,
    toGrid: true,
    toObjects: true,
    toCanvas: true,
    threshold: 10 // Snap distance in pixels
  }
})

// Derived stores for current page
export const currentPage = derived(document, $doc =>
  $doc.pages[$doc.currentPageIndex] || $doc.pages[0]
)

export const layers = derived(currentPage, $page => $page?.layers || [])
export const selectedLayerIds = derived(currentPage, $page => $page?.selectedLayerIds || [])
export const selectedLayers = derived(
  [currentPage],
  ([$page]) => $page?.layers.filter(layer => $page.selectedLayerIds.includes(layer.id)) || []
)
export const canvas = derived(document, $doc => $doc.canvas)
export const activeTool = derived(document, $doc => $doc.activeToolId)
export const pages = derived(document, $doc => $doc.pages)
export const currentPageIndex = derived(document, $doc => $doc.currentPageIndex)
export const guides = derived(document, $doc => $doc.guides)
export const grid = derived(document, $doc => $doc.grid)
export const snap = derived(document, $doc => $doc.snap)

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
  // Add a new layer to current page
  addLayer(layer, index = -1) {
    document.update($doc => {
      const newPages = [...$doc.pages]
      const currentPage = newPages[$doc.currentPageIndex]
      const newLayers = [...currentPage.layers]

      if (index === -1) {
        newLayers.push(layer)
      } else {
        newLayers.splice(index, 0, layer)
      }

      newPages[$doc.currentPageIndex] = {
        ...currentPage,
        layers: newLayers,
        selectedLayerIds: [layer.id]
      }

      this.saveHistory()

      return {
        ...$doc,
        pages: newPages
      }
    })
  },

  // Remove layer(s) from current page
  removeLayer(layerId) {
    document.update($doc => {
      const newPages = [...$doc.pages]
      const currentPage = newPages[$doc.currentPageIndex]
      const newLayers = currentPage.layers.filter(l => l.id !== layerId)
      const newSelectedIds = currentPage.selectedLayerIds.filter(id => id !== layerId)

      newPages[$doc.currentPageIndex] = {
        ...currentPage,
        layers: newLayers,
        selectedLayerIds: newSelectedIds
      }

      this.saveHistory()

      return {
        ...$doc,
        pages: newPages
      }
    })
  },

  // Update layer properties on current page
  updateLayer(layerId, updates) {
    document.update($doc => {
      const newPages = [...$doc.pages]
      const currentPage = newPages[$doc.currentPageIndex]
      const newLayers = currentPage.layers.map(layer =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      )

      newPages[$doc.currentPageIndex] = {
        ...currentPage,
        layers: newLayers
      }

      return {
        ...$doc,
        pages: newPages
      }
    })
  },

  // Duplicate layer on current page
  duplicateLayer(layerId) {
    const $doc = get(document)
    const currentPage = $doc.pages[$doc.currentPageIndex]
    const layer = currentPage.layers.find(l => l.id === layerId)
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

    const index = currentPage.layers.findIndex(l => l.id === layerId)
    this.addLayer(duplicate, index + 1)
  },

  // Move layer up in z-index on current page
  moveLayerUp(layerId) {
    document.update($doc => {
      const newPages = [...$doc.pages]
      const currentPage = newPages[$doc.currentPageIndex]
      const index = currentPage.layers.findIndex(l => l.id === layerId)
      if (index === currentPage.layers.length - 1) return $doc

      const newLayers = [...currentPage.layers]
      const [layer] = newLayers.splice(index, 1)
      newLayers.splice(index + 1, 0, layer)

      newPages[$doc.currentPageIndex] = { ...currentPage, layers: newLayers }
      this.saveHistory()

      return { ...$doc, pages: newPages }
    })
  },

  // Move layer down in z-index on current page
  moveLayerDown(layerId) {
    document.update($doc => {
      const newPages = [...$doc.pages]
      const currentPage = newPages[$doc.currentPageIndex]
      const index = currentPage.layers.findIndex(l => l.id === layerId)
      if (index === 0) return $doc

      const newLayers = [...currentPage.layers]
      const [layer] = newLayers.splice(index, 1)
      newLayers.splice(index - 1, 0, layer)

      newPages[$doc.currentPageIndex] = { ...currentPage, layers: newLayers }
      this.saveHistory()

      return { ...$doc, pages: newPages }
    })
  },

  // Move layer to top on current page
  moveLayerToTop(layerId) {
    document.update($doc => {
      const newPages = [...$doc.pages]
      const currentPage = newPages[$doc.currentPageIndex]
      const index = currentPage.layers.findIndex(l => l.id === layerId)
      if (index === currentPage.layers.length - 1) return $doc

      const newLayers = [...currentPage.layers]
      const [layer] = newLayers.splice(index, 1)
      newLayers.push(layer)

      newPages[$doc.currentPageIndex] = { ...currentPage, layers: newLayers }
      this.saveHistory()

      return { ...$doc, pages: newPages }
    })
  },

  // Move layer to bottom on current page
  moveLayerToBottom(layerId) {
    document.update($doc => {
      const newPages = [...$doc.pages]
      const currentPage = newPages[$doc.currentPageIndex]
      const index = currentPage.layers.findIndex(l => l.id === layerId)
      if (index === 0) return $doc

      const newLayers = [...currentPage.layers]
      const [layer] = newLayers.splice(index, 1)
      newLayers.unshift(layer)

      newPages[$doc.currentPageIndex] = { ...currentPage, layers: newLayers }
      this.saveHistory()

      return { ...$doc, pages: newPages }
    })
  },

  // Toggle layer visibility on current page
  toggleVisibility(layerId) {
    document.update($doc => {
      const newPages = [...$doc.pages]
      const currentPage = newPages[$doc.currentPageIndex]
      const newLayers = currentPage.layers.map(layer =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
      newPages[$doc.currentPageIndex] = { ...currentPage, layers: newLayers }
      return { ...$doc, pages: newPages }
    })
  },

  // Toggle layer lock on current page
  toggleLock(layerId) {
    document.update($doc => {
      const newPages = [...$doc.pages]
      const currentPage = newPages[$doc.currentPageIndex]
      const newLayers = currentPage.layers.map(layer =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
      newPages[$doc.currentPageIndex] = { ...currentPage, layers: newLayers }
      return { ...$doc, pages: newPages }
    })
  },

  // Select layer(s) on current page
  selectLayer(layerId, addToSelection = false) {
    document.update($doc => {
      const newPages = [...$doc.pages]
      const currentPage = newPages[$doc.currentPageIndex]

      let newSelectedIds
      if (addToSelection) {
        if (currentPage.selectedLayerIds.includes(layerId)) {
          newSelectedIds = currentPage.selectedLayerIds.filter(id => id !== layerId)
        } else {
          newSelectedIds = [...currentPage.selectedLayerIds, layerId]
        }
      } else {
        newSelectedIds = [layerId]
      }

      newPages[$doc.currentPageIndex] = { ...currentPage, selectedLayerIds: newSelectedIds }
      return { ...$doc, pages: newPages }
    })
  },

  // Deselect all layers on current page
  deselectAll() {
    document.update($doc => {
      const newPages = [...$doc.pages]
      const currentPage = newPages[$doc.currentPageIndex]
      newPages[$doc.currentPageIndex] = { ...currentPage, selectedLayerIds: [] }
      return { ...$doc, pages: newPages }
    })
  },

  // Reorder layers on current page (for drag-and-drop in layers panel)
  reorderLayers(fromIndex, toIndex) {
    document.update($doc => {
      const newPages = [...$doc.pages]
      const currentPage = newPages[$doc.currentPageIndex]
      const newLayers = [...currentPage.layers]
      const [layer] = newLayers.splice(fromIndex, 1)
      newLayers.splice(toIndex, 0, layer)

      newPages[$doc.currentPageIndex] = { ...currentPage, layers: newLayers }
      this.saveHistory()

      return { ...$doc, pages: newPages }
    })
  },

  // Add a new page
  addPage() {
    document.update($doc => {
      const newPages = [...$doc.pages, createPage()]
      this.saveHistory()
      return {
        ...$doc,
        pages: newPages,
        currentPageIndex: newPages.length - 1
      }
    })
  },

  // Delete a page
  deletePage(index) {
    document.update($doc => {
      if ($doc.pages.length <= 1) return $doc // Can't delete last page

      const newPages = $doc.pages.filter((_, i) => i !== index)
      const newCurrentIndex = Math.min($doc.currentPageIndex, newPages.length - 1)
      this.saveHistory()

      return {
        ...$doc,
        pages: newPages,
        currentPageIndex: newCurrentIndex
      }
    })
  },

  // Select a page
  selectPage(index) {
    document.update($doc => ({
      ...$doc,
      currentPageIndex: index
    }))
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

  // Set which pages a layer spans across
  setLayerSpanPages(layerId, pageIndices) {
    document.update($doc => {
      const newPages = [...$doc.pages]
      const currentPage = newPages[$doc.currentPageIndex]
      const newLayers = currentPage.layers.map(layer =>
        layer.id === layerId ? { ...layer, spanPages: pageIndices } : layer
      )
      newPages[$doc.currentPageIndex] = { ...currentPage, layers: newLayers }
      this.saveHistory()
      return { ...$doc, pages: newPages }
    })
  },

  // Guide management
  addHorizontalGuide(y) {
    document.update($doc => ({
      ...$doc,
      guides: {
        ...$doc.guides,
        horizontal: [...$doc.guides.horizontal, y].sort((a, b) => a - b)
      }
    }))
  },

  addVerticalGuide(x) {
    document.update($doc => ({
      ...$doc,
      guides: {
        ...$doc.guides,
        vertical: [...$doc.guides.vertical, x].sort((a, b) => a - b)
      }
    }))
  },

  removeHorizontalGuide(y) {
    document.update($doc => ({
      ...$doc,
      guides: {
        ...$doc.guides,
        horizontal: $doc.guides.horizontal.filter(pos => pos !== y)
      }
    }))
  },

  removeVerticalGuide(x) {
    document.update($doc => ({
      ...$doc,
      guides: {
        ...$doc.guides,
        vertical: $doc.guides.vertical.filter(pos => pos !== x)
      }
    }))
  },

  moveHorizontalGuide(oldY, newY) {
    document.update($doc => ({
      ...$doc,
      guides: {
        ...$doc.guides,
        horizontal: $doc.guides.horizontal
          .map(y => (y === oldY ? newY : y))
          .sort((a, b) => a - b)
      }
    }))
  },

  moveVerticalGuide(oldX, newX) {
    document.update($doc => ({
      ...$doc,
      guides: {
        ...$doc.guides,
        vertical: $doc.guides.vertical
          .map(x => (x === oldX ? newX : x))
          .sort((a, b) => a - b)
      }
    }))
  },

  clearAllGuides() {
    document.update($doc => ({
      ...$doc,
      guides: {
        ...$doc.guides,
        horizontal: [],
        vertical: []
      }
    }))
  },

  toggleGuidesVisible() {
    document.update($doc => ({
      ...$doc,
      guides: {
        ...$doc.guides,
        visible: !$doc.guides.visible
      }
    }))
  },

  toggleGuidesLocked() {
    document.update($doc => ({
      ...$doc,
      guides: {
        ...$doc.guides,
        locked: !$doc.guides.locked
      }
    }))
  },

  // Grid management
  toggleGrid() {
    document.update($doc => ({
      ...$doc,
      grid: {
        ...$doc.grid,
        enabled: !$doc.grid.enabled
      }
    }))
  },

  updateGridSettings(settings) {
    document.update($doc => ({
      ...$doc,
      grid: {
        ...$doc.grid,
        ...settings
      }
    }))
  },

  // Snap management
  toggleSnap() {
    document.update($doc => ({
      ...$doc,
      snap: {
        ...$doc.snap,
        enabled: !$doc.snap.enabled
      }
    }))
  },

  updateSnapSettings(settings) {
    document.update($doc => ({
      ...$doc,
      snap: {
        ...$doc.snap,
        ...settings
      }
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
  pages,
  currentPageIndex,
  currentPage,
  history,
  canUndo,
  canRedo,
  layerActions,
  createLayer,
  createPage,
  LayerType,
  BlendMode,
  Tool
}
