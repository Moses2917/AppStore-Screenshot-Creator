import { writable, derived } from 'svelte/store'

// Theme store
export const theme = writable(localStorage.getItem('theme') || 'dark')
theme.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', value)
  }
})

// Screenshots store
export const screenshots = writable([])

// Current screenshot index
export const currentScreenshotIndex = writable(0)

// Current screenshot (derived from screenshots and index)
export const currentScreenshot = derived(
  [screenshots, currentScreenshotIndex],
  ([$screenshots, $currentScreenshotIndex]) => {
    return $screenshots[$currentScreenshotIndex] || null
  }
)

// History for undo/redo
export const history = writable({
  past: [],
  present: null,
  future: []
})

// Loading states
export const isExporting = writable(false)
export const exportProgress = writable(0)

// Tutorial state
export const showTutorial = writable(!localStorage.getItem('tutorialCompleted'))

// Create a new screenshot object
export function createScreenshot(imageData, id = Date.now()) {
  return {
    id,
    image: imageData,
    config: {
      backgroundColor: '#f5f5f7',
      backgroundType: 'solid', // solid, gradient, pattern
      gradientColors: ['#667eea', '#764ba2'],
      gradientAngle: 135,
      deviceFrame: 'iphone',
      textTop: '',
      textBottom: '',
      textColor: '#000000',
      fontSize: 32,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textShadow: false,
      textTopPosition: { x: 50, y: 15 }, // percentage positions
      textBottomPosition: { x: 50, y: 85 },
      devicePosition: { x: 50, y: 50 }, // center of canvas
      rotation: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      decorativeImages: [] // array of {id, src, x, y, width, height}
    }
  }
}

// Save project to localStorage
export function saveProject(name) {
  const data = {
    screenshots: [],
    currentIndex: 0
  }

  screenshots.subscribe(s => data.screenshots = s)()
  currentScreenshotIndex.subscribe(i => data.currentIndex = i)()

  localStorage.setItem(`project_${name}`, JSON.stringify(data))

  // Save to projects list
  const projects = JSON.parse(localStorage.getItem('projects') || '[]')
  if (!projects.includes(name)) {
    projects.push(name)
    localStorage.setItem('projects', JSON.stringify(projects))
  }
}

// Load project from localStorage
export function loadProject(name) {
  const data = JSON.parse(localStorage.getItem(`project_${name}`))
  if (data) {
    screenshots.set(data.screenshots)
    currentScreenshotIndex.set(data.currentIndex)
  }
}

// Get all saved projects
export function getSavedProjects() {
  return JSON.parse(localStorage.getItem('projects') || '[]')
}

// Delete project
export function deleteProject(name) {
  localStorage.removeItem(`project_${name}`)
  const projects = JSON.parse(localStorage.getItem('projects') || '[]')
  const filtered = projects.filter(p => p !== name)
  localStorage.setItem('projects', JSON.stringify(filtered))
}
