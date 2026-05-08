import React, { useState, useEffect } from "react";

const VideoBanner = ({ data }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Handle video loading state
  const handleLoadedData = () => {
    setIsLoading(false);
  };

  // Handle video error
  const handleVideoError = () => {
    setVideoError(true);
    setIsLoading(false);
  };

  // If no data is provided, show loading state
  if (!data) {
    return (
      <section className="mb-8">
        <div className="relative w-full aspect-[1200/655] bg-gray-200 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="relative w-full aspect-[1200/655]">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="text-gray-600">Loading video...</div>
          </div>
        )}
        
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={handleLoadedData}
          onError={handleVideoError}
        >
          <source src={data.video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {!isLoading && !videoError && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center ">
            <div className="text-center text-white p-6">
              <h2 className="text-4xl font-bold mb-4">Experience Comfort</h2>
              <p className="text-xl max-w-2xl mx-auto">
                Designed for performance, made for everyday comfort
              </p>
            </div>
          </div>
        )}

        {videoError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-red-600">Failed to load video</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoBanner;