import { FunctionComponent } from 'preact';
import { Label } from 'src/types/interface';

import '../ProductLabel/ProductLabel.css';

export interface ProductLabelProps {
  label: Label;
  variant: 'primary' | 'secondary';
}

export const ProductLabel: FunctionComponent<ProductLabelProps> = ({
  label,
  variant,
}) => {
  const defaultTexts: { [key: number]: string } = {
    30: 'Out of Stock',
    61: 'Custom?',
    262: 'Sold Out',
  };

  if (!label.txt && !label.image) {
    return null;
  }

  const textToRender = label.txt || defaultTexts[label.label_id] || '';

  const variantStyles = {
    primary: {
      baseClass:
        'ds-sdk-product-label-primary absolute top-2 left-2 px-2 py-1 border border-black z-20',
      textClass: 'text-[12px] font-medium label-line',
      style: {
        backgroundColor: label.additional_data.background_color || '#fff',
      },
    },
    secondary: {
      baseClass: 'ds-sdk-product-label-secondary',
      textClass: 'text-[12px] font-normal uppercase text-labelGold',
      style: {},
    },
  };

  const { baseClass, textClass, style } = variantStyles[variant];

  return (
    <div className={baseClass} style={style}>
      <p className={textClass}>{textToRender}</p>
    </div>
  );
};

export default ProductLabel;