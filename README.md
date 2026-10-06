# RGBit - Advanced Image Processor

A comprehensive Image Processing desktop application built using C++. Developed as part of the academic course requirements for **CS213 (Object-Oriented Programming)** under the supervision of the Faculty of Computers and Artificial Intelligence, Cairo University (FCAI-CU).

---

## Features and Filter Capabilities

Our system architecture processes pixel matrices across various image formats including `.png`, `.jpg`, `.jpeg`, and `.bmp`. The filters are strategically grouped below to match the project requirements:

### 1. Color Filters
* **Grayscale Conversion** - Transforms full-color images into clean grayscale values using luminance averaging.
* **Black and White Thresholding** - Converts images into binary monochrome based on brightness threshold levels.
* **Darken and Lighten Image** - Allows full control over brightness exposure scales from 0% to 100%.
* **Invert Image Colors** - Reverses pixel RGB spectra to generate classic photographic negatives.

### 2. Transformation Filters
* **Image Flipping** - Full capability for both horizontal and vertical axis mirror transformations.
* **Image Rotation** - High-precision geometric rotation clockwise by 90°, 180°, or 270°.
* **Image Resizing** - Precise scaling via new absolute pixel dimensions or percentage-based scaling ratios.

### 3. Effect Filters (Advanced Level)
* **Add Frame Boundary** - Dynamically paints solid graphical borders with fully interactive custom frame thickness and custom color options.
* **Gaussian Blur Filter** - Blurs and filters out image detail using custom neighborhood pixel calculations.
* **Infrared Photography** - Replicates infrared samurai-photography spectra using tailored pixel adjustments.

---

## Project Structure

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

## Compilation and Setup

### Prerequisites
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

## Academic Acknowledgments
* **Course Instructor:** Dr. Mohammad El-Ramly (FCAI-CU)
* **Underlying Pixel Loader Utilities:** Handed over by `stb` architectural single-header frameworks.
