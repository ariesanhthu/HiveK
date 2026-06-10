"use client";

import { type KolAnalysisTab } from "@/features/kol-analysis/hooks/use-kol-analysis";
import { cn } from "@/lib/utils";

type KolAnalysisTabsProps = {
  activeTab: KolAnalysisTab;
  onTabChange: (tab: KolAnalysisTab) => void;
};

const TABS: { id: KolAnalysisTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "analytics", label: "Performance Analytics", icon: "monitoring" },
  { id: "pipeline", label: "Pipeline Guide", icon: "account_tree" },
];

export function KolAnalysisTabs({ activeTab, onTabChange }: KolAnalysisTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-primary-soft pb-2">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-primary text-background-dark"
                : "text-foreground-muted hover:bg-primary-soft hover:text-foreground"
            )}
          >
            <span className="material-symbols-outlined text-base" aria-hidden>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

