# PIXLat - Advanced Image Processor (Console & Windows GUI)

A comprehensive Object-Oriented Image Processing desktop application built in C++. Developed as part of the academic coursework for **CS213 (Object-Oriented Programming)** under the Faculty of Computers and Artificial Intelligence, Cairo University (FCAI-CU).

---

## 🌟 Overview & Interfaces

The project provides two independent user interfaces powered by the same underlying image-processing engine:
1. **Interactive Console Application (`main.cpp`)**: Terminal-based menu for sequential image filtering and saving.
2. **Modern Windows GUI (`GUI/GUI.cpp`)**: A full desktop window featuring side-by-side BEFORE and AFTER previews, sequential filter chaining, an intensity slider, Undo/Redo history, and intuitive control dialogs.

---

## 🖼️ Supported Image Formats

Powered by lightweight single-header image decoders and encoders in `Libraries/Image_Class.h`:
* **PNG** (`.png`)
* **JPEG / JPG** (`.jpg`, `.jpeg`)
* **Bitmap** (`.bmp`)
* **Targa** (`.tga`)

---

## 🚀 Windows GUI Documentation

### GUI Layout & Features

The Windows desktop interface uses a purple/lavender theme and the PIXLat brand.
* **BEFORE vs AFTER Side-by-Side Previews**:
  - **BEFORE Preview**: Always maintains the original loaded image as the reference benchmark.
  - **AFTER Preview**: Displays the live edited image with all sequential filters applied.
  - **Aspect-Ratio Preservation**: Automatically scales and centers images inside preview viewports without distorting dimensions.
* **Undo & Redo**: Full step-by-step history tracking. Undo previous filters or Redo them at will.
* **Clear Filters**: One-click restoration of the AFTER image back to the original image state.
* **Universal Live Intensity Slider (0% - 100%) for ALL Filters**:
  - Dragging the intensity slider provides instant, real-time live blending for **every filter** (Grayscale, Black & White, Darken, Lighten, Invert, Infrared, Sunlight, Old TV, Purple, Blur, Detect Edges, Oil Painting, Add Frame).
  - Automatically preserves the clean image base state before the filter was selected, allowing continuous adjustment from 0% (original base) to 100% (full filter effect) without compounding or needing to click "Clear" or "Undo".
  - **Apply & Chain Button**: Locks in the current filtered state at any desired intensity, allowing unlimited sequential filter layering.
* **Filter Options Dialogs**:
  - **Flip**: Interactive Horizontal vs. Vertical mirror selection.
  - **Rotate**: 90° Clockwise, 180° Half-Turn, and 270° Clockwise.
  - **Add Frame**: Custom frame thickness and color picker (Red, Blue, White, Gray, etc.).
  - **Resize**: Dimensions scaling (Half scale, Double size, or custom dimensions).
  - **Crop**: Region selection with automatic boundary clamping.
* **Safe Save**: Automatically appends appropriate file extensions (`.png`, `.jpg`, `.bmp`, `.tga`) if omitted by the user.

### GUI Compilation (MinGW / MSYS2 on Windows)

#### Prerequisites
* Windows 7/8/10/11
* MinGW-w64 via MSYS2 (`ucrt64` or `mingw64` environment)
* Libraries required: `gdiplus`, `comctl32`, `comdlg32`, `gdi32`, `user32` (standard built-in Windows SDK libraries included with MinGW).

#
### Easiest way to start on Windows

1. Download the repository using **Code → Download ZIP** and extract the ZIP completely.
2. Open the extracted `Pixlat-master` folder.
3. Close any already-running PIXLat window.
4. Double-click **`Start_PIXLat.bat`**. This script rebuilds `PIXLat.exe` from the current source using the optimized `-O2` compiler option, then launches it. Rebuilding prevents an old executable from hiding recent source-code fixes.
5. If the build fails, make sure MSYS2 UCRT64 is installed and that `C:\msys64\ucrt64\bin\g++.exe` and `windres.exe` exist. Keep the whole extracted folder together.

You can also run **`BUILD_WINDOWS_EXE.bat`** to build the executable without using the launcher. The resulting `PIXLat.exe` is created in the project root. This source ZIP may not contain a prebuilt executable, so the first launch may require the compiler to be installed.

### Compilation Command
Open the MSYS2 UCRT64 terminal (or command prompt with `C:\msys64\ucrt64\bin\g++.exe` in PATH) and run:

```bash
windres PIXLat.rc -O coff -o PIXLat_resources.o
g++ -std=c++17 GUI/GUI.cpp PIXLat_resources.o -o PIXLat.exe -lgdiplus -lcomctl32 -lcomdlg32 -lgdi32 -luser32 -mwindows
```

#### Running the GUI
```bash
./PIXLat.exe
```
The launcher creates `PIXLat.exe` in the project root. Do not rely on an old `GUI\gui.exe`; use `Start_PIXLat.bat` to rebuild and start the latest source.

---

## 💻 Console Application Compilation & Setup

### Build Console Version
From the root project directory:
```bash
g++ -std=c++17 main.cpp -o PIXLatProcessor
```

### Run Console Version
```bash
./PIXLatProcessor
```
Follow the interactive terminal prompts to select an image from `Images/`, choose a filter (1-18), and export the edited file.

---

## 🎨 Available Filters

The project implements 18 image filters located in `Filters/` (including the new Oil Painting, Merge, and Skew filters):

