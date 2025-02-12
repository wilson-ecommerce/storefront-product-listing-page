/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

/// <reference types="@types/jest" />;
import { render } from '@testing-library/preact';

import { CategoryFilters } from './CategoryFilters';

describe('PLP widget/CategoryFilters', () => {
  it('renders', () => {
    const { container } = render(
      <CategoryFilters
        pageLoading={false}
        totalCount={1}
        facets={[]}
      />
    );

    const elem = container.querySelector('.ds-widgets_actions_header');

    expect(!!elem).toEqual(true);
  });
});
