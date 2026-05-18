import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignDetailView } from "@/features/campaign-detail/components/campaign-detail-view";
import { getCampaignDetailById } from "@/features/campaign-detail/server/get-campaign-detail-by-id";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = getCampaignDetailById(id);
  if (!detail) {
    return { title: "Chiến dịch | Hive-K" };
  }
  return {
    title: `${detail.title} | Hive-K`,
    description: `${detail.externalIdLabel} — ${detail.createdByLabel}`,
  };
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = getCampaignDetailById(id);
  if (!detail) {
    notFound();
  }
  return <CampaignDetailView detail={detail} />;
}
