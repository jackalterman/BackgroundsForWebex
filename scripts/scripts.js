// Lumina Photo Studio - Combined Core Scripts

// ==========================================
// PART 1: State & Initialization
// ==========================================

// Application State
const state = {
    images: [],             // Array of image objects
    currentIndex: 0,
    history: [],
    historyIndex: 0,
    edit: {
        rotate: 0,
        flipH: 1,
        flipV: 1,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        grayscale: 0,
        hueRotate: 0,
        sepia: 0
    },
    zoom: 100,              // Zoom percentage
    histogramVisible: false,
    currentPreset: 'Original',
    slideshowInterval: null,
    isPlaying: false
};

// Global Canvas
let canvas, ctx;

// Filter Presets
const filterPresets = [
    { name: 'Original', filter: 'brightness(100%) contrast(100%) saturate(100%) grayscale(0%) sepia(0%)' },
    { name: 'Vintage', filter: 'brightness(110%) contrast(90%) saturate(85%) grayscale(20%) sepia(30%)' },
    { name: 'Noir', filter: 'brightness(100%) contrast(120%) saturate(0%) grayscale(100%) sepia(0%)' },
    { name: 'Vivid', filter: 'brightness(110%) contrast(110%) saturate(150%) grayscale(0%) sepia(0%)' },
    { name: 'Cool', filter: 'brightness(105%) contrast(100%) saturate(90%) hue-rotate(180deg) sepia(0%)' },
    { name: 'Warm', filter: 'brightness(105%) contrast(100%) saturate(110%) hue-rotate(-30deg) sepia(20%)' },
    { name: 'Cyberpunk', filter: 'brightness(110%) contrast(120%) saturate(140%) hue-rotate(200deg) sepia(0%)' },
    { name: 'Desert', filter: 'brightness(110%) contrast(110%) saturate(80%) hue-rotate(-10deg) sepia(40%)' }
];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    canvas = document.getElementById('editor-canvas');
    ctx = canvas.getContext('2d');

    const dropZone = document.getElementById('welcome-screen');
    const galleryContainer = document.getElementById('gallery-container');

    // Drag & Drop listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });

    document.body.addEventListener('drop', handleDrop, false);

    // Filters & Sort
    document.getElementById('sort-select').addEventListener('change', () => renderGallery());
    document.getElementById('filter-select').addEventListener('change', () => renderGallery());

    // File Input
    document.getElementById('folder-input').addEventListener('change', handleFileSelect);
    const heroInput = document.getElementById('folder-input-hero');
    if (heroInput) heroInput.addEventListener('change', handleFileSelect);

    // Modal
    document.getElementById('btn-close').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal' || e.target.id === 'canvas-container') closeModal();
    });

    document.getElementById('prev-img').addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
    document.getElementById('next-img').addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });

    // Zoom Listeners
    document.getElementById('btn-zoom-in').addEventListener('click', () => updateZoom(10));
    document.getElementById('btn-zoom-out').addEventListener('click', () => updateZoom(-10));

    // Sliders
    ['brightness', 'contrast', 'saturation'].forEach(type => {
        const slider = document.getElementById('filter-' + type);
        slider.addEventListener('input', (e) => {
            state.edit[type] = parseInt(e.target.value);
            document.getElementById('val-' + type.substr(0, 6)).innerText = state.edit[type] + '%';
            drawCanvas();
        });
        slider.addEventListener('change', () => saveHistory());
    });

    renderPresets();

    document.getElementById('btn-save').addEventListener('click', saveImage);
    document.getElementById('btn-copy-path').addEventListener('click', copyPath);
    document.getElementById('btn-slideshow').addEventListener('click', toggleSlideshow);

    document.addEventListener('keydown', handleKeyboardShortcuts);
});

// Helper
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// File Handlers
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    processFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
}

