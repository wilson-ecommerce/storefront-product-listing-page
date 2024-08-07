import { FunctionComponent } from 'preact';

import MinusIcon from '../../icons/minus.svg';
import PlusIcon from '../../icons/plus.svg';
import { Facet as FacetType, PriceFacet } from '../../types/interface';

export type FilterSelectionTitleSlot = (label: string) => FunctionComponent;

export interface FilterSelectionProps {
  title: string;
  attribute?: string;
  filterSelectionTitleSlot?: FilterSelectionTitleSlot;
  handleFilter?: () => void;
  selectedNumber?: number;
  selectedFacet?: FacetType | PriceFacet | null;
}

export const FilterSelection: FunctionComponent<FilterSelectionProps> = ({
  title,
  filterSelectionTitleSlot,
  handleFilter,
  selectedNumber,
  selectedFacet,
}) => {
  const handleOptions = () => {
    handleFilter?.();
  };

  const isSelected = title === selectedFacet?.title;

  return (
    <div className="ds-sdk-input py-md">
      {filterSelectionTitleSlot ? (
        filterSelectionTitleSlot(title)
      ) : (
        <div
          className="flex items-center gap-x-1 cursor-pointer"
          onClick={handleOptions}
        >
          <label className="ds-sdk-input__label text-neutral-900 font-headline-1 text-sm font-semibold cursor-pointer">
            {title}{' '}
            {!!selectedNumber && (
              <span className="font-normal text-neutral-700">{`${selectedNumber} Selected`}</span>
            )}
          </label>
          {isSelected ? (
            <MinusIcon className="h-sm w-sm fill-neutral-800" />
          ) : (
            <PlusIcon className="h-sm w-sm fill-neutral-800" />
          )}
        </div>
      )}
    </div>
  );
};
