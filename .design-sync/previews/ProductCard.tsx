import { ProductCard } from 'client';

const product = {
  id: 'p-01',
  name: 'Serum Dưỡng Sáng Vitamin C 20%',
  description:
    'Tinh chất dưỡng sáng da chuyên sâu, làm mờ thâm nám và đều màu da sau 4 tuần sử dụng.',
  price: 480000,
  currency: '₫',
  imageUrl:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#fde68a"/><circle cx="200" cy="150" r="70" fill="#f59e0b"/></svg>',
    ),
  productPageUrl: '#',
};

const perks = [
  { id: 'k1', label: 'Hoa hồng 15%' },
  { id: 'k2', label: 'Quà tặng độc quyền' },
  { id: 'k3', label: 'Freeship toàn quốc' },
];

export function Default() {
  return (
    <div style={{ width: 320 }}>
      <ProductCard product={product} perks={perks} />
    </div>
  );
}