| Filter | Description | GUI Parameter / Control |
| :--- | :--- | :--- |
| **Grayscale** | Luminance averaging to grayscale | One click |
| **Black & White** | Monochrome binarization | Controlled via **Intensity Slider (0-100%)** |
| **Darken** | Reduces brightness exposure | Controlled via **Intensity Slider (0-100%)** |
| **Lighten** | Increases brightness exposure | Controlled via **Intensity Slider (0-100%)** |
| **Invert** | Photographic negative color inversion | One click |
| **Infrared** | False-color infrared spectrum rendering | One click |
| **Add Frame** | Solid outer border with custom thickness & color | Dialog with thickness and color choices |
| **Flip** | Matrix reflection along horizontal or vertical axis | Dialog (Horizontal / Vertical) |
| **Rotate** | Geometric rotation | Dialog (90°, 180°, 270°) |
| **Blur** | 5x5 neighborhood smoothing convolution | One click |
| **Crop** | Bounds-checked rectangular sub-region crop | Dialog (X, Y, Width, Height) |
| **Resize** | Nearest-neighbor dimension scaling | Dialog (Preset or custom width & height) |
| **Sunlight** | Warm solar tint enhancement | One click |
| **Old TV** | Retro CRT scanline effect | One click |
| **Purple** | Violet color cast enhancement | One click |
| **Detect Edges** | Gradient difference edge boundary extraction | One click |
| **Merge** | Blend a second image with the current image | Dialog (second image path and merge mode) |
| **Skew** | Slants the image horizontally | Dialog (angle from -45° to 45°) |
| **Oil Painting** | Groups local colors by intensity to create a painterly effect | Controlled via **Intensity Slider (0-100%)** |

---

## 📁 Project Directory Structure

```text
OOP_Projectt/
├── Filters/
│   ├── Add_frame_filter.cpp      # Border padding
│   ├── Blur_filter.cpp           # Smoothing convolution
│   ├── black_and_white_filter.cpp# Binarization thresholding
│   ├── crop_filter.cpp           # Crop subregion
│   ├── Darken-lighten_filter.cpp # Exposure adjustment
│   ├── detect_image_edges_filter.cpp # Sobel/difference edge detection
│   ├── Flip_filter.cpp           # Horizontal & Vertical mirror
│   ├── Gray_scale_filter.cpp     # Grayscale transformation
│   ├── Infrared_filter.cpp       # Thermal channel inversion
│   ├── Invert_filter.cpp         # RGB negation
│   ├── purple_filter.cpp         # Magenta tinting
│   ├── Resize_filter.cpp         # Dimension scaling
│   ├── rotate_filter.cpp         # 90/180/270 grid rotation
│   ├── sunlight_filter.cpp       # Warmth filter
│   └── TV_filter.cpp             # Interlaced scanline effect
├── GUI/
│   ├── GUI.cpp                   # Complete Win32 + GDI+ Desktop GUI
│   └── gui.exe                   # Compiled GUI executable (after build)
├── Images/                       # Asset images directory (sample input/output)
│   ├── mario.bmp
│   └── sample.bmp
├── Libraries/
│   ├── Image_Class.h             # Core Image matrix class
│   ├── stb_image.h               # Image loader backend
│   └── stb_image_write.h         # Image export backend
├── main.cpp                      # Console interface
└── README.md                     # Documentation & build instructions
```

---

## 👥 Academic Acknowledgments
* **Supervision:** Dr. Mohammad El-Ramly (FCAI-CU)
* **Course:** CS213 - Object-Oriented Programming

## PIXLat branding assets (Windows GUI)

The native Win32 GUI uses `PIXLat_logo.png` and `PIXLat.ico` from the project root. Keep the full extracted folder structure intact. The main action button is labeled **Apply Changes**.

## Performance notes

- The Windows launcher builds the GUI with `-O2` optimizations.
- Image loading and saving use GDI+ bitmap locking to process pixel data in blocks rather than calling a per-pixel API for every pixel.
- The GUI caches converted preview buffers for the original and current images to reduce repeated work during repainting.
- Large images still require more processing time, especially for computationally expensive filters such as Blur and Oil Painting. Close other running copies of PIXLat before rebuilding, because Windows can lock an executable that is currently running.


## Merge filter options

The Merge filter supports:

1. **Resize to maximum dimensions** — resize both images to `max(width) × max(height)` and blend corresponding pixels.
2. **Common area** — blend only the top-left common rectangle, sized `min(width) × min(height)`. For example, 500×1000 and 1000×500 produce a 500×500 output.
3. **Drag-to-overlap (GUI)** — choose the third option and select the second image using the file picker (it can be in any folder). Drag the second image around the AFTER preview to position the live overlay. You can reposition it more than once; click **Apply Changes** to confirm the merge, or press **Esc** to cancel. The original image defines the output canvas, and any part of the second image outside it is clipped.

The console version supports the first two modes and an X/Y-offset overlay mode.

## Editing workflow

- **BEFORE** always shows the original image loaded at the start of the editing session.
- **AFTER** shows the current result, including committed filters and merges.
- Use the intensity slider to adjust supported filter effects, then click **Apply Changes** to commit the current effect before layering another filter.
- **Undo** and **Redo** navigate the edit history.
- **Clear Filters** restores AFTER to the original image and cancels any unfinished merge overlay.
- Use **Open Image** to load a built-in/sample image or browse to an image on your computer. When saving, choose a supported output extension such as PNG, JPG/JPEG, BMP, or TGA.
