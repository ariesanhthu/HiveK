import { CampaignCategoryChips } from 'client';

const categories = [
  'Làm đẹp',
  'Thời trang',
  'Công nghệ',
  'Ẩm thực',
  'Du lịch',
  'Mẹ & Bé',
  'Gaming',
] as const;

const noop = () => {};

export function AllSelected() {
  return (
    <div style={{ width: 820 }}>
      <CampaignCategoryChips categories={categories} selected='all' onSelect={noop} />
    </div>
  );
}

export function CategorySelected() {
  return (
    <div style={{ width: 820 }}>
      <CampaignCategoryChips categories={categories} selected='Công nghệ' onSelect={noop} />
    </div>
  );
}
