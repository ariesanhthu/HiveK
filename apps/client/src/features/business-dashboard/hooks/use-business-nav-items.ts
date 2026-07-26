"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { type DashboardNavItem } from "@/features/business-dashboard/types";
import { BUSINESS_NAV_BASE } from "@/features/business-dashboard/constants";

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "#") return false;
  if (href.includes("?")) return false;
  const hrefPath = href.split("?", 1)[0];
  if (pathname === hrefPath) return true;
  return pathname.startsWith(`${hrefPath}/`);
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
