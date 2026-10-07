#include<iostream>
#include"../Libraries/Image_Class.h"
using namespace std;


void crop_filter(Image &image)
{
    int x, y, w, h;

    cout << "Enter x: ";
    cin >> x;

    cout << "Enter y: ";
    cin >> y;

    cout << "Enter width: ";
    cin >> w;

    cout << "Enter height: ";
    cin >> h;

    Image cropped(w, h);

    for (int i = 0; i < w; i++)
    {
        for (int j = 0; j < h; j++)
        {
            for (int k = 0; k < image.channels; k++)
            {
                cropped(i, j, k) = image(x + i, y + j, k);
            }
        }
    }

    image = cropped;
}