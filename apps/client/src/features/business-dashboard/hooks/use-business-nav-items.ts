"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { type DashboardNavItem } from "@/features/business-dashboard/types";

const BUSINESS_NAV_BASE: Omit<DashboardNavItem, "isActive">[] = [
  { id: "ai-chat", label: "HiveK AI", icon: "auto_awesome", href: "/ai-chat" },
  { id: "dashboard", label: "Bảng điều khiển", icon: "dashboard", href: "/dashboard" },
  { id: "campaigns", label: "Chiến dịch", icon: "campaign", href: "/campaign-management" },
  {
    id: "auto-posting",
    label: "Lên bài tự động",
    icon: "auto_awesome",
    href: "/campaign-planning",
  },
  { id: "discovery", label: "Khám phá KOL", icon: "travel_explore", href: "/kol-matching" },
  { id: "analytics", label: "Phân tích", icon: "bar_chart", href: "/kol-analysis" },
  { id: "settings", label: "Cài đặt", icon: "settings", href: "#" },
];

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "#") return false;
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export function useBusinessNavItems(): DashboardNavItem[] {
  const pathname = usePathname() ?? "";

  return useMemo(
    () =>
      BUSINESS_NAV_BASE.map((item) => ({
        ...item,
        isActive: isNavItemActive(pathname, item.href),
      })),
    [pathname]
  );
}
