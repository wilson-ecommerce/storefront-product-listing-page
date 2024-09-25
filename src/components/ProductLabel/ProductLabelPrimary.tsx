import { FunctionComponent } from 'preact';
import { Label } from 'src/types/interface';

import '../ProductLabel/ProductLabel.css';

export interface ProductProps {
  label: Label;
}

export const ProductLabelPrimary: FunctionComponent<ProductProps> = ({
  label,
}) => {
  const defaultTexts: { [key: number]: string } = {
    30: 'Out of Stock',
    61: 'Custom?',
    262: 'Sold Out',
  };

  const baseClass =
    'ds-sdk-product-label absolute top-2 left-2 px-2 py-1 border border-black z-20';
  const textToRender = label.txt || defaultTexts[label.label_id] || '';

  return (
    <div
      className={`${baseClass}`}
      style={{
        color: label.additional_data.text_color || "#000",
        backgroundColor: label.additional_data.background_color || "#fff",
      }}
    >
      <p className="text-[12px] font-medium label-line">{textToRender}</p>
    </div>
  );
};

export default ProductLabelPrimary;
