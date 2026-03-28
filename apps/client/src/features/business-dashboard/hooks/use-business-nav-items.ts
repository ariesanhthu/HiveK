"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { type DashboardNavItem } from "@/features/business-dashboard/types";

const BUSINESS_NAV_BASE: Omit<DashboardNavItem, "isActive">[] = [
  { id: "dashboard", label: "Bảng điều khiển", icon: "dashboard", href: "/dashboard" },
  { id: "campaigns", label: "Chiến dịch", icon: "campaign", href: "#" },
  { id: "discovery", label: "Khám phá KOL", icon: "travel_explore", href: "/kol-matching" },
  { id: "analytics", label: "Phân tích", icon: "bar_chart", href: "#" },
  { id: "settings", label: "Cài đặt", icon: "settings", href: "#" },
];

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "#") return false;
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

/**
 * Sidebar nav for business workspace routes; highlights item by current pathname.
 */
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
