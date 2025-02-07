import { FunctionComponent } from 'preact';
import { Label } from 'src/types/interface';

import '../ProductLabel/ProductLabel.css';

export interface ProductProps {
  label: Label;
}

export const ProductLabelSecondary: FunctionComponent<ProductProps> = ({
  label,
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

  return (
    <div className="ds-sdk-product-label-secondary">
      <p className="text-[12px] font-normal uppercase text-labelGold">{textToRender}</p>
    </div>
  );
};

export default ProductLabelSecondary;
