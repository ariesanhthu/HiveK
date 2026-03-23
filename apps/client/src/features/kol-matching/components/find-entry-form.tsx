"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FindEntryHelperPanel } from "@/features/kol-matching/components/find-entry-helper-panel";
import { type FindKolEntryInput } from "@/features/kol-matching/types";

type FindEntryFormProps = {
  initialValue: FindKolEntryInput;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (value: FindKolEntryInput) => Promise<void>;
};

export function FindEntryForm({
  initialValue,
  isSubmitting,
  errorMessage,
  onSubmit,
}: FindEntryFormProps) {
  const [formValue, setFormValue] = useState<FindKolEntryInput>(initialValue);

  function updateValue<K extends keyof FindKolEntryInput>(
    key: K,
    value: FindKolEntryInput[K]
  ): void {
    setFormValue((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formValue.targetPlatforms.length === 0) {
      return;
    }
    await onSubmit(formValue);
  }

  function togglePlatform(platform: FindKolEntryInput["targetPlatforms"][number]): void {
    setFormValue((previous) => {
      if (previous.targetPlatforms.includes(platform)) {
        if (previous.targetPlatforms.length === 1) return previous;
        return {
          ...previous,
          targetPlatforms: previous.targetPlatforms.filter((item) => item !== platform),
        };
      }
      return {
        ...previous,
        targetPlatforms: [...previous.targetPlatforms, platform],
      };
    });
  }

  const budgetRangeLabel = `$1k - $${formValue.budgetRangeMaxK}k`;
  const followerRangeLabel = `100k - ${formValue.followerRangeMaxK}k`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <Card className="lg:col-span-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">description</span>
            Search Brief Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="font-semibold text-foreground">Select Campaign</span>
                <select
                  value={formValue.campaignOption}
                  onChange={(event) => updateValue("campaignOption", event.target.value)}
                  className="w-full rounded-xl border border-primary-soft bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option>Summer Launch 2024</option>
                  <option>Tech Gadget Promo</option>
                  <option>Influencer Outreach Q3</option>
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-semibold text-foreground">Niche Category</span>
                <select
                  value={formValue.nicheCategory}
                  onChange={(event) => {
                    updateValue("nicheCategory", event.target.value);
                    updateValue("niche", event.target.value.split("&")[0].trim());
                  }}
                  className="w-full rounded-xl border border-primary-soft bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option>Lifestyle & Fashion</option>
                  <option>Tech & Gaming</option>
                  <option>Health & Wellness</option>
                  <option>Food & Cooking</option>
                </select>
              </label>
            </div>

            <label className="space-y-1 text-sm">
              <span className="font-semibold text-foreground">Product/Campaign Summary</span>
              <textarea
                rows={4}
                value={formValue.summary}
                onChange={(event) => updateValue("summary", event.target.value)}
                placeholder="Describe the product and the goals of this campaign..."
                className="w-full rounded-xl border border-primary-soft bg-muted px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground-muted focus:border-primary"
              />
            </label>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Target Platforms</p>
              <div className="flex flex-wrap gap-2">
                {(["tiktok", "instagram", "youtube"] as const).map((platform) => {
                  const isChecked = formValue.targetPlatforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                        isChecked
                          ? "border-primary bg-primary-soft text-foreground"
                          : "border-primary-soft bg-muted text-foreground-muted hover:border-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {platform === "tiktok" ? "TikTok" : platform === "instagram" ? "Instagram" : "YouTube"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 rounded-xl border border-primary-soft bg-muted p-4 md:grid-cols-3">
              <label className="space-y-1 text-xs">
                <span className="font-bold uppercase tracking-wider text-foreground-muted">
                  Min. Reach
                </span>
                <input
                  type="number"
                  min={0}
                  value={formValue.minReach}
                  onChange={(event) => updateValue("minReach", Number(event.target.value))}
                  className="w-full border-b border-primary-soft bg-transparent py-1 text-base font-bold text-foreground outline-none focus:border-primary"
                />
              </label>

              <label className="space-y-1 text-xs">
                <span className="font-bold uppercase tracking-wider text-foreground-muted">
                  Min. CTR (%)
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={formValue.minCtr}
                  onChange={(event) => updateValue("minCtr", Number(event.target.value))}
                  className="w-full border-b border-primary-soft bg-transparent py-1 text-base font-bold text-foreground outline-none focus:border-primary"
                />
              </label>

              <label className="space-y-1 text-xs">
                <span className="font-bold uppercase tracking-wider text-foreground-muted">
                  Conversion Target
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={formValue.conversionTarget}
                  onChange={(event) => updateValue("conversionTarget", Number(event.target.value))}
                  className="w-full border-b border-primary-soft bg-transparent py-1 text-base font-bold text-foreground outline-none focus:border-primary"
                />
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="flex items-center justify-between font-semibold text-foreground">
                  Budget Range
                  <span className="text-primary">{budgetRangeLabel}</span>
                </span>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={formValue.budgetRangeMaxK}
                  onChange={(event) => updateValue("budgetRangeMaxK", Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary-soft accent-primary"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="flex items-center justify-between font-semibold text-foreground">
                  Follower Range
                  <span className="text-primary">{followerRangeLabel}</span>
                </span>
                <input
                  type="range"
                  min={100}
                  max={1500}
                  step={50}
                  value={formValue.followerRangeMaxK}
                  onChange={(event) => updateValue("followerRangeMaxK", Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary-soft accent-primary"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary-soft pt-4">
              {errorMessage ? <Badge variant="warning">{errorMessage}</Badge> : <span />}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-primary-soft px-4 py-2 text-sm font-semibold text-foreground hover:bg-primary-soft"
                >
                  <span className="material-symbols-outlined text-base">filter_list</span>
                  Advanced Filters
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formValue.targetPlatforms.length === 0}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                  {isSubmitting ? "Generating..." : "Generate Suggestions"}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="lg:col-span-4">
        <FindEntryHelperPanel />
      </div>
    </div>
  );
}
