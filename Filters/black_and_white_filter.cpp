#include <iostream>
#include "../Libraries/Image_Class.h"
using namespace std;

void black_and_white_filter(Image &image){

    string option;
    double level;

    cout << "coloured or B&W " << endl;
    cin >> option;

    if (option == "B&W")
    {
        cout << " choose level from 0 to 100% : " << endl;
        cin >> level;

        level = level/100;

        for(int i=0 ; i<image.width ; i++)
        {
            for(int j=0 ; j<image.height ; j++)
            {
                int avg = 0;

                // calc avg
                for(int k=0 ; k<image.channels ; k++)
                {
                    avg += image(i,j,k);
                }

                // calc avg --> bright or dark
                avg = avg/image.channels;

                // convert bright to white and dark to black
                int BW;

                if (avg > 128)
                {
                    BW = 255; // bright // white
                }
                else
                {
                    BW = 0; // dark // black
                }

                // apply intensity level chosen of filter to image
                for (int k=0 ; k<image.channels ; k++)
                {
                    image(i,j,k) =
                        (image(i,j,k) * (1-level)) + (BW*level);
                }
            }
        }
    }
}

