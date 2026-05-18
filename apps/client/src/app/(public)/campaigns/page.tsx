import type { Metadata } from "next";
import { CampaignsListPage } from "@/features/campaigns/components/campaigns-list-page";
import { ACTIVE_CAMPAIGNS } from "@/data/mock-data";

export const metadata: Metadata = {
  title: "Chiến dịch | Hive-K",
  description:
    "Danh sách chiến dịch KOL/KOC đang mở: lọc theo ngành, xem ngân sách và trạng thái.",
};

export default function CampaignsPage() {
  return <CampaignsListPage campaigns={ACTIVE_CAMPAIGNS} />;
}
