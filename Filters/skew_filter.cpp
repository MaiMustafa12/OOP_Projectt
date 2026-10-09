#include <iostream>
#include <cmath>
#include <algorithm>
#include "../Libraries/Image_Class.h"

using namespace std;

void skew_filter(Image& image, double angle)
{
    // Avoid extreme dimensions and near-vertical tangent values.
    if (image.width <= 0 || image.height <= 0 || image.channels < 3 ||
        !std::isfinite(angle) || angle < -45.0 || angle > 45.0)
        return;

    const double radian = angle * 3.14159265358979323846 / 180.0;
    const int horizontalMovement = static_cast<int>(
        tan(radian) * (image.height - 1));
    const int newwidth = image.width + abs(horizontalMovement);
    if (newwidth <= 0 || newwidth > 30000)
        return;

    Image newimage(newwidth, image.height);
    for (int x = 0; x < newimage.width; ++x)
        for (int y = 0; y < newimage.height; ++y)
            for (int k = 0; k < 3; ++k)
                newimage(x, y, k) = 255;

    for (int x = 0; x < image.width; ++x)
    {
        for (int y = 0; y < image.height; ++y)
        {
            const int move = static_cast<int>(
                tan(radian) * (image.height - 1 - y));
            const int newx = x + move + (horizontalMovement < 0
                                          ? -horizontalMovement : 0);
            if (newx >= 0 && newx < newimage.width)
                for (int k = 0; k < 3; ++k)
                    newimage(newx, y, k) = image(x, y, k);
        }
    }
    image = newimage;
}

// Console-compatible version used by main.cpp.
void skew_filter(Image& image)
{
    double angle = 0.0;
    cout << "Enter skew angle in degrees (-45 to 45): ";
    if (!(cin >> angle) || angle < -45.0 || angle > 45.0)
    {
        cout << "Invalid angle. Enter a value from -45 to 45.\n";
        return;
    }
    skew_filter(image, angle);
}
