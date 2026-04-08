"use client";

import { useState, useMemo } from "react";
import type { AmbassadorCampaign } from "@/data/mock-data";

type TabType = "All" | "Active" | "Pending" | "History";

export function useAmbassadorCampaigns(initialCampaigns: AmbassadorCampaign[]) {
  const [activeTab, setActiveTab] = useState<TabType>("All");

  const filteredCampaigns = useMemo(() => {
    switch (activeTab) {
      case "Active":
        return initialCampaigns.filter(c => c.shortStatus === "POSTING" || c.shortStatus === "IN PLANNING");
      case "Pending":
        return initialCampaigns.filter(c => c.shortStatus === "WAITING REVIEW");
      case "History":
        return initialCampaigns.filter(c => c.shortStatus === "COMPLETED");
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
