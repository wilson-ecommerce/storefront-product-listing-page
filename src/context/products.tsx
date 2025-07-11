/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { createContext } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { getGraphQL } from 'src/api/graphql';
import { GET_PRODUCT_LABELS_QUERY } from 'src/api/queries';
import { getColorSwatchesFromAttribute } from 'src/utils/productUtils';

import {
  getFranchiseSearch,
  getProductSearch,
  refineProductSearch,
} from '../api/search';
import {
  CategoryView,
  Facet,
  FacetFilter,
  Label,
  PageSizeOption,
  Product,
  ProductSearchQuery,
  ProductSearchResponse,
  RedirectRouteFunc,
  SearchClauseInput,
} from '../types/interface';
import {
  CATEGORY_SORT_DEFAULT,
  DEFAULT_MIN_QUERY_LENGTH,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  SEARCH_SORT_DEFAULT,
} from '../utils/constants';
import { moveToTop } from '../utils/dom';
import {
  getFiltersFromUrl,
  getValueFromUrl,
  handleUrlPagination,
} from '../utils/handleUrlFilters';
import { useAttributeMetadata } from './attributeMetadata';
import { useSearch } from './search';
import { useStore } from './store';
import { useTranslation } from './translation';

interface WithChildrenProps {
  children?: any;
}

type Franchise = {
  items: Product[];
} & CategoryView;

const ProductsContext = createContext<{
  variables: ProductSearchQuery;
  loading: boolean;
  items: Product[];
  setItems: (items: Product[]) => void;
  labels: Label[];
  setLabels: (labels: Label[]) => void;
  franchises: any;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalCount: number;
  setTotalCount: (count: number) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  facets: Facet[];
  setFacets: (facets: Facet[]) => void;
  categoryName: string;
  setCategoryName: (categoryName: string) => void;
  currencySymbol: string;
  setCurrencySymbol: (currencySymbol: string) => void;
  currencyRate: string;
  setCurrencyRate: (currencyRate: string) => void;
  minQueryLength: string | number;
  minQueryLengthReached: boolean;
  setMinQueryLengthReached: (minQueryLengthReached: boolean) => void;
  pageSizeOptions: PageSizeOption[];
  setRoute: RedirectRouteFunc | undefined;
  refineProduct: (optionIds: string[], sku: string) => any;
  pageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
  categoryPath: string | undefined;
  categoryConfig: Record<string, any> | undefined;
  viewType: string;
  setViewType: (viewType: string) => void;
  listViewType: string;
  setListViewType: (viewType: string) => void;
  resolveCartId?: () => Promise<string | undefined>;
  refreshCart?: () => void;
  addToCart: (
    sku: string,
    options: string[],
    quantity: number
  ) => Promise<{ user_errors: any[] }>;
  disableAllPurchases?: boolean;
  getMoreFranchiseProducts: (
    category: string,
    pageSize: number,
    currentPage: number
  ) => void;
}>({
  variables: {
    phrase: '',
  },
  loading: false,
  items: [],
  setItems: () => {},
  labels: [],
  setLabels: () => {},
  currentPage: 1,
  setCurrentPage: () => {},
  pageSize: DEFAULT_PAGE_SIZE,
  setPageSize: () => {},
  totalCount: 0,
  setTotalCount: () => {},
  totalPages: 0,
  setTotalPages: () => {},
  facets: [],
  setFacets: () => {},
  categoryName: '',
  setCategoryName: () => {},
  currencySymbol: '',
  setCurrencySymbol: () => {},
  currencyRate: '',
  setCurrencyRate: () => {},
  minQueryLength: DEFAULT_MIN_QUERY_LENGTH,
  minQueryLengthReached: false,
  setMinQueryLengthReached: () => {},
  pageSizeOptions: [],
  setRoute: undefined,
  refineProduct: () => {},
  pageLoading: false,
  setPageLoading: () => {},
  categoryPath: undefined,
  categoryConfig: undefined,
  viewType: '',
  setViewType: () => {},
  listViewType: '',
  setListViewType: () => {},
  resolveCartId: () => Promise.resolve(''),
  refreshCart: () => {},
  addToCart: () => Promise.resolve({ user_errors: [] }),
  disableAllPurchases: false,
  franchises: null,
  getMoreFranchiseProducts: () => {},
});

