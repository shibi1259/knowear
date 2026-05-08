"use client";
import Calender from "@/public/svgs/Calender";
import Clock from "@/public/svgs/Clock";
import Image from "next/image";
import React from "react";
import DOMPurify from "dompurify";

const BlogDetails = ({ details }: any) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const formatDate = (date: string) => {
    const monthIndex = new Date(date).getMonth();
    return `${months[monthIndex]} ${new Date(date).getDate()} ${new Date(
      date
    ).getFullYear()}`;
  };
  return (
    <div>
      <Image
        className="h-full w-full object-cover md:mb-[22px] mb-[13px]"
        src={details?.cover}
        alt={details?.title}
        width={500}
        height={500}
        priority={true}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        quality={100}
      />
      <div className="">
        <h1 className="text-[15px] md:text-[25px] font-medium leading-[21px] md:leading-[33px]">
          {details?.title}
        </h1>
        <div className="flex items-center gap-[9px]">
          <div className="flex items-center gap-[9px] mt-[11px] md:mt-[9.8px]">
            <Calender />
            <p className="text-black opacity-50 font-normal text-xs leading-[18px] min-w-[101px]">
              {formatDate(details?.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-[9px] mt-[11px] md:mt-[9.8px]">
            <Clock />
            <p className="text-black opacity-50 font-normal text-xs leading-[18px] min-w-[101px]">
              10 Min Read
            </p>
          </div>
        </div>
        <div className="mt-2.5 md:mt-[21px]">
          <p className="leading-[19px] text-[13px] text-black">
            {details?.overview}
          </p>
          <div
            className="description mt-[11px] md:mt-2 text-[13px] text-black"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(details?.description || ""),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
