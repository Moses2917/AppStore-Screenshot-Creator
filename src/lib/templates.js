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

// Comprehensive preset sizes for various platforms
export const presetSizes = [
  // iOS App Store
  { name: 'iPhone 15 Pro Max (6.7")', width: 1290, height: 2796, category: 'iOS' },
  { name: 'iPhone 15 Pro (6.1")', width: 1179, height: 2556, category: 'iOS' },
  { name: 'iPhone 14 Plus (6.7")', width: 1284, height: 2778, category: 'iOS' },
  { name: 'iPhone SE (4.7")', width: 750, height: 1334, category: 'iOS' },
  { name: 'iPad Pro 12.9"', width: 2048, height: 2732, category: 'iOS' },
  { name: 'iPad Pro 11"', width: 1668, height: 2388, category: 'iOS' },
  { name: 'iPad Air 10.9"', width: 1640, height: 2360, category: 'iOS' },
  { name: 'iPad 10.2"', width: 1620, height: 2160, category: 'iOS' },
  { name: 'iPad mini 8.3"', width: 1488, height: 2266, category: 'iOS' },

  // Google Play Store
  { name: 'Phone Portrait', width: 1080, height: 1920, category: 'Android' },
  { name: 'Phone Landscape', width: 1920, height: 1080, category: 'Android' },
  { name: '7" Tablet', width: 1200, height: 1920, category: 'Android' },
  { name: '10" Tablet', width: 1600, height: 2560, category: 'Android' },
  { name: 'Android Feature Graphic', width: 1024, height: 500, category: 'Android' },

  // Apple Watch
  { name: 'Apple Watch Ultra', width: 410, height: 502, category: 'Watch' },
  { name: 'Apple Watch 45mm', width: 396, height: 484, category: 'Watch' },
  { name: 'Apple Watch 41mm', width: 352, height: 430, category: 'Watch' },

  // Apple TV
  { name: 'Apple TV 4K', width: 3840, height: 2160, category: 'TV' },
  { name: 'Apple TV HD', width: 1920, height: 1080, category: 'TV' },

  // Mac App Store
  { name: 'MacBook Pro 16"', width: 3456, height: 2234, category: 'Mac' },
  { name: 'MacBook Pro 14"', width: 3024, height: 1964, category: 'Mac' },
  { name: 'MacBook Air 13"', width: 2560, height: 1664, category: 'Mac' },
  { name: 'iMac 24"', width: 4480, height: 2520, category: 'Mac' },

  // Instagram
  { name: 'Instagram Post (Square)', width: 1080, height: 1080, category: 'Instagram' },
  { name: 'Instagram Portrait', width: 1080, height: 1350, category: 'Instagram' },
  { name: 'Instagram Landscape', width: 1080, height: 566, category: 'Instagram' },
  { name: 'Instagram Story', width: 1080, height: 1920, category: 'Instagram' },
  { name: 'Instagram Reels', width: 1080, height: 1920, category: 'Instagram' },
  { name: 'Instagram Carousel', width: 1080, height: 1080, category: 'Instagram' },

  // Facebook
  { name: 'Facebook Post', width: 1200, height: 630, category: 'Facebook' },
  { name: 'Facebook Story', width: 1080, height: 1920, category: 'Facebook' },
  { name: 'Facebook Cover', width: 820, height: 312, category: 'Facebook' },
  { name: 'Facebook Event', width: 1920, height: 1080, category: 'Facebook' },

  // Twitter/X
  { name: 'Twitter Post', width: 1200, height: 675, category: 'Twitter' },
  { name: 'Twitter Header', width: 1500, height: 500, category: 'Twitter' },
  { name: 'Twitter Card', width: 800, height: 418, category: 'Twitter' },

  // LinkedIn
  { name: 'LinkedIn Post', width: 1200, height: 627, category: 'LinkedIn' },
  { name: 'LinkedIn Article', width: 1200, height: 627, category: 'LinkedIn' },
  { name: 'LinkedIn Cover', width: 1584, height: 396, category: 'LinkedIn' },

  // TikTok
  { name: 'TikTok Video', width: 1080, height: 1920, category: 'TikTok' },
  { name: 'TikTok Ad', width: 1080, height: 1920, category: 'TikTok' },

  // YouTube
  { name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'YouTube' },
  { name: 'YouTube Banner', width: 2560, height: 1440, category: 'YouTube' },
  { name: 'YouTube Story', width: 1080, height: 1920, category: 'YouTube' },
  { name: 'YouTube Short', width: 1080, height: 1920, category: 'YouTube' },

  // Pinterest
  { name: 'Pinterest Pin', width: 1000, height: 1500, category: 'Pinterest' },
  { name: 'Pinterest Square', width: 1000, height: 1000, category: 'Pinterest' },

  // Snapchat
  { name: 'Snapchat Ad', width: 1080, height: 1920, category: 'Snapchat' },

  // Common Web Sizes
  { name: 'Full HD (1080p)', width: 1920, height: 1080, category: 'Web' },
  { name: '4K (2160p)', width: 3840, height: 2160, category: 'Web' },
  { name: 'Desktop Wide', width: 1920, height: 1200, category: 'Web' },
  { name: 'Desktop Standard', width: 1440, height: 900, category: 'Web' },
  { name: 'Laptop', width: 1366, height: 768, category: 'Web' },
  { name: 'Tablet Portrait', width: 768, height: 1024, category: 'Web' },
  { name: 'Mobile Portrait', width: 375, height: 667, category: 'Web' },

  // Print & Design
  { name: 'A4 (300 DPI)', width: 2480, height: 3508, category: 'Print' },
  { name: 'Letter (300 DPI)', width: 2550, height: 3300, category: 'Print' },
  { name: 'Business Card', width: 1050, height: 600, category: 'Print' },
  { name: 'Poster 18x24"', width: 5400, height: 7200, category: 'Print' }
]

// Legacy export presets for backwards compatibility
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
