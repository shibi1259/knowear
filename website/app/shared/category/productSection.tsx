import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  image: string;
  title: string;
  color: string;
  price: string;
  originalPrice: string;
  discount: string;
  isNew: boolean;
}

interface SingleSliderProps {
  slides: any[];
  className?: string;
}

const SingleSlider: React.FC<any> = ({ slides, className = "" }:any) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides?.files?.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides?.files?.length - 1 : prevIndex - 1
    );
  };

  console.log(slides, "slides");
  

  return (
    <div className={`w-full ${className} border-2 border-black-500`}>
      <div className="relative">
        {/* Image Container */}
        <div className="relative aspect-[0.84]   overflow-hidden">
          <div
            className="absolute w-full h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides?.files?.map((slide: any, index: any) => (
              <div
                key={index}
                className="absolute pt-[16px] gap-[16px] object-contain  w-full h-full"
                style={{ left: `${index * 100}%` }}
              >
                <img
                  src={`https://knowearcommerce.s3.ap-south-1.amazonaws.com/${slide}`}
                  alt={slides?.name}
                  className="w-full h-full object-contain"
                />
                {slides?.isNew && (
                  <div className="absolute top-4 left-4 bg-green-800 text-white px-2 py-1 text-sm">
                    New
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Product Info */}
        <div className="mt-4 px-4">
          <h2 className="text-lg font-semibold">
            {slides?.name}
          </h2>
          <p className="text-gray-600 text-sm">{slides?.overview}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="font-bold">AED {slides?.price?.selling}</span>
            <span className="text-gray-500 line-through text-sm">
              {slides?.price?.mrp}
            </span>
            <span className="bg-gray-100 px-2 py-1 mb-1 text-sm">
              {slides?.price?.offer}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageSlider:any = ({ data, activeTab }: any) => {
  return (
    <div className="w-full  mx-auto !mt-[16px]">
      <div className="grid  grid-cols-2 gap-4">
        {data?.products2?.map((item: any, index: any) => (
          <SingleSlider slides={item} key={index} className="" />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
