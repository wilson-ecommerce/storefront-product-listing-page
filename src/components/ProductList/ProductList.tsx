/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import {FunctionComponent} from 'preact';
import {HTMLAttributes} from 'preact/compat';
import {useEffect, useState} from 'preact/hooks';

import './product-list.css';

import {Alert} from '../../components/Alert';
import {useProducts, useSearch, useStore} from '../../context';
import {Product} from '../../types/interface';
import {classNames} from '../../utils/dom';
import ProductItem, {ProductProps} from '../ProductItem';

type FranchiseProps = Omit<ProductProps, "item"> & {
  franchise: string;
  franchises: any;
  numberOfColumns: number;
  getMoreFranchiseProducts: (category: string, pageSize: number, currentPage: number) => void
};

const NEXT_NUMBER_OF_ROWS = 4;

const Franchises : FunctionComponent<FranchiseProps> = ({
   currencySymbol,
   currencyRate,
   categoryConfig,
   setRoute,
   refineProduct,
   addToCart,
  franchise,
  franchises,
  numberOfColumns,
  disableAllPurchases,
  setCartUpdated,
  setItemAdded,
  setError,
  getMoreFranchiseProducts,
  }: FranchiseProps) => {
  const [page, setPage] = useState(1);
  const storeCtx = useStore();

  const totalProductsCount = franchises[franchise]?.count;

  useEffect(() => {
    const fetchData = async () => {
      const franchiseData = franchises[franchise];
      if (!franchiseData) {
        return;
      }

      const {
        currentPage,
        pageSize,
        path
      } = franchiseData;

      const requestedProducts = page * numberOfColumns;
      const fetchedProducts = franchises[franchise].items.length;
      if (requestedProducts > fetchedProducts) {
        await getMoreFranchiseProducts(path, pageSize, currentPage + 1);
      }
    }

    fetchData();
  }, [page, franchises, franchise])

  return (
    <div className="franchises" key={franchise}>
      <div className="franchise-header">
        <h2>{franchises[franchise].name.toUpperCase()}</h2>
        <a href={storeCtx.route?.({
          sku: "",
          urlKey: franchises[franchise].title,
          optionsUIDs: null
        }) ?? franchises[franchise].title}>View all {totalProductsCount} results</a>
      </div>
      <div style={{
        gridTemplateColumns: `repeat(${numberOfColumns}, minmax(0, 1fr))`,
      }}
           className="ds-sdk-product-list__grid mt-md grid gap-y-8 gap-x-sm xl:gap-x-6">
        {franchises[franchise].items.slice(0, numberOfColumns * page).map((item: Product) => (
          <ProductItem
            item={item}
            setError={setError}
            key={item?.productView?.id}
            currencySymbol={currencySymbol}
            currencyRate={currencyRate}
            categoryConfig={categoryConfig}
            disableAllPurchases={disableAllPurchases}
            setRoute={setRoute}
            refineProduct={refineProduct}
            setCartUpdated={setCartUpdated}
            setItemAdded={setItemAdded}
            addToCart={addToCart}
          />
        ))}
      </div>
      {page * numberOfColumns < totalProductsCount &&
        <button onClick={() => setPage((p) => p + NEXT_NUMBER_OF_ROWS)} className="button secondary load-more">Load More</button>
      }

    </div>
  );
}


export interface ProductListProps extends HTMLAttributes<HTMLDivElement> {
  products: Array<Product> | null | undefined;
  numberOfColumns: number;
  showFilters: boolean;
  franchises: any;
}

export const ProductList: FunctionComponent<ProductListProps> = ({
                                                                   products,
                                                                   numberOfColumns,
                                                                   showFilters,
                                                                   franchises,
                                                                 }) => {
  const productsCtx = useProducts();
  const {
    currencySymbol,
    currencyRate,
    categoryConfig,
    setRoute,
    refineProduct,
    refreshCart,
    addToCart,
    getMoreFranchiseProducts,
    disableAllPurchases = false,
  } = productsCtx;
  const [cartUpdated, setCartUpdated] = useState(false);
  const [itemAdded, setItemAdded] = useState('');
  const {viewType} = useProducts();
  const [error, setError] = useState<boolean>(false);
  const {
    config: {listview},
  } = useStore();
  const {displayFranchises } = useSearch();

  const className = showFilters
    ? 'ds-sdk-product-list bg-body w-full max-w-full pb-2xl sm:pb-24'
    : 'ds-sdk-product-list bg-body w-full mx-auto pb-2xl sm:pb-24';

  useEffect(() => {
    refreshCart && refreshCart();
  }, [itemAdded]);

  return (
    <div
      className={classNames(
        'ds-sdk-product-list bg-body pb-2xl sm:pb-24',
        className
      )}
    >
      {cartUpdated && (
        <div className="mt-8">
          <Alert
            title={`You added ${itemAdded} to your shopping cart.`}
            type="success"
            description=""
            onClick={() => setCartUpdated(false)}
          />
        </div>
      )}
      {error && (
        <div className="mt-8">
          <Alert
            title={`Something went wrong trying to add an item to your cart.`}
            type="error"
            description=""
            onClick={() => setError(false)}
          />
        </div>
      )}

      {displayFranchises && franchises && (<div className="w-full">
          {Object.keys(franchises).map((franchise) => (
            <Franchises
              numberOfColumns={numberOfColumns}
              franchises={franchises}
              franchise={franchise}
              setError={setError}
              key={franchise}
              currencySymbol={currencySymbol}
              currencyRate={currencyRate}
              categoryConfig={categoryConfig}
              disableAllPurchases={disableAllPurchases}
              setRoute={setRoute}
              refineProduct={refineProduct}
              setCartUpdated={setCartUpdated}
              setItemAdded={setItemAdded}
              addToCart={addToCart}
              getMoreFranchiseProducts={getMoreFranchiseProducts}
            />
          ))}
        </div>)
      }

      {!displayFranchises && (listview && viewType === 'listview' ? (
        <div className="w-full">
          <div className="ds-sdk-product-list__list-view-default mt-md grid grid-cols-none pt-[15px] w-full gap-[10px]">
            {products?.map((product) => (
              <ProductItem
                item={product}
                setError={setError}
                key={product?.productView?.id}
                currencySymbol={currencySymbol}
                currencyRate={currencyRate}
                categoryConfig={categoryConfig}
                setRoute={setRoute}
                refineProduct={refineProduct}
                setCartUpdated={setCartUpdated}
                setItemAdded={setItemAdded}
                addToCart={addToCart}
                disableAllPurchases={disableAllPurchases}
              />
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            gridTemplateColumns: `repeat(${numberOfColumns}, minmax(0, 1fr))`,
          }}
          className="ds-sdk-product-list__grid mt-md grid gap-y-8 gap-x-sm md:gap-x-9 md:gap-y-9"
        >
          {products?.map((product) => (
            <ProductItem
              item={product}
              setError={setError}
              key={product?.productView?.id}
              currencySymbol={currencySymbol}
              currencyRate={currencyRate}
              categoryConfig={categoryConfig}
              setRoute={setRoute}
              refineProduct={refineProduct}
              setCartUpdated={setCartUpdated}
              setItemAdded={setItemAdded}
              addToCart={addToCart}
              disableAllPurchases={disableAllPurchases}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
