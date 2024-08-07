/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
import { FunctionComponent } from 'preact';
import { FilterSelection } from 'src/components/FilterSelection';

import { Facet as FacetType, PriceFacet } from '../../../types/interface';
export type HandleFilterType = () => void;

interface ScalarFacetProps {
  filterData: FacetType | PriceFacet;
  handleFilter?: HandleFilterType;
  selectedNumber?: number;
  selectedFacet?: FacetType | PriceFacet | null;
}

export const ScalarFacet: FunctionComponent<ScalarFacetProps> = ({
  filterData,
  handleFilter,
  selectedNumber,
  selectedFacet
}) => {
  return (
    <>
      <FilterSelection
        title={filterData.title}
        attribute={filterData.attribute}
        handleFilter={handleFilter}
        selectedNumber={selectedNumber}
        selectedFacet={selectedFacet}
      />
    </>
  );
};
