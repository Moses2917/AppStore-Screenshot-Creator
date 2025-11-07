export const templates = [
  {
    name: 'Minimal Light',
    id: 'minimal-light',
    config: {
      backgroundColor: '#ffffff',
      backgroundType: 'solid',
      textColor: '#000000',
      fontSize: 32,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textShadow: false
    }
  },
  {
    name: 'Minimal Dark',
    id: 'minimal-dark',
    config: {
      backgroundColor: '#1a1a1a',
      backgroundType: 'solid',
      textColor: '#ffffff',
      fontSize: 32,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textShadow: false
    }
  },
  {
    name: 'Purple Dream',
    id: 'purple-dream',
    config: {
      backgroundColor: '#667eea',
      backgroundType: 'gradient',
      gradientColors: ['#667eea', '#764ba2'],
      gradientAngle: 135,
      textColor: '#ffffff',
      fontSize: 36,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textShadow: true
    }
  },
  {
    name: 'Ocean Blue',
    id: 'ocean-blue',
    config: {
      backgroundColor: '#0575E6',
      backgroundType: 'gradient',
      gradientColors: ['#0575E6', '#021B79'],
      gradientAngle: 135,
      textColor: '#ffffff',
      fontSize: 36,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textShadow: true
    }
  },
  {
    name: 'Sunset',
    id: 'sunset',
    config: {
      backgroundColor: '#FF512F',
      backgroundType: 'gradient',
      gradientColors: ['#FF512F', '#DD2476'],
      gradientAngle: 135,
      textColor: '#ffffff',
      fontSize: 36,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textShadow: true
    }
  },
  {
    name: 'Forest',
    id: 'forest',
    config: {
      backgroundColor: '#134E5E',
      backgroundType: 'gradient',
      gradientColors: ['#134E5E', '#71B280'],
      gradientAngle: 135,
      textColor: '#ffffff',
      fontSize: 36,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textShadow: true
    }
  },
  {
    name: 'Peach',
    id: 'peach',
    config: {
      backgroundColor: '#FFECD2',
      backgroundType: 'gradient',
      gradientColors: ['#FFECD2', '#FCB69F'],
      gradientAngle: 135,
      textColor: '#333333',
      fontSize: 36,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textShadow: false
    }
  },
  {
    name: 'Neon',
    id: 'neon',
    config: {
      backgroundColor: '#08AEEA',
      backgroundType: 'gradient',
      gradientColors: ['#08AEEA', '#2AF598'],
      gradientAngle: 135,
      textColor: '#ffffff',
      fontSize: 40,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textShadow: true
    }
  }
]

export const exportPresets = {
  appStore: {
    name: 'App Store',
    sizes: {
      'iPhone 6.7"': { width: 1290, height: 2796 },
      'iPhone 6.5"': { width: 1242, height: 2688 },
      'iPhone 5.5"': { width: 1242, height: 2208 },
      'iPad Pro 12.9"': { width: 2048, height: 2732 },
      'iPad Pro 11"': { width: 1668, height: 2388 }
    }
  },
  social: {
    name: 'Social Media',
    sizes: {
      'Instagram Post': { width: 1080, height: 1080 },
      'Instagram Story': { width: 1080, height: 1920 },
      'Twitter Post': { width: 1200, height: 675 },
      'Facebook Post': { width: 1200, height: 630 },
      'LinkedIn Post': { width: 1200, height: 627 }
    }
  },
  custom: {
    name: 'Custom',
    sizes: {}
  }
}

export const fontFamilies = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier', value: 'Courier, monospace' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Comic Sans', value: 'Comic Sans MS, cursive' }
]
