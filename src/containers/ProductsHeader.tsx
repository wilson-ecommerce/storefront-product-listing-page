/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { FunctionComponent } from 'preact';

interface Props {
  title: string,
}
export const ProductsHeader: FunctionComponent<Props> = ({
  title,
}) => {
  return (
    <div className="product-list-page-header flex flex-col gap-4 justify-center items-center h-[180px] lg:h-[248px]">
      <h1 className="text-center capitalize">
        {title}
      </h1>
    </div>
  );
};