const ProductsContextProvider = ({ children }: WithChildrenProps) => {
  const urlValue = getValueFromUrl('p');
  const pageDefault = urlValue ? Number(urlValue) : 1;

  const searchCtx = useSearch();
  const storeCtx = useStore();
  const attributeMetadataCtx = useAttributeMetadata();

  const pageSizeValue = getValueFromUrl('page_size');
  const defaultPageSizeOption =
    Number(storeCtx?.config?.perPageConfig?.defaultPageSizeOption) ||
    DEFAULT_PAGE_SIZE;
  const pageSizeDefault = pageSizeValue
    ? Number(pageSizeValue)
    : defaultPageSizeOption;

  const translation = useTranslation();

  const showAllLabel = translation.ProductContainers.showAll;

  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [items, setItems] = useState<Product[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [franchises, setFranchises] = useState<Record<
    string,
    Franchise
  > | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(pageDefault);
  const [pageSize, setPageSize] = useState<number>(pageSizeDefault);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [facets, setFacets] = useState<Facet[]>([]);
  const [categoryName, setCategoryName] = useState<string>(
    storeCtx?.config?.categoryName ?? ''
  );
  const [pageSizeOptions, setPageSizeOptions] = useState<PageSizeOption[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState<string>(
    storeCtx?.config?.currencySymbol ?? ''
  );
  const [currencyRate, setCurrencyRate] = useState<string>(
    storeCtx?.config?.currencyRate ?? ''
  );
  const [minQueryLengthReached, setMinQueryLengthReached] =
    useState<boolean>(false);
  const minQueryLength = useMemo(() => {
    return storeCtx?.config?.minQueryLength || DEFAULT_MIN_QUERY_LENGTH;
  }, [storeCtx?.config.minQueryLength]);
  const categoryPath = storeCtx.config?.currentCategoryUrlPath;
  const categoryId = storeCtx.config?.currentCategoryId;
  const categoryConfig = storeCtx.config?.categoryConfig;
  const categoriesExtraInfo = storeCtx.config?.categoriesExtraInfo;

  const viewTypeFromUrl = getValueFromUrl('view_type');
  const [viewType, setViewType] = useState<string>(
    viewTypeFromUrl ? viewTypeFromUrl : 'gridView'
  );
  const [listViewType, setListViewType] = useState<string>('default');

  const variables = useMemo(() => {
    return {
      phrase: searchCtx.phrase,
      filter: searchCtx.filters,
      sort: searchCtx.sort,
      context: storeCtx.context,
      pageSize,
      displayOutOfStock: storeCtx.config.displayOutOfStock,
      currentPage,
    };
  }, [
    searchCtx.phrase,
    searchCtx.filters,
    searchCtx.sort,
    storeCtx.context,
    storeCtx.config.displayOutOfStock,
    pageSize,
    currentPage,
  ]);

  const handleRefineProductSearch = async (
    optionIds: string[],
    sku: string
  ) => {
    const data = await refineProductSearch({ ...storeCtx, optionIds, sku });
    return data;
  };

  const getMoreFranchiseProducts = async (
    categoryPath: string,
    pageSize: number,
    currentPage: number
  ) => {
    if (!categoryPath) {
      return;
    }

    const result = await getFranchiseSearch({
      ...variables,
      ...storeCtx,
      pageSize,
      currentPage,
      apiUrl: storeCtx.apiUrl,
      categories: [categoryPath],
    });

    const category = categoryPath.split('/').at(-1)?.replaceAll('-', '') || '';
    if (result?.[category]?.items?.length === 0) {
      return;
    }

    setFranchises((franchises) => {
      if (!franchises) {
        return franchises;
      }

      return {
        ...franchises,
        [category]: {
          ...franchises[category],
          pageSize,
          currentPage,
          items: [...franchises[category].items, ...result[category].items],
        },
      };
    });
  };

  const context = {
    variables,
    loading,
    items,
    setItems,
    labels,
    setLabels,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalCount,
    setTotalCount,
    totalPages,
    setTotalPages,
    facets,
    setFacets,
    categoryName,
    setCategoryName,
    currencySymbol,
    setCurrencySymbol,
    currencyRate,
    setCurrencyRate,
    minQueryLength,
    minQueryLengthReached,
    setMinQueryLengthReached,
    pageSizeOptions,
    setRoute: storeCtx.route,
    refineProduct: handleRefineProductSearch,
    pageLoading,
    setPageLoading,
    categoryPath,
    categoryId,
    categoryConfig,
    viewType,
    setViewType,
    listViewType,
    setListViewType,
    cartId: storeCtx.config.resolveCartId,
    refreshCart: storeCtx.config.refreshCart,
    resolveCartId: storeCtx.config.resolveCartId,
    addToCart: storeCtx.config.addToCart,
    disableAllPurchases: storeCtx.config.disableAllPurchases,
    franchises,
    getMoreFranchiseProducts,
  };

  const handleFranchiseSearch = async (data: ProductSearchResponse['data']) => {
    const categories = data.productSearch.facets?.find(
      (facet) => facet.attribute === 'categories'
    )?.buckets as CategoryView[];

    if (!categories) {
      return;
    }

    let sortedCategories = categories;
    /* Sort categories based on id from categoriesExtraInfo */
    if (categoriesExtraInfo) {
      sortedCategories = categories.sort((a, b) => {
        const idA = categoriesExtraInfo.findIndex(item => item.url === a.path);
        const idB = categoriesExtraInfo.findIndex(item => item.url === b.path)
        return idA - idB;
      });
    }

    const result = await getFranchiseSearch({
      ...variables,
      ...storeCtx,
      pageSize: 20,
      currentPage: 1,
      apiUrl: storeCtx.apiUrl,
      categories: sortedCategories.map((c) => c.title),
    });

    Object.keys(result).forEach((key) => {
      const category = sortedCategories.find((c) => c.title.replaceAll('-', '').endsWith(key));
      result[key] = {
        ...category,
        ...result[key],
        currentPage: 1,
        pageSize: 20,
      };
    });

    setFranchises(result);
  };

  const searchProducts = async () => {
    try {
      setLoading(true);
      moveToTop();
      if (checkMinQueryLength()) {
        const filters = [...variables.filter];

        handleCategorySearch(categoryPath, categoryId, filters);

        const data = await getProductSearch({
          ...variables,
          ...storeCtx,
          apiUrl: storeCtx.apiUrl,
          filter: filters,
          categorySearch: !!categoryPath || !!categoryId,
          categoryId,
        });

        const searchItems = [...(data?.productSearch?.items || [])];

        const productIds = searchItems.flatMap((item) => {
          const { allConfigIds } = getColorSwatchesFromAttribute(
            item.productView,
            storeCtx.config.currentCategoryId
          );
          return allConfigIds;
        });

        const productLabelsResults = await getGraphQL(
          GET_PRODUCT_LABELS_QUERY,
          {
            productIds,
            mode: 'CATEGORY',
          },'',
          storeCtx.basicToken,
          storeCtx.graphqlEndpoint
        );

        const labels =
          productLabelsResults?.data?.wilsonAmLabelProvider.items ?? [];

        setItems(data?.productSearch?.items || []);
        setLabels(labels || []);
        setFacets(data?.productSearch?.facets || []);
        setTotalCount(data?.productSearch?.total_count || 0);
        setTotalPages(data?.productSearch?.page_info?.total_pages || 1);
        handleCategoryNames(data?.productSearch?.facets || []);

        getPageSizeOptions(data?.productSearch?.total_count);

        if (searchCtx.displayFranchises) {
          await handleFranchiseSearch(data);
        }

        paginationCheck(
          data?.productSearch?.total_count,
          data?.productSearch?.page_info?.total_pages
        );
      }
      setLoading(false);
      setPageLoading(false);
    } catch (error) {
      setLoading(false);
      setPageLoading(false);
    }
  };

  const checkMinQueryLength = () => {
    if (
      !storeCtx.config?.currentCategoryUrlPath &&
      !storeCtx.config?.currentCategoryId &&
      searchCtx.phrase.trim().length <
        (Number(storeCtx.config.minQueryLength) || DEFAULT_MIN_QUERY_LENGTH)
    ) {
      setItems([]);
      setLabels([]);
      setFacets([]);
      setTotalCount(0);
      setTotalPages(1);
      setMinQueryLengthReached(false);
      return false;
    }
    setMinQueryLengthReached(true);
    return true;
  };

  const getPageSizeOptions = (totalCount: number | null) => {
    const optionsArray: PageSizeOption[] = [];
    const pageSizeString =
      storeCtx?.config?.perPageConfig?.pageSizeOptions ||
      DEFAULT_PAGE_SIZE_OPTIONS;
    const pageSizeArray = pageSizeString.split(',');
    pageSizeArray.forEach((option) => {
      optionsArray.push({
        label: option,
        value: parseInt(option, 10),
      });
    });

    if (storeCtx?.config?.allowAllProducts == '1') {
      // '==' is intentional for conversion
      optionsArray.push({
        label: showAllLabel,
        value: totalCount !== null ? (totalCount > 500 ? 500 : totalCount) : 0,
      });
    }
    setPageSizeOptions(optionsArray);
  };

  const paginationCheck = (
    totalCount: number | null,
    totalPages: number | undefined
  ) => {
    if (totalCount && totalCount > 0 && totalPages === 1) {
      setCurrentPage(1);
      handleUrlPagination(1);
    }
  };

  const handleCategorySearch = (
    categoryPath: string | undefined,
    categoryId: string | undefined,
    filters: FacetFilter[]
  ) => {
    if (!categoryPath && !categoryId) {
      return;
    }

    if (categoryPath) {
      const categoryFilter = {
        attribute: 'categoryPath',
        eq: categoryPath,
      };
      filters.push(categoryFilter);
    } else if (categoryId) {
      const categoryIdFilter = {
        attribute: 'categoryIds',
        eq: categoryId,
      };
      filters.push(categoryIdFilter);
    }

    //add default category sort
    if (variables.sort.length < 1 || variables.sort === SEARCH_SORT_DEFAULT) {
      variables.sort = CATEGORY_SORT_DEFAULT;
    }
  };

  const handleCategoryNames = (facets: Facet[]) => {
    facets.map((facet) => {
      const bucketType = facet?.buckets[0]?.__typename;
      if (bucketType === 'CategoryView') {
        const names = facet.buckets.map((bucket) => {
          if (bucket.__typename === 'CategoryView')
            return {
              name: bucket.name,
              value: bucket.title,
              attribute: facet.attribute,
              path: bucket.path,
            };
        });
        searchCtx.setCategoryNames(names);
      }
    });
  };

  useEffect(() => {
    if (attributeMetadataCtx.filterableInSearch) {
      searchProducts();
    }
  }, [searchCtx.filters]);

  useEffect(() => {
    if (attributeMetadataCtx.filterableInSearch) {
      const filtersFromConfig = [];
      if (storeCtx?.config?.preCheckedFilters) {
        filtersFromConfig.push(
          ...getFiltersFromConfig(
            attributeMetadataCtx.filterableInSearch,
            storeCtx.config.preCheckedFilters
          )
        );
      }
      const filtersFromUrl = getFiltersFromUrl(
        attributeMetadataCtx.filterableInSearch
      );
      searchCtx.setFilters([...filtersFromConfig, ...filtersFromUrl]);
    }
  }, [attributeMetadataCtx.filterableInSearch]);

  useEffect(() => {
    if (!loading) {
      searchProducts();
    }
  }, [searchCtx.phrase, searchCtx.sort, currentPage, pageSize]);

  return (
    <ProductsContext.Provider value={context}>
      {children}
    </ProductsContext.Provider>
  );
};

const getFiltersFromConfig = (
  filterableAttributes: string[],
  preCheckedFilters: Array<{
    key: string;
    value: string;
  }>
): SearchClauseInput[] => {
  const filters: FacetFilter[] = [];
  preCheckedFilters.forEach(({ key, value }) => {
    if (filterableAttributes.includes(key)) {
      if (value.includes('--')) {
        const range = value.split('--');
        const filter = {
          attribute: key,
          range: { from: Number(range[0]), to: Number(range[1]) },
        };
        filters.push(filter);
      } else {
        const attributeIndex = filters.findIndex(
          (filter) => filter.attribute == key
        );
        if (attributeIndex !== -1) {
          filters[attributeIndex].in?.push(value);
        } else {
          const filter = { attribute: key, in: [value] };
          filters.push(filter);
        }
      }
    }
  });
  return filters;
};

const useProducts = () => {
  const productsCtx = useContext(ProductsContext);
  return productsCtx;
};

export { ProductsContextProvider, useProducts };
