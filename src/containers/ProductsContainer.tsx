/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import {  FunctionComponent } from 'preact';
import { useEffect } from 'preact/hooks';
import Loading from 'src/components/Loading';
import {useProducts, useSearch, useSensor, useStore, useTranslation} from 'src/context';
import {
  handleUrlPagination,
} from 'src/utils/handleUrlFilters';

import { Alert } from '../components/Alert';
import { Pagination } from '../components/Pagination';
import { ProductList } from '../components/ProductList';

interface Props {
  showFilters: boolean;
}

export const ProductsContainer: FunctionComponent<Props> = ({
  showFilters,
}) => {
  const storeCtx = useStore();
  const productsCtx = useProducts();
  const { displayFranchises } = useSearch();
  const { screenSize } = useSensor();
  const translation = useTranslation();

  const {
    variables,
    items,
    setCurrentPage,
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    minQueryLength,
    minQueryLengthReached,
    loading,
    franchises,
    labels
  } = productsCtx;

  useEffect(() => {
    if (currentPage < 1) {
      goToPage(1);
    }
  }, []);

  const goToPage = (page: number | string) => {
    if (typeof page === 'number') {
      setCurrentPage(page);
      handleUrlPagination(page);
    }
  };

  const loadingLabel = translation.Loading.title;

  if (!minQueryLengthReached) {
    const templateMinQueryText = translation.ProductContainers.minquery;
    const title = templateMinQueryText
      .replace('{variables.phrase}', variables.phrase)
      .replace('{minQueryLength}', minQueryLength);
    return (
      <div className="ds-sdk-min-query__page mx-auto max-w-8xl py-12 px-4 sm:px-6 lg:px-8">
        <Alert title={title} type="warning" description="" />
      </div>
    );
  }

  if (!totalCount) {
    return (
      <div className="ds-sdk-no-results__page flex flex-col gap-8 justify-center items-center w-full">
        <p className="text-center px-md">0 {translation.ProductContainers.resultsText}</p>
        <p className="text-center px-md">{translation.ProductContainers.noresults}</p>
        {storeCtx.config.noResultsLinks && (
          <ul className="flex flex-wrap justify-center items-center gap-[12px] px-md">
            {storeCtx.config.noResultsLinks.map((link) => (
              <li key={link.text} className="inline-block p-[14px] bg-black text-white uppercase">
                <a href={link.url} className="">
                  {translation.ProductContainers.noresultsEgift.replace('{variables.egift}', link.text)}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <Loading label={loadingLabel} />
      ) : (
        <ProductList
          products={items}
          labels={labels}
          franchises={franchises}
          numberOfColumns={screenSize.columns}
          showFilters={showFilters}
        />
      )}
      <div
        className={`flex ${screenSize.desktop ? 'flex-row' : 'flex-col gap-4'} pb-24 justify-between max-w-full ${
          showFilters ? 'mx-auto' : 'mr-auto'
        } w-full h-full text-[14px] font-normal`}
      >
        {!displayFranchises && (
          <span className="flex items-center justify-center text-neutral-700">
            {`${Math.max((currentPage - 1) * pageSize, 1)}-${Math.min(currentPage * pageSize, totalCount)}`} of {totalCount}
          </span>
        )}
        {!displayFranchises && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}
      </div>
    </>
  );
};
