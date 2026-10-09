import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FolderOpen,
  Save,
  Undo2,
  Redo2,
  RotateCcw,
  Sliders,
  Sparkles,
  Layers,
  Code2,
  Terminal,
  Copy,
  Check,
  Zap,
  CheckCheck
} from 'lucide-react';

interface HistoryState {
  imageData: ImageData;
  description: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'gui' | 'code' | 'guide'>('gui');
  const [selectedCodeFile, setSelectedCodeFile] = useState<'GUI.cpp' | 'main.cpp' | 'Image_Class.h' | 'README.md'>('GUI.cpp');
  const [copied, setCopied] = useState(false);

  // Universal Live Intensity Filter States
  const [intensity, setIntensity] = useState<number>(100);
  const [activeFilterName, setActiveFilterName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Ready. Click any filter to preview with live intensity!');
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  // Modal Dialog Inputs
  const [frameSize, setFrameSize] = useState<number>(15);
  const [frameColor, setFrameColor] = useState<number>(1);
  const [cropParams, setCropParams] = useState({ x: 25, y: 25, w: 200, h: 150 });
  const [resizeParams, setResizeParams] = useState({ w: 300, h: 200 });

  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);
  const afterCanvasRef = useRef<HTMLCanvasElement>(null);

  // Universal base snapshot and 100% filtered snapshot for real-time alpha blending
  const baseImageDataRef = useRef<ImageData | null>(null);
  const fullyFilteredDataRef = useRef<ImageData | null>(null);

  const [hasImage, setHasImage] = useState<boolean>(false);
  const [imageDims, setImageDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // History stacks
  const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);

  // Load initial sample Mario image
  useEffect(() => {
    loadSampleImage('mario');
  }, []);

