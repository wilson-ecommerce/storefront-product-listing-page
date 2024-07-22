/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { FunctionComponent } from 'preact';
import { ReactNode } from 'preact/compat';
import { useContext } from 'preact/hooks';

import { TranslationContext } from '../../context/translation';
import { Label, Product, RefinedProduct } from '../../types/interface';
import { getProductPrice } from '../../utils/getProductPrice';

export interface ProductPriceProps {
  isComplexProductView: boolean;
  item: Product | RefinedProduct;
  isBundle: boolean;
  isGrouped: boolean;
  isGiftCard: boolean;
  isConfigurable: boolean;
  discount: boolean | undefined;
  currencySymbol: string;
  currencyRate?: string;
  priceLabel?: Label;
}

export const ProductPrice: FunctionComponent<ProductPriceProps> = ({
  isComplexProductView,
  item,
  isBundle,
  isGrouped,
  isGiftCard,
  isConfigurable,
  discount,
  currencySymbol,
  currencyRate,
  priceLabel,
}: ProductPriceProps) => {
  const translation = useContext(TranslationContext);
  let price;

  if ('product' in item) {
    price =
      item?.product?.price_range?.minimum_price?.final_price ??
      item?.product?.price_range?.minimum_price?.regular_price;
  } else {
    price =
      item?.refineProduct?.priceRange?.minimum?.final ??
      item?.refineProduct?.price?.final;
  }
  const getBundledPrice = (
    item: Product | RefinedProduct,
    currencySymbol: string,
    currencyRate: string | undefined
  ) => {
    const bundlePriceTranslationOrder =
      translation.ProductCard.bundlePrice.split(' ');
    return bundlePriceTranslationOrder.map((word: string, index: any) =>
      word === '{fromBundlePrice}' ? (
        <span
          className="text-brand-600 font-headline-4-default mr-xs"
          key={index}
        >
          {getProductPrice(item, currencySymbol, currencyRate, false, true)}
        </span>
      ) : word === '{toBundlePrice}' ? (
        <span
          className="text-brand-600 font-headline-4-default mr-xs"
          key={index}
        >
          {getProductPrice(item, currencySymbol, currencyRate, true, true)}
        </span>
      ) : (
        <span
          className="text-brand-300 font-headline-4-default mr-xs"
          key={index}
        >
          {word}
        </span>
      )
    );
  };

  const getPriceFormat = (
    item: Product | RefinedProduct,
    currencySymbol: string,
    currencyRate: string | undefined,
    isGiftCard: boolean
  ) => {
    const priceTranslation = isGiftCard
      ? translation.ProductCard.from
      : translation.ProductCard.startingAt;
    const startingAtTranslationOrder = priceTranslation.split('{productPrice}');
    return startingAtTranslationOrder.map((word: string, index: any) =>
      word === '' ? (
        getProductPrice(item, currencySymbol, currencyRate, false, true)
      ) : (
        <span
          className="text-brand-300 font-details-caption-3 mr-xs"
          key={index}
        >
          {word}
        </span>
      )
    );
  };

  const getDiscountedPrice = (discount: boolean | undefined) => {
    const discountPrice = discount ? (
      <>
        <span className="line-through text-black">
          {getProductPrice(item, currencySymbol, currencyRate, false, false)}
        </span>
        <span className="font-headline-4-strong text-neutral-700 ml-2">
          {getProductPrice(item, currencySymbol, currencyRate, false, true)}
        </span>
      </>
    ) : (
      getProductPrice(item, currencySymbol, currencyRate, false, true)
    );
    // const discountedPriceTranslation = translation.ProductCard.asLowAs;
    // const discountedPriceTranslationOrder =
    //   discountedPriceTranslation.split('{discountPrice}');
    return discountPrice;
    // return discountedPriceTranslationOrder.map((word: string, index: any) =>
    //   word === '' ? (
    //     discountPrice
    //   ) : (
    //     <span
    //       className="text-brand-300 font-headline-4-default mr-xs"
    //       key={index}
    //     >
    //       {word}
    //     </span>
    //   )
    // );
  };

  const renderPriceWithLabel = (price: string | ReactNode) => {
    const priceClass = priceLabel ? 'line-through' : '';

    return (
      <span className="price-wrapper">
        <span className={priceClass}>{price}</span>
        {priceLabel && (
          <span className="ml-2 text-neutral-700">{priceLabel.txt}</span>
        )}
      </span>
    );
  };

  const priceContent = (() => {
    if (!price) return null;

    if (isBundle) {
      return (
        <div className="ds-sdk-product-price--bundle">
          <p className="mt-xs font-headline-4-default">
            {renderPriceWithLabel(
              getBundledPrice(item, currencySymbol, currencyRate)
            )}
          </p>
        </div>
      );
    }

    if (isGrouped) {
      return (
        <p className="ds-sdk-product-price--grouped font-headline-4-strong">
          {renderPriceWithLabel(
            getPriceFormat(item, currencySymbol, currencyRate, false)
          )}
        </p>
      );
    }

    if (isGiftCard) {
      return (
        <p className="ds-sdk-product-price--gift-card font-headline-4-strong">
          {renderPriceWithLabel(
            getPriceFormat(item, currencySymbol, currencyRate, true)
          )}
        </p>
      );
    }

    if (isConfigurable || isComplexProductView) {
      return (
        <p className="ds-sdk-product-price--configurable font-headline-4-strong">
          {renderPriceWithLabel(getDiscountedPrice(discount))}
        </p>
      );
    }

    if (discount) {
      return (
        <p className="ds-sdk-product-price--discount font-headline-4-strong">
          <span className="line-through pr-2 text-brand-300">
            {getProductPrice(item, currencySymbol, currencyRate, false, false)}
          </span>
          <span className="text-brand-600">
            {getProductPrice(item, currencySymbol, currencyRate, false, true)}
          </span>
        </p>
      );
    }

    return (
      <p className="ds-sdk-product-price--no-discount font-headline-4-strong">
        {renderPriceWithLabel(
          getProductPrice(item, currencySymbol, currencyRate, false, true)
        )}
      </p>
    );
  })();

  return (
    <>{price && <div className="ds-sdk-product-price">{priceContent}</div>}</>
  );
};

export default ProductPrice;
