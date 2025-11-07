// Device Frames Library for App Store Screenshots

export const DeviceCategory = {
  IPHONE: 'iPhone',
  IPAD: 'iPad',
  ANDROID: 'Android',
  LAPTOP: 'Laptop',
  DESKTOP: 'Desktop'
}

export const FrameStyle = {
  REALISTIC: 'realistic',
  CLAY: 'clay',
  MINIMAL: 'minimal',
  FLAT: 'flat',
  ISOMETRIC: 'isometric'
}

// Device frame definitions with screen area coordinates
export const deviceFrames = [
  // iPhone Models
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    category: DeviceCategory.IPHONE,
    displaySize: '6.9"',
    screenSize: { width: 1320, height: 2868 },
    frameSize: { width: 1420, height: 3000 },
    screenOffset: { x: 50, y: 66 },
    cornerRadius: 55,
    notch: { width: 260, height: 50, x: 580, y: 0 },
    hasNotch: true,
    hasDynamicIsland: true,
    color: '#1a1a1a',
    style: FrameStyle.REALISTIC
  },
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    category: DeviceCategory.IPHONE,
    displaySize: '6.7"',
    screenSize: { width: 1290, height: 2796 },
    frameSize: { width: 1390, height: 2920 },
    screenOffset: { x: 50, y: 62 },
    cornerRadius: 55,
    hasDynamicIsland: true,
    color: '#1a1a1a',
    style: FrameStyle.REALISTIC
  },
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    category: DeviceCategory.IPHONE,
    displaySize: '6.1"',
    screenSize: { width: 1179, height: 2556 },
    frameSize: { width: 1275, height: 2670 },
    screenOffset: { x: 48, y: 57 },
    cornerRadius: 50,
    hasDynamicIsland: true,
    color: '#1a1a1a',
    style: FrameStyle.REALISTIC
  },
  {
    id: 'iphone-14-plus',
    name: 'iPhone 14 Plus',
    category: DeviceCategory.IPHONE,
    displaySize: '6.5"',
    screenSize: { width: 1284, height: 2778 },
    frameSize: { width: 1380, height: 2895 },
    screenOffset: { x: 48, y: 58 },
    cornerRadius: 50,
    hasNotch: true,
    color: '#1a1a1a',
    style: FrameStyle.REALISTIC
  },
  {
    id: 'iphone-14',
    name: 'iPhone 14',
    category: DeviceCategory.IPHONE,
    displaySize: '6.1"',
    screenSize: { width: 1170, height: 2532 },
    frameSize: { width: 1260, height: 2640 },
    screenOffset: { x: 45, y: 54 },
    cornerRadius: 48,
    hasNotch: true,
    color: '#1a1a1a',
    style: FrameStyle.REALISTIC
  },
  {
    id: 'iphone-13-mini',
    name: 'iPhone 13 mini',
    category: DeviceCategory.IPHONE,
    displaySize: '5.4"',
    screenSize: { width: 1080, height: 2340 },
    frameSize: { width: 1165, height: 2440 },
    screenOffset: { x: 42, y: 50 },
    cornerRadius: 45,
    hasNotch: true,
    color: '#1a1a1a',
    style: FrameStyle.REALISTIC
  },
  {
    id: 'iphone-8-plus',
    name: 'iPhone 8 Plus',
    category: DeviceCategory.IPHONE,
    displaySize: '5.5"',
    screenSize: { width: 1242, height: 2208 },
    frameSize: { width: 1330, height: 2395 },
    screenOffset: { x: 44, y: 93 },
    cornerRadius: 15,
    hasHomeButton: true,
    color: '#1a1a1a',
    style: FrameStyle.REALISTIC
  },

  // iPad Models
  {
    id: 'ipad-pro-12-9',
    name: 'iPad Pro 12.9"',
    category: DeviceCategory.IPAD,
    displaySize: '12.9"',
    screenSize: { width: 2048, height: 2732 },
    frameSize: { width: 2180, height: 2870 },
    screenOffset: { x: 66, y: 69 },
    cornerRadius: 20,
    color: '#1a1a1a',
    style: FrameStyle.REALISTIC
  },
  {
    id: 'ipad-pro-11',
    name: 'iPad Pro 11"',
    category: DeviceCategory.IPAD,
    displaySize: '11"',
    screenSize: { width: 1668, height: 2388 },
    frameSize: { width: 1780, height: 2510 },
    screenOffset: { x: 56, y: 61 },
    cornerRadius: 18,
    color: '#1a1a1a',
    style: FrameStyle.REALISTIC
  },
  {
    id: 'ipad-air',
    name: 'iPad Air',
    category: DeviceCategory.IPAD,
    displaySize: '10.9"',
    screenSize: { width: 1640, height: 2360 },
    frameSize: { width: 1750, height: 2480 },
    screenOffset: { x: 55, y: 60 },
    cornerRadius: 18,
    color: '#1a1a1a',
    style: FrameStyle.REALISTIC
  },

  // Android Models
  {
    id: 'pixel-8-pro',
    name: 'Google Pixel 8 Pro',
    category: DeviceCategory.ANDROID,
    displaySize: '6.7"',
    screenSize: { width: 1344, height: 2992 },
    frameSize: { width: 1440, height: 3105 },
    screenOffset: { x: 48, y: 56 },
    cornerRadius: 40,
    color: '#2d2d2d',
    style: FrameStyle.REALISTIC
  },
  {
    id: 'pixel-8',
    name: 'Google Pixel 8',
    category: DeviceCategory.ANDROID,
    displaySize: '6.2"',
    screenSize: { width: 1080, height: 2400 },
    frameSize: { width: 1165, height: 2500 },
    screenOffset: { x: 42, y: 50 },
    cornerRadius: 35,
    color: '#2d2d2d',
    style: FrameStyle.REALISTIC
  },
  {
    id: 'samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra',
    category: DeviceCategory.ANDROID,
    displaySize: '6.8"',
    screenSize: { width: 1440, height: 3120 },
    frameSize: { width: 1535, height: 3230 },
    screenOffset: { x: 47, y: 55 },
    cornerRadius: 12,
    color: '#1a1a1a',
    style: FrameStyle.REALISTIC
  },
  {
    id: 'samsung-s24',
    name: 'Samsung Galaxy S24',
    category: DeviceCategory.ANDROID,
    displaySize: '6.2"',
    screenSize: { width: 1080, height: 2340 },
    frameSize: { width: 1165, height: 2440 },
    screenOffset: { x: 42, y: 50 },
    cornerRadius: 12,
    color: '#1a1a1a',
    style: FrameStyle.REALISTIC
  }
]

// Get devices by category
export function getDevicesByCategory(category) {
  return deviceFrames.filter(device => device.category === category)
}

// Get device by ID
export function getDeviceById(id) {
  return deviceFrames.find(device => device.id === id)
}

// Get all categories
export function getAllCategories() {
  return Object.values(DeviceCategory)
}

// Calculate the scale needed to fit a screenshot into a device frame
export function calculateFitScale(screenshot, device) {
  const scaleX = device.screenSize.width / screenshot.width
  const scaleY = device.screenSize.height / screenshot.height
  return Math.min(scaleX, scaleY)
}

// Calculate position to center screenshot in device frame
export function calculateCenterPosition(screenshot, device, scale) {
  const scaledWidth = screenshot.width * scale
  const scaledHeight = screenshot.height * scale

  return {
    x: device.screenOffset.x + (device.screenSize.width - scaledWidth) / 2,
    y: device.screenOffset.y + (device.screenSize.height - scaledHeight) / 2
  }
}
