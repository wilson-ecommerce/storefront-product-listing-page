/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { render } from '@testing-library/preact';

import { SwatchButton } from './SwatchButton';

describe('WidgetSDK - UIKit/SwatchButton', () => {
  test('renders', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <SwatchButton
        title=""
        id="test"
        value="test"
        type="TEXT"
        checked={true}
        onClick={handleChange}
      />
    );

    const elem = container.querySelector('.ds-sdk-swatch-button_test');

    expect(!!elem).toEqual(true);
  });
});
