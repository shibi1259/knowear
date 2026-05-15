"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";

const CategoryGrids = (props: any) => {
  const medias: any[] = props?.widgetDetails?.medias || [];

  return (
    <section className="pt-5 md:pt-10">
      <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-[15px] lg:gap-5">
        {medias.map((widgetItem: any, index: number) => (
          <Link
            key={widgetItem?._id || widgetItem?.redirection || index}
            href={widgetItem?.redirection || "/products"}
            className="relative group overflow-hidden col-span-2 lg:col-span-3 aspect-[200/350] block"
          >
            <Image
              priority={index < 2}
              loading={index < 4 ? "eager" : "lazy"}
              fetchPriority={index < 2 ? "high" : "auto"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
              quality={75}
              src={widgetItem?.thumbnail}
              alt={widgetItem?.title || "Category"}
              className="group-hover:scale-105 transition duration-300 ease-in-out object-cover"
            />
            <p className="text-black text-[13px] lg:text-xl uppercase font-medium bg-white/50 pt-[6px] lg:pt-3 pb-1 lg:pb-[7px] text-center absolute right-0 left-0 bottom-0">
              {widgetItem.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrids;
