#include <iostream>
#include "../Libraries/Image_Class.h"
#include <algorithm>

using namespace std;

void flip_filter(Image& image){
    int choice;
    cout << "Choose flip type: " << endl;
    cout << "1 => flip horizontally" << endl;
    cout << "2 => flip vertically" << endl;
    cin >> choice;
    if (choice == 1){
        for (int i = 0; i < image.width / 2; i++) {
            for (int j = 0; j < image.height; j++){
                for (int k = 0; k < 3; k++) {
                    swap(image(i, j, k),
                        image(image.width - 1 - i, j, k));
                }
            }
        }
    }
    else if (choice == 2){
        for (int i = 0; i < image.width; i++){
            for (int j = 0; j < image.height / 2; j++) {
                for (int k = 0; k < 3; k++){
                    swap(image(i, j, k),
                        image(i, image.height - 1 - j, k));
                }
            }
        }
    }
}
