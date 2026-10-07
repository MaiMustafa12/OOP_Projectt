#include<iostream>
#include"../Libraries/Image_Class.h"
using namespace std;

void darken_lighten_filter(Image &image){
    string option;
    double level;
    cout<<" Dark or Light :"<<endl;
    cin>>option;
    cout<<" choose the level from 0 to 100% : "<<endl;
    cin>>level;
    level=level/100 ;
     if (option=="dark"){
      for(int i=0 ; i<image.width ; ++i){
        for(int j=0 ; j<image.height ; ++j){
            for(int k=0 ; k<image.channels ; ++k){
                    image(i,j,k)=(1-level)*image(i,j,k);
            }}}
     }else{
        for(int i=0 ; i<image.width ; ++i){
        for(int j=0 ; j<image.height ; ++j){
            for(int k=0 ; k<image.channels ; ++k){
                image(i,j,k)=image(i,j,k)+((255-image(i,j,k))*level);
                  if(image(i,j,k)>255){
                     image(i,j,k)=255;}
                    }
                }
            }
        }
    }