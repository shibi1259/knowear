"use client";
import React from "react";
import Image from "next/image";
import Bannerimage from "../../public/counterbanner.png";
import StudentSupport from "../../public/icons/support.svg";
import Fund from "../../public/icons/funding.svg";
import Link from "next/link";
type Props = {
  widgetDetails: any;
};

const BannerCounter = ({ widgetDetails }: Props) => {
  return (
    <>
      <section className="relative mt-5 md:mt-10 py-[88px] lg:py-[106px] overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-black/50 before:z-10">
        {/* {
                 widgetDetails?.video ?
                   <video autoPlay muted loop playsInline webkit-playsinline src={widgetDetails?.video} className="absolute top-0 left-0 w-full h-full object-cover"></video>
                  
                   :
                   <Image
                     height={341}
                     width={1360}
                     src={widgetDetails?.videoCover}
                     alt='Knowear'
                     className="absolute top-0 left-0 w-full h-full object-cover" />
               } */}
        <video
          autoPlay
          muted
          loop
          playsInline
          webkit-playsinline
          src={"/AUS.mp4"}
          className="absolute top-0 left-0 w-full h-full object-cover"
        ></video>

        <div className="container max-w-full relative z-10 text-white ">
          <h3 className="text-[30px] leading-[30px] lg:leading-[50px] lg:text-[45px] font-semibold max-w-[454px] w-full">
            {widgetDetails?.title}
          </h3>
          <div className="flex flex-wrap items-center gap-y-[25px] mt-[10px] lg:justify-between">
            <p className="text-[13px] lg:text-xl lg:leading-[35px] font-normal max-w-[515px] w-full lg:w-1/2">
              {widgetDetails?.description}
            </p>
            <div className="w-full lg:w-1/2 xl:w-full xl:max-w-[600px]">
              <ul className="flex justify-start lg:justify-end items-center flex-wrap">
                <li className="flex justify-start items-center gap-5 w-full sm:w-1/2 pb-3 sm:pb-0 border-b-[1px] sm:border-b-0 sm:border-r-[1px] border-[rgba(255,255,255,0.5)] sm:pr-[61px]">
                  <Image src={StudentSupport} alt="Student Support" />
                  <div>
                    <h4 className="text-[25px] lg:text-[36px] leading-9 font-medium">
                      500+
                    </h4>
                    <p className="text-xs lg:text-sm font-medium uppercase">
                      Students supported
                    </p>
                  </div>
                </li>
                <li className="flex justify-start items-center gap-5 w-full sm:w-1/2 pt-[19px] sm:pt-0 sm:pl-[61px]">
                  <Image src={Fund} alt="Fund" />
                  <div>
                    <h4 className="text-[25px] lg:text-[36px] leading-9 font-medium">
                      5%
                    </h4>
                    <p className="text-xs lg:text-sm font-medium uppercase">
                      of revenue supports education
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <Link
            href={widgetDetails?.button?.link || ""}
            className="text-sm lg:text-lg font-normal text-black text-center bg-white px-[13px] py-3 uppercase mt-[30px] lg:mt-10 w-[136px] lg:w-[192px] block hover:rounded-lg transition-all"
          >
            {widgetDetails?.button?.text}
          </Link>
        </div>
      </section>
    </>
  );
};

export default BannerCounter;
