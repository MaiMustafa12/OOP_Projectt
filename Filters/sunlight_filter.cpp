#include <iostream>
#include "Image_Class.h"
using namespace std;
void sunlight_filter(Image&image) {
    for (int i = 0;i < image.width;i++) {
        for (int j = 0;j < image.height;j++) {
            for (int k = 0;k < image.channels;k++) {
                int value = image(i, j, k);
                value = value + 50;
                if (value > 255) {
                    value = 255;
                }
                image(i, j, k) = value;
            }
        }
    }
}
