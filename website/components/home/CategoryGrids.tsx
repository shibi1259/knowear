"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";

type Props = {};

const categorygrids = (props: any) => {
  console.log("props", props.widgetDetails);
  return (
    <>
      <section className="pt-5 md:pt-10">
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-[15px] lg:gap-5">
          {props?.widgetDetails?.medias.map(
            (widgetItem: any, index: number) => (
              <>
                <Link
                  href={widgetItem?.redirection || "/products"}
                  className="relative group overflow-hidden col-span-2 lg:col-span-3"
                  key={index}
                >
                  <Image
                    priority={true}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    quality={100}
                    height={350}
                    width={200}
                    src={widgetItem?.thumbnail}
                    alt="yoga"
                    className="group-hover:scale-105 transition duration-300 ease-in-out object-cover w-full"
                  />
                  {/* <Image height={350} width={200} src={widgetItem?.thumbnail} alt="yoga" className='group-hover:scale-105 transition duration-300 ease-in-out object-cover w-full' /> */}
                  <p className="text-black text-[13px] lg:text-xl uppercase font-medium bg-white/50 pt-[6px] lg:pt-3 pb-1 lg:pb-[7px] text-center absolute right-0 left-0 bottom-0">
                    {widgetItem.title}
                  </p>
                </Link>
              </>
            )
          )}
        </div>
      </section>
    </>
  );
};

export default categorygrids;
