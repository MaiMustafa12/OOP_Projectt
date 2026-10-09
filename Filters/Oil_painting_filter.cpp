#include <iostream>
#include <vector>
#include <algorithm>
#include "../Libraries/Image_Class.h"

using namespace std;

// Filter 18: Oil Painting
// Groups neighboring pixels by intensity and replaces each pixel with
// the average RGB color from the most common intensity group.
void oil_painting_filter(Image &image)
{
    if (image.width <= 0 || image.height <= 0 || image.channels < 3)
        return;

    const int width = image.width;
    const int height = image.height;
    const int intensityLevels = 20;
    const int radius = 3; // 7 x 7 neighborhood

    // Read from a copy so earlier pixels do not affect later calculations.
    Image original = image;

    for (int y = 0; y < height; ++y)
    {
        for (int x = 0; x < width; ++x)
        {
            int histogram[intensityLevels] = {};
            long long redSum[intensityLevels] = {};
            long long greenSum[intensityLevels] = {};
            long long blueSum[intensityLevels] = {};

            for (int dy = -radius; dy <= radius; ++dy)
            {
                for (int dx = -radius; dx <= radius; ++dx)
                {
                    const int nx = x + dx;
                    const int ny = y + dy;

                    if (nx < 0 || nx >= width || ny < 0 || ny >= height)
                        continue;

                    const int r = original(nx, ny, 0);
                    const int g = original(nx, ny, 1);
                    const int b = original(nx, ny, 2);
                    const int intensity = (r + g + b) / 3;
                    const int level = min(intensityLevels - 1,
                                          intensity * intensityLevels / 256);

                    ++histogram[level];
                    redSum[level] += r;
                    greenSum[level] += g;
                    blueSum[level] += b;
                }
            }

            int bestLevel = 0;
            for (int level = 1; level < intensityLevels; ++level)
            {
                if (histogram[level] > histogram[bestLevel])
                    bestLevel = level;
            }

            if (histogram[bestLevel] > 0)
            {
                image(x, y, 0) = static_cast<unsigned char>(
                    redSum[bestLevel] / histogram[bestLevel]);
                image(x, y, 1) = static_cast<unsigned char>(
                    greenSum[bestLevel] / histogram[bestLevel]);
                image(x, y, 2) = static_cast<unsigned char>(
                    blueSum[bestLevel] / histogram[bestLevel]);
            }
        }
    }
}
