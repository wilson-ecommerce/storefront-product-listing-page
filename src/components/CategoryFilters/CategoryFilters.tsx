/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { FunctionComponent } from 'preact';

import { Facet } from '../../types/interface';
import { Facets } from '../Facets';

interface CategoryFiltersProps {
  loading: boolean;
  pageLoading: boolean;
  totalCount: number;
  facets: Facet[];
  categoryName: string;
  phrase: string;
  showFilters: boolean;
  setShowFilters: (showFilters: boolean) => void;
  filterCount: number;
}

export const CategoryFilters: FunctionComponent<CategoryFiltersProps> = ({
  pageLoading,
  totalCount,
  facets,
}) => {

  return (
    <div className="sm:flex ds-widgets-_actions relative max-width-[480px] flex-[25] px-2 flex-col">
      {!pageLoading && facets.length > 0 && (
        <Facets searchFacets={facets} totalCount={totalCount} />
      )}
    </div>
  );
};
