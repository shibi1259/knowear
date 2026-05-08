"use client";
import React from "react";
import Carousel from "../../../components/home/Carousel";
import { EmblaOptionsType } from "embla-carousel";
import WidgetHeader from "../widget-header/WidgetHeader";
import Link from "next/link";

const SLIDE_COUNT = 5;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());
type Props = {};

const OPTIONS: EmblaOptionsType = { dragFree: true };

const ProductSlider = (props: any) => {
  return (
    <>
      <section className="pt-5 md:pt-[50px]">
        <div className="container max-w-full">
          <div className="mb-[15px] lg:mb-[41px] flex justify-between items-center">
            <WidgetHeader widgetDetails={props.widgetDetails} />
            <Link href="/products">
              <button className="block md:hidden text-black text-[12px] underline text-primary font-normal">
                View All
              </button>
            </Link>
          </div>
          <Carousel widgetDetails={props.widgetDetails} slides={SLIDES} />
        </div>
      </section>
    </>
  );
};

export default ProductSlider;
