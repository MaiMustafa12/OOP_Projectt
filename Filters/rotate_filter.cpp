#include <iostream>
#include "../Libraries/Image_Class.h"
using namespace std;


void rotate_filter(Image &image)
{
    int angle;

    cout << "choose rotation angle (90, 180, 270): "<< endl;
    cin >> angle;

    Image rotated(image.height, image.width);

    if (angle == 90)
    {
        for(int i=0 ; i<image.width ; i++)
        {
            for(int j=0 ; j<image.height ; j++)
            {
                for(int k=0 ; k<image.channels ; k++)
                {
                    rotated(image.height - 1 - j, i, k)
                        = image(i,j,k);
                }
            }
        }
    }

    else if(angle == 180)
    {
        for(int i=0 ; i<image.width ; i++)
        {
            for(int j=0 ; j<image.height ; j++)
            {
                for(int k=0 ; k<image.channels ; k++)
                {
                    rotated(image.height - 1 - j,
                            image.width - 1 - i, k)
                        = image(i,j,k);
                }
            }
        }
    }

    else if(angle == 270)
    {
        for(int i=0 ; i<image.width ; i++)
        {
            for(int j=0 ; j<image.height ; j++)
            {
                for(int k=0 ; k<image.channels ; k++)
                {
                    rotated(j, image.width - 1 - i, k)
                        = image(i,j,k);
                }
            }
        }
    }

    image = rotated;
}

