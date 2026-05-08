"use client";
import React, { useCallback, useEffect, useState } from "react";
import { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import ProductCard from "@/app/shared/product-card/ProductCard";

type PropType = {
  slides: number[];
  widgetDetails: any;
  options?: EmblaOptionsType;
};

const Carousel: React.FC<PropType> = (props: any) => {
  const { slides, options, widgetDetails } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [scrollProgress, setScrollProgress] = useState(0);

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress * 100);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onScroll(emblaApi);
    emblaApi
      .on("reInit", onScroll)
      .on("scroll", onScroll)
      .on("slideFocus", onScroll);
  }, [emblaApi, onScroll]);

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {props?.widgetDetails?.products?.map((product: any, index: number) => {
            console.log("product", product)
            return (
            <div className="embla__slide" key={index}>
              <div className="embla__slide__number">
                <ProductCard productDetails={product} />
              </div>
            </div>
            )
          })}
        </div>
      </div>

      <div className="embla__controls">
        <div className="embla__progress">
          <div
            className="embla__progress__bar"
            style={{ transform: `translate3d(${scrollProgress}%,0px,0px)` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Carousel;
