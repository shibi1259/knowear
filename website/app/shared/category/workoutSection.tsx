import React, { useState, useEffect, useRef, TouchEvent, MouseEvent } from "react";

// Define types for component props
interface WorkoutSectionProps {
  data: {
    images: Array<string | { alt?: string }>;
    seventhIcon: string;
    seventhIconTitle: string;
    seventhIconDescription: string;
    eighthIcon: string;
    eighthIconTitle: string;
    eighthIconDescription: string;
  };
}

// Define type for icon data
interface IconData {
  icon: string;
  title: string;
  description: string;
}

// Workout Section Component with Mobile Slider
const WorkoutSection: React.FC<WorkoutSectionProps> = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [translateX, setTranslateX] = useState<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Check if the current view is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle slide navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === data?.images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? data?.images.length - 1 : prev - 1));
  };

  // Get the icon data based on current slide
  const getCurrentIconData = (index: number): IconData => {
    if (index === 0) {
      return {
        icon: data?.seventhIcon,
        title: data?.seventhIconTitle,
        description: data?.seventhIconDescription,
      };
    } else {
      return {
        icon: `https://knowearcommerce.s3.ap-south-1.amazonaws.com/${data?.eighthIcon}`,
        title: data?.eighthIconTitle,
        description: data?.eighthIconDescription,
      };
    }
  };

  // Drag handlers
  const handleDragStart = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    
    // Get starting position
    if ('touches' in e) {
      setStartX(e.touches[0].clientX);
    } else {
      setStartX(e.clientX);
    }

    // Set initial translateX based on current slide
    setTranslateX(-currentSlide * 100);
  };

  const handleDragMove = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    // Get current position
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    
    // Calculate slider width for determining drag sensitivity
    const sliderWidth = sliderRef.current?.offsetWidth || 1;
    
    // Set translateX based on drag movement (as a percentage of container width)
    const newTranslateX = -currentSlide * 100 + (deltaX / sliderWidth * 100);
    
    // Limit drag to prevent dragging too far past the edges
    if (newTranslateX > 0 || newTranslateX < -(data.images.length - 1) * 100) {
      return;
    }
    
    setTranslateX(newTranslateX);
  };

  const handleDragEnd = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Get ending position
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    
    // Determine if we should change slide based on the drag distance
    const sliderWidth = sliderRef.current?.offsetWidth || 1;
    const dragPercent = (deltaX / sliderWidth) * 100;
    
    // If the drag is more than 15% of the slider width, change slides
    if (Math.abs(dragPercent) > 15) {
      if (dragPercent > 0 && currentSlide > 0) {
        // Dragged right, go to previous slide
        setCurrentSlide(currentSlide - 1);
      } else if (dragPercent < 0 && currentSlide < data.images.length - 1) {
        // Dragged left, go to next slide
        setCurrentSlide(currentSlide + 1);
      } else {
        // Snap back to current slide
        setTranslateX(-currentSlide * 100);
      }
    } else {
      // Snap back to current slide if drag wasn't far enough
      setTranslateX(-currentSlide * 100);
    }
  };

  // Update translateX when currentSlide changes
  useEffect(() => {
    setTranslateX(-currentSlide * 100);
  }, [currentSlide]);

  // Render desktop view (grid)
  if (!isMobile) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <img
            src={data?.images[0] as string}
            alt={typeof data?.images[0] === 'object' ? data?.images[0]?.alt : undefined}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-[20px] left-[2px] md:top-16 md:left-10 flex flex-col items-center">
            <img
              src={data?.seventhIcon}
              alt={data?.seventhIconTitle}
              className="w-8 h-8"
            />
            <p className="text-black text-sm font-medium">
              {data?.seventhIconTitle}
            </p>
            <p
              className="text-gray-600 text-xs"
              dangerouslySetInnerHTML={{ __html: data?.seventhIconDescription }}
            ></p>
          </div>
        </div>

        <div className="relative">
          <img
            src={data?.images[1] as string}
            alt={typeof data?.images[1] === 'object' ? data?.images[1]?.alt : undefined}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-[20px] right-[2px] md:top-16 md:right-10 flex flex-col items-center">
            <img
              src={`https://knowearcommerce.s3.ap-south-1.amazonaws.com/${data?.eighthIcon}`}
              alt={data?.eighthIconTitle}
              className="w-8 h-8"
            />
            <p className="text-white text-sm font-medium">
              {data?.eighthIconTitle}
            </p>
            <p
              className="text-white text-xs"
              dangerouslySetInnerHTML={{ __html: data?.eighthIconDescription }}
            ></p>
          </div>
        </div>
      </div>
    );
  }

  // Render mobile view (slider)
  return (
    <div className="relative w-full">
      {/* Slider container */}
      <div 
        className="relative overflow-hidden"
        ref={sliderRef}
      >
        {/* Slides */}
        <div 
          className={`flex ${isDragging ? 'transition-none' : 'transition-transform duration-300 ease-in-out'}`}
          style={{ transform: `translateX(${translateX}%)` }}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {data?.images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0 relative">
              <img
                src={typeof image === 'string' ? image : ''}
                alt={typeof image === 'object' ? image?.alt || `Workout image ${index + 1}` : `Workout image ${index + 1}`}
                className="w-full h-64 object-cover"
                draggable="false"
              />
              
              {/* Icon overlay */}
              <div className="absolute top-4 left-0 right-0 flex flex-col items-center max-w-[119px]">
                <img
                  src={getCurrentIconData(index).icon}
                  alt={getCurrentIconData(index).title}
                  className="w-8 h-8"
                  draggable="false"
                />
                <p className={`${index === 1 ? 'text-white' : 'text-black'} text-sm font-medium mt-1`}>
                  {getCurrentIconData(index).title}
                </p>
                <p
                  className={`${index === 1 ? 'text-white' : 'text-gray-600'} text-xs text-center px-4 mt-1`}
                  dangerouslySetInnerHTML={{ __html: getCurrentIconData(index).description }}
                ></p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination dots */}
      <div className="flex justify-center mt-4">
        {data?.images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-2 mx-1 rounded-full ${
              currentSlide === index ? 'bg-black' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkoutSection;