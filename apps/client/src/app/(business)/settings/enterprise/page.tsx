import type { Metadata } from "next";
import { DashboardSidebar } from "@/features/business-dashboard/components/dashboard-sidebar";
import { DashboardTopbar } from "@/features/business-dashboard/components/dashboard-topbar";
import { EnterpriseProfileView } from "@/features/enterprise/components/enterprise-profile-view";
import { getMyEnterprises } from "@/features/enterprise/server/enterprise-actions";
import { BUSINESS_NAV_BASE } from "@/features/business-dashboard/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hồ sơ Doanh nghiệp | HiveK",
  description: "Xem chi tiết hồ sơ Doanh nghiệp, thành viên và thông tin tri thức.",
};

export default async function EnterpriseProfilePage() {
  const enterprises = await getMyEnterprises();
  const activeEnterprise = enterprises[0] ?? null;

  const navItems = BUSINESS_NAV_BASE.map((item) => ({
    ...item,
    isActive: item.href === "/settings/enterprise",
  }));

  return (
    <main className="flex min-h-screen w-full bg-background-light">
      <DashboardSidebar
        items={navItems}
        enterprises={enterprises}
        activeEnterprise={activeEnterprise}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Hồ sơ Doanh nghiệp
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Quản lý chi tiết thông tin tổ chức, trạng thái xác minh và danh sách thành viên workspace.
            </p>
          </header>

          <EnterpriseProfileView enterprises={enterprises} />
        </section>
      </div>
    </main>
  );
}
