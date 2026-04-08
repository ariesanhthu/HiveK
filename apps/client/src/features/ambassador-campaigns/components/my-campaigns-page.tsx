"use client";

import { useAmbassadorCampaigns } from "../hooks/use-ambassador-campaigns";
import type { AmbassadorCampaign } from "@/data/mock-data";
import { MetricsCard } from "./metrics-card";
import { CampaignCard } from "./campaign-card";
import { Filter, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface MyCampaignsPageProps {
  campaigns: AmbassadorCampaign[];
  metrics: any[]; // You can type this properly later
}

const TABS = ["All", "Active", "Pending", "History"] as const;

export function MyCampaignsPage({ campaigns, metrics }: MyCampaignsPageProps) {
  const { activeTab, setActiveTab, filteredCampaigns } = useAmbassadorCampaigns(campaigns);

  return (
    <div className="flex w-full flex-col gap-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Campaigns</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Manage and track your ongoing brand collaborations.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 focus:outline-none">
            <Filter className="h-4 w-4 text-slate-400" />
            Filters
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 focus:outline-none">
            <Calendar className="h-4 w-4 text-slate-400" />
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricsCard key={metric.id} {...metric} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex w-full items-center gap-6 border-b border-slate-200">
         {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative pb-4 text-sm font-bold transition-all", 
                activeTab === tab ? "text-orange-500" : "text-slate-400 hover:text-slate-700"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-orange-500 rounded-t-full" />
              )}
            </button>
         ))}
      </div>

      {/* Campaigns List */}
      <div className="flex flex-col gap-4">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
               <Filter className="h-8 w-8 text-slate-300" />
             </div>
             <h3 className="text-lg font-bold text-slate-700">No campaigns found</h3>
             <p className="mt-1 text-sm text-slate-500">There are no {activeTab.toLowerCase()} campaigns right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
