/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { FunctionComponent } from 'preact';

import './ImageHover.css';
import { useRef, useEffect } from 'preact/compat';
import { useIntersectionObserver } from '../../utils/useIntersectionObserver';

export interface ImageCarouselProps {
  images: string[] | { src: string; srcset: any }[];
}

export const ImageHover: FunctionComponent<ImageCarouselProps> = ({
  images,
}) => {
    const backImage = images.length > 1 
    ? (typeof images[1] === 'object' ? images[1].src : images[1])
    : '';
    const imageRef = useRef<HTMLDivElement>(null);
    const entry = useIntersectionObserver(imageRef, { rootMargin: '200px' });

    useEffect(() => {
      if (!entry) return;

      if (entry?.isIntersecting) {
        var image = entry.target;
        image.classList.remove("lazy");

        if (backImage) {
          const preloadLink = document.createElement('link');
          preloadLink.rel = 'preload';
          preloadLink.as = 'image';
          preloadLink.href = backImage;
          document.head.appendChild(preloadLink);
        }
      }
    }, [entry]);

    return (
      <>
        <meta itemProp="image" content={typeof images[0] === 'object' ? images[0].src : images[0]} />
        <div class="relative w-full pb-[122.22%]">
          <div class={`ds-sdk-product-image ${backImage ? 'hover-enabled' : ''} absolute h-full w-full m-auto bg-cover bg-no-repeat bg-position-center lazy`}
              style={{
                '--image-url': `url('${typeof images[0] === 'object' ? images[0].src : images[0]}')`,
                '--hover-url': `url('${backImage}')`,
              }}
              ref={imageRef}
            />
        </div>
      </>
    );
};
