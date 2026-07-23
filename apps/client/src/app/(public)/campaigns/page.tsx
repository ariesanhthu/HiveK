import { CampaignsListPage } from '@/features/campaigns/components/campaigns-list-page';
import { getCampaigns } from '@/features/campaigns/server/get-campaigns';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chiến dịch | Hive-K',
  description: 'Danh sách chiến dịch KOL/KOC đang mở: lọc theo ngành, xem ngân sách và trạng thái.',
};

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();
  return <CampaignsListPage campaigns={campaigns} />;
}
