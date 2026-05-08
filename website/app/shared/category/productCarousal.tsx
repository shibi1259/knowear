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

const Carousel: React.FC<PropType> = (props) => {
  const { options, widgetDetails } = props
  const [isMobile, setIsMobile] = useState(false)

  // Adjust slidesToScroll based on screen size
  const [emblaRef, emblaApi] = useEmblaCarousel({
    ...options,
    slidesToScroll: 'auto',
    containScroll: 'keepSnaps',
    align: 'start',
    dragFree: true
  })

  const [scrollProgress, setScrollProgress] = useState(0)

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()))
    setScrollProgress(progress * 100)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    // Initial check
    checkMobile()

    // Add resize handler
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onScroll(emblaApi)
    emblaApi
      .on('reInit', onScroll)
      .on('scroll', onScroll)
      .on('slideFocus', onScroll)

    // Add resize handler to update carousel on window resize
    const handleResize = () => {
      if (!isMobile) {
        emblaApi.reInit()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [emblaApi, onScroll, isMobile])

  if (isMobile) {
    return (
      <div className="w-full px-4">
        <div className="grid grid-cols-2 gap-4">
          {props?.widgetDetails?.products.slice(0, 4).map((product: any, index: number) => (
            <div key={index} className="w-full">
              <ProductCard productDetails={product} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="embla">
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {props?.widgetDetails?.products.map((product: any, index: number) => (
              <div 
                className="embla__slide flex-grow-0 flex-shrink-0 pl-4 first:pl-0"
                key={index}
              >
                <div className="embla__slide__content">
                  <ProductCard productDetails={product} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .embla__container {
          display: flex;
          width: 100%;
        }
        .embla__viewport {
          overflow: hidden;
        }
        .embla__slide {
          min-width: 0;
          position: relative;
          flex: 0 0 33.333333%;
        }
        @media (min-width: 1024px) {
          .embla__slide {
            flex: 0 0 25%;
          }
        }
      `}</style>
    </div>
  )
}

export default Carousel