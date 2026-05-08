import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import Image from "next/image";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import api from "@/config/api.interceptor";
import { StateContext } from "@/providers/state/StateContext";

const PlusIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="white"
    stroke="black"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ProductCard: React.FC<any> = ({
  product,
  onWishlistToggle,
  isMobile,
}) => {
  const { wishlistDetails, getWishlistDetails } = React.useContext(StateContext);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  useEffect(() => {
    const wishlistIds =
      wishlistDetails &&
      wishlistDetails?.map((wishlistItem: any) => {
        return wishlistItem.params.slug;
      });
    const isWishlisted = wishlistIds?.includes(product?.params?.slug) || false;
    setIsWishlisted(isWishlisted);
  }, [wishlistDetails]);

  const handleWishlist = () => {
    api
      .post(endpoints.manageWishList, {
        slug: product?.params?.slug,
      })
      .then((res) => {
        if (res?.data?.errorCode == 0) {
          getWishlistDetails();
        }
      })
      .catch((error: any) => {});
  };

  return (
    <div
      className={`bg-white shadow-lg overflow-hidden flex flex-col ${
        isMobile ? "w-full" : "w-72"
      }`}
    >
      <div className="p-2 flex justify-between w-full  items-start absolute top-0 left-0 z-[1] ">
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-sm">
          {product?.donationPercentage?.text}
        </span>
        <button
          onClick={handleWishlist}
          className="group"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`${
              isMobile ? "w-4 h-4" : "w-5 h-5"
            } transition-colors duration-300 ${
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-400 group-hover:text-gray-700"
            }`}
          />
        </button>
      </div>

      <div className="flex-grow">
        <div className="flex flex-col aspect-[287/550]">
          <div className="relative overflow-hidden ">
            {isMobile ? (
              <Image
                src={product?.thumbnail?.thumbnail}
                alt={product?.name?.text}
                width={165}
                height={220}
                className="w-full md:h-56  aspect-square object-cover "
              />
            ) : (
              <Image
                src={product?.thumbnail?.thumbnail}
                alt={product?.name?.text}
                width={288}
                height={320}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            )}
          </div>

          <div
            className={`${
              isMobile ? "mt-2 mb-2 space-y-1 px-2 " : "mt-4 mb-4 space-y-2 px-2"
            }`}
          >
            <h3 className={`${isMobile ? "text-sm" : "text-lg"} font-medium`}>
              {product?.name?.text}
            </h3>
            
            <p className="text-sm text-gray-500">{product?.overview?.text}</p>

            {isMobile ? (
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm text-gray-900">
                  {product?.price?.text}
                </span>
                {product?.actualPrice && (
                  <span className="text-gray-500 line-through text-xs">
                    {product?.actualPrice?.text}
                  </span>
                )}
                {product?.discount && (
                  <span className="text-xs text-black font-normal bg-gray-300 w-20 h-5 px-1 flex items-center justify-center">
                    {product?.discount}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-gray-900">
                  {product?.price?.text}
                </span>
                {product?.originalPrice && (
                  <span className="text-gray-500 line-through text-sm">
                    {product?.actualPrice?.text}
                  </span>
                )}
                {product?.discount && (
                  <span className="text-xs text-black font-normal bg-gray-300 h-6 px-1 flex items-center">
                    {product?.discount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductBanner = ({ data }: any) => {
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const activeProduct = activeHotspot
    ? data?.hotspots.find((h: any) => h.id === activeHotspot)
    : null;

  const handleHotspotClick = (hotspotId: number) => {
    // If clicking the same hotspot that is currently active, close the product card
    setActiveHotspot(activeHotspot === hotspotId ? null : hotspotId);
  };

  const handleBannerClick = (event: React.MouseEvent) => {
    // Check if the click is on the banner image itself and not on a hotspot
    if (event.target === event.currentTarget.querySelector('img')) {
      setActiveHotspot(null);
    }
  };

  return (
    <div
      className={`relative mx-auto ${
        isMobile ? "max-w-full" : "max-w-[1800px] lg:max-w-[3600px]"
      }`}
      onClick={handleBannerClick}
    >
      <div className="relative flex flex-col">
        <div className="relative w-full lg:h-auto lg:max-w-full md:h-[655px]">
          <img
            src={data?.interactiveImage}
            alt="Woman in black workout clothes"
            className={`w-full h-full ${
              isMobile ? "h-[408px] object-cover object-center" : "object-cover"
            }`}
          />

          {data?.hotspots.map((hotspot: any) => (
            <div
              key={hotspot.id}
              className="absolute"
              style={{
                top: `${hotspot.y}%`,
                left: `${hotspot.x}%`,
              }}
            >
              <button
                onClick={() => handleHotspotClick(hotspot.id)}
                className={`${
                  isMobile ? "w-6 h-6" : "w-8 h-8"
                } bg-white rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform`}
              >
                <PlusIcon />
              </button>
            </div>
          ))}
        </div>

        {activeHotspot !== null && (
          <div
            className={`absolute ${
              isMobile 
                ? "top-1/2 -translate-y-1/2 right-5 w-[165px]" 
                : "top-1/2 -translate-y-1/2 right-[76px]"
            }`}
          >
            <ProductCard product={activeProduct} isMobile={isMobile} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductBanner;
