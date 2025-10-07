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
import { generateOptimizedImages } from '../../utils/getProductImage';
import { useSensor } from '../../context';

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
  const { screenSize } = useSensor();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const initialImagesValue:string[] = [];
  const [imagesCarousel, setImagesCarousel] = useState(initialImagesValue);
  const [imagesCarouselSize, setImagesCarouselSize] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);
  const imageFrontMobileRef = useRef<HTMLDivElement>(null);
  const entry = useIntersectionObserver(imageRef, { rootMargin: '200px' });
  const imageBackRef = useRef<HTMLDivElement>(null);
  const backImage = images.length > 1 
    ? (typeof images[1] === 'object' ? images[1].src : images[1])
    : '';
  const frontImage = images.length
    ? (typeof images[0] === 'object' ? images[0].src : images[0])
    : '';
  const [prevSelectedSwatchSku, setPrevSelectedSwatchSku] = useState('');
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [origin, setOrigin] = useState(0);
  const [lastTranslate, setLastTranslate] = useState(0);
  const [lastPos, setLastPos] = useState(0);

  const loadCarousel = async() => {
    if (selectedColorSwatch && selectedColorSwatch.sku !== prevSelectedSwatchSku) {
      const { sku, optionId } = selectedColorSwatch;
      setPrevSelectedSwatchSku(sku);
      const data = await refineProduct([optionId], sku);
      const dataImages = data.refineProduct?.images.filter((img: { label: string; url: string; roles: string[]; }) => !img.roles.some((role) => ['image', 'thumbnail', 'swatch_image', 'small_image'].includes(role)) && img.url !== backImage?.replace(/\?.*/,''));
      if (dataImages) {
        const dataImagesUrls = dataImages.flatMap((img: { url: string; }) => img.url);
        const optimizedImageArray = generateOptimizedImages(
          dataImagesUrls,
          imageWidth || imageRef.current?.offsetWidth || 420,
          ''
        );

        const images = optimizedImageArray.flatMap((img: { src: string; }) => img.src);
        setImagesCarousel(images);
        let size = backImage ?  images?.length + 1 : images?.length;
        if (screenSize.mobile) {
          size = size + 1;
        }
        setImagesCarouselSize(size);
      }
    }
  };

  useEffect(() => {
    if (!entry) return;

    if (entry.isIntersecting) {
      entry.target.classList.remove('lazy');

      if (backImage) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = backImage;
        document.head.appendChild(preloadLink);
        if (imageBackRef.current) imageBackRef.current.classList.remove('lazy');
        setImagesCarouselSize(1);
      }

      if (imageFrontMobileRef.current) imageFrontMobileRef.current.classList.remove('lazy');

      if (imageRef.current) imageRef.current.classList.remove('lazy');

      if (screenSize.mobile) loadCarousel();
    }

    if (imageRef.current) {
      const containerWidth = imageRef.current.offsetWidth;
      setImageWidth(containerWidth);
    }
  }, [entry]);

  const prevHandler = (e: Event) => {
    e.preventDefault();
    let newIndex = 0;
    if (carouselIndex > 0) {
      setCarouselIndex(carouselIndex - 1);
      newIndex = carouselIndex - 1;
    }
    setCarouselIndex(newIndex);
    setLastTranslate(newIndex * imageWidth);
  };

  const nextHandler = (e: Event) => {
    e.preventDefault();
    let newIndex = 0;
    if (carouselIndex < imagesCarouselSize - 1) {
      newIndex = carouselIndex + 1;
    }
    setCarouselIndex(newIndex);
    setLastTranslate(newIndex * imageWidth);
  };

  const startDragHandle = async(e: TouchEvent) => {
    setOrigin(e.touches[0].screenX);
    setDragging(false);
  };

  const dragHandle = async(e: TouchEvent) => {
    e.preventDefault();
    setDragging(true);
      const pos = {
        x: e.touches[0].screenX - origin - lastTranslate,
        y: e.touches[0].screenY
      };
      if (e.touches && Math.abs(pos.x) > Math.abs(pos.y)) {
        e.preventDefault();
        e.stopPropagation();
      }
      setLastPos(e.touches[0].screenX - origin);
      setDragX(pos.x);
  };

  const stopDragHandle = async(e: Event) => {
    if (dragging) {
      e.preventDefault();
    }

    if (dragging && lastPos) {
      setDragging(false);
      if (Math.abs(lastPos / imageWidth) > .2 ) {
        lastPos < 0 ? nextHandler(e) : prevHandler(e);
      }
    }
  };

  const hoverHandler = async(e: Event) => {
    e.preventDefault();
    if (screenSize.desktop) {
      loadCarousel();
    }
  };

  const imagesWrapperWidth = imageWidth * imagesCarouselSize;
  const translateX = dragging ? -dragX : carouselIndex * imageWidth;
  const progressBarWidth = (carouselIndex + 1) * 100 / imagesCarouselSize;

  return (
    <>
      <meta itemProp="image" content={frontImage} />
      <div class="relative w-full pb-[122.22%]">
        <div class="ds-sdk-product-image-carousel m-auto absolute h-full w-full" 
          onTouchMove={dragHandle}
          onTouchStart={startDragHandle}
          onTouchEnd={stopDragHandle}
          onMouseOver={(e: Event) => hoverHandler(e)}
          >
          {imagesCarouselSize > 1 && (
            <Chevron className="h-[32px] w-md transform rotate-180 stroke-neutral-900 absolute top-mid left-2 z-1 transition ease-out duration-40" onClick={(e: Event) => prevHandler(e)}/>
          )}
          <div
            className="flex flex-nowrap overflow-hidden relative w-full h-full"
          >
            <div className="overflow-hidden relative w-full h-full">
              <div className={`${backImage || imagesCarousel?.length > 0 ? 'main-image' : ''} relative z-1 transition duration-40 w-full h-full`}>
                <div className="ds-sdk-product-image absolute h-full w-full m-auto bg-cover bg-no-repeat bg-position-center lazy" 
                  style={{
                    '--image-url': `url('${frontImage}')`,
                  }} 
                  ref={imageRef} />
              </div>
              <div
                className={`flex transition ease-out duration-40 absolute top-0 w-full h-full`}
                style={{
                  transform: `translateX(-${translateX}px)`,
                  width: `${imagesWrapperWidth}px`,
                }}
              >
                {screenSize.mobile && (
                  <div className="ds-sdk-product-image relative h-full w-full m-auto bg-cover bg-no-repeat bg-position-center lazy" style={{
                    '--image-url': `url(${frontImage})`,
                  }}
                  ref={imageFrontMobileRef} />
                )}
                {backImage && (
                  <div className="ds-sdk-product-image relative h-full w-full m-auto bg-cover bg-no-repeat bg-position-center lazy" style={{
                    '--image-url': `url(${backImage})`,
                  }} ref={imageBackRef}/>
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
          {imagesCarouselSize > 1 && (
            <Chevron className="h-[32px] w-md transform stroke-neutral-900 absolute z-1 right-2 top-mid transition ease-out duration-40" onClick={(e: Event) => nextHandler(e)}/>
          )}
          {imagesCarouselSize > 1 && (
            <div className="progress-bar">
              <span style={{
                '--progress-width': `${progressBarWidth}%`,
              }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
