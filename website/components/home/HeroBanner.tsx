"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  widgetDetails: any;
};

const HeroBanner = ({ widgetDetails }: any) => {
  console.log("widgetDetails====>", widgetDetails);

  return (
    <>
      {/* h-[341px] lg:h-[calc(100vh_-_115px)] */}
      <section className="relative w-full overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-black/50 before:z-10">
        {/* {widgetDetails?.video ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            webkit-playsinline
            src={widgetDetails?.video}
            className="absolute top-0 left-0 w-full h-full object-cover"
          ></video>
        ) : (
          // <iframe
          //   className="absolute top-0 left-0 w-full h-full"
          //   src={widgetDetails?.video}
          //   title="Video player"
          //   frameBorder="0"
          //   allow="accelerometer; autoplay; clipboard-write; gyroscope; picture-in-picture;"
          //   referrerPolicy="strict-origin-when-cross-origin"
          //   allowFullScreen
          // ></iframe>
          <Image
            height={341}
            width={1360}
            src={widgetDetails?.videoCover}
            alt="Knowear"
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        )} */}
        <video
          autoPlay
          muted
          loop
          playsInline
          webkit-playsinline
          src={'/hero_video.mp4'}
          className="absolute top-0 left-0 w-full h-full object-cover"
        ></video>
        <div className="container max-w-full relative z-20 md:w-[1366px] md:h-[655px] w-[375px] h-[370px] text-white flex flex-col justify-center items-center ">
          <h1 className="text-[25px] lg:text-[45px] leading-[30px] lg:leading-[50px] max-w-[576px] w-full font-bold mb-[10px] lg:mb-[22px] justify-center align-center text-center  mx-auto">
            {widgetDetails?.title}
          </h1>
          <p className="text-[13px] lg:text-[15px] leading-5 font-light max-w-[576px] w-full text-center">
            {widgetDetails?.description}
          </p>
          {widgetDetails?.buttonVisibility && (
            <Link
              href={widgetDetails?.button?.link || ""}
              className="text-sm lg:text-lg font-normal text-white text-center bg-transparent border border-white   md:px-[8px] px-[7px] md:py-1 py-[7px] uppercase mt-[30px] lg:mt-10 w-[140px]  transition-all"
            >
              {widgetDetails?.button?.text}
            </Link>
          )}
        </div>
      </section>
    </>
  );
};

export default HeroBanner;
