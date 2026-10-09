#include <iostream>
#include <string>
#include <algorithm>
#include <limits>
#include "../Libraries/Image_Class.h"

using namespace std;

// mode 0: resize both images to max(width) x max(height), then blend.
// mode 1: blend only the common top-left area (min(width) x min(height)).
// mode 2: overlay image2 on image at pixel offset (offsetX, offsetY), clipping outside.
void merge_filter(Image& image, const Image& image2, int mode, int offsetX = 0, int offsetY = 0)
{
    if (image.width <= 0 || image.height <= 0 || image2.width <= 0 || image2.height <= 0 ||
        image.channels < 3 || image2.channels < 3)
        throw invalid_argument("Both images must be valid RGB images.");

    if (mode == 0 || mode == 1) {
        const int newwidth = (mode == 0) ? max(image.width, image2.width) : min(image.width, image2.width);
        const int newheight = (mode == 0) ? max(image.height, image2.height) : min(image.height, image2.height);
        Image merged(newwidth, newheight);

        for (int x = 0; x < newwidth; ++x) {
            for (int y = 0; y < newheight; ++y) {
                int x1 = x, y1 = y, x2 = x, y2 = y;
                if (mode == 0) {
                    x1 = x * image.width / newwidth;
                    y1 = y * image.height / newheight;
                    x2 = x * image2.width / newwidth;
                    y2 = y * image2.height / newheight;
                }
                for (int k = 0; k < 3; ++k)
                    merged(x, y, k) = (image(x1, y1, k) + image2(x2, y2, k)) / 2;
            }
        }
        image = merged;
        return;
    }

    if (mode == 2) {
        Image merged = image;

        // Visit only pixels where the second image overlaps the first image.
        // This avoids scanning huge off-screen areas while the user is dragging.
        const int startX = max(0, -offsetX);
        const int startY = max(0, -offsetY);
        const int endX = min(image2.width, image.width - offsetX);
        const int endY = min(image2.height, image.height - offsetY);

        for (int y2 = startY; y2 < endY; ++y2) {
            for (int x2 = startX; x2 < endX; ++x2) {
                const int x = x2 + offsetX;
                const int y = y2 + offsetY;
                for (int k = 0; k < 3; ++k)
                    merged(x, y, k) = (image(x, y, k) + image2(x2, y2, k)) / 2;
            }
        }
        image = merged;
        return;
    }

    throw invalid_argument("Invalid merge mode.");
}

// Console-compatible version used by main.cpp.
void merge_filter(Image& image)
{
    string imageName;
    cout << "Enter second image path (spaces allowed): ";
    getline(cin >> ws, imageName);
    try {
        Image image2(imageName);
        int choice = 0;
        cout << "Choose option:\n"
             << "1. Resize both images to maximum width and height, then merge\n"
             << "2. Merge common area only\n"
             << "3. Overlay second image at an X/Y position\nChoice: ";
        if (!(cin >> choice)) {
            cin.clear(); cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << "Invalid merge option.\n"; return;
        }
        int x = 0, y = 0;
        if (choice == 3) {
            cout << "X offset (can be negative): "; if (!(cin >> x)) { cout << "Invalid X offset.\n"; return; }
            cout << "Y offset (can be negative): "; if (!(cin >> y)) { cout << "Invalid Y offset.\n"; return; }
        }
        merge_filter(image, image2, choice == 1 ? 0 : choice == 2 ? 1 : choice == 3 ? 2 : -1, x, y);
    } catch (const exception& e) {
        cout << "Could not merge images: " << e.what() << '\n';
    }
}
