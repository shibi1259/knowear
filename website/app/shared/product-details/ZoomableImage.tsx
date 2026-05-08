import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ZoomableImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  onSlideChange?: () => void;
}

const ZoomableImage = ({ src, alt, width, height, priority, onSlideChange }: ZoomableImageProps) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const resetZoom = () => {
    setIsZoomed(false);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      if (isZoomed) {
        resetZoom();
      } else {
        setIsZoomed(true);
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) {
      e.stopPropagation();
      setIsDragging(true);
      setStartPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isZoomed) {
      e.stopPropagation();
      setIsDragging(true);
      setStartPosition({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isZoomed) {
      const newX = e.clientX - startPosition.x;
      const newY = e.clientY - startPosition.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && isZoomed) {
      e.preventDefault();
      const newX = e.touches[0].clientX - startPosition.x;
      const newY = e.touches[0].clientY - startPosition.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      resetZoom();
    }
  };

  // Reset zoom when changing slides
  useEffect(() => {
    return () => {
      if (isZoomed) {
        resetZoom();
        if (onSlideChange) {
          onSlideChange();
        }
      }
    };
  }, [src]); // Dependency on src ensures this runs when the image changes

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomed) {
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        ref={imageRef}
        className={`relative transition-transform duration-200 ${
          isZoomed ? 'cursor-move' : 'cursor-zoom-in'
        }`}
        onClick={handleImageClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isZoomed ? `scale(2) translate(${position.x}px, ${position.y}px)` : 'scale(1)',
        }}
      >
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="max-h-[90vh] w-auto object-contain select-none"
        //   priority={priority}
          draggable={false}
        />
      </div>
      {isZoomed && (
        <div
          className="fixed inset-0 bg-transparent z-10"
          onClick={handleBackgroundClick}
        />
      )}
    </div>
  );
};

export default ZoomableImage;