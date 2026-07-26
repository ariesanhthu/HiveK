import type { Metadata } from "next";
import { EnterpriseSetupForm } from "@/features/enterprise/components/enterprise-setup-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thiết lập Hồ sơ Doanh nghiệp | HiveK",
  description: "Khởi tạo thông tin Doanh nghiệp để sử dụng workspace HiveK.",
};

export default function EnterpriseSetupPage() {
  return <EnterpriseSetupForm />;
}
