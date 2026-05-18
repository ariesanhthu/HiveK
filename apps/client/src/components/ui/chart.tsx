"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used inside a <ChartContainer />");
  }

  return context;
}

type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
};

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replaceAll(":", "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-primary-soft [&_.recharts-tooltip-cursor]:stroke-primary-soft [&_.recharts-curve.recharts-tooltip-cursor]:stroke-primary-soft [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer minWidth={0} minHeight={96} debounce={50}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const entries = Object.entries(config).filter(
    ([, configItem]) => configItem.theme || configItem.color
  );

  if (entries.length === 0) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${entries
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
}

export const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayload = {
  name?: string;
  dataKey?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

type ChartTooltipContentProps = React.ComponentProps<"div"> & {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
  hideLabel?: boolean;
  indicator?: "line" | "dot";
  nameKey?: string;
  labelFormatter?: (value: string | number) => string;
  valueFormatter?: (value: number | string) => string;
};

export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  label,
  labelFormatter,
  valueFormatter,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  const formattedLabel = labelFormatter ? labelFormatter(label ?? "") : label;

  return (
    <div
      className={cn(
        "grid min-w-32 gap-1 rounded-lg border border-primary-soft bg-card px-2.5 py-1.5 text-xs shadow-sm",
        className
      )}
    >
      {!hideLabel ? (
        <div className="font-medium text-foreground">{formattedLabel}</div>
      ) : null}
      <div className="grid gap-1">
        {payload.map((item) => {
          const key = String(item.dataKey ?? item.name ?? "");
          const itemConfig = config[key];
          const indicatorColor = item.color ?? `var(--color-${key})`;
          const value = valueFormatter
            ? valueFormatter(item.value ?? "")
            : String(item.value ?? "");

          return (
            <div key={key} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex shrink-0 rounded-full",
                    indicator === "dot" ? "h-2 w-2" : "h-0.5 w-3"
                  )}
                  style={{ backgroundColor: indicatorColor }}
                />
                <span className="text-muted">{itemConfig?.label ?? item.name}</span>
              </div>
              <span className="font-semibold text-foreground">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
