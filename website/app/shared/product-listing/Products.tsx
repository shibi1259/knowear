"use client";
import { ProductCardProps } from "@/types/productCard.types";
import React, { useEffect } from "react";
import ProductCard from "../product-card/ProductCard";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

type Props = {
  products: Array<ProductCardProps>;
  isGrid: number;
  isLoading: boolean;
  setIsLoading: (item: boolean) => void;
  isLastPage: boolean;
  setLimit: (item: number) => void;
  setPage: (item: any) => void;
};

const Products = (props: Props) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      if (!props.isLastPage && !props.isLoading) {
        // props.setLimit((prev)=>prev+1)
        props.setPage((prev: any) => prev + 1);
      }
    }
    // eslint-disable-next-line
  }, [inView, props.isLastPage, props.isLoading]);

  return (
    <section className="pb-[6.25rem]">
      {props.products?.length ? (
        <div
          className={`grid ${
            // props.isGrid == 2? "grid-cols-2" :
            props.isGrid == 4 ? "grid-cols-4" : "grid-cols-3"
            } gap-[15px] max-md:grid-cols-2`}
        >
          {props.products.map((product: ProductCardProps, index: number) => {
            return (
              <div key={index}>
                <ProductCard productDetails={product} />
              </div>
            );
          })}
        </div>
      ) : !props.isLoading ? (
        <div className="flex flex-col justify-center items-center w-full pt-12 pb-10 md:pb-20">
          <p className="text-center font-semibold md:font-bold text-sm md:text-base">
            {`We couldn't find any matches!`}
          </p>
          <Link
            className="mt-3 flex gap-2 items-center justify-center font-semibold md:font-bold"
            href="/"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <p className="underline text-sm md:text-base">Return To Homepage</p>
          </Link>
        </div>
      ) : <></>}
      <div ref={ref}>
        {props.isLoading && !props.isLastPage && (
          <p className="text-lg font-semibold text-center">
            <div className="container mx-auto my-10">
              <div className="mx-auto table">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="xMidYMid"
                  width="100"
                  height="100"
                  style={{
                    shapeRendering: "auto",
                    display: "block",
                    background: "transparent",
                  }}
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                  <g>
                    <circle
                      strokeDasharray="75.39822368615503 27.132741228718345"
                      r="16"
                      strokeWidth="4"
                      stroke={"rgb(0, 0, 0)"}
                      fill="none"
                      cy="50"
                      cx="50"
                    >
                      <animateTransform
                        keyTimes="0;1"
                        values="0 50 50;360 50 50"
                        dur="1.25s"
                        repeatCount="indefinite"
                        type="rotate"
                        attributeName="transform"
                      ></animateTransform>
                    </circle>
                    <g></g>
                  </g>
                </svg>
              </div>
            </div>
          </p>
        )}
      </div>
    </section>
  );
};

export default Products;
