/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { v4 as uuidv4 } from 'uuid';

import { updateSearchInputCtx, updateSearchResultsCtx } from '../context';
import {
  AttributeMetadataResponse,
  ClientProps,
  MagentoHeaders,
  ProductSearchQuery,
  ProductSearchResponse,
  RefinedProduct,
  RefineProductQuery,
} from '../types/interface';
import { SEARCH_UNIT_ID } from '../utils/constants';
import { Product, ProductView } from './fragments';
import {
  ATTRIBUTE_METADATA_QUERY,
  CATEGORY_QUERY,
  FranchiseQueryFragment,
  PRODUCT_SEARCH_QUERY,
  REFINE_PRODUCT_QUERY,
} from './queries';

const getHeaders = (headers: MagentoHeaders) => {
  return {
    'Magento-Environment-Id': headers.environmentId,
    'Magento-Website-Code': headers.websiteCode,
    'Magento-Store-Code': headers.storeCode,
    'Magento-Store-View-Code': headers.storeViewCode,
    'X-Api-Key': headers.apiKey,
    'X-Request-Id': headers.xRequestId,
    'Content-Type': 'application/json',
    'Magento-Customer-Group': headers.customerGroup,
  };
};


const discontinuedFilter = {
  attribute: 'pcm_product_salability',
  in: ['STANDARD','COMING_SOON','DRAW_CAMPAIGN','EARLY_ACCESS','SOLD_OUT','PRE_ORDER','NOT_SOLD_ONLINE'],
};

const discontinuedFilterString = `{
              attribute: "pcm_product_salability",
              in: ["STANDARD", "COMING_SOON", "DRAW_CAMPAIGN", "EARLY_ACCESS", "SOLD_OUT", "PRE_ORDER", "NOT_SOLD_ONLINE"],
            }`;
const isSlugger = window.location.hostname.indexOf('slugger') !== -1;

const getFranchiseSearch = async ({
  environmentId,
  websiteCode,
  storeCode,
  storeViewCode,
  apiKey,
  apiUrl,
  xRequestId = uuidv4(),
  context,
  categories = [],
  pageSize = 20,
  currentPage = 1,
}: {
  environmentId: string;
  websiteCode: string;
  storeCode: string;
  storeViewCode: string;
  apiKey: string;
  apiUrl: string;
  xRequestId?: string;
  context?: any;
  categories: string[];
  pageSize?: number;
  currentPage?: number;
}) => {
  const headers = getHeaders({
    environmentId,
    websiteCode,
    storeCode,
    storeViewCode,
    apiKey,
    xRequestId,
    customerGroup: context?.customerGroup ?? '',
  });

  const query = `
    query getFranchises(
      $pageSize: Int = 20
      $currentPage: Int = 1
    ) {
      ${categories.map((category) => `
        ${category.split('/').at(-1)?.replaceAll('-', '')}: productSearch(
          phrase: "",
          page_size: $pageSize
          current_page: $currentPage
          filter: [
            { attribute: "categoryPath", eq: "${category}" },
            ${isSlugger ? '' : discontinuedFilterString}
          ]
        ) {
          items {
            ... FRANCHISE_QUERY
          }
        }
      `).join(' ')}
    }
    ${Product}
    ${ProductView}
    ${FranchiseQueryFragment}
  `;
  const variables = {
    pageSize,
    currentPage,
  };

  const results = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: query.replace(/(?:\r\n|\r|\n|\t|[\s]{4})/g, ' ').replace(/\s\s+/g, ' '),
      variables,
    }),
  }).then((res) => res.json());

  return results?.data;
}

const getProductSearch = async ({
  environmentId,
  websiteCode,
  storeCode,
  storeViewCode,
  apiKey,
  apiUrl,
  phrase,
  pageSize = 24,
  displayOutOfStock,
  currentPage = 1,
  xRequestId = uuidv4(),
  filter = [],
  sort = [],
  context,
  categorySearch = false,
  categoryId,
  route,
}: ProductSearchQuery & ClientProps): Promise<
  ProductSearchResponse['data']
