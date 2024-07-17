import { FunctionComponent } from 'preact';
import { Label } from 'src/types/interface';

export interface ProductProps {
  label: Label;
}

export const ProductLabel: FunctionComponent<ProductProps> = ({ label }) => {
  const positionClasses: { [key: string]: string } = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
  };

  const defaultTexts: { [key: number]: string } = {
    30: 'Out of Stock',
    61: 'Custom?',
    262: 'Sold Out',
  };

  const positionClass = positionClasses[label.position] || '';
  const baseClass = 'ds-sdk-product-label absolute';
  const textToRender = label.txt || defaultTexts[label.label_id] || '';

  return (
    <div
      className={`${baseClass} ${positionClass}`}
      style={{
        color: label.additional_data.text_color,
        backgroundColor: label.additional_data.background_color,
      }}
    >
      <h4>{textToRender}</h4>
    </div>
  );
};

export default ProductLabel;