async function processFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    document.getElementById('loader-overlay').classList.remove('hidden');
    const newImages = [];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (validTypes.includes(file.type)) {
            const imgObj = {
                name: file.name,
                url: URL.createObjectURL(file),
                type: file.type,
                size: file.size,
                date: file.lastModified,
                file: file,
                width: 0, height: 0, exif: {}
            };

            await new Promise(resolve => {
                const img = new Image();
                img.onload = () => {
                    imgObj.width = img.naturalWidth;
                    imgObj.height = img.naturalHeight;
                    EXIF.getData(img, function () {
                        const all = EXIF.getAllTags(this);
                        imgObj.exif = {
                            make: all.Make, model: all.Model, iso: all.ISOSpeedRatings,
                            focal: all.FocalLength, aperture: all.FNumber,
                            shutter: all.ExposureTime ? '1/' + Math.round(1 / all.ExposureTime) : null
                        };
                        resolve();
                    });
                };
                img.onerror = resolve;
                img.src = imgObj.url;
            });
            newImages.push(imgObj);
        }
    }

    if (newImages.length > 0) {
        state.images = [...state.images, ...newImages];
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('gallery-container').classList.remove('hidden');
        document.getElementById('gallery-controls').classList.remove('hidden');
        document.getElementById('gallery-controls').classList.add('flex');

        updateImageCount();
        renderGallery();
    }
    document.getElementById('loader-overlay').classList.add('hidden');
}

function updateImageCount() {
    const countEl = document.getElementById('image-count');
    countEl.innerText = `${state.images.length} photos`;
    countEl.classList.remove('hidden');
}

// Render Gallery
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';

    const sortVal = document.getElementById('sort-select').value;
    const filterVal = document.getElementById('filter-select').value;

    let displayImages = [...state.images];

    if (filterVal === 'portrait') {
        displayImages = displayImages.filter(img => img.height > img.width);
    } else if (filterVal === 'landscape') {
        displayImages = displayImages.filter(img => img.width > img.height);
    }

    displayImages.sort((a, b) => {
        if (sortVal === 'name-asc') return a.name.localeCompare(b.name);
        if (sortVal === 'name-desc') return b.name.localeCompare(a.name);
        if (sortVal === 'date-desc') return b.date - a.date;
        if (sortVal === 'date-asc') return a.date - b.date;
        return 0;
    });

    displayImages.forEach((img, index) => {
        const originalIndex = state.images.indexOf(img);
        const item = document.createElement('div');
        item.className = 'masonry-item relative group overflow-hidden rounded-xl bg-neutral-800 cursor-pointer fade-in';
        item.onclick = () => openModal(originalIndex);

        const imgEl = document.createElement('img');
        imgEl.src = img.url;
        imgEl.className = 'w-full h-auto transform transition duration-500 group-hover:scale-110';
        imgEl.loading = 'lazy';

        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4';

        const name = document.createElement('span');
        name.className = 'text-white text-sm font-medium truncate';
        name.innerText = img.name;

        const meta = document.createElement('span');
        meta.className = 'text-gray-300 text-xs';
        meta.innerText = `${img.width}×${img.height}`;

        overlay.appendChild(name);
        overlay.appendChild(meta);
        item.appendChild(imgEl);
        item.appendChild(overlay);
        grid.appendChild(item);
    });
    lucide.createIcons();
}

// ==========================================
// PART 2: Modal & Editing Functions
// ==========================================

function openModal(index) {
    state.currentIndex = index;
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    void modal.offsetWidth;
    modal.classList.remove('opacity-0');

    // Reset Zoom
    state.zoom = 100;
    document.getElementById('editor-canvas').style.transform = `scale(1)`;
    document.getElementById('zoom-level').innerText = '100%';

    loadImageToCanvas();
    updateModalUI();
    resetEdits();
}

