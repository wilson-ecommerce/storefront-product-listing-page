/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { render } from '@testing-library/preact';

import {
  InputButtonGroup,
  InputButtonGroupProps,
} from './InputButtonGroup';

const mockButtonGroup: InputButtonGroupProps = {
  title: 'button',
  attribute: 'button',
  buckets: [],
  isSelected: () => true,
  onChange: () => {},
  type: 'radio',
  isHidden: true,
};

describe('WidgetSDK - UIKit/InputButtonGroup', () => {
  test('renders', () => {
    const { container } = render(
      <InputButtonGroup
        title={mockButtonGroup.title}
        attribute={mockButtonGroup.attribute}
        buckets={mockButtonGroup.buckets}
        isSelected={mockButtonGroup.isSelected}
        onChange={mockButtonGroup.onChange}
        type={mockButtonGroup.type}
        isHidden={mockButtonGroup.isHidden}
      />
    );

    const elem = container.querySelector('.ds-sdk-input');

    expect(!!elem).toEqual(true);
  });
});
