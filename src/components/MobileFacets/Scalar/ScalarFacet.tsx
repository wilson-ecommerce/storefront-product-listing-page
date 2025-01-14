/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { FunctionComponent } from 'preact';

import useScalarFacet from '../../../hooks/useScalarFacet';
import { Facet as FacetType, PriceFacet } from '../../../types/interface';
import { InputButtonGroup } from '../../InputButtonGroup';

interface ScalarFacetProps {
  filterData: FacetType | PriceFacet;
}

export const ScalarFacet: FunctionComponent<ScalarFacetProps> = ({
  filterData,
}) => {
  const { isSelected, onChange } = useScalarFacet(filterData);

  return (
    <InputButtonGroup
      title={filterData.title}
      attribute={filterData.attribute}
      buckets={filterData.buckets as any}
      type={'checkbox'}
      isSelected={isSelected}
      isHidden={true}
      onChange={(args) => onChange(args.value, args.selected)}
    />
  );
};
