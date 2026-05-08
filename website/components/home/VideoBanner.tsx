"use client";
import React from "react";
import Bannerimage from "../../public/lowerVideoBanner.png";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PlayIcon from "../../public/icons/play.svg";

type Props = {
  widgetDetails: any;
  checkoutBanner?: boolean;
};

const VideoBanner = ({ checkoutBanner = false, widgetDetails }: Props) => {
  return (
    <>
      <div className="mt-[2%]">
        <h5 className="md:font-normal font-medium text-[13px] lg:text-[15px] lg:leading-[15px] uppercase truncate">
          {widgetDetails?.caption}
        </h5>
        {checkoutBanner && (
          <>
            <h3 className=" lg:text-[30px] lg:text-[65px] h-[88px] font-semibold md:mt-0 mt-2">
              KnoWear Supports Education Internationally
            </h3>
            <p className="text-xs lg:text-xl font-medium uppercase md:leading-[20px] lg:mt-[10px] -mt-12">
              {/* "We proudly supported the “Get Active for Education” initiative at
              the American University of Sharjah (AUS)"  */}
              WE SUPPORTED THE “GET ACTIVE FOR EDUCATION” INITIATIVE AT THE
              AMERICAN UNIVERSITY OF SHARJAH (AUS).
            </p>
          </>
        )}
      </div>
      <section className="relative w-full mt-[30px] md:mt-10">
        {/* 16:9 Aspect Ratio Box */}
        <div className="relative w-full h-[650px]">
          <Image
            src={
              checkoutBanner
                ? "/homepage_banner_desktop.jpg"
                : "/homepage_banner.jpg"
            }
            alt="Video Banner"
            fill
            quality={75}
            className="object-cover"
            priority={false}
            loading="lazy"
          />

          {/* Video Button - Moved left from center */}
          <div className="absolute top-1/2 left-[10%] -translate-y-1/2 z-10">
            {!checkoutBanner && (
              <div className="mb-12">
                <h3 className="text-[30px] lg:text-[65px] h-[88px] font-semibold md:mt-0 text-white">
                  {widgetDetails?.title}
                </h3>
                <p className="text-sm lg:text-xl font-medium uppercase md:leading-[20px] lg:mt-[10px] -mt-12 text-white">
                  {widgetDetails?.description}
                </p>
              </div>
            )}
            <Dialog>
              <DialogTrigger className="md:mb-12 flex items-center gap-2 md:text-[18px] text-[15px] font-normal text-black bg-white md:px-[21px] md:py-[18px] px-[18px] py-[15px] uppercase hover:rounded-lg transition-all">
                <Image
                  src={PlayIcon}
                  alt="Play Icon"
                  width={24}
                  height={24}
                  className="w-[20px] h-[20px] md:w-[24px] md:h-[24px]"
                />
                {checkoutBanner
                  ? "VIEW HIGHLIGHTS"
                  : widgetDetails?.button?.text}
              </DialogTrigger>
              <DialogContent className="p-3 sm:max-w-xl">
                <DialogHeader>
                  <DialogDescription>
                    {checkoutBanner ? (
                      <iframe
                        className="w-full"
                        height="315"
                        src="https://www.youtube.com/embed/X5OfUJb_2i8"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        webkit-playsinline
                        preload="none"
                        src={
                          checkoutBanner
                            ? "/KW_How_it_works.mp4"
                            : "/How_it_works.mp4"
                        }
                        className="w-full"
                      ></video>
                    )}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    </>
  );
};

export default VideoBanner;
