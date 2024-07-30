/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
// import 'preact/debug';

import { render } from 'preact';

import './styles/index.css';

import { getUserViewHistory } from '../src/utils/getUserViewHistory';
import {
  refineProductSearch,
} from './api/search';
import ProductItem from './components/ProductItem';
import App from './containers/App';
import {
  AttributeMetadataProvider,
  CartProvider,
  ProductsContextProvider,
  SearchProvider,
  StoreContextProvider,
  StoreDetailsProps,
} from './context/';
import Resize from './context/displayChange';
import Translation from './context/translation';
import { Product } from './types/interface';
import { validateStoreDetailsKeys } from './utils/validateStoreDetails';

type MountSearchPlpProps = {
  storeDetails: StoreDetailsProps;
  root: HTMLElement;
};

type MountProductCardProps = {
  storeDetails: StoreDetailsProps;
  root: HTMLElement;
  item: Product;
};

const LiveSearchPLP = ({ storeDetails, root }: MountSearchPlpProps) => {
  if (!storeDetails) {
    throw new Error("Livesearch PLP's storeDetails prop was not provided");
  }
  if (!root) {
    throw new Error("Livesearch PLP's Root prop was not provided");
  }

  const userViewHistory = getUserViewHistory();

  const updatedStoreDetails: StoreDetailsProps = {
    ...storeDetails,
    context: {
      ...storeDetails.context,
      userViewHistory,
    },
  };

  render(
    <StoreContextProvider {...validateStoreDetailsKeys(updatedStoreDetails)}>
      <AttributeMetadataProvider>
        <SearchProvider>
          <Resize>
            <Translation>
              <ProductsContextProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </ProductsContextProvider>
            </Translation>
          </Resize>
        </SearchProvider>
      </AttributeMetadataProvider>
    </StoreContextProvider>,
    root
  );
};

const ProductCard = async ({ storeDetails, root, item }: MountProductCardProps) => {
  if (!storeDetails) {
    throw new Error("Product cards's storeDetails prop was not provided");
  }
  if (!root) {
    throw new Error("Product card's Root prop was not provided");
  }

  const handleRefineProductSearch = async (
    optionIds: string[],
    sku: string
  ) => {
    const data = await refineProductSearch({ ...storeDetails, optionIds, sku });
    return data;
  };

  const props = {
    item,
    currencySymbol: storeDetails.config.currencySymbol || '',
    currencyRate: storeDetails.config.currencyRate,
    setRoute: storeDetails.route,
    refineProduct: handleRefineProductSearch,
  };

  render(
    <StoreContextProvider {...validateStoreDetailsKeys(storeDetails)}>
      <AttributeMetadataProvider>
        <SearchProvider>
          <Resize>
            <Translation>
                <CartProvider>
                  <ProductItem {...props}/>
                </CartProvider>
            </Translation>
          </Resize>
        </SearchProvider>
      </AttributeMetadataProvider>
    </StoreContextProvider>,
    root
  );
};

if (typeof window !== 'undefined' && !window.LiveSearchPLP) {
  window.LiveSearchPLP = LiveSearchPLP;
}

if (typeof window !== 'undefined' && !window.ProductCard) {
  window.ProductCard = ProductCard;
}
