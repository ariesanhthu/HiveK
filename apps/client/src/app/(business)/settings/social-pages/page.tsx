import type { Metadata } from "next";
import { DashboardSidebar } from "@/features/business-dashboard/components/dashboard-sidebar";
import { DashboardTopbar } from "@/features/business-dashboard/components/dashboard-topbar";
import { SocialPagesManager } from "@/features/social-pages/components/social-pages-manager";
import {
  getConnectedSocialPages,
  getPlatforms,
} from "@/features/social-pages/server/social-pages-actions";
import { getMyEnterprises } from "@/features/enterprise/server/enterprise-actions";
import { BUSINESS_NAV_BASE } from "@/features/business-dashboard/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Liên kết Mạng xã hội | HiveK",
  description: "Quản lý kết nối Facebook Page và Threads cho Doanh nghiệp.",
};

export default async function SocialPagesPage() {
  const [socialResult, enterprises, platforms] = await Promise.all([
    getConnectedSocialPages(),
    getMyEnterprises(),
    getPlatforms(50),
  ]);

  const activeEnterprise = enterprises[0] ?? null;

  const navItems = BUSINESS_NAV_BASE.map((item) => ({
    ...item,
    isActive: item.href === "/settings/social-pages",
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

        <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-6">
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Liên kết Mạng xã hội
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Kết nối các trang Facebook và tài khoản Threads để vận hành tự động hóa bài viết và chiến dịch tiếp thị.
            </p>
          </header>

          <SocialPagesManager
            hasEnterprise={socialResult.hasEnterprise && !!activeEnterprise}
            initialPages={socialResult.pages}
            platforms={platforms}
            initialError={socialResult.error}
          />
        </section>
      </div>
    </main>
  );
}
