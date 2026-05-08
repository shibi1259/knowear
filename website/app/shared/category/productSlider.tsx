"use client";
import React from "react";
import Carousel from "../../../components/home/Carousel";
import { EmblaOptionsType } from "embla-carousel";
import WidgetHeader from "../widget-header/WidgetHeader";
import Link from "next/link";

// Set SLIDE_COUNT to exactly 4
const SLIDE_COUNT = 4;
// Create array with exactly 4 elements
const SLIDES = Array.from({ length: SLIDE_COUNT }, (_, index) => index);

type Props = {
  widgetDetails?: any;
};

const OPTIONS: EmblaOptionsType = {
  dragFree: true,
  // Add containScroll option to ensure slides stay within bounds
  containScroll: 'trimSnaps'
};

const ProductSlider = (props: Props) => {

  return (
    <section className="pt-2 md:pt-10">
      <div className="max-w-full">
        <div className="mb-[15px] lg:mb-[41px] flex justify-between items-center">
          <WidgetHeader widgetDetails={props.widgetDetails} />
          <Link href="/products">
            {/* <button className="block md:hidden text-black text-[12px] underline text-primary font-normal">
              View All
            </button> */}
          </Link>
        </div>
        <Carousel 
          widgetDetails={props.widgetDetails} 
          slides={SLIDES}
          options={OPTIONS}
        />
      </div>
    </section>
  );
};

export default ProductSlider;
