# 🎨 Lumina Photo Studio - Ultimate Edition

A professional photo viewer and editor with local file processing capabilities, perfect for managing Zoom/Webex backgrounds.

## ✨ Features

### 🚀 Easy File Loading
- **Open Folder**: Securely load local directories via the browser's file picker.
- **Drag & Drop Support**: Drag any folder directly onto the window to load images instantly.
- **Privacy First**: Files are processed locally in your browser and never uploaded to any server.

### 🖼️ Image Management
- **Masonry Grid Layout**: Beautiful responsive gallery that adapts to screen size.
- **Sort & Filter**: Sort by name or date, filter by orientation (portrait/landscape).
- **Search Functionality**: Quick file name display on hover.

### 🎨 Image Editing
- **8 Professional Presets**: Original, Vintage, Noir, Vivid, Cool, Warm, Cyberpunk, Desert.
- **Manual Adjustments**: Brightness (0-200%), Contrast (0-200%), Saturation (0-200%).
- **Rotation Tools**: Rotate left/right by 90°.
- **Flip/Mirror**: Horizontal (perfect for reversing camera images) and Vertical flip.
- **RGB Histogram**: View color distribution for perfect exposure.
- **Zoom & Pan**: Inspect details with up to 500% zoom.
- **Undo/Redo**: 20-step history for all edits.

### ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `H` | **Flip Horizontal** (Mirror/Reverse - perfect for Zoom!) |
| `V` | Flip Vertical |
| `G` | Toggle Histogram |
| `[` | Rotate Left 90° |
| `]` | Rotate Right 90° |
| `+` / `=` | Zoom In |
| `-` / `_` | Zoom Out |
| `Space` | Play/Pause Slideshow |
| `←` / `→` | Previous/Next Image |
| `Home` / `End` | First/Last Image |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Esc` | Close Editor |

### 🎬 Presentation Mode
- **Slideshow**: Automatic 3-second image transitions.
- **Zoom Persistence**: Zoom level remains active even during slideshows.
- **Full-Screen Editor**: Immersive editing experience.

### 💾 Export Options
- **Save Edited Images**: Download your edited versions.
- **Copy Filename**: Quickly copy the filename to clipboard (for file dialog searching).
- **Original Quality**: Non-destructive editing.

## 📂 Project Structure

```
BackgroundsForWebex/
├── index.html              # Main HTML file
├── backgrounds/            # Image folder (93 images included)
│   ├── zoom-bg-*.png
│   └── ...
├── scripts/
│   ├── style.css           # All CSS styles
│   └── scripts.js          # Main JavaScript logic (Consolidated)
└── README.md               # This file
```

## 🚀 Getting Started

### Quick Start
1. **Open the app**: Double-click `index.html` in any modern browser.
2. **Load Images**:
   - Click **"Open Folder"** and select the `backgrounds` directory (or your own).
   - Or **Drag & Drop** the folder onto the welcome screen.
3. **Click any image**: Opens the full editor with all features.
4. **Edit & Save**: Apply filters, adjust settings, and download your edited image.

## 🎯 Perfect For

- **Zoom/Webex Backgrounds**: Edit and reverse backgrounds for video calls.
- **Photo Organization**: View and sort large collections.
- **Quick Edits**: Apply professional filters instantly.
- **Presentations**: Slideshow mode for displaying images.

## 💡 Pro Tips

### For Video Conferencing
- Use the **"Reverse/Mirror"** button (or press `H`) if backgrounds look flipped in video calls.
- Try the **"Vivid"** or **"Cool"** presets for professional-looking backgrounds.

### For Efficiency
- Use **keyboard shortcuts** for faster workflow.
- Press `Space` to quickly preview images in slideshow mode.
- Use `Ctrl+Z` liberally - 20 steps of undo available!

## 🔧 Technical Details

### Technologies Used
- **HTML5 & CSS3**: Modern web standards.
- **JavaScript (ES6+)**: Pure vanilla JS, no frameworks.
- **Tailwind CSS**: Utility-first styling via CDN.
- **Lucide Icons**: Beautiful icon library.

### Browser Compatibility
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## 📝 Changelog

### Version 2.1 - Ultimate Edition (Current)
- ✨ **NEW**: Consolidated codebase into a single script file.
- ✨ **NEW**: Added **Zoom Controls** (Buttons & Shortcuts).
- ✨ **NEW**: Added **Copy Path** button for easier file finding.
- ✨ **IMPROVED**: Removed automatic loading restrictions in favor of robust manual loading.
- ✨ **IMPROVED**: Enhanced UI for smoother experience.

### Version 2.0
- Added auto-load concepts.
- Split files (refactored later).

### Version 1.0
- Initial release.

## 📄 License

This project is free to use for personal and commercial purposes. No attribution required.

---

**Enjoy your enhanced photo studio! 📸✨**
