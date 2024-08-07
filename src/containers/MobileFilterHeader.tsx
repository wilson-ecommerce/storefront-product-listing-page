/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { FunctionComponent } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { Drawer } from 'src/components/Drawer/Drawer';
import MobileFacets from 'src/components/MobileFacets';
import ViewSwitcher from 'src/components/ViewSwitcher';

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

  const defaultSortOption =
    storeCtx.config?.currentCategoryUrlPath ||
    storeCtx.config?.currentCategoryId
      ? 'position_ASC'
      : 'relevance_DESC';
  const sortFromUrl = getValueFromUrl('product_list_order');
  const sortByDefault = sortFromUrl ? sortFromUrl : defaultSortOption;
  const [sortBy, setSortBy] = useState<string>(sortByDefault);
  const onSortChange = (sortOption: string) => {
    setSortBy(sortOption);
    searchCtx.setSort(generateGQLSortInput(sortOption));
    handleUrlSort(sortOption);
  };

  return (
    <div className="flex flex-col max-w-5xl lg:max-w-full ml-auto w-full h-full">
      <div className="flex border-t border-b border-neutral-400">
        {screenSize.mobile && totalCount > 0 && (
          <div className="flex justify-center w-1/2 py-md border-r border-neutral-400">
            <FilterButton
              displayFilter={() => setShowMobileFacet(!showMobileFacet)}
              type="mobile"
            />
          </div>
        )}

        {totalCount > 0 && (
          <div className="flex justify-center w-1/2 py-md">
            {storeCtx?.config?.listview && <ViewSwitcher />}
            <SortDropdown
              sortOptions={sortOptions}
              value={sortBy}
              onChange={onSortChange}
              mobile
            />
          </div>
        )}
      </div>
      {screenSize.mobile && (
        <Drawer
          isOpen={showMobileFacet}
          onClose={() => setShowMobileFacet(!showMobileFacet)}
        >
          <MobileFacets searchFacets={facets} />
        </Drawer>
      )}
    </div>
  );
};
