"use client";

import { useState, useMemo } from "react";
import type { AmbassadorCampaign } from "@/data/mock-data";

type TabType = "All" | "Active" | "Pending" | "History";

export function useAmbassadorCampaigns(initialCampaigns: AmbassadorCampaign[]) {
  const [activeTab, setActiveTab] = useState<TabType>("All");

  const filteredCampaigns = useMemo(() => {
    switch (activeTab) {
      case "Active":
        return initialCampaigns.filter(
          c => c.shortStatus === "ĐANG ĐĂNG BÀI" || c.shortStatus === "ĐANG LÊN KẾ HOẠCH"
        );
      case "Pending":
        return initialCampaigns.filter(c => c.shortStatus === "CHỜ DUYỆT");
      case "History":
        return initialCampaigns.filter(c => c.shortStatus === "ĐÃ HOÀN THÀNH");
      case "All":
      default:
        return initialCampaigns;
    }
  }, [activeTab, initialCampaigns]);

  return {
    activeTab,
    setActiveTab,
    filteredCampaigns,
  };
}
