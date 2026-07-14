import type { Metadata } from "next";
import { PricingPage } from "@/features/pricing/components/pricing-page";

export const metadata: Metadata = {
  title: "Bảng giá | Hive-K",
  description:
    "Chọn gói Hive-K phù hợp: Starter miễn phí, Growth cho đội ngũ tăng trưởng, Enterprise cho doanh nghiệp. Creator tham gia miễn phí.",
};

export default function Page() {
  return <PricingPage />;
}
