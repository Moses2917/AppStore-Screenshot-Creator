# AppStore-Screenshot-Creator

Create stunning, professional App Store screenshots in minutes. Upload your iOS app screenshots and transform them into eye-catching images ready for the App Store, social media, or marketing materials.

## Features

### Core Features
- **Drag & Drop Upload** - Easily upload single or multiple screenshots
- **Multiple Screenshot Management** - Work with multiple screenshots simultaneously
- **Device Frames** - Choose from iPhone, iPad, or no frame
- **Professional Templates** - 8+ pre-designed templates for quick styling
- **Custom Backgrounds** - Solid colors or beautiful gradients with adjustable angles
- **Text Overlays** - Add top and bottom text with full customization

### Advanced Customization
- **Typography Controls** - Choose from 8 fonts, adjust size (16-72px), weight, and add shadows
- **Image Adjustments** - Fine-tune brightness, contrast, saturation, and rotation
- **Gradient Builder** - Create custom gradients with color picker and angle control
- **Real-time Preview** - See changes instantly as you edit

### Export & Sharing
- **Multiple Export Formats** - PNG and JPEG with quality control
- **App Store Presets** - Export in official App Store sizes (iPhone 6.7", 6.5", 5.5", iPad Pro)
- **Social Media Presets** - Instagram, Twitter, Facebook, LinkedIn optimized sizes
- **Custom Dimensions** - Set any custom width and height
- **Batch Export** - Export all screenshots at once with same settings
- **High Quality** - 2x scale exports for crisp, professional results

### Workflow Features
- **Save/Load Projects** - Save your work and return to it later
- **Keyboard Shortcuts** - Speed up your workflow with shortcuts
- **Duplicate Screenshots** - Quickly create variations
- **Dark/Light Mode** - Choose your preferred theme
- **Interactive Tutorial** - Learn the features with a guided tour

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

### Basic Workflow

1. **Upload** - Drag and drop screenshots or click to browse (supports multiple files)
2. **Select Template** - Choose from preset templates or start from scratch
3. **Customize Background** - Pick solid colors or create gradients
4. **Add Device Frame** - Select iPhone, iPad, or no frame
5. **Add Text** - Include top and bottom text with custom styling
6. **Adjust Image** - Fine-tune brightness, contrast, saturation, rotation
7. **Export** - Choose format, size preset, and download

### Keyboard Shortcuts

- `Ctrl/⌘ + S` - Save project
- `Ctrl/⌘ + E` - Export current screenshot
- `Ctrl/⌘ + Shift + E` - Batch export all
- `Ctrl/⌘ + D` - Duplicate current screenshot
- `Delete` - Delete current screenshot
- `Ctrl/⌘ + ←/→` - Navigate between screenshots
- `?` - Show all shortcuts

### Managing Projects

1. Enter a project name in the "Projects" section
2. Click "Save Project" to save your current work
3. Saved projects appear in the list below
4. Click a project name to load it
5. Use `Ctrl/⌘ + S` to quick-save

### Batch Processing

1. Upload multiple screenshots
2. Apply the same styling to each (or customize individually)
3. Click "Batch Export All"
4. Choose your export settings
5. All screenshots will be downloaded with consistent styling

## Templates

Choose from professionally designed templates:

- **Minimal Light** - Clean white background
- **Minimal Dark** - Sleek dark background
- **Purple Dream** - Purple gradient
- **Ocean Blue** - Blue gradient
- **Sunset** - Red-pink gradient
- **Forest** - Green gradient
- **Peach** - Soft peach gradient
- **Neon** - Vibrant cyan-green gradient

## Export Presets

### App Store Sizes
- iPhone 6.7" (1290×2796)
- iPhone 6.5" (1242×2688)
- iPhone 5.5" (1242×2208)
- iPad Pro 12.9" (2048×2732)
- iPad Pro 11" (1668×2388)

### Social Media Sizes
- Instagram Post (1080×1080)
- Instagram Story (1080×1920)
- Twitter Post (1200×675)
- Facebook Post (1200×630)
- LinkedIn Post (1200×627)

## Tech Stack

- **Svelte 4** - Reactive UI framework
- **Vite 5** - Fast build tool and dev server
- **html2canvas** - Client-side screenshot generation
- **Svelte Stores** - State management
- **LocalStorage API** - Project persistence

## Browser Support

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

See LICENSE file for details.
