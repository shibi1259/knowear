import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { X } from "lucide-react";
import Image from "next/image";
import { ProductMedia } from "@/types/productDetails.types";
import ZoomableImage from './ZoomableImage';

const FullScreenViewer = ({
  medias,
  initialSlide = 0,
  isOpen,
  onClose
}: {
  medias: ProductMedia[];
  initialSlide?: number;
  isOpen: boolean;
  onClose: () => void;
}) => {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full h-screen m-0 p-0 bg-black/95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-8 w-8 text-white mt-5" />
        </button>
        
        <div className="h-full w-full flex items-center justify-center">
          <Carousel
            className="w-full max-w-5xl"
            // defaultChecked={initialSlide}
            opts={{
              align: "center",
              loop: true,
              startIndex:initialSlide 
            }}
          >
            <CarouselContent>
              {medias?.map((media, index) => (
                <CarouselItem key={index} className="flex justify-center">
                  <div className="relative w-full h-screen flex items-center justify-center p-4 text-white">
                    <ZoomableImage
                    src={media.url}
                    alt={`Product image ${index + 1}`}
                    width={1200}
                    height={800}
                    priority={index === initialSlide}
                  />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 h-12 w-12 bg-white/10 hover:bg-white/20">
              <CustomArrowIcon className="h-6 w-6 text-white background-black" direction="prev" />
            </CarouselPrevious>
            <CarouselNext className="right-4 h-12 w-12 bg-white/10 hover:bg-white/20">
              <CustomArrowIcon className="h-6 w-6 text-white" />
            </CarouselNext>
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenViewer;



  // const ImageWithLightbox = ({
  //   src,
  //   alt,
  //   width,
  //   height,
  //   className,
  //   zoom,
  // }: any) => (
  //   <Dialog
  //     open={isOpen && selectedImage === src}
  //     onOpenChange={(open) => {
  //       setIsOpen(open);
  //       if (!open) setSelectedImage("");
  //     }}
  //   >
  //     <div className="grid gap-4">
  //     </div>
  //     <DialogTrigger asChild>
  //       <div
  //         className={`${!zoom?'cursor-pointer':''} transition-transform hover:scale-[1.02]`}
  //         onClick={() => {
  //           if(!zoom){
  //           setSelectedImage(src);
  //           setIsOpen(true);
  //           }
  //         }}
  //       >
  //         {zoom ? (
  //           <ImageZoomLens
  //             // key={index}
  //             src={src}
  //             alt={src?.url || "Product image"}
  //             width={600}
  //             height={600}
  //             zoomLevel={5}
  //             lensSize={200}
  //           />
  //         ) : (
  //           <Image
  //             height={height}
  //             width={width}
  //             src={src}
  //             alt={alt}
  //             className={className}
  //           />
  //         )}
  //       </div>
  //     </DialogTrigger>
  //     <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-0">
  //       <div className="relative max-w-full h-[90vh]">
  //         <button
  //           onClick={() => {
  //             setIsOpen(false);
  //             setSelectedImage("");
  //           }}
  //           className="absolute top-4 right-4 p-2 bg-white hover:bg-gray-100 transition-colors z-50"
  //         >
  //           <X className="h-4 w-4 text-gray-600" />
  //         </button>
  //         <Image
  //           src={src}
  //           alt={alt}
  //           width={1200}
  //           height={1200}
  //           className="w-full h-full object-contain"
  //         />
  //       </div>
  //     </DialogContent>
  //   </Dialog>
  // );