  const loadSampleImage = (type: 'mario' | 'circle') => {
    const w = 320;
    const h = 240;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'mario') {
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(100, 30, 120, 50);
      ctx.fillRect(90, 130, 140, 50);

      ctx.fillStyle = '#fde047';
      ctx.fillRect(110, 80, 100, 50);

      ctx.fillStyle = '#2563eb';
      ctx.fillRect(110, 160, 100, 70);

      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 220, w, 20);
    } else {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#ec4899');
      grad.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2);
      ctx.fill();
    }

    const imgData = ctx.getImageData(0, 0, w, h);
    setupImage(imgData, w, h);
    setStatusMessage(`Loaded sample image (${type}) [${w}x${h} px]`);
  };

  const setupImage = (imgData: ImageData, w: number, h: number) => {
    setImageDims({ w, h });
    setHasImage(true);
    setUndoStack([]);
    setRedoStack([]);
    setActiveFilterName(null);
    baseImageDataRef.current = null;
    fullyFilteredDataRef.current = null;

    if (beforeCanvasRef.current) {
      beforeCanvasRef.current.width = w;
      beforeCanvasRef.current.height = h;
      const bCtx = beforeCanvasRef.current.getContext('2d');
      bCtx?.putImageData(imgData, 0, 0);
    }

    if (afterCanvasRef.current) {
      afterCanvasRef.current.width = w;
      afterCanvasRef.current.height = h;
      const aCtx = afterCanvasRef.current.getContext('2d');
      aCtx?.putImageData(imgData, 0, 0);
    }

    setCropParams({ x: Math.floor(w * 0.2), y: Math.floor(h * 0.2), w: Math.floor(w * 0.6), h: Math.floor(h * 0.6) });
    setResizeParams({ w: Math.floor(w * 0.75), h: Math.floor(h * 0.75) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height);
        setupImage(data, img.width, img.height);
        setStatusMessage(`Opened ${file.name} (${img.width}x${img.height})`);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const saveUndoState = (desc: string) => {
    if (!afterCanvasRef.current) return;
    const aCtx = afterCanvasRef.current.getContext('2d');
    if (!aCtx) return;
    const current = aCtx.getImageData(0, 0, afterCanvasRef.current.width, afterCanvasRef.current.height);
    setUndoStack(prev => [...prev, { imageData: current, description: desc }]);
    setRedoStack([]);
  };

  // Lock in current filter and make it the new base
  const handleCommitFilter = () => {
    if (!afterCanvasRef.current || !activeFilterName) return;
    const aCtx = afterCanvasRef.current.getContext('2d');
    if (!aCtx) return;

    baseImageDataRef.current = aCtx.getImageData(0, 0, afterCanvasRef.current.width, afterCanvasRef.current.height);
    const lockedFilter = activeFilterName;
    setActiveFilterName(null);
    fullyFilteredDataRef.current = null;
    setStatusMessage(`Filter "${lockedFilter}" committed and locked in! Ready to chain another filter.`);
  };

  // -------------------------------------------------------------
  // Universal Live Intensity Linear Alpha Blend (0% - 100%)
  // -------------------------------------------------------------
  const blendLiveFilter = useCallback((val: number) => {
    if (!afterCanvasRef.current || !baseImageDataRef.current || !fullyFilteredDataRef.current) return;
    const aCtx = afterCanvasRef.current.getContext('2d');
    if (!aCtx) return;

    const base = baseImageDataRef.current;
    const filtered = fullyFilteredDataRef.current;
    const alpha = Math.max(0, Math.min(100, val)) / 100.0;

    const output = new ImageData(new Uint8ClampedArray(base.data), base.width, base.height);
    const outData = output.data;
    const bData = base.data;
    const fData = filtered.data;

    for (let i = 0; i < outData.length; i += 4) {
      outData[i] = Math.floor((1 - alpha) * bData[i] + alpha * fData[i]);
      outData[i + 1] = Math.floor((1 - alpha) * bData[i + 1] + alpha * fData[i + 1]);
      outData[i + 2] = Math.floor((1 - alpha) * bData[i + 2] + alpha * fData[i + 2]);
      outData[i + 3] = 255;
    }

    aCtx.putImageData(output, 0, 0);
  }, []);

  // When user drags intensity slider
  const handleIntensitySliderChange = (newVal: number) => {
    setIntensity(newVal);

    if (activeFilterName && baseImageDataRef.current && fullyFilteredDataRef.current) {
      blendLiveFilter(newVal);
      setStatusMessage(`Live Intensity: ${newVal}% (${activeFilterName})`);
    } else if (hasImage) {
      // If no filter selected yet, activate Grayscale as default live filter
      selectLiveFilter('Grayscale');
    }
  };

  // -------------------------------------------------------------
  // Calculate 100% Filtered Result for Any Filter
  // -------------------------------------------------------------
  const compute100PercentFilter = (base: ImageData, filterName: string): ImageData => {
    const copy = new ImageData(new Uint8ClampedArray(base.data), base.width, base.height);
    const data = copy.data;
    const w = base.width;
    const h = base.height;

    switch (filterName) {
      case 'Grayscale': {
        for (let i = 0; i < data.length; i += 4) {
          const avg = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
        break;
      }
      case 'Black & White': {
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const bw = avg > 128 ? 255 : 0;
          data[i] = bw;
          data[i + 1] = bw;
          data[i + 2] = bw;
        }
        break;
      }
      case 'Darken': {
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
        }
        break;
      }
      case 'Lighten': {
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        }
        break;
      }
      case 'Invert': {
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
        }
        break;
      }
      case 'Infrared': {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          data[i] = 255;
          data[i + 1] = 255 - r;
          data[i + 2] = 255 - r;
        }
        break;
      }
      case 'Sunlight': {
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] + 70);
          data[i + 1] = Math.min(255, data[i + 1] + 35);
          data[i + 2] = Math.max(0, data[i + 2] - 30);
        }
        break;
      }
      case 'Old TV': {
        for (let y = 0; y < h; y++) {
          if (y % 2 === 0) {
            for (let x = 0; x < w; x++) {
              const idx = (y * w + x) * 4;
              data[idx] = data[0];
              data[idx + 1] = data[1];
              data[idx + 2] = data[2];
            }
          }
        }
        break;
      }
      case 'Purple': {
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] + 50);
          data[i + 1] = Math.floor(data[i + 1] * 0.15);
          data[i + 2] = Math.min(255, data[i + 2] + 120);
        }
        break;
      }
      case 'Detect Edges': {
        const gray = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) {
          gray[i] = Math.floor((data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3);
        }
        const maxDiff = 30;
        for (let y = 0; y < h - 1; y++) {
          for (let x = 0; x < w - 1; x++) {
            const current = gray[y * w + x];
            const right = gray[y * w + (x + 1)];
            const down = gray[(y + 1) * w + x];
            const diffR = Math.abs(current - right);
            const diffD = Math.abs(current - down);
            const idx = (y * w + x) * 4;
            const val = diffR > maxDiff || diffD > maxDiff ? 0 : 255;
            data[idx] = val;
            data[idx + 1] = val;
            data[idx + 2] = val;
          }
        }
        break;
      }
      case 'Blur': {
        const orig = new Uint8ClampedArray(data);
        for (let x = 2; x < w - 2; x++) {
          for (let y = 2; y < h - 2; y++) {
            for (let c = 0; c < 3; c++) {
              let sum = 0;
              for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                  const idx = ((y + dy) * w + (x + dx)) * 4 + c;
                  sum += orig[idx];
                }
              }
              const targetIdx = (y * w + x) * 4 + c;
              data[targetIdx] = Math.floor(sum / 25);
            }
          }
        }
        break;
      }
      case 'Add Frame': {
        let r = 255, g = 0, b = 0;
        if (frameColor === 1) { r = 255; g = 0; b = 0; }
        else if (frameColor === 2) { r = 0; g = 255; b = 0; }
        else if (frameColor === 3) { r = 0; g = 0; b = 255; }
        else if (frameColor === 4) { r = 0; g = 0; b = 0; }
        else if (frameColor === 5) { r = 255; g = 255; b = 255; }
        else if (frameColor === 6) { r = 124; g = 124; b = 124; }

        const size = Math.min(frameSize, Math.floor(Math.min(w, h) / 2));
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (x < size || x >= w - size || y < size || y >= h - size) {
              const idx = (y * w + x) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
            }
          }
        }
        break;
      }
    }
    return copy;
  };

  // Select ANY filter with universal instant live intensity!
  const selectLiveFilter = (filterName: string) => {
    if (!afterCanvasRef.current) return;
    const aCtx = afterCanvasRef.current.getContext('2d');
    if (!aCtx) return;

    // If starting a live filter session, capture clean base
    if (!baseImageDataRef.current) {
      saveUndoState(`${filterName} (Live)`);
      baseImageDataRef.current = aCtx.getImageData(0, 0, afterCanvasRef.current.width, afterCanvasRef.current.height);
    }

    setActiveFilterName(filterName);

    // Compute the full target filter once from the base image
    const full = compute100PercentFilter(baseImageDataRef.current, filterName);
    fullyFilteredDataRef.current = full;

    // Blend instantly at current slider position!
    blendLiveFilter(intensity);
    setStatusMessage(`Active Live Filter: ${filterName} at ${intensity}%. Drag slider to adjust instantly!`);
  };

  // Undo
  const handleUndo = () => {
    if (undoStack.length === 0 || !afterCanvasRef.current) {
      setStatusMessage('No more undo steps available.');
      return;
    }
    setActiveFilterName(null);
    baseImageDataRef.current = null;
    fullyFilteredDataRef.current = null;

    const aCtx = afterCanvasRef.current.getContext('2d');
    if (!aCtx) return;

    const currentState = aCtx.getImageData(0, 0, afterCanvasRef.current.width, afterCanvasRef.current.height);
    const last = undoStack[undoStack.length - 1];

    setRedoStack(prev => [...prev, { imageData: currentState, description: 'Reverted' }]);
    setUndoStack(prev => prev.slice(0, prev.length - 1));

    afterCanvasRef.current.width = last.imageData.width;
    afterCanvasRef.current.height = last.imageData.height;
    aCtx.putImageData(last.imageData, 0, 0);
    setImageDims({ w: last.imageData.width, h: last.imageData.height });
    setStatusMessage(`Undid: ${last.description}`);
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0 || !afterCanvasRef.current) {
      setStatusMessage('No more redo steps available.');
      return;
    }
    setActiveFilterName(null);
    baseImageDataRef.current = null;
    fullyFilteredDataRef.current = null;

    const aCtx = afterCanvasRef.current.getContext('2d');
    if (!aCtx) return;

    const currentState = aCtx.getImageData(0, 0, afterCanvasRef.current.width, afterCanvasRef.current.height);
    const next = redoStack[redoStack.length - 1];

    setUndoStack(prev => [...prev, { imageData: currentState, description: 'Redone' }]);
    setRedoStack(prev => prev.slice(0, prev.length - 1));

    afterCanvasRef.current.width = next.imageData.width;
    afterCanvasRef.current.height = next.imageData.height;
    aCtx.putImageData(next.imageData, 0, 0);
    setImageDims({ w: next.imageData.width, h: next.imageData.height });
    setStatusMessage('Redid filter change.');
  };

  // Clear Filters
  const handleClearFilters = () => {
    if (!beforeCanvasRef.current || !afterCanvasRef.current) return;
    saveUndoState('Clear Filters');
    setActiveFilterName(null);
    baseImageDataRef.current = null;
    fullyFilteredDataRef.current = null;

    const bCtx = beforeCanvasRef.current.getContext('2d');
    const aCtx = afterCanvasRef.current.getContext('2d');
    if (!bCtx || !aCtx) return;

    const originalData = bCtx.getImageData(0, 0, beforeCanvasRef.current.width, beforeCanvasRef.current.height);
    afterCanvasRef.current.width = beforeCanvasRef.current.width;
    afterCanvasRef.current.height = beforeCanvasRef.current.height;
    aCtx.putImageData(originalData, 0, 0);
    setImageDims({ w: beforeCanvasRef.current.width, h: beforeCanvasRef.current.height });
    setStatusMessage('Cleared all filters. AFTER restored to original image.');
  };

  // Save Image Download
  const handleSaveImage = () => {
    if (!afterCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'edited_image.png';
    link.href = afterCanvasRef.current.toDataURL('image/png');
    link.click();
    setStatusMessage('Saved edited image as edited_image.png');
  };

  // Geometric transformations commit live filters first
  const applyGeometricFilter = (name: string, transform: (img: ImageData, w: number, h: number) => ImageData) => {
    if (!afterCanvasRef.current) return;
    const aCtx = afterCanvasRef.current.getContext('2d');
    if (!aCtx) return;

    saveUndoState(name);
    setActiveFilterName(null);
    baseImageDataRef.current = null;
    fullyFilteredDataRef.current = null;

    const w = afterCanvasRef.current.width;
    const h = afterCanvasRef.current.height;
    const current = aCtx.getImageData(0, 0, w, h);
    const result = transform(current, w, h);

    afterCanvasRef.current.width = result.width;
    afterCanvasRef.current.height = result.height;
    aCtx.putImageData(result, 0, 0);
    setImageDims({ w: result.width, h: result.height });
    setStatusMessage(`Applied ${name}`);
  };

  const handleFlip = (horizontal: boolean) => {
    applyGeometricFilter(horizontal ? 'Flip Horizontal' : 'Flip Vertical', (img, w, h) => {
      const copy = new ImageData(new Uint8ClampedArray(img.data), w, h);
      const src = copy.data;
      const dst = img.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const srcIdx = (y * w + x) * 4;
          const targetX = horizontal ? w - 1 - x : x;
          const targetY = horizontal ? y : h - 1 - y;
          const targetIdx = (targetY * w + targetX) * 4;
          dst[targetIdx] = src[srcIdx];
          dst[targetIdx + 1] = src[srcIdx + 1];
          dst[targetIdx + 2] = src[srcIdx + 2];
          dst[targetIdx + 3] = src[srcIdx + 3];
        }
      }
      return img;
    });
    setActiveDialog(null);
  };

  const handleRotate = (angle: number) => {
    applyGeometricFilter(`Rotate ${angle}°`, (img, w, h) => {
      const newW = angle === 180 ? w : h;
      const newH = angle === 180 ? h : w;
      const newCanvas = document.createElement('canvas');
      newCanvas.width = newW;
      newCanvas.height = newH;
      const nCtx = newCanvas.getContext('2d');
      if (!nCtx) return img;

      const newImgData = nCtx.createImageData(newW, newH);
      const src = img.data;
      const dst = newImgData.data;

      for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
          const srcIdx = (y * w + x) * 4;
          let dstX = 0, dstY = 0;
          if (angle === 90) { dstX = h - 1 - y; dstY = x; }
          else if (angle === 180) { dstX = w - 1 - x; dstY = h - 1 - y; }
          else if (angle === 270) { dstX = y; dstY = w - 1 - x; }

          const dstIdx = (dstY * newW + dstX) * 4;
          dst[dstIdx] = src[srcIdx];
          dst[dstIdx + 1] = src[srcIdx + 1];
          dst[dstIdx + 2] = src[srcIdx + 2];
          dst[dstIdx + 3] = 255;
        }
      }
      return newImgData;
    });
    setActiveDialog(null);
  };

  const handleCrop = () => {
    applyGeometricFilter('Crop', (img, w, h) => {
      const cx = Math.max(0, cropParams.x);
      const cy = Math.max(0, cropParams.y);
      const cw = Math.min(w - cx, cropParams.w);
      const ch = Math.min(h - cy, cropParams.h);
      if (cw <= 0 || ch <= 0) return img;

      const newCanvas = document.createElement('canvas');
      newCanvas.width = cw;
      newCanvas.height = ch;
      const nCtx = newCanvas.getContext('2d');
      if (!nCtx) return img;

      const newImg = nCtx.createImageData(cw, ch);
      const src = img.data;
      const dst = newImg.data;

      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const srcIdx = ((cy + y) * w + (cx + x)) * 4;
          const dstIdx = (y * cw + x) * 4;
          dst[dstIdx] = src[srcIdx];
          dst[dstIdx + 1] = src[srcIdx + 1];
          dst[dstIdx + 2] = src[srcIdx + 2];
          dst[dstIdx + 3] = src[srcIdx + 3];
        }
      }
      return newImg;
    });
    setActiveDialog(null);
  };

  const handleResize = () => {
    applyGeometricFilter('Resize', (img, w, h) => {
      const nw = Math.max(10, resizeParams.w);
      const nh = Math.max(10, resizeParams.h);
      const newCanvas = document.createElement('canvas');
      newCanvas.width = nw;
      newCanvas.height = nh;
      const nCtx = newCanvas.getContext('2d');
      if (!nCtx) return img;

      const newImg = nCtx.createImageData(nw, nh);
      const src = img.data;
      const dst = newImg.data;

      for (let y = 0; y < nh; y++) {
        for (let x = 0; x < nw; x++) {
          const oldX = Math.floor((x * w) / nw);
          const oldY = Math.floor((y * h) / nh);
          const srcIdx = (oldY * w + oldX) * 4;
          const dstIdx = (y * nw + x) * 4;
          dst[dstIdx] = src[srcIdx];
          dst[dstIdx + 1] = src[srcIdx + 1];
          dst[dstIdx + 2] = src[srcIdx + 2];
          dst[dstIdx + 3] = src[srcIdx + 3];
        }
      }
      return newImg;
    });
    setActiveDialog(null);
  };

  const copyCodeToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets: Record<string, string> = {
    'GUI.cpp': `// Universal Live Intensity (0% - 100%) for ALL Filters in Win32:
void BlendImages(Image& out, const Image& base, const Image& filtered, int intensityPercent) {
    double alpha = (double)intensityPercent / 100.0;
    out = base;
    for (int i = 0; i < out.width; ++i) {
        for (int j = 0; j < out.height; ++j) {
            for (int k = 0; k < out.channels; ++k) {
                int bVal = base(i, j, k);
                int fVal = filtered(i, j, k);
                out(i, j, k) = (unsigned char)((1.0 - alpha) * bVal + alpha * fVal);
            }
        }
    }
}

// In WM_HSCROLL trackbar handler:
case WM_HSCROLL: {
    currentIntensity = (int)SendMessageW(hSliderIntensity, TBM_GETPOS, 0, 0);
    // Instantly blends from baseImageBeforeFilter in real-time!
    UpdateLiveFilterIntensity();
    return 0;
}`,
    'main.cpp': `#include <iostream>
#include "Libraries/Image_Class.h"
#include "Filters/Flip_filter.cpp"
#include "Filters/black_and_white_filter.cpp"
#include "Filters/Gray_scale_filter.cpp"
// ...
int main() {
    Image image;
    image.loadNewImage("Images/mario.bmp");
    // Interactive console loop ...
}`,
    'Image_Class.h': `class Image {
public:
    int width = 0;
    int height = 0;
    int channels = 3;
    unsigned char* imageData = nullptr;

    bool loadNewImage(const std::string& filename);
    bool saveImage(const std::string& outputFilename);
    unsigned char& operator()(int row, int col, int channel);
};`,
    'README.md': `# PIXLat Image Processor (Console & Windows GUI)
Compile GUI:
  g++ -std=c++17 GUI/GUI.cpp -o GUI/gui.exe -lgdiplus -lcomctl32 -lcomdlg32 -lgdi32 -luser32 -mwindows

Compile Console:
  g++ -std=c++17 main.cpp -o PIXLatProcessor`
  };

  const filterButtons = [
    { name: 'Grayscale', emoji: '🌫️' },
    { name: 'Black & White', emoji: '🔳' },
    { name: 'Darken', emoji: '🌑' },
    { name: 'Lighten', emoji: '🌕' },
    { name: 'Invert', emoji: '🔄' },
    { name: 'Infrared', emoji: '🔥' },
    { name: 'Sunlight', emoji: '☀️' },
    { name: 'Old TV', emoji: '📺' },
    { name: 'Purple', emoji: '🔮' },
    { name: 'Blur', emoji: '💧' },
    { name: 'Detect Edges', emoji: '⚡' },
    { name: 'Add Frame', emoji: '🖼️', isDialog: true }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header Navigation */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            R
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              PIXLat Image Processor
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                Live Intensity Active For ALL Filters
              </span>
            </h1>
            <p className="text-xs text-slate-400">Faculty of Computers & AI, Cairo University (CS213)</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('gui')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'gui'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Desktop GUI
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'code'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            C++ Source Code
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Build & Run Guide
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      {activeTab === 'gui' && (
        <div className="flex-1 flex flex-col p-4 max-w-7xl mx-auto w-full gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Desktop Window Title Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="ml-2 font-mono text-slate-400">PIXLat - IMAGE PROCESSOR (GUI.exe)</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                {imageDims.w > 0 ? `${imageDims.w} × ${imageDims.h} px` : 'No Image'}
              </div>
            </div>

            {/* PREVIEWS SECTION: BEFORE AND AFTER */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/50">
              {/* Left: BEFORE IMAGE */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-1">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Layers className="w-3.5 h-3.5" />
                    BEFORE (Original Image)
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Never Modified</span>
                </div>
                <div className="h-64 sm:h-72 bg-slate-950 rounded-xl border border-slate-800 p-2 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <canvas ref={beforeCanvasRef} className="max-w-full max-h-full object-contain rounded-lg shadow" />
                </div>
              </div>

              {/* Right: AFTER IMAGE */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-1">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    AFTER (Current Edited Image)
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    {activeFilterName ? `● Live [${activeFilterName}] at ${intensity}%` : '● Ready'}
                  </span>
                </div>
                <div className="h-64 sm:h-72 bg-slate-950 rounded-xl border border-slate-800 p-2 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <canvas ref={afterCanvasRef} className="max-w-full max-h-full object-contain rounded-lg shadow" />
                </div>
              </div>
            </div>

            {/* TOOLBAR CONTROLS: OPEN, SAVE, UNDO, REDO, CLEAR, COMMIT */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  id="imageUploadInput"
                  accept="image/png, image/jpeg, image/bmp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => document.getElementById('imageUploadInput')?.click()}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4" />
                  Open Image
                </button>

                <button
                  onClick={handleSaveImage}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  Save Image
                </button>

                <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    undoStack.length > 0
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                      : 'bg-slate-900/50 text-slate-400 border-slate-800 cursor-not-allowed opacity-50'
                  }`}
                  title="Undo last filter step"
                >
                  <Undo2 className="w-4 h-4 text-amber-400" />
                  Undo ({undoStack.length})
                </button>

                <button
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    redoStack.length > 0
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                      : 'bg-slate-900/50 text-slate-400 border-slate-800 cursor-not-allowed opacity-50'
                  }`}
                  title="Redo undone filter step"
                >
                  <Redo2 className="w-4 h-4 text-blue-400" />
                  Redo ({redoStack.length})
                </button>

                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-rose-500/30 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  Clear Filters
                </button>

                <button
                  onClick={handleCommitFilter}
                  disabled={!activeFilterName}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    activeFilterName
                      ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/50 active:scale-95'
                      : 'bg-slate-900/50 text-slate-500 border-slate-800 cursor-not-allowed opacity-50'
                  }`}
                  title="Lock in current filtered intensity and begin a new filter layer"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  Apply & Chain
                </button>
              </div>

              {/* Sample Selector */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Preset:</span>
                <button
                  onClick={() => loadSampleImage('mario')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                >
                  Mario
                </button>
                <button
                  onClick={() => loadSampleImage('circle')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                >
                  Gradient
                </button>
              </div>
            </div>

            {/* UNIVERSAL INSTANT REAL-TIME INTENSITY BAR FOR ALL FILTERS */}
            <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full max-w-xl">
                <Sliders className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200 whitespace-nowrap">
                  Universal Intensity: <strong className="text-indigo-400 font-mono text-sm">{intensity}%</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={intensity}
                  onChange={(e) => handleIntensitySliderChange(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Active:</span>
                <span className="px-2.5 py-1 rounded-md bg-indigo-950 border border-indigo-700/50 text-indigo-300 font-mono font-semibold text-[11px]">
                  {activeFilterName ? activeFilterName : 'Select any filter below'}
                </span>
                <span className="text-[11px] text-slate-400 italic hidden md:inline">
                  (0% = original, 100% = full effect)
                </span>
              </div>
            </div>

            {/* FILTER BUTTONS GRID */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>All Filter Capabilities (Live Real-Time Blending)</span>
                <span className="text-[11px] text-emerald-400 lowercase italic font-normal">
                  ⚡ Click any filter or drag slider anytime without clearing
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {filterButtons.map((btn) => (
                  <button
                    key={btn.name}
                    onClick={() => {
                      if (btn.isDialog) {
                        setActiveDialog('frame');
                      } else {
                        selectLiveFilter(btn.name);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1 cursor-pointer active:scale-95 ${
                      activeFilterName === btn.name
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/50 shadow'
                        : 'bg-slate-900 hover:bg-slate-800 hover:border-slate-700 border-slate-800/80 text-slate-200'
                    }`}
                  >
                    <span className="text-base">{btn.emoji}</span>
                    {btn.name}
                  </button>
                ))}

                {/* Transformation Filters */}
                <button
                  onClick={() => setActiveDialog('flip')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 hover:border-slate-700 border border-slate-800/80 text-xs font-medium text-slate-200 transition-all flex flex-col items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span className="text-base">↔️</span>
                  Flip...
                </button>

                <button
                  onClick={() => setActiveDialog('rotate')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 hover:border-slate-700 border border-slate-800/80 text-xs font-medium text-slate-200 transition-all flex flex-col items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span className="text-base">🔃</span>
                  Rotate...
                </button>

                <button
                  onClick={() => setActiveDialog('crop')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 hover:border-slate-700 border border-slate-800/80 text-xs font-medium text-slate-200 transition-all flex flex-col items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span className="text-base">✂️</span>
                  Crop...
                </button>

                <button
                  onClick={() => setActiveDialog('resize')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 hover:border-slate-700 border border-slate-800/80 text-xs font-medium text-slate-200 transition-all flex flex-col items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span className="text-base">📐</span>
                  Resize...
                </button>
              </div>
            </div>

            {/* STATUS BAR */}
            <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {statusMessage}
              </span>
              <span>CS213 Cairo University</span>
            </div>
          </div>
        </div>
      )}

      {/* Code Viewer Tab */}
      {activeTab === 'code' && (
        <div className="flex-1 flex flex-col p-4 max-w-7xl mx-auto w-full gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-2xl">
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(['GUI.cpp', 'main.cpp', 'Image_Class.h', 'README.md'] as const).map((file) => (
                  <button
                    key={file}
                    onClick={() => setSelectedCodeFile(file)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      selectedCodeFile === file
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {file}
                  </button>
                ))}
              </div>
              <button
                onClick={() => copyCodeToClipboard(codeSnippets[selectedCodeFile] || '')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1.5 font-mono cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex-1 overflow-auto font-mono text-xs leading-relaxed text-slate-300">
              <pre className="whitespace-pre-wrap">{codeSnippets[selectedCodeFile]}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Guide Tab */}
      {activeTab === 'guide' && (
        <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full gap-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              Universal Instant Live Intensity Architecture
            </h2>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <span className="font-semibold text-emerald-400">How Instant Intensity Works for ALL Filters:</span>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                  <li><strong>Smooth 0% – 100% Transition:</strong> At 0% intensity, the image is 100% original base. At 100%, it is the full filter effect. At 50%, it creates a balanced aesthetic blend.</li>
                  <li><strong>No Need to Clear:</strong> When you want to try a different intensity or test another filter, you never have to click "Clear Filters" or "Undo". The application re-evaluates directly from the clean base image.</li>
                  <li><strong>Apply & Chain:</strong> When you are satisfied with a filter's intensity, click <strong>"Apply & Chain"</strong> to lock it in and begin layering another filter on top.</li>
                  <li><strong>High Performance:</strong> Blending is calculated using ultra-fast linear interpolation in sub-millisecond time for smooth 60 FPS slider drag.</li>
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <span className="font-semibold text-indigo-300">MSYS2 / MinGW Compilation:</span>
                <p className="text-slate-400 font-mono bg-slate-950 p-2.5 rounded border border-slate-800/80 select-all">
                  g++ -std=c++17 GUI/GUI.cpp -o GUI/gui.exe -lgdiplus -lcomctl32 -lcomdlg32 -lgdi32 -luser32 -mwindows
                </p>
                <span className="text-[11px] text-slate-400">
                  Run command: <code>./GUI/gui.exe</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DIALOGS */}
      {activeDialog === 'flip' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Choose Flip Orientation</h3>
            <p className="text-xs text-slate-400">Select which axis to reflect the current image across:</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleFlip(true)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Horizontal ↔️
              </button>
              <button
                onClick={() => handleFlip(false)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Vertical ↕️
              </button>
            </div>
            <button
              onClick={() => setActiveDialog(null)}
              className="py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activeDialog === 'rotate' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Choose Rotation Angle</h3>
            <p className="text-xs text-slate-400">Select clockwise rotation angle:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleRotate(90)}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                90°
              </button>
              <button
                onClick={() => handleRotate(180)}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                180°
              </button>
              <button
                onClick={() => handleRotate(270)}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                270°
              </button>
            </div>
            <button
              onClick={() => setActiveDialog(null)}
              className="py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activeDialog === 'frame' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Add Border Frame</h3>
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-slate-300">Border Thickness (pixels):</label>
              <input
                type="number"
                min="2"
                max="80"
                value={frameSize}
                onChange={(e) => setFrameSize(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-slate-300">Frame Color:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 1, label: 'Red', bg: 'bg-red-500' },
                  { id: 2, label: 'Green', bg: 'bg-green-500' },
                  { id: 3, label: 'Blue', bg: 'bg-blue-500' },
                  { id: 4, label: 'Black', bg: 'bg-black' },
                  { id: 5, label: 'White', bg: 'bg-white text-black' },
                  { id: 6, label: 'Gray', bg: 'bg-slate-500' }
                ].map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setFrameColor(col.id)}
                    className={`py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                      frameColor === col.id ? 'ring-2 ring-indigo-400 border-white' : 'border-slate-800'
                    } ${col.bg}`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  selectLiveFilter('Add Frame');
                  setActiveDialog(null);
                }}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Apply Frame (Live)
              </button>
              <button
                onClick={() => setActiveDialog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeDialog === 'crop' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Crop Subregion</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400">Start X:</label>
                <input
                  type="number"
                  value={cropParams.x}
                  onChange={(e) => setCropParams({ ...cropParams, x: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400">Start Y:</label>
                <input
                  type="number"
                  value={cropParams.y}
                  onChange={(e) => setCropParams({ ...cropParams, y: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400">Width:</label>
                <input
                  type="number"
                  value={cropParams.w}
                  onChange={(e) => setCropParams({ ...cropParams, w: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400">Height:</label>
                <input
                  type="number"
                  value={cropParams.h}
                  onChange={(e) => setCropParams({ ...cropParams, h: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCrop}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Apply Crop
              </button>
              <button
                onClick={() => setActiveDialog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeDialog === 'resize' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Resize Image</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400">Target Width (px):</label>
                <input
                  type="number"
                  value={resizeParams.w}
                  onChange={(e) => setResizeParams({ ...resizeParams, w: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400">Target Height (px):</label>
                <input
                  type="number"
                  value={resizeParams.h}
                  onChange={(e) => setResizeParams({ ...resizeParams, h: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setResizeParams({ w: Math.floor(imageDims.w * 0.5), h: Math.floor(imageDims.h * 0.5) })}
                className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] rounded cursor-pointer"
              >
                50% Scale
              </button>
              <button
                onClick={() => setResizeParams({ w: Math.floor(imageDims.w * 2), h: Math.floor(imageDims.h * 2) })}
                className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] rounded cursor-pointer"
              >
                200% Scale
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleResize}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Apply Resize
              </button>
              <button
                onClick={() => setActiveDialog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
