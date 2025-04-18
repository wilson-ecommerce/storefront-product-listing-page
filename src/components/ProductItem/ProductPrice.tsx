/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { FunctionComponent } from 'preact';
import { useContext } from 'preact/hooks';

import { TranslationContext } from '../../context/translation';
import { Label, Product, RefinedProduct } from '../../types/interface';
import { getOnlyProductPrice, getProductPrice } from '../../utils/getProductPrice';

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
  inStock?: boolean | undefined;
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
  inStock
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
          <meta itemProp="price" content={getOnlyProductPrice(
              item,
              currencyRate,
              false,
              true)}/>
            {getProductPrice(item, currencySymbol, currencyRate, false, true)}
        </span>
      ) : word === '{toBundlePrice}' ? (
          <span
              className="text-brand-600 font-headline-4-default mr-xs"
              key={index}
          >
            <meta itemProp="price" content={getOnlyProductPrice(
                item,
                currencyRate,
                true,
                true)}/>
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
    const productSalability = item.productView?.attributes?.find((attr) =>
        attr.name === 'pcm_product_salability')?.value;
    if (productSalability === 'SOLD_OUT') {
      return (
          <>
        <span className="line-through text-back">
          {getProductPrice(item, currencySymbol, currencyRate, false, true)}
        </span>
          </>
      );
    }

    const discountPrice = discount ? (
      <>
        <span className="font-medium text-labelRed mr-2">
          <meta itemProp="price" content={getOnlyProductPrice(
            item,
            currencyRate,
            false,
            true)}/>
          {getProductPrice(item, currencySymbol, currencyRate, false, true)}
        </span>
        <span className="line-through text-neutral-700">
          {getProductPrice(item, currencySymbol, currencyRate, false, false)}
        </span>
      </>
    ) : (
        <>
          <meta itemProp="price" content={getOnlyProductPrice(
            item,
            currencyRate,
            false,
            true)}/>
          {getProductPrice(item, currencySymbol, currencyRate, false, true)}
        </>
      );

    return discountPrice;
  };

  const getPriceLabel = () => {
    if (priceLabel) {
      return <span className="ml-2 text-neutral-700">{priceLabel.txt}</span>;
    }
  };

  // const renderPriceWithLabel = (price: string | ReactNode) => {
  //   const priceClass = priceLabel ? 'line-through' : '';

  //   return (
  //     <span className="price-wrapper">
  //       <span className={priceClass}>{price}</span>
  //       {priceLabel && <span>{priceLabel.txt}</span>}
  //     </span>
  //   );
  // };

  return (
    <>
      {price && (
        <div
          className="ds-sdk-product-price"
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
        >
          <meta itemProp="priceCurrency" content="USD" />
          <meta
            itemProp="availability"
            content={inStock ? 'InStock' : 'OutOfStock'}
          />
          {!isBundle &&
            !isGrouped &&
            !isConfigurable &&
            !isComplexProductView &&
            discount && (
              <p className="ds-sdk-product-price--discount font-headline-4-strong">
                <span className="line-through pr-2 text-brand-300">
                  {getProductPrice(
                    item,
                    currencySymbol,
                    currencyRate,
                    false,
                    false
                  )}
                </span>
                <span className="text-labelRed">
                  <meta
                    itemProp="price"
                    content={getOnlyProductPrice(
                      item,
                      currencyRate,
                      false,
                      true
                    )}
                  />
                  {getProductPrice(
                    item,
                    currencySymbol,
                    currencyRate,
                    false,
                    true
                  )}
                </span>
                {getPriceLabel()}
              </p>
            )}

          {!isBundle &&
            !isGrouped &&
            !isGiftCard &&
            !isConfigurable &&
            !isComplexProductView &&
            !discount && (
              <p className="ds-sdk-product-price--no-discount font-headline-4-strong">
                <meta
                  itemProp="price"
                  content={getOnlyProductPrice(item, currencyRate, false, true)}
                />
                {getProductPrice(
                  item,
                  currencySymbol,
                  currencyRate,
                  false,
                  true
                )}
                {getPriceLabel()}
              </p>
            )}

          {isBundle && (
            <div className="ds-sdk-product-price--bundle">
              <p className="mt-xs font-headline-4-default">
                {getBundledPrice(item, currencySymbol, currencyRate)}
                {getPriceLabel()}
              </p>
            </div>
          )}

          {isGrouped && (
            <p className="ds-sdk-product-price--grouped font-headline-4-strong">
              {getPriceFormat(item, currencySymbol, currencyRate, false)}
              {getPriceLabel()}
            </p>
          )}

          {isGiftCard && (
            <p className="ds-sdk-product-price--gift-card font-headline-4-strong">
              {getPriceFormat(item, currencySymbol, currencyRate, true)}
              {getPriceLabel()}
            </p>
          )}

          {!isGrouped &&
            !isBundle &&
            (isConfigurable || isComplexProductView) && (
              <p className="ds-sdk-product-price--configurable font-headline-4-strong">
                {getDiscountedPrice(discount)}
                {getPriceLabel()}
              </p>
            )}
        </div>
      )}
    </>
  );
};

export default ProductPrice;
