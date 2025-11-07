import html2canvas from 'html2canvas'

// Export a single screenshot with options
export async function exportScreenshot(element, options = {}) {
  const {
    format = 'png',
    quality = 1.0,
    scale = 2,
    width = null,
    height = null,
    filename = `screenshot-${Date.now()}`
  } = options

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale,
      useCORS: true,
      allowTaint: true,
      width,
      height
    })

    // Resize if specific dimensions are provided
    let finalCanvas = canvas
    if (width && height) {
      finalCanvas = document.createElement('canvas')
      finalCanvas.width = width
      finalCanvas.height = height
      const ctx = finalCanvas.getContext('2d')
      ctx.drawImage(canvas, 0, 0, width, height)
    }

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
    const dataUrl = finalCanvas.toDataURL(mimeType, quality)

    const link = document.createElement('a')
    link.download = `${filename}.${format}`
    link.href = dataUrl
    link.click()

    return true
  } catch (error) {
    console.error('Error exporting screenshot:', error)
    throw error
  }
}

// Batch export multiple screenshots
export async function batchExport(screenshots, options = {}, onProgress) {
  const results = []
  const total = screenshots.length

  for (let i = 0; i < screenshots.length; i++) {
    try {
      const result = await exportScreenshot(screenshots[i].element, {
        ...options,
        filename: `screenshot-${i + 1}-${Date.now()}`
      })
      results.push({ success: true, index: i })

      if (onProgress) {
        onProgress((i + 1) / total * 100)
      }
    } catch (error) {
      results.push({ success: false, index: i, error })
    }
  }

  return results
}

// Generate gradient CSS
export function generateGradient(colors, angle = 135) {
  return `linear-gradient(${angle}deg, ${colors.join(', ')})`
}

// Apply image filters
export function applyImageFilters(config) {
  const filters = []

  if (config.brightness !== 100) {
    filters.push(`brightness(${config.brightness}%)`)
  }
  if (config.contrast !== 100) {
    filters.push(`contrast(${config.contrast}%)`)
  }
  if (config.saturation !== 100) {
    filters.push(`saturate(${config.saturation}%)`)
  }
  if (config.blur > 0) {
    filters.push(`blur(${config.blur}px)`)
  }

  return filters.length > 0 ? filters.join(' ') : 'none'
}

// Keyboard shortcuts
export const shortcuts = {
  'ctrl+s': 'Save project',
  'ctrl+z': 'Undo',
  'ctrl+shift+z': 'Redo',
  'ctrl+e': 'Export current',
  'ctrl+shift+e': 'Batch export',
  'ctrl+d': 'Duplicate current',
  'delete': 'Delete current',
  'ctrl+arrowleft': 'Previous screenshot',
  'ctrl+arrowright': 'Next screenshot',
  'ctrl+t': 'Toggle theme',
  '?': 'Show shortcuts'
}

// Handle keyboard shortcuts
export function handleKeyboardShortcut(event, handlers) {
  const key = event.key.toLowerCase()
  const ctrl = event.ctrlKey || event.metaKey
  const shift = event.shiftKey

  let shortcut = ''
  if (ctrl) shortcut += 'ctrl+'
  if (shift) shortcut += 'shift+'
  shortcut += key

  if (handlers[shortcut]) {
    event.preventDefault()
    handlers[shortcut]()
    return true
  }

  return false
}

// Download data as JSON
export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `${filename}.json`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

// Load JSON file
export function loadJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}
