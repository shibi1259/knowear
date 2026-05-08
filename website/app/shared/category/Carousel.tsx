'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import ProductCard from '@/app/shared/product-card/ProductCard'

type PropType = {
  slides: number[]
  widgetDetails: any
  options?: EmblaOptionsType
}

const Carousel: React.FC<PropType> = ({ slides, options, widgetDetails }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ ...options, slidesToScroll: 1 })
  const [scrollProgress, setScrollProgress] = useState(0)

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()))
    setScrollProgress(progress * 100)
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onScroll(emblaApi)
    emblaApi.on('reInit', onScroll).on('scroll', onScroll).on('slideFocus', onScroll)
  }, [emblaApi, onScroll])


  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container flex">
          {widgetDetails?.map((product: any, index: number) => (
            <div className="embla__slide w-1/2 lg:w-1/4 flex-[none!important] px-2" key={index}>
              <ProductCard productDetails={product} />
            </div>
          ))}
        </div>
      </div>
      <div className="embla__controls">
        {/* <div className="embla__progress">
          <div
            className="embla__progress__bar"
            style={{ transform: `translate3d(${scrollProgress}%,0px,0px)` }}
          />
        </div> */}
      </div>
    </div>
  )
}

export default Carousel