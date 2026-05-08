"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  blog: any;
};

const BlogCard = ({ blog }: Props) => {
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
      <div className="h-fit md:h-[555px] relative">
        <div className="absolute px-2 py-[5px] bg-white uppercase text-xs my-3 mx-[10px]">
          {blog?.category}
        </div>
        <Image
          className="h-full w-full md:object-cover object-contain"
          src={blog?.cover}
          alt={blog?.title}
          width={500}
          height={500}
          priority={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          quality={100}
        />
      </div>
      <div className="text-[15px] md:text-[25px] font-medium mt-[13px] md:mt-[22px] md:leading-[33px]">{blog?.title}</div>
      <div className="mt-[0.6125rem] text-sm text-gray-500">
        {formatDate(blog?.createdAt)}
      </div>
      <div className="pt-[10px] sm:pt-[21.41px]">
        <div className="text-[13px] leading-[19.5px]">{blog?.overivew}</div>
      </div>
      <div className="flex items-center justify-center mt-[26px] md:mt-[49px] px-[15px] w-fit h-[35px] md:h-[42px] bg-black text-white  text-sm font-medium rounded-none">
        <Link
          href={`/blogs/${blog?.slug}`}
          className=""
        >
          Read More
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;