> => {
  const variables = {
    phrase,
    pageSize,
    currentPage,
    filter,
    sort,
    categoryId,
    context,
  };

  // default filters if search is "catalog (category)" or "search"
  let searchType = 'Search';
  if (categorySearch) {
    searchType = 'Catalog';
  }
  const defaultFilters = {
    attribute: 'visibility',
    in: [searchType, 'Catalog, Search'],
  };

  variables.filter.push(defaultFilters); //add default visibility filter

  const displayInStockOnly = displayOutOfStock != '1'; // '!=' is intentional for conversion

  const inStockFilter = {
    attribute: 'inStock',
    eq: 'true',
  };


  if (!isSlugger) {
  variables.filter?.push(discontinuedFilter);
  }

  if (displayInStockOnly) {
    variables.filter.push(inStockFilter);
  }

  const headers = getHeaders({
    environmentId,
    websiteCode,
    storeCode,
    storeViewCode,
    apiKey,
    xRequestId,
    customerGroup: context?.customerGroup ?? '',
  });

  // ======  initialize data collection =====
  const searchRequestId = uuidv4();

  updateSearchInputCtx(
    SEARCH_UNIT_ID,
    searchRequestId,
    phrase,
    filter,
    pageSize,
    currentPage,
    sort
  );

  window.adobeDataLayer.push((dl: any) => {
    dl.push({
      event: 'search-request-sent',
      eventInfo: { ...dl.getState(), searchUnitId: SEARCH_UNIT_ID },
    });
  });
  // ======  end of data collection =====

  const query =
    categorySearch && categoryId ? CATEGORY_QUERY : PRODUCT_SEARCH_QUERY;
  const results = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: query
        .replace(/(?:\r\n|\r|\n|\t|[\s]{4})/g, ' ')
        .replace(/\s\s+/g, ' '),
      variables: { ...variables },
    }),
  }).then((res) => res.json());

  // ======  initialize data collection =====
  updateSearchResultsCtx(
    SEARCH_UNIT_ID,
    searchRequestId,
    results?.data?.productSearch,
    route
  );

  window.adobeDataLayer.push((dl: any) => {
    dl.push({
      event: 'search-response-received',
      eventInfo: { ...dl.getState(), searchUnitId: SEARCH_UNIT_ID },
    });
  });

  if (categorySearch && categoryId) {
    window.adobeDataLayer.push((dl: any) => {
      dl.push({ categoryContext: results?.data?.categories?.[0] });
      dl.push({
        event: 'category-results-view',
        eventInfo: { ...dl.getState(), searchUnitId: SEARCH_UNIT_ID },
      });
    });
  } else {
    window.adobeDataLayer.push((dl: any) => {
      dl.push({
        event: 'search-results-view',
        eventInfo: { ...dl.getState(), searchUnitId: SEARCH_UNIT_ID },
      });
    });
  }
  // ======  end of data collection =====

  return results?.data;
};

const getAttributeMetadata = async ({
  environmentId,
  websiteCode,
  storeCode,
  storeViewCode,
  apiKey,
  apiUrl,
  xRequestId = uuidv4(),
}: ClientProps): Promise<AttributeMetadataResponse['data']> => {
  const headers = getHeaders({
    environmentId,
    websiteCode,
    storeCode,
    storeViewCode,
    apiKey,
    xRequestId,
    customerGroup: '',
  });

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: ATTRIBUTE_METADATA_QUERY,
    }),
  });
  const results = await response.json();
  return results?.data;
};

const refineProductSearch = async ({
  environmentId,
  websiteCode,
  storeCode,
  storeViewCode,
  apiKey,
  apiUrl,
  xRequestId = uuidv4(),
  context,
  optionIds,
  sku,
}: RefineProductQuery & ClientProps): Promise<RefinedProduct> => {
  const variables = {
    optionIds,
    sku,
  };

  const headers = getHeaders({
    environmentId,
    websiteCode,
    storeCode,
    storeViewCode,
    apiKey,
    xRequestId,
    customerGroup: context?.customerGroup ?? '',
  });

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: REFINE_PRODUCT_QUERY,
      variables: { ...variables },
    }),
  });
  const results = await response.json();
  return results?.data;
};

export { getAttributeMetadata, getProductSearch, refineProductSearch, getFranchiseSearch };
