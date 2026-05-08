"use client";
import React from "react";
import Carousel from "./Carousel";
import { EmblaOptionsType } from "embla-carousel";

// Set SLIDE_COUNT to exactly 4
const SLIDE_COUNT = 4;
// Create array with exactly 4 elements
const SLIDES = Array.from({ length: SLIDE_COUNT }, (_, index) => index);

type Props = {
  widgetDetails?: any;
  activeTab?: any;
};

const OPTIONS: EmblaOptionsType = {
  dragFree: true,
  // Add containScroll option to ensure slides stay within bounds
  containScroll: "trimSnaps",
};

const ProductSliderLandingPage = (props: Props) => {


  return (
    <section className="pt-5 md:pt-0">
      <div className="max-w-full">
        <Carousel
          widgetDetails={props?.widgetDetails}
          slides={SLIDES}
          options={OPTIONS}
        />
      </div>
    </section>
  );
};

export default ProductSliderLandingPage;
