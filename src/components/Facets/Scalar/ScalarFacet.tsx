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
export type DisplayFilterType = () => void;

interface ScalarFacetProps {
  filterData: FacetType | PriceFacet;
  iteration: number;
  handleFilter?: HandleFilterType;
  displayFilter?: DisplayFilterType;
  selectedNumber?: number;
  selectedFacet?: FacetType | PriceFacet | null;
}

export const ScalarFacet: FunctionComponent<ScalarFacetProps> = ({
  filterData,
  iteration,
  handleFilter,
  selectedNumber,
  selectedFacet,
  displayFilter,
}) => {
  return (
    <>
      <FilterSelection
        title={filterData.title}
        attribute={filterData.attribute}
        handleFilter={handleFilter}
        displayFilter={displayFilter}
        selectedNumber={selectedNumber}
        selectedFacet={selectedFacet}
        iteration={iteration}
      />
    </>
  );
};
