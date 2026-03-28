"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CampaignCreatorRow } from "@/features/campaign-detail/types";

const CREATOR_STATUS: Record<
  CampaignCreatorRow["status"],
  { label: string; variant: "success" | "warning" }
> = {
  live: { label: "LIVE", variant: "success" },
  pending_post: { label: "PENDING POST", variant: "warning" },
};

export type CampaignActiveCreatorsTableProps = {
  creators: CampaignCreatorRow[];
};

export function CampaignActiveCreatorsTable({
  creators,
}: CampaignActiveCreatorsTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return creators;
    return creators.filter((c) => c.name.toLowerCase().includes(q));
  }, [creators, query]);

  return (
    <Card className="rounded-2xl border-primary-soft shadow-sm">
      <CardHeader className="flex flex-col gap-3 border-b border-primary-soft/60 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-foreground">
          Active Creators ({creators.length})
        </h2>
        <label className="sr-only" htmlFor="creator-filter">
          Filter creators by name
        </label>
        <input
          id="creator-filter"
          type="search"
          placeholder="Filter names..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-primary-soft bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 sm:max-w-xs"
        />
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-primary-soft bg-muted/30 text-xs font-bold uppercase tracking-wide text-muted">
              <th className="px-4 py-3 md:px-5">Creator</th>
              <th className="px-4 py-3">Reach</th>
              <th className="px-4 py-3">Engagement</th>
              <th className="px-4 py-3">Status</th>
              <th className="w-12 px-2 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-muted"
                >
                  No creators match your filter.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const st = CREATOR_STATUS[row.status];
                return (
                  <tr
                    key={row.id}
                    className="border-b border-primary-soft/60 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 md:px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={row.avatarUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-soft"
                        />
                        <span className="font-semibold text-foreground">
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {row.reachLabel}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {row.engagementLabel}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={st.variant} className="text-[10px] uppercase">
                        {st.label}
                      </Badge>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <button
                        type="button"
                        className={cn(
                          "inline-flex rounded-lg p-1.5 text-muted transition-colors hover:bg-muted hover:text-foreground"
                        )}
                        aria-label={`More actions for ${row.name}`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          more_vert
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
