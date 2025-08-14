/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { FunctionComponent } from 'preact';
import { useRef } from 'preact/hooks';
import { useEffect, useState } from 'react';

import { SwatchType } from '../../types/interface';
import { SwatchButton } from '../SwatchButton';

import Chevron from '../../icons/chevron-right.svg';

export type Swatch = {
    id: string;
    title: string;
    type: SwatchType;
    value: string;
    sku: string;
    inStock?: boolean
    configId?: string;
};

export interface SwatchButtonGroupProps {
  isSelected: (id: string) => boolean | undefined;
  swatches: Swatch[];
  showMore: () => any;
  productUrl: string;
  onClick: (optionIds: string[], sku: string) => any;
}

export const SwatchButtonGroup: FunctionComponent<SwatchButtonGroupProps> = ({
  isSelected,
  swatches,
  showMore,
  onClick,
}: SwatchButtonGroupProps) => {
  const [visibleCount, setVisibleCount] = useState<number|null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const swatchButtonContainerRef = useRef<HTMLDivElement>(null);
  const swatchButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (swatchButtonContainerRef.current && swatchButtonRef.current) {
        const containerWidth = swatchButtonContainerRef.current.offsetWidth;
        const swatchWidth = swatchButtonRef.current.offsetWidth;
        const visibleSwatches = Math.floor(containerWidth / swatchWidth);
        setVisibleCount(visibleSwatches); 
      }
    };

    updateVisibleCount();

    const resizeObserver = new ResizeObserver(() => updateVisibleCount());
    if (swatchButtonContainerRef.current) {
      resizeObserver.observe(swatchButtonContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const handleArrowRightClick = (evt: Event) => {
    evt.preventDefault();
    if (visibleCount && carouselIndex + 1 < swatches.length/visibleCount) {
      setCarouselIndex(carouselIndex + 1);
    }
    showMore();
  }

  const handleArrowLeftClick = (evt: Event) => {
    evt.preventDefault();
    if (carouselIndex - 1 >= 0) {
      setCarouselIndex(carouselIndex - 1);
    }
  }

  const moreSwatches = visibleCount === null ? false : swatches.length > visibleCount;

  const swatchButtons = swatches.map((swatch, index) => {
    const handleClick = (evt: Event) => {
      evt.preventDefault();
      evt.stopPropagation();

      onClick([swatch.id], swatch.sku);
    }

    const checked = isSelected(swatch.id);
    const selectedClass = checked ? 'selected' : '';
    const outOfStockClass = swatch.inStock ? '' : 'out-of-stock';
    const wrapperClasses = `ds-sdk-product-item__product-swatch-item text-sm text-brand-700${swatch.type == 'COLOR_HEX' ? ' mr-2': ''} ${selectedClass} ${outOfStockClass}`;
    return (
      <div className={wrapperClasses} key={swatch.id} ref={index === 0  ? swatchButtonRef : null} data-config-id={swatch.configId || ''}>
          <SwatchButton
            title={swatch.title}
            id={swatch.id}
            value={swatch.value}
            type={swatch.type}
            checked={!!checked}
            onClick={handleClick}
          />
        </div>
      );
  });

  const translateX = swatchButtonRef && swatchButtonRef.current && visibleCount ? swatchButtonRef.current?.offsetWidth * visibleCount : 0;

  return (
    <div className="ds-sdk-product-item__product-swatch-group flex column items-center space-x-2 overflow-hidden px-xsmall" ref={swatchButtonContainerRef}>
      {(
        <div className="flex h-full w-full overflow-hidden">
          {moreSwatches ? (
            <button onClick={handleArrowLeftClick} className="absolute left-0 h-[44px]" aria-label="Next swatches">
              <Chevron aria-hidden="true" className="transform rotate-180"/> 
            </button>
          ) : ''}
          <div className={`flex h-full w-full transition`} style={{
                transform: `translateX(-${carouselIndex * translateX}px)`,
              }}>{swatchButtons}</div>
          {moreSwatches ? (
            <button onClick={handleArrowRightClick} className="absolute right-0 h-[44px]" aria-label="Previous swatches">
              <Chevron aria-hidden="true"/> 
            </button>
          ) : ''}
        </div>
        )
      }
    </div>
  );
};