function closeModal() {
    if (state.isPlaying) toggleSlideshow();
    const modal = document.getElementById('modal');
    modal.classList.add('opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function renderPresets() {
    const container = document.getElementById('filter-presets');
    container.innerHTML = '';
    filterPresets.forEach(preset => {
        const div = document.createElement('div');
        div.className = 'filter-preset group';
        if (preset.name === state.currentPreset) div.classList.add('active');
        div.setAttribute('data-preset', preset.name);
        div.onclick = () => applyPreset(preset);

        const grad = document.createElement('div');
        grad.className = 'w-full h-full bg-neutral-700';
        grad.style.filter = preset.filter;
        grad.style.background = 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)';

        const name = document.createElement('div');
        name.className = 'filter-preset-name';
        name.innerText = preset.name;

        div.appendChild(grad);
        div.appendChild(name);
        container.appendChild(div);
    });
}

function applyPreset(preset) {
    const defaults = { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, hueRotate: 0, sepia: 0 };
    state.edit.rotate = 0; state.edit.flipH = 1; state.edit.flipV = 1;
    Object.assign(state.edit, defaults);

    const regex = /([a-z-]+)\((-?\d+(?:\.\d+)?)(%|deg)?\)/g;
    let match;
    while ((match = regex.exec(preset.filter)) !== null) {
        const type = match[1];
        const val = parseFloat(match[2]);
        switch (type) {
            case 'brightness': state.edit.brightness = val; break;
            case 'contrast': state.edit.contrast = val; break;
            case 'saturate': state.edit.saturation = val; break;
            case 'grayscale': state.edit.grayscale = val; break;
            case 'hue-rotate': state.edit.hueRotate = val; break;
            case 'sepia': state.edit.sepia = val; break;
        }
    }

    state.currentPreset = preset.name;
    document.querySelectorAll('.filter-preset').forEach(el => el.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-preset="${preset.name}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    drawCanvas();
    saveHistory();
    updateSlidersFromState();
}

// Shortcuts
function handleKeyboardShortcuts(e) {
    if (document.getElementById('modal').classList.contains('hidden')) return;
    switch (e.key) {
        case 'ArrowLeft': prevImage(); break;
        case 'ArrowRight': nextImage(); break;
        case 'Escape': closeModal(); break;
        case 'h': case 'H': editActions.flip('h'); break;
        case 'v': case 'V': editActions.flip('v'); break;
        case '[': editActions.rotate(-90); break;
        case ']': editActions.rotate(90); break;
        case 'g': case 'G': editActions.toggleHistogram(); break;
        case ' ': e.preventDefault(); toggleSlideshow(); break;
        case 'z': if (e.ctrlKey) { e.preventDefault(); undo(); } break;
        case 'y': if (e.ctrlKey) { e.preventDefault(); redo(); } break;
        case '+': case '=': updateZoom(10); break;
        case '-': case '_': updateZoom(-10); break;
    }
}

function toggleSlideshow() {
    const btn = document.getElementById('btn-slideshow');
    const icon = document.getElementById('slideshow-icon');
    const text = document.getElementById('slideshow-text');

    if (state.isPlaying) {
        clearInterval(state.slideshowInterval);
        state.isPlaying = false;
        text.innerText = "Play";
        icon.setAttribute('data-lucide', 'play');
        btn.classList.remove('slideshow-active', 'text-red-400', 'hover:bg-red-400/10');
        btn.classList.add('text-blue-400', 'hover:bg-blue-400/10');
    } else {
        state.isPlaying = true;
        text.innerText = "Pause";
        icon.setAttribute('data-lucide', 'pause');
        btn.classList.add('slideshow-active', 'text-red-400', 'hover:bg-red-400/10');
        btn.classList.remove('text-blue-400', 'hover:bg-blue-400/10');

        state.slideshowInterval = setInterval(() => {
            if (state.currentIndex < state.images.length - 1) {
                nextImage();
            } else {
                openModal(0);
            }
        }, 3000);
    }
    lucide.createIcons();
}

function updateModalUI() {
    const img = state.images[state.currentIndex];
    document.getElementById('file-name').innerText = img.name;
    const dims = `${img.width}×${img.height}`;
    const size = formatFileSize(img.size);
    const pos = `${state.currentIndex + 1}/${state.images.length}`;
    document.getElementById('file-metadata').innerText = `${size} • ${dims} • ${pos}`;

    if (img.exif && (img.exif.make || img.exif.model || img.exif.iso)) {
        const parts = [];
        if (img.exif.make && img.exif.model) parts.push(`${img.exif.make} ${img.exif.model}`);
        if (img.exif.focal) parts.push(`${img.exif.focal}mm`);
        if (img.exif.aperture) parts.push(`f/${img.exif.aperture}`);
        if (img.exif.shutter) parts.push(`${img.exif.shutter}s`);
        if (img.exif.iso) parts.push(`ISO ${img.exif.iso}`);
        document.getElementById('file-exif').innerText = parts.join(' • ');
    } else {
        document.getElementById('file-exif').innerText = '';
    }

    document.getElementById('prev-img').style.opacity = state.currentIndex === 0 ? '0.3' : '1';
    document.getElementById('next-img').style.opacity = state.currentIndex === state.images.length - 1 ? '0.3' : '1';
}

function prevImage() {
    if (state.currentIndex > 0) openModal(state.currentIndex - 1);
}

function nextImage() {
    if (state.currentIndex < state.images.length - 1) openModal(state.currentIndex + 1);
}

let currentImageObj = new Image();

function loadImageToCanvas() {
    const img = state.images[state.currentIndex];
    currentImageObj.src = img.url;
    currentImageObj.onload = () => {
        drawCanvas();
        if (state.histogramVisible) updateHistogram();
    };
}

function saveHistory() {
    if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
    }
    state.history.push(JSON.parse(JSON.stringify(state.edit)));
    state.historyIndex = state.history.length - 1;
    if (state.history.length > 20) {
        state.history.shift();
        state.historyIndex--;
    }
    updateUndoRedoButtons();
}

