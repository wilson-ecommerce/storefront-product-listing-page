/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { render } from '@testing-library/preact';

import { sampleProductNotDiscounted } from './MockData';
import ProductItem from './ProductItem';

beforeEach(() => {
  // IntersectionObserver isn't available in test environment
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

describe('WidgetSDK - UIKit/ProductItem', () => {
  test('renders', () => {
    const { container } = render(
      <ProductItem
        item={sampleProductNotDiscounted}
        currencySymbol="$"
        currencyRate="USD"
        setRoute={undefined}
        refineProduct={() => {}}
        setItemAdded={() => 'test'}
        setCartUpdated={() => true}
        setError={() => ''}
        addToCart={()=>Promise.resolve({user_errors: []})}
        disableAllPurchases={false}
      />
    );

    const elem = container.querySelector('.ds-sdk-product-item');

    expect(!!elem).toEqual(true);
  });
});
