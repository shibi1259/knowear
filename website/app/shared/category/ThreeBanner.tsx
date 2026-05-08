import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ThreeBannerLayout = ({data}:any) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Sample images - using placeholder API since external images aren't allowed
  // const images = [
  //   'https://knowearcommerce.s3.ap-south-1.amazonaws.com/image%2027.png',
  //   'https://knowearcommerce.s3.ap-south-1.amazonaws.com/image%2028%20%281%29.png',
  //   'https://knowearcommerce.s3.ap-south-1.amazonaws.com/image%2027.png'
  // ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % data?.images2?.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + data?.images2?.length) % data?.images2?.length);
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full mt-[30px]">
      {/* Mobile: Single slide view */}
      <div className="block md:hidden relative w-full min-h-[328px]">
        <div className="absolute inset-0">
          <img
            src={data?.images2[currentSlide]}
            alt={`Banner ${currentSlide + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Navigation dots for mobile */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {data?.images2.map((_:any, index:any) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: Three slides view */}
      <div className="hidden md:grid grid-cols-3 gap-[39px] min-h-[328px]">
        {data?.images2.map((src:any, index:any) => (
          <div key={index} className="relative overflow-hidden">
            <img
              src={src}
              alt={`Banner ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Mobile navigation arrows */}
      <button
        onClick={prevSlide}
        className="md:hidden absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="md:hidden absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 transition-colors"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default ThreeBannerLayout;