function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        state.edit = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        updateSlidersFromState();
        drawCanvas();
        if (state.histogramVisible) updateHistogram();
        updateUndoRedoButtons();
    }
}

function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.edit = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        updateSlidersFromState();
        drawCanvas();
        if (state.histogramVisible) updateHistogram();
        updateUndoRedoButtons();
    }
}

function updateUndoRedoButtons() {
    document.getElementById('btn-undo').disabled = state.historyIndex <= 0;
    document.getElementById('btn-redo').disabled = state.historyIndex >= state.history.length - 1;
}

function updateSlidersFromState() {
    document.getElementById('filter-brightness').value = state.edit.brightness;
    document.getElementById('val-bright').innerText = `${state.edit.brightness}%`;
    document.getElementById('filter-contrast').value = state.edit.contrast;
    document.getElementById('val-contrast').innerText = `${state.edit.contrast}%`;
    document.getElementById('filter-saturation').value = state.edit.saturation;
    document.getElementById('val-saturation').innerText = `${state.edit.saturation}%`;
}

const editActions = {
    rotate: deg => {
        saveHistory();
        state.edit.rotate = (state.edit.rotate + deg) % 360;
        drawCanvas();
        if (state.histogramVisible) updateHistogram();
    },
    flip: dir => {
        saveHistory();
        if (dir === 'h') state.edit.flipH *= -1;
        if (dir === 'v') state.edit.flipV *= -1;
        drawCanvas();
        if (state.histogramVisible) updateHistogram();
    },
    toggleHistogram: () => {
        state.histogramVisible = !state.histogramVisible;
        const container = document.getElementById('histogram-container');
        const btn = document.getElementById('btn-histogram');
        if (state.histogramVisible) {
            container.classList.remove('hidden');
            btn.classList.add('text-blue-400');
            updateHistogram();
        } else {
            container.classList.add('hidden');
            btn.classList.remove('text-blue-400');
        }
    },
    reset: () => {
        saveHistory();
        resetEdits();
        drawCanvas();
        if (state.histogramVisible) updateHistogram();
    }
};

