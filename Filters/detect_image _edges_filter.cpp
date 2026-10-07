#include <iostream>
#include "../Libraries/Image_Class.h"
#include "Filters/Gray_scale_filter.cpp"
using namespace std;

void detect_edges_filter(Image &image)
{
// turn pic to grey
    grayscale_filter(image);
// detect edges
int max_diff = 30 ;
for ( int i=0; i< image.width ; i++ ) {
for ( int j =0 ; j< image.height ; j++ ) {
int current = image ( i , j , 0);
int right = image ( i+1 , j , 0);
int down = image ( i, j+1 , 0 ) ;
int diffR = abs(current - right);
int diffD = abs(current - down);
if ( diffR > max_diff || diffD > max_diff) {
image ( i , j , 0 ) = 0;
image ( i , j , 1 ) = 0;
image ( i , j , 2 ) = 0;
}
else {
image ( i , j , 0 ) = 255;
image ( i , j , 1 ) = 255;
image ( i , j , 2 ) = 255;
}
}
}
}
