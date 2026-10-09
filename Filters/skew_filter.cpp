#include <iostream>
#include "Image_Class.h"
#include <cmath>
void skew_filter(Image& image) {
    double angle;
    cout << "Enter the skew angle";
    cin >> angle;
    double radian = angle * 3.14159 / 180.0;
    int horizentailmoment = (int)(tan(radian) * image.height);
    int newwidth = image.width + abs(horizentailmoment);
    Image newimage(newwidth, image.height);
    for (int i = 0;i < newimage.width;i++) {
        for (int j = 0;j< newimage.height;j++) {
            for (int k = 0;k < newimage.channels;k++) {
                newimage(i, j, k) = 255;
            }
        }
    }
     for (int i=0;i<image.width;i++){
        for (int j = 0;j < image.height;j++) {
           int horizentalmove = (int)(tan(radian) *(int) (image.height-1- j));
           int newi = i + horizentalmove;
           if (newi >= 0 && newi < newimage.width) {
               for (int k = 0; k < image.channels;k++) {
                    newimage(newi, j, k) =image(i,j,k );
              }
           }
      }
    }    image = newimage;
}
