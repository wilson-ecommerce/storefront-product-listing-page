/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { createContext } from 'preact';
import { useContext, useMemo } from 'preact/hooks';

import {
  QueryContextInput,
  RedirectRouteFunc,
  StoreDetailsConfig,
} from '../types/interface';

interface WithChildrenProps {
  children?: any;
}

export interface StoreDetailsProps extends WithChildrenProps {
  environmentId: string;
  environmentType: string;
  websiteCode: string;
  storeCode: string;
  storeViewCode: string;
  config: StoreDetailsConfig;
  context?: QueryContextInput;
  apiUrl: string;
  apiKey: string;
  route?: RedirectRouteFunc; // optional product redirect func prop
  searchQuery?: string; // 'q' default search query param if not provided.
  basicToken?: string;
  graphqlEndpoint?: string;
  inGridPromoIndexes?:Array<number>;
}

const StoreContext = createContext<StoreDetailsProps>({
  environmentId: '',
  environmentType: '',
  websiteCode: '',
  storeCode: '',
  storeViewCode: '',
  apiUrl: '',
  apiKey: '',
  config: {
    disableAllPurchases: false,
    addToCart: () => Promise.resolve({user_errors: []})
  },
  context: {},
  route: undefined,
  searchQuery: 'q',
  basicToken: '',
  graphqlEndpoint: '',
  inGridPromoIndexes: [],
});

const StoreContextProvider = ({
  children,
  environmentId,
  environmentType,
  websiteCode,
  storeCode,
  storeViewCode,
  config,
  context,
  apiKey,
  route,
  searchQuery,
  basicToken,
  graphqlEndpoint,
  inGridPromoIndexes,
}: StoreDetailsProps) => {
  const storeProps = useMemo(
    () => ({
      environmentId,
      environmentType,
      websiteCode,
      storeCode,
      storeViewCode,
      config,
      context: {
        customerGroup: context?.customerGroup ?? '',
        userViewHistory: context?.userViewHistory ?? [],
      },
      apiUrl: environmentType?.toLowerCase() === 'testing' ? TEST_URL : API_URL,
      apiKey:
        environmentType?.toLowerCase() === 'testing' && !apiKey
          ? SANDBOX_KEY
          : apiKey,
      route,
      searchQuery,
      graphqlEndpoint,
      basicToken,
      inGridPromoIndexes,
    }),
    [environmentId, websiteCode, storeCode, storeViewCode, inGridPromoIndexes]
  );

  const storeContext = {
    ...storeProps,
  };

  return (
    <StoreContext.Provider value={storeContext}>
      {children}
    </StoreContext.Provider>
  );
};

const useStore = () => {
  const storeCtx = useContext(StoreContext);
  return storeCtx;
};

export { StoreContextProvider, useStore };
