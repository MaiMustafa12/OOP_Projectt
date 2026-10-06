<p align="center">
  <img src="https://shields.io" alt="Course Badge">
  <img src="https://shields.io" alt="Level Badge">
</p>

<h1 align="center">📸 RGBit - Advanced Image Processor</h1>

<p align="center">
  <strong>A High-Performance Core Computer Vision & Image Editing Pipeline built from scratch using C++</strong><br>
  Developed as part of the academic course requirements for <b>CS213: Object-Oriented Programming (2026-2027)</b> under the supervision of the Faculty of Computers and Artificial Intelligence, Cairo University (FCAI-CU).
</p>

---

## 🚀 System Features & Filter Capabilities

Our system architecture processes pixel matrices across various image formats including `.png`, `.jpg`, `.jpeg`, and `.bmp`. The filters are strategically grouped below:

### 🎨 1. Core Color Adjustments

| Filter Indicator | Function Name | Operational Mechanism | Development Layer |
| :--- | :--- | :--- | :--- |
| **Filter 1** | `grayscale_filter` | Luminance spectrum matrix averaging | Core Layer |
| **Filter 2** | `BW_filter` | Binary monochrome brightness thresholding | Core Layer |
| **Filter 3** | `darken_lighten_filter` | Pixel channel values scaling [-100%, 100%] | Core Layer |
| **Filter 8** | `invert_filter` | Photo-negative spectral reversal (`255 - RGB`) | Core Layer |

### 🔄 2. Geometric Transformations

| Filter Indicator | Function Name | Operational Mechanism | Development Layer |
| :--- | :--- | :--- | :--- |
| **Filter 5** | `flip_filter` | Horizontal and Vertical axis mirror reflections | Transformation Layer |
| **Filter 6** | `rotate_filter` | High-precision clockwise pixel grid rotation (90°/180°/270°) | Transformation Layer |
| **Filter 7** | `resize_filter` | Coordinate scaling based on new absolute dimensions or percentage ratio | Transformation Layer |

### 🔮 3. Special Effects & Filters (Beast Level)

| Filter Indicator | Function Name | Operational Mechanism | Development Layer |
| :--- | :--- | :--- | :--- |
| **Filter 4** | `add_frame_filter` | Structural perimeter padding with 6 interactive color channels | Advanced Layer |
| **Filter 12** | `blur_filter` | Gaussian-like neighborhood average matrix computation | Advanced Layer |
| **Filter 16** | `infrared_filter` | Thermal spectra rendering via custom red channel amplification | Advanced Layer |

---

## 🛠️ Repository & Project Structure

The project codebases are managed under a strict directory separation layer to enforce modular compiler build optimization:

```text
ImageProcessor/
├── Filters/                     # Individual source code allocation for each filter
│   ├── Add_frame_filter.cpp     # Graphical padding operations
│   ├── Blur_filter.cpp          # Smoothing matrix convolution
│   ├── BW_filter.cpp            # Thresholding binarization
│   ├── Darken-lighten_filter.cpp# Exposure scaling functions
│   ├── Flip_filter.cpp          # Matrix reflection mechanics
│   ├── Gray_scale_filter.cpp    # Grayscale conversion algorithms
│   ├── Infrared_filter.cpp      # Infrared thermal channel rendering
│   ├── Invert_filter.cpp        # Color space inverse operations
│   ├── Resize_filter.cpp        # Scaling pipelines
│   └── Rotate_filter.cpp        # Grid rotation mechanics
├── Libraries/                   # Internal abstraction headers
│   ├── Image_Class.h            # Main raw pixel matrix data array class
│   ├── stb_image.h              # Lightweight image loader backend utility
│   └── stb_image_write.h        # File export streaming layer
├── Images/                      # Asset path for testing input/output samples
└── main.cpp                     # Console interaction terminal loop and pipeline router
```

---

## 💻 Compilation & Operational Setup

### System Prerequisites
A generic compiler layer supporting **C++17** specifications (`g++ v9.0+` or `clang`).

### Build Execution Commands
1. Clone your private team project instance from the remote git tree.
2. Compile all independent functional files via the core launcher:
   ```bash
   g++ -std=c++17 main.cpp -o RGBitProcessor
   ```
3. Run the optimized executable binary file:
   ```bash
   ./RGBitProcessor
   ```

---

## 📜 Academic Acknowledgments & References
* **Supervising Professor:** Dr. Mohammad El-Ramly (FCAI-CU)
* **Underlying Pixel Loader Utilities:** Handed over by `stb` architectural single-header frameworks.

---
## 📄 Project Framework Licensing
Licensed solely under standard academic usage rules. Open for continuous revision increments until Milestone Part 2 validation.
