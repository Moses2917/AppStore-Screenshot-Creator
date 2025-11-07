# AppStore-Screenshot-Creator

Upload your iOS app screenshot, edit them into nice images, then upload them to the App Store.

## Features

- Upload iOS app screenshots
- Choose device frames (iPhone, iPad, or no frame)
- Customize background colors
- Add top and bottom text overlays
- Adjust text colors
- Download high-quality screenshots (2x scale)

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

## Usage

1. Click "Choose Screenshot" to upload your iOS app screenshot
2. Select a device frame (iPhone, iPad, or none)
3. Customize the background color
4. Add optional text overlays at the top and bottom
5. Adjust text color as needed
6. Click "Download Screenshot" to save your formatted image

## Tech Stack

- Svelte 4
- Vite 5
- html2canvas for screenshot generation
