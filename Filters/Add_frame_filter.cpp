#include <iostream>
#include "../Libraries/Image_Class.h"
using namespace std;

void add_frame_filter(Image& image)
{
    int size;
    int color;
    cout << "Enter frame size:" << endl;
    cin >> size;
    cout << "choose frame color:" << endl;
    cout << "1=> red" << endl;
    cout << "2=> green" << endl;
    cout << "3=> blue" << endl;
    cout << "4=> black" << endl;
    cout << "5=> white" << endl;
    cout << "6=> gray" << endl;
    cin >> color;
    int r, g, b;
    if (color == 1) {
        r = 255; g = 0; b = 0;
    }
    else if (color == 2) {
        r = 0; g = 255; b = 0;
    }
    else if (color == 3) {
        r = 0; g = 0; b = 255;
    }
    else if (color == 4) {
        r = 0; g = 0; b = 0;
    }
    else if (color == 5) {
        r = 255; g = 255; b = 255;
    }
    else if (color == 6) {
        r = 124; g = 124; b = 124;
    }
    else {
        cout << "invalid color choice!" << endl;
        return;
    }

    for (int i = 0; i < image.width; ++i)
    {
        for (int j = 0; j < image.height; ++j)
        {
            if (i < size || i >= image.width - size ||
                j < size || j >= image.height - size)
            {
                image(i, j, 0) = r;
                image(i, j, 1) = g;
                image(i, j, 2) = b;
            }
        }
    }
}
