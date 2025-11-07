// Template Library for App Store Screenshots

// Font families for text styling
export const fontFamilies = [
  'Inter',
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS'
]

// Preset sizes for size carousel
export const presetSizes = [
  // App Store
  { name: 'iPhone 6.7"', width: 1290, height: 2796, category: 'iPhone', description: 'iPhone 14/15 Pro Max' },
  { name: 'iPhone 6.5"', width: 1242, height: 2688, category: 'iPhone', description: 'iPhone XS Max, 11 Pro Max' },
  { name: 'iPhone 6.1"', width: 1179, height: 2556, category: 'iPhone', description: 'iPhone 14/15 Pro' },
  { name: 'iPhone 5.5"', width: 1242, height: 2208, category: 'iPhone', description: 'iPhone 6/7/8 Plus' },
  { name: 'iPad Pro 12.9"', width: 2048, height: 2732, category: 'iPad', description: 'iPad Pro 12.9-inch' },
  { name: 'iPad Pro 11"', width: 1668, height: 2388, category: 'iPad', description: 'iPad Pro 11-inch' },
  { name: 'iPad Air', width: 1640, height: 2360, category: 'iPad', description: 'iPad Air 10.9-inch' },

  // Social Media
  { name: 'Instagram Post', width: 1080, height: 1080, category: 'Social', description: 'Square format' },
  { name: 'Instagram Story', width: 1080, height: 1920, category: 'Social', description: 'Vertical story' },
  { name: 'Facebook Post', width: 1200, height: 630, category: 'Social', description: 'Link preview' },
  { name: 'Twitter Post', width: 1200, height: 675, category: 'Social', description: 'Twitter/X post' },

  // Android
  { name: 'Pixel 8', width: 1080, height: 2400, category: 'Android', description: 'Google Pixel 8' },
  { name: 'Galaxy S24', width: 1080, height: 2340, category: 'Android', description: 'Samsung Galaxy' },
  { name: 'Android Tablet', width: 1600, height: 2560, category: 'Android', description: '10-inch tablet' }
]

// Export presets for different platforms
export const exportPresets = {
  'app-store': {
    name: 'App Store',
    sizes: {
      'iPhone 6.7"': { width: 1290, height: 2796 },
      'iPhone 6.5"': { width: 1242, height: 2688 },
      'iPhone 5.5"': { width: 1242, height: 2208 },
      'iPad Pro 12.9"': { width: 2048, height: 2732 },
      'iPad Pro 11"': { width: 1668, height: 2388 }
    }
  },
  'google-play': {
    name: 'Google Play',
    sizes: {
      'Phone': { width: 1080, height: 1920 },
      'Tablet 7"': { width: 1200, height: 1920 },
      'Tablet 10"': { width: 1600, height: 2560 }
    }
  },
  'social': {
    name: 'Social Media',
    sizes: {
      'Instagram Post': { width: 1080, height: 1080 },
      'Instagram Story': { width: 1080, height: 1920 },
      'Facebook Post': { width: 1200, height: 630 },
      'Twitter Post': { width: 1200, height: 675 }
    }
  },
  'custom': {
    name: 'Custom',
    sizes: {}
  }
}

export const TemplateCategory = {
  APP_STORE: 'App Store',
  SOCIAL_MEDIA: 'Social Media',
  HERO_BANNER: 'Hero Banner',
  FEATURE_HIGHLIGHT: 'Feature Highlight',
  COMPARISON: 'Comparison',
  TESTIMONIAL: 'Testimonial',
  TUTORIAL: 'Tutorial',
  MINIMAL: 'Minimal'
}

