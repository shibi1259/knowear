"use client";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import api from "@/config/api.interceptor";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const CategoryList = ({ categories }: any) => {
  const [categoryList, setCategoryList] = useState(
    categories?.categories ? categories?.categories : []
  );
  const [isInitialRender, setIsInitialRender] = useState(true); // Flag to track initial render
  const [filterlist, setFilterList] = useState({
    page: 1,
    limit: 20,
    startWith: "",
    search: "",
    clear: false,
  });
  const [isLoading, setisLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(categories?.last_page);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let resp = await api.post(endpoints.categoriesList, {
          page: filterlist?.page,
          limit: 12,
        });

        setIsLastPage(resp?.data?.result?.last_page);
        if (filterlist?.clear) {
        } else {
          setCategoryList([...categoryList, ...resp?.data?.result?.categories]);
        }
        setisLoading(false);
      } catch (error) {
        setisLoading(false);
        const errorMessage = error as any;
      }
    };
    if (!isInitialRender) {
      setTimeout(() => {
        fetchData();
      }, 500);
    } else {
      setIsInitialRender(false);
      // getPublishedWidgets()
    }
    return () => {};
    // eslint-disable-next-line
  }, [filterlist]);

  const onHandlePagnation = async () => {
    try {
      setisLoading(true);
      setFilterList({
        ...filterlist,
        page: filterlist?.page + 1,
        clear: false,
      });
    } catch (error) {}
  };


  return (
    <div>
      <section className="pt-5 md:pt-10 ">
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-[15px] lg:gap-5">
          {categoryList.map((widgetItem: any, index: number) => (
            <Link
              href={
                widgetItem?.isLanding
                  ? `/categories/${widgetItem?.params?.slug}`
                  : `/products/${widgetItem?.params?.slug}`
              }
              className="relative group overflow-hidden col-span-2 lg:col-span-3"
              key={index}
            >
              {widgetItem?.image ? (
                <Image
                  priority={true}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  quality={100}
                  height={350}
                  width={200}
                  src={widgetItem?.image}
                  alt="yoga"
                  className="group-hover:scale-105 transition duration-300 ease-in-out object-cover w-full"
                />
              ) : (
                <div className="bg-gray-200 h-[254px] w-full" />
              )}
              {/* <Image height={350} width={200} src={widgetItem?.thumbnail} alt="yoga" className='group-hover:scale-105 transition duration-300 ease-in-out object-cover w-full' /> */}
              <p className="text-black text-[13px] lg:text-xl uppercase font-medium bg-white/50 pt-[6px] lg:pt-3 pb-1 lg:pb-[7px] text-center absolute right-0 left-0 bottom-0">
                {widgetItem?.name}
              </p>
            </Link>
          ))}
        </div>
      </section>
      {!isLastPage && (
        <div className="flex items-center justify-center mb-5">
          <button
            disabled={isLoading}
            onClick={onHandlePagnation}
            className="rounded-none font-semibold border border-black px-4 py-2 text-xs disabled:opacity-40  disabled:text-gray-700"
          >
            LOAD MORE
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
