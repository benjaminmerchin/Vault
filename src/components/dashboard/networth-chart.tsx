"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { fmtCompact, fmtMoney } from "@/lib/format";

const config: ChartConfig = {
  value: { label: "Net worth", color: "var(--chart-1)" },
};

export function NetWorthChart({
  data,
}: {
  data: { month: string; value: number }[];
}) {
  return (
    <ChartContainer config={config} className="h-[210px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 4, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="nw-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          fontSize={11}
          stroke="var(--muted-foreground)"
          tickFormatter={(v) => fmtCompact(Number(v))}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => fmtMoney(Number(value))}
              hideIndicator
            />
          }
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#nw-fill)"
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
