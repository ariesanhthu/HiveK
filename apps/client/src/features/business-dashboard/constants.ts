import { type DashboardNavItem } from "@/features/business-dashboard/types";

export const BUSINESS_NAV_BASE: Omit<DashboardNavItem, "isActive">[] = [
  { id: "ai-chat", label: "HiveK AI", icon: "auto_awesome", href: "/ai-chat" },
  { id: "dashboard", label: "Bảng điều khiển", icon: "dashboard", href: "/dashboard" },
  {
    id: "inbox",
    label: "Hộp thư",
    icon: "support_agent",
    href: "/inbox",
    badgeCount: 4,
    badgeLabel: "4 cuộc hội thoại cần xử lý",
  },
  { id: "social-pages", label: "Liên kết MXH", icon: "share", href: "/settings/social-pages" },
  { id: "enterprise-profile", label: "Hồ sơ Doanh nghiệp", icon: "domain", href: "/settings/enterprise" },
  { id: "campaigns", label: "Chiến dịch", icon: "campaign", href: "/campaign-management" },
  {
    id: "auto-posting",
    label: "Kế hoạch đăng bài",
    icon: "auto_awesome",
    href: "/campaign-planning",
  },
  { id: "discovery", label: "Khám phá CTV", icon: "travel_explore", href: "/kol-matching" },
  { id: "analytics", label: "Phân tích", icon: "bar_chart", href: "/kol-analysis" },
  {
    id: "settings",
    label: "Studio",
    icon: "settings",
    href: "/ai-chat?view=studio",
  },
];
