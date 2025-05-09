/*
Copyright 2024 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { FunctionComponent } from 'preact';
import { useProducts, useTranslation } from 'src/context';
import { handleViewType } from 'src/utils/handleUrlFilters';

import GridView from '../../icons/gridView.svg';
import ListView from '../../icons/listView.svg';

export const ViewSwitcher: FunctionComponent = () => {
  const { viewType, setViewType } = useProducts();
  const translation = useTranslation();

  const handleClick = (viewType: string): void => {
    handleViewType(viewType);
    setViewType(viewType);
  };

  return (
    <div className="flex justify-between">
      <button
        className={`flex items-center ${
          viewType === 'gridview' ? 'bg-gray-100' : ''
        } ring-black ring-opacity-5  p-sm text-sm h-[32px] border border-gray-300`}
        onClick={() => handleClick('gridview')}
        aria-label={translation.ListView.gridView}
      >
        <GridView className="h-[20px] w-[20px]" aria-hidden="true" focusable="false"/>
      </button>
      <button
        className={`flex items-center ${
          viewType === 'listview' ? 'bg-gray-100' : ''
        } ring-black ring-opacity-5 p-sm text-sm h-[32px] border border-gray-300`}
        onClick={() => handleClick('listview')}
        aria-label={translation.ListView.listView}
      >
        <ListView className="h-[20px] w-[20px]" aria-hidden="true" focusable="false"/>
      </button>
    </div>
  );
};