// Template structure:
// - id: unique identifier
// - name: display name
// - category: TemplateCategory
// - description: short description
// - thumbnail: preview image or null
// - canvasSize: { width, height }
// - backgroundColor: default background color
// - layers: array of layer configurations
export const templates = [
  // App Store Templates
  {
    id: 'appstore-iphone-portrait',
    name: 'iPhone Portrait',
    category: TemplateCategory.APP_STORE,
    description: 'Standard iPhone portrait screenshot layout',
    thumbnail: null,
    canvasSize: { width: 1242, height: 2208 },
    backgroundColor: '#ffffff',
    layers: []
  },
  {
    id: 'appstore-iphone-landscape',
    name: 'iPhone Landscape',
    category: TemplateCategory.APP_STORE,
    description: 'iPhone landscape screenshot layout',
    thumbnail: null,
    canvasSize: { width: 2208, height: 1242 },
    backgroundColor: '#ffffff',
    layers: []
  },
  {
    id: 'appstore-ipad-portrait',
    name: 'iPad Portrait',
    category: TemplateCategory.APP_STORE,
    description: 'iPad portrait screenshot layout',
    thumbnail: null,
    canvasSize: { width: 2048, height: 2732 },
    backgroundColor: '#ffffff',
    layers: []
  },
  {
    id: 'appstore-ipad-landscape',
    name: 'iPad Landscape',
    category: TemplateCategory.APP_STORE,
    description: 'iPad landscape screenshot layout',
    thumbnail: null,
    canvasSize: { width: 2732, height: 2048 },
    backgroundColor: '#ffffff',
    layers: []
  },

  // Hero Banner Templates
  {
    id: 'hero-gradient-device',
    name: 'Gradient with Device',
    category: TemplateCategory.HERO_BANNER,
    description: 'Hero banner with gradient background and device frame',
    thumbnail: null,
    canvasSize: { width: 1242, height: 2208 },
    backgroundColor: '#6366f1',
    layers: [
      {
        type: 'text',
        name: 'Title',
        position: { x: 621, y: 300 },
        data: {
          text: 'Your App Name',
          fontSize: 72,
          color: '#ffffff',
          fontFamily: 'Inter',
          fontWeight: 'bold',
          align: 'center'
        }
      },
      {
        type: 'text',
        name: 'Subtitle',
        position: { x: 621, y: 420 },
        data: {
          text: 'The best app for everything',
          fontSize: 32,
          color: '#e0e7ff',
          fontFamily: 'Inter',
          fontWeight: 'normal',
          align: 'center'
        }
      }
    ]
  },
  {
    id: 'hero-split-screen',
    name: 'Split Screen Hero',
    category: TemplateCategory.HERO_BANNER,
    description: 'Split screen layout with text and device',
    thumbnail: null,
    canvasSize: { width: 1242, height: 2208 },
    backgroundColor: '#1e293b',
    layers: [
      {
        type: 'shape',
        name: 'Background Panel',
        position: { x: 0, y: 0 },
        data: {
          shapeType: 'rectangle',
          width: 621,
          height: 2208,
          fill: '#0f172a',
          stroke: '#000000',
          strokeWidth: 0
        }
      },
      {
        type: 'text',
        name: 'Title',
        position: { x: 100, y: 900 },
        data: {
          text: 'Discover\nSomething\nNew',
          fontSize: 64,
          color: '#ffffff',
          fontFamily: 'Inter',
          fontWeight: 'bold'
        }
      }
    ]
  },

  // Feature Highlight Templates
  {
    id: 'feature-centered',
    name: 'Centered Feature',
    category: TemplateCategory.FEATURE_HIGHLIGHT,
    description: 'Single feature centered with icon and description',
    thumbnail: null,
    canvasSize: { width: 1242, height: 2208 },
    backgroundColor: '#f8fafc',
    layers: [
      {
        type: 'text',
        name: 'Feature Title',
        position: { x: 621, y: 800 },
        data: {
          text: 'Amazing Feature',
          fontSize: 56,
          color: '#0f172a',
          fontFamily: 'Inter',
          fontWeight: 'bold',
          align: 'center'
        }
      },
      {
        type: 'text',
        name: 'Description',
        position: { x: 621, y: 920 },
        data: {
          text: 'This feature will change how you work',
          fontSize: 28,
          color: '#64748b',
          fontFamily: 'Inter',
          fontWeight: 'normal',
          align: 'center'
        }
      }
    ]
  },
  {
    id: 'feature-three-column',
    name: 'Three Feature Grid',
    category: TemplateCategory.FEATURE_HIGHLIGHT,
    description: 'Three features in a grid layout',
    thumbnail: null,
    canvasSize: { width: 1242, height: 2208 },
    backgroundColor: '#ffffff',
    layers: [
      {
        type: 'text',
        name: 'Header',
        position: { x: 621, y: 200 },
        data: {
          text: 'Key Features',
          fontSize: 64,
          color: '#0f172a',
          fontFamily: 'Inter',
          fontWeight: 'bold',
          align: 'center'
        }
      }
    ]
  },

  // Minimal Templates
  {
    id: 'minimal-white',
    name: 'Minimal White',
    category: TemplateCategory.MINIMAL,
    description: 'Clean white background with subtle shadows',
    thumbnail: null,
    canvasSize: { width: 1242, height: 2208 },
    backgroundColor: '#ffffff',
    layers: []
  },
  {
    id: 'minimal-black',
    name: 'Minimal Black',
    category: TemplateCategory.MINIMAL,
    description: 'Elegant black background',
    thumbnail: null,
    canvasSize: { width: 1242, height: 2208 },
    backgroundColor: '#000000',
    layers: []
  },
  {
    id: 'minimal-gradient-blue',
    name: 'Gradient Blue',
    category: TemplateCategory.MINIMAL,
    description: 'Smooth blue gradient background',
    thumbnail: null,
    canvasSize: { width: 1242, height: 2208 },
    backgroundColor: '#3b82f6',
    layers: []
  },
  {
    id: 'minimal-gradient-purple',
    name: 'Gradient Purple',
    category: TemplateCategory.MINIMAL,
    description: 'Vibrant purple gradient background',
    thumbnail: null,
    canvasSize: { width: 1242, height: 2208 },
    backgroundColor: '#8b5cf6',
    layers: []
  },

  // Social Media Templates
  {
    id: 'social-instagram-post',
    name: 'Instagram Post',
    category: TemplateCategory.SOCIAL_MEDIA,
    description: 'Square format for Instagram feed',
    thumbnail: null,
    canvasSize: { width: 1080, height: 1080 },
    backgroundColor: '#ffffff',
    layers: []
  },
  {
    id: 'social-instagram-story',
    name: 'Instagram Story',
    category: TemplateCategory.SOCIAL_MEDIA,
    description: 'Vertical story format',
    thumbnail: null,
    canvasSize: { width: 1080, height: 1920 },
    backgroundColor: '#ffffff',
    layers: []
  },
  {
    id: 'social-twitter-header',
    name: 'Twitter Header',
    category: TemplateCategory.SOCIAL_MEDIA,
    description: 'Twitter/X header banner',
    thumbnail: null,
    canvasSize: { width: 1500, height: 500 },
    backgroundColor: '#1da1f2',
    layers: []
  },

  // Tutorial Templates
  {
    id: 'tutorial-step-by-step',
    name: 'Step-by-Step Guide',
    category: TemplateCategory.TUTORIAL,
    description: 'Numbered steps tutorial layout',
    thumbnail: null,
    canvasSize: { width: 1242, height: 2208 },
    backgroundColor: '#f1f5f9',
    layers: [
      {
        type: 'text',
        name: 'Step Number',
        position: { x: 120, y: 300 },
        data: {
          text: '1',
          fontSize: 96,
          color: '#3b82f6',
          fontFamily: 'Inter',
          fontWeight: 'bold'
        }
      },
      {
        type: 'text',
        name: 'Step Title',
        position: { x: 120, y: 450 },
        data: {
          text: 'First Step',
          fontSize: 48,
          color: '#0f172a',
          fontFamily: 'Inter',
          fontWeight: 'bold'
        }
      },
      {
        type: 'text',
        name: 'Step Description',
        position: { x: 120, y: 550 },
        data: {
          text: 'Here\'s how to get started with this feature',
          fontSize: 28,
          color: '#64748b',
          fontFamily: 'Inter',
          fontWeight: 'normal'
        }
      }
    ]
  }
]

// Get templates by category
export function getTemplatesByCategory(category) {
  return templates.filter(template => template.category === category)
}

// Get template by ID
export function getTemplateById(id) {
  return templates.find(template => template.id === id)
}

// Get all categories
export function getAllTemplateCategories() {
  return Object.values(TemplateCategory)
}

// Get unique categories from templates
export function getAvailableCategories() {
  const categories = [...new Set(templates.map(t => t.category))]
  return categories.sort()
}
