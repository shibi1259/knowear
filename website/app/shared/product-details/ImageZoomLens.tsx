import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ImageZoomLensProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  zoomLevel?: number;
  lensSize?: number;
}

interface Position {
  x: number;
  y: number;
}

const ImageZoomLens: React.FC<ImageZoomLensProps> = ({
  src,
  alt,
  width = 400,
  height = 400,
  zoomLevel = 2.5,
  lensSize = 150
}) => {
  const [showZoom, setShowZoom] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const imageRef = useRef<HTMLDivElement | null>(null);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!imageRef.current || isMobile) return;

    const rect = imageRef.current.getBoundingClientRect();
    
    // Get precise cursor position
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate boundaries
    const halfLens = lensSize / 2;
    const boundedX = Math.max(halfLens, Math.min(rect.width - halfLens, x));
    const boundedY = Math.max(halfLens, Math.min(rect.height - halfLens, y));

    setPosition({
      x: boundedX,
      y: boundedY
    });
  };

  // Calculate zoom image position with higher precision
  const getZoomImagePosition = () => {
    if (!imageRef.current) return { x: 0, y: 0 };

    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = (position.x / rect.width) * (width * zoomLevel - lensSize);
    const scaleY = (position.y / rect.height) * (height * zoomLevel - lensSize);

    return {
      x: -scaleX + lensSize/2,
      y: -scaleY + lensSize/2
    };
  };

  if (isMobile) {
    return (
      <div className="relative w-fit">
        <Image
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          width={width || 800}
          height={height || 600}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
          loading="lazy"
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"
        />
      </div>
    );
  }

  const zoomPosition = getZoomImagePosition();

  return (
    <div className="relative w-fit cursor-none">
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
        onMouseMove={handleMouseMove}
        ref={imageRef}
      >
        <Image
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          width={width || 800}
          height={height || 600}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
          loading="lazy"
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"
        />

        {showZoom && (
          <div
            className="absolute overflow-hidden  border-gray-300 shadow-lg bg-white"
            style={{
              width: `${lensSize}px`,
              height: `${lensSize}px`,
              left: position.x,
              top: position.y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          >
            <Image
              src={src}
              alt={`${alt} zoomed`}
              className="absolute select-none"
              width={width * zoomLevel}
              height={height * zoomLevel}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              quality={95}
              priority={true}
              style={{
                maxWidth: 'none',
                left: `${zoomPosition.x}px`,
                top: `${zoomPosition.y}px`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageZoomLens;