function resetEdits() {
    state.edit = { rotate: 0, flipH: 1, flipV: 1, brightness: 100, contrast: 100, saturation: 100, grayscale: 0, hueRotate: 0, sepia: 0 };
    state.currentPreset = 'Original';
    state.history = [JSON.parse(JSON.stringify(state.edit))];
    state.historyIndex = 0;
    updateSlidersFromState();
    document.querySelectorAll('.filter-preset').forEach(el => el.classList.remove('active'));
    const orig = document.querySelector('[data-preset="Original"]');
    if (orig) orig.classList.add('active');
    updateUndoRedoButtons();
}

function drawCanvas() {
    const isVert = Math.abs(state.edit.rotate) % 180 !== 0;
    const w = currentImageObj.naturalWidth;
    const h = currentImageObj.naturalHeight;
    canvas.width = isVert ? h : w;
    canvas.height = isVert ? w : h;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(state.edit.rotate * Math.PI / 180);
    ctx.scale(state.edit.flipH, state.edit.flipV);
    ctx.filter = `brightness(${state.edit.brightness}%) contrast(${state.edit.contrast}%) saturate(${state.edit.saturation}%) grayscale(${state.edit.grayscale}%) hue-rotate(${state.edit.hueRotate}deg) sepia(${state.edit.sepia}%)`;
    ctx.drawImage(currentImageObj, -w / 2, -h / 2);
    ctx.restore();
}

function saveImage() {
    const link = document.createElement('a');
    link.download = `edited_${state.images[state.currentIndex].name}`;
    link.href = canvas.toDataURL(state.images[state.currentIndex].type, 0.9);
    link.click();
}

// Zoom Function
function updateZoom(delta) {
    let newZoom = state.zoom + delta;
    if (newZoom < 10) newZoom = 10;
    if (newZoom > 500) newZoom = 500;
    state.zoom = newZoom;

    document.getElementById('zoom-level').innerText = `${state.zoom}%`;
    document.getElementById('editor-canvas').style.transform = `scale(${state.zoom / 100})`;
}

// Copy Path Function
function copyPath() {
    const img = state.images[state.currentIndex];
    const textToCopy = img.name;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const btn = document.getElementById('btn-copy-path');
        const originalHTML = btn.innerHTML;

        btn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-green-400"></i> Copied!`;
        lucide.createIcons();

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            lucide.createIcons();
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard');
    });
}

function updateHistogram() {
    const histCanvas = document.getElementById('histogram-canvas');
    if (!histCanvas) return;
    const hCtx = histCanvas.getContext('2d');
    const w = histCanvas.width;
    const h = histCanvas.height;

    let imgData;
    try {
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    } catch (e) {
        return;
    }

    const r = new Array(256).fill(0);
    const g = new Array(256).fill(0);
    const b = new Array(256).fill(0);

    const stride = 16;
    for (let i = 0; i < imgData.length; i += stride) {
        r[imgData[i]]++;
        g[imgData[i + 1]]++;
        b[imgData[i + 2]]++;
    }

    const max = Math.max(...r, ...g, ...b) || 1;

    hCtx.clearRect(0, 0, w, h);
    hCtx.globalCompositeOperation = 'screen';

    const drawChannel = (arr, color) => {
        hCtx.fillStyle = color;
        hCtx.beginPath();
        hCtx.moveTo(0, h);
        for (let i = 0; i < 256; i++) {
            const pct = arr[i] / max;
            const barH = pct * h;
            const x = (i / 255) * w;
            hCtx.lineTo(x, h - barH);
        }
        hCtx.lineTo(w, h);
        hCtx.fill();
    };

    drawChannel(r, 'rgba(255,0,0,0.5)');
    drawChannel(g, 'rgba(0,255,0,0.5)');
    drawChannel(b, 'rgba(0,0,255,0.5)');

    hCtx.globalCompositeOperation = 'source-over';
}
