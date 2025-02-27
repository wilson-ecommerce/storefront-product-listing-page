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
  if (!label.txt && !label.image) {
    return null;
  }

  const textToRender = label.txt || '';

  const variantStyles = {
    primary: {
      baseClass:
        'ds-sdk-product-label-primary absolute top-2 left-2 px-2 py-1 border border-black z-1',
      textClass: 'text-[12px] font-medium label-line',
      style: {
        color: label.additional_data.text_color || "#000",
        borderColor: label.additional_data.background_color || "#fff",
        backgroundColor: label.additional_data.background_color || '#fff',
      },
    },
    secondary: {
      baseClass: 'ds-sdk-product-label-secondary pt-[6px]',
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
