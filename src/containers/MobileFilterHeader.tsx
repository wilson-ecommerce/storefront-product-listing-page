/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { FunctionComponent } from 'preact';
import { useCallback, useEffect, useState, useRef } from 'preact/hooks';
import { Drawer } from 'src/components/Drawer/Drawer';
import MobileFacets from 'src/components/MobileFacets';

import { CategoryFilters, SelectedFilters } from "../components";
import { FranchiseViewSelector } from "../components/Facets/FranchiseViewSelector";
import { FilterButton } from '../components/FilterButton';
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

export const MobileFilterHeader: FunctionComponent<Props> = ({
  facets,
  totalCount,
  screenSize,
}) => {
  const searchCtx = useSearch();
  const storeCtx = useStore();
  const attributeMetadata = useAttributeMetadata();
  const productsCtx = useProducts();
  const translation = useTranslation();

  const attributesToFilter = [
    'price',
    'pcm_publication_date'
  ];

  const filteredAttributes = attributeMetadata?.sortable.filter((item) =>
    attributesToFilter.includes(item.attribute)
  );

  const [showMobileFacet, setShowMobileFacet] = useState(
    false
  );
  const [sortOptions, setSortOptions] = useState(defaultSortOptions());

  const getSortOptions = useCallback(() => {
    setSortOptions(
      getSortOptionsfromMetadata(
        translation,
        filteredAttributes,
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

  const onSortChange = (sortOption: string) => {
    setSortBy(sortOption);
    searchCtx.setSort(generateGQLSortInput(sortOption));
    handleUrlSort(sortOption);
  };

  return (
    <div className="flex flex-col max-w-full ml-auto w-full h-full">
      {!screenSize.mobile && (
        <CategoryFilters
          pageLoading={productsCtx.pageLoading}
          facets={productsCtx.facets}
          totalCount={productsCtx.totalCount}
          displayFilter={() => setShowMobileFacet(!showMobileFacet)}
        />
      )}
      {screenSize.mobile && (
        <div className="flex border-t border-b border-neutral-400 bg-black">
          <div className="flex justify-center w-full py-md border-r border-neutral-400">
            <FilterButton
              displayFilter={() => setShowMobileFacet(!showMobileFacet)}
              type="mobile"
            />
          </div>
        </div>
      )}
      {screenSize.mobile && (
        <div className={'mobile-franchise'}>
          <div className={'franchise-counter'}>
            {storeCtx.config.categoryConfig?.pcm_display_by_franchise !== '0' && (
              <FranchiseViewSelector/>
            )}
            <SelectedFilters totalCount={totalCount} isCount={true}/>
          </div>
          <div className={'mobile-pills'}>
            <SelectedFilters totalCount={totalCount} isCount={false}/>
          </div>
        </div>
      )}
      <div class="mobile-filters-container z-1000">
        <Drawer
          isOpen={showMobileFacet}
          onClose={() => setShowMobileFacet(!showMobileFacet)}
          totalCount={totalCount}
        >
          <MobileFacets
            searchFacets={facets}
            onClose={() => setShowMobileFacet(!showMobileFacet)}
            sortOptions={sortOptions}
            value={sortBy}
            onChange={onSortChange}
          />
        </Drawer>
      </div>
    </div>
  );
};
