import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { ProductMedia } from "@/types/productDetails.types";
import FullScreenViewer from "./FullScreenViewer";
import { type CarouselApi } from "@/components/ui/carousel";

type Props = {
  medias: Array<ProductMedia>;
};

const SnapShots = (props: Props) => {
  const [medias, setMedias] = React.useState(props.medias);
  const [videoUrl, setVideoUrl] = React.useState("");
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    for (let media of medias) {
      if (media.type === "video") {
        setVideoUrl(media?.url);
        break;
      }
    }
  }, [medias]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  // Manual auto-rotation implementation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (api && medias.length > 1) {
      interval = setInterval(() => {
        api.scrollNext();
      }, 5000); // Change slide every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [api, medias.length]);

  const handleImageClick = (index: number) => {
    // Only open fullscreen viewer if the media is an image
    if (medias[index].type === "image") {
      // Calculate correct index for the filtered image array
      const imageOnlyIndex = medias
        .filter(media => media.type === "image")
        .findIndex((_, i, arr) => {
          return medias.indexOf(arr[i]) === index;
        });
      
      setSelectedImageIndex(imageOnlyIndex >= 0 ? imageOnlyIndex : 0);
      setIsFullScreenOpen(true);
    }
  };

  const CustomArrowIcon = ({ className = "", direction = "next" }) => (
    <svg
      width="7"
      height="13"
      viewBox="0 0 7 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${direction === "prev" ? "rotate-180" : ""}`}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.146893 12.8531C0.10033 12.8067 0.0633873 12.7515 0.0381808 12.6907C0.0129744 12.63 -1.902e-08 12.5649 -2.18948e-08 12.4991C-2.47695e-08 12.4333 0.0129744 12.3682 0.0381808 12.3075C0.0633872 12.2467 0.10033 12.1916 0.146893 12.1451L5.79389 6.49911L0.146893 0.853106C0.100405 0.806619 0.0635287 0.75143 0.0383696 0.69069C0.0132105 0.629951 0.00026124 0.56485 0.000261237 0.499106C0.000261234 0.433363 0.0132105 0.368262 0.0383696 0.307523C0.0635287 0.246783 0.100405 0.191594 0.146893 0.145106C0.193381 0.0986185 0.24857 0.0617418 0.309309 0.0365829C0.370049 0.011424 0.435149 -0.00152494 0.500893 -0.00152495C0.566637 -0.00152495 0.631737 0.011424 0.692477 0.0365829C0.753216 0.0617418 0.808405 0.0986185 0.854893 0.145106L6.85489 6.14511C6.90146 6.19155 6.9384 6.24673 6.96361 6.30747C6.98881 6.36822 7.00179 6.43334 7.00179 6.49911C7.00179 6.56487 6.98881 6.62999 6.96361 6.69074C6.9384 6.75148 6.90146 6.80666 6.85489 6.85311L0.854894 12.8531C0.808448 12.8997 0.753272 12.9366 0.692527 12.9618C0.631782 12.987 0.566661 13 0.500894 13C0.435126 13 0.370005 12.987 0.30926 12.9618C0.248515 12.9366 0.193339 12.8997 0.146893 12.8531Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <>
      <div className="relative w-full">
        <Carousel 
          className="w-full"
          setApi={setApi}
          opts={{
            align: "start",
            loop: true, // Enable infinite looping
          }}
        >
          <CarouselContent>
            {medias.map((media: ProductMedia, index: number) => (
              <CarouselItem 
                key={index}
                className="cursor-pointer"
                onClick={() => handleImageClick(index)}
              >
                {media.type === "image" ? (
                  <Image
                    height={613}
                    width={613}
                    src={media.url}
                    alt={`Product image ${index + 1}`}
                    className="aspect-square object-cover w-full h-full"
                  />
                ) : media.type === "video" && (
                  <div className="aspect-square w-full">
                    <iframe
                      className="w-full h-full object-cover"
                      src={media.url}
                      title="Video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; gyroscope; picture-in-picture;"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-5 rounded-none">
            <CustomArrowIcon className="h-4 w-4" direction="prev" />
          </CarouselPrevious>
          <CarouselNext className="right-5 rounded-none">
            <CustomArrowIcon className="h-4 w-4" direction="next" />
          </CarouselNext>
        </Carousel>
      </div>

      <FullScreenViewer
        medias={medias.filter(media => media.type === "image")}
        initialSlide={selectedImageIndex}
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
      />
    </>
  );
};

export default SnapShots;