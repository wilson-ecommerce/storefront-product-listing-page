/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import './ImageCarousel.css';
import { FunctionComponent } from 'preact';
import { useState } from 'react';
import { useRef, useEffect } from 'preact/compat';
import { useIntersectionObserver } from '../../utils/useIntersectionObserver';

import Chevron from '../../icons/chevron-light.svg';

export interface ImageCarouselProps {
  images: string[] | { src: string; srcset: any }[];
  selectedColorSwatch: { sku: string; optionId: string; } | null;
  refineProduct: (optionIds: string[], sku: string) => any;
}

export const ImageCarousel: FunctionComponent<ImageCarouselProps> = ({
  images,
  selectedColorSwatch,
  refineProduct,
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const initialImagesValue:string[] = [];
  const [imagesCarousel, setImagesCarousel] = useState(initialImagesValue);
  const [imageWidth, setImageWidth] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);
  const entry = useIntersectionObserver(imageRef, { rootMargin: '200px' });
  const backImage = images.length > 1 
    ? (typeof images[1] === 'object' ? images[1].src : images[1])
    : '';
  const frontImage = images.length
    ? (typeof images[0] === 'object' ? images[0].src : images[0])
    : '';
  const [carouselInit, setCarouselInit] = useState(false);

  useEffect(() => {
    if (!entry) return;

    if (entry?.isIntersecting) {
      const image = entry.target;
      image.classList.remove("lazy");

      if (backImage) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = backImage;
        document.head.appendChild(preloadLink);
      }
    }

    if (imageRef.current) {
      const containerWidth = imageRef.current.offsetWidth;
      setImageWidth(containerWidth);
    }
  }, [entry]);

  const prevHandler = (e: Event) => {
    e.preventDefault();
    if (carouselIndex === 0) {
      setCarouselIndex(0);
    } else {
      setCarouselIndex(carouselIndex - 1);
    }
  };

  const nextHandler = (e: Event) => {
    e.preventDefault();
    if (carouselIndex === imagesCarousel.length) {
      setCarouselIndex(0);
    } else {
      setCarouselIndex(carouselIndex + 1);
    }
  };

  const hoverHandler = async(e: Event) => {
    e.preventDefault();
    if (selectedColorSwatch && !imagesCarousel.length && !carouselInit) {
      setCarouselInit(true);
      const { sku, optionId } = selectedColorSwatch;
      const data = await refineProduct([optionId], sku);
      const dataImages = data.refineProduct?.images.filter((img: { label: string; url: string; roles: string[]; }) => !img.roles.some((role) => ['image', 'thumbnail'].includes(role)) && img.url !== backImage?.replace(/\?.*/,''));
      if (dataImages) {
        setImagesCarousel(dataImages.flatMap((img: { url: string; }) => img.url));
      }
    }
  };

  const imagesWrapperWidth = imageWidth * (imagesCarousel?.length + 1);

  return (
    <>
      <meta itemProp="image" content={frontImage} />
      <div class="relative w-full pb-[122.22%]">
        <div class="ds-sdk-product-image-carousel max-w-2xl m-auto absolute h-full w-full" onMouseOver={(e: Event) => hoverHandler(e)}>
          {imagesCarousel?.length > 0 && (
            <Chevron className="h-[32px] w-md transform rotate-180 stroke-neutral-900 absolute top-mid left-2 z-1 transition ease-out duration-40" onClick={(e: Event) => prevHandler(e)}/>
          )}
          <div
            className="flex flex-nowrap overflow-hidden relative w-full h-full"
          >
            <div className="overflow-hidden relative w-full h-full">
              <div className={`${backImage || imagesCarousel?.length > 0 ? 'main-image' : ''} relative z-1 transition duration-40 w-full h-full`}>
                <div className="ds-sdk-product-image absolute h-full w-full m-auto bg-cover bg-no-repeat bg-position-center" 
                  style={{
                    'background-image': `url(${frontImage})`,
                  }} 
                  ref={imageRef} />
              </div>
              <div
                className={`flex transition ease-out duration-40 absolute top-0 w-full h-full`}
                style={{
                  transform: `translateX(-${carouselIndex * imageWidth}px)`,
                  width: `${imagesWrapperWidth}px`,
                }}
              >
                {backImage && (
                <div className="ds-sdk-product-image relative h-full w-full m-auto bg-cover bg-no-repeat bg-position-center lazy" style={{
                  'background-image': `url(${backImage})`,
                }} />
                )}
                {imagesCarousel && imagesCarousel.map((item, index) => {
                  return (
                      <div className="ds-sdk-product-image relative h-full w-full m-auto bg-cover bg-no-repeat bg-position-center" style={{
                        'background-image': `url(${item})`,
                      }} key={index} />
                  );
                })}
              </div>
            </div>
          </div>
          {imagesCarousel?.length > 0 && (
            <Chevron className="h-[32px] w-md transform stroke-neutral-900 absolute z-1 right-2 top-mid transition ease-out duration-40" onClick={(e: Event) => nextHandler(e)}/>
          )}
        </div>
      </div>
    </>
  );
};
