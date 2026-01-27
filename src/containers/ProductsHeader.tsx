/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { FunctionComponent } from 'preact';
import { useCallback, useEffect, useState, useRef } from 'preact/hooks';
import ViewSwitcher from 'src/components/ViewSwitcher';

import Facets from '../components/Facets';
import { FilterButton } from '../components/FilterButton';
import { SortDropdown } from '../components/SortDropdown';
import {
  useAttributeMetadata,
  useProducts,
  useSearch,
  useStore,
  useTranslation,
} from '../context';
import { Facet } from '../types/interface';
import { getValueFromUrl, handleUrlSort } from '../utils/handleUrlFilters';
import {
  defaultSortOptions,
  generateGQLSortInput,
  getSortOptionsfromMetadata,
} from '../utils/sort';

interface Props {
  facets: Facet[];
  totalCount: number;
  screenSize: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
    columns: number;
  };
}
export const ProductsHeader: FunctionComponent<Props> = ({
  facets,
  totalCount,
  screenSize,
}) => {
  const searchCtx = useSearch();
  const storeCtx = useStore();
  const attributeMetadata = useAttributeMetadata();
  const productsCtx = useProducts();
  const translation = useTranslation();

  const [showMobileFacet, setShowMobileFacet] = useState(
    !!productsCtx.variables.filter?.length
  );
  const [sortOptions, setSortOptions] = useState(defaultSortOptions());

  const getSortOptions = useCallback(() => {
    setSortOptions(
      getSortOptionsfromMetadata(
        translation,
        attributeMetadata?.sortable,
        storeCtx?.config?.displayOutOfStock,
        storeCtx?.config?.currentCategoryUrlPath,
        storeCtx?.config?.currentCategoryId
      )
    );
  }, [storeCtx, translation, attributeMetadata]);

  useEffect(() => {
    getSortOptions();
  }, [getSortOptions]);

  const SORT_KEY_TO_VALUE = {
    featured: 'position_ASC',
    new: 'pcm_publication_date_DESC',
    'price-low-to-high': 'price_ASC',
    'price-high-to-low': 'price_DESC',
  };

  type DefaultSortByKey = keyof typeof SORT_KEY_TO_VALUE;

  const mappedDefaultSort =
    storeCtx.defaultSortBy !== ''
      ? SORT_KEY_TO_VALUE[storeCtx.defaultSortBy as DefaultSortByKey]
      : undefined;

  const defaultSortOption =
    mappedDefaultSort ??
    (storeCtx.config?.currentCategoryUrlPath || storeCtx.config?.currentCategoryId
      ? 'position_ASC'
      : 'relevance_DESC');

  const sortFromUrl = getValueFromUrl('product_list_order');
  const sortByDefault = sortFromUrl ? sortFromUrl : defaultSortOption;
  const [sortBy, setSortBy] = useState<string>(sortByDefault);

  const userChangedSortRef = useRef(false);

  const onSortChange = (sortOption: string) => {
    userChangedSortRef.current = true;

    setSortBy(sortOption);
    searchCtx.setSort(generateGQLSortInput(sortOption));
    handleUrlSort(sortOption);
  };

  useEffect(() => {
    if (sortFromUrl) return;

    if (userChangedSortRef.current) return;

    setSortBy(defaultSortOption);
    searchCtx.setSort(generateGQLSortInput(defaultSortOption));
  }, [defaultSortOption, sortFromUrl]);

  return (
    <div className="flex flex-col max-w-full ml-auto w-full h-full">
      <div
        className={`flex gap-x-2.5 mb-[1px] ${
          screenSize.mobile ? 'justify-between' : 'justify-between'
        }`}
      >
        {/* <div> */}
          {screenSize.mobile
            && totalCount > 0 && (
                <div className="pb-4">
                  <FilterButton
                    displayFilter={() => setShowMobileFacet(!showMobileFacet)}
                    type="mobile"
                  />
                </div>

              )

            // storeCtx.config.displaySearchBox && (
              //     <SearchBar
            //       phrase={searchCtx.phrase}
            //       onKeyPress={(e: any) => {
              //         if (e.key === 'Enter') {
                //           searchCtx.setPhrase(e?.target?.value);
            //         }
            //       }}
            //       onClear={() => searchCtx.setPhrase('')}
            //       placeholder={translation.SearchBar.placeholder}
            //     />
            //   )}
          }
        {/* </div> */}
        {totalCount > 0 && (
          <>
            {/* <div>
            {`${
                totalCount > 0 ? `${totalCount}` : ''
              } ${translation.CategoryFilters.results}`}
            </div> */}

            {storeCtx?.config?.listview && <ViewSwitcher />}
            <SortDropdown
              sortOptions={sortOptions}
              value={sortBy}
              onChange={onSortChange}
            />
          </>
        )}
      </div>
      {screenSize.mobile && showMobileFacet && <Facets searchFacets={facets} />}
    </div>
  );
};
