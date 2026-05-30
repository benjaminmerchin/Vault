"use client";

import { Label, Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { fmtMoney } from "@/lib/format";

export type SpendSlice = { category: string; amount: number; fill: string };

export function SpendingChart({
  data,
  total,
}: {
  data: SpendSlice[];
  total: number;
}) {
  const config: ChartConfig = Object.fromEntries(
    data.map((d) => [d.category, { label: d.category, color: d.fill }]),
  );

  return (
    <ChartContainer config={config} className="mx-auto aspect-square h-[210px]">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="category"
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-muted-foreground">{name}</span>
                  <span className="font-medium">{fmtMoney(Number(value))}</span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          innerRadius={62}
          outerRadius={94}
          paddingAngle={2}
          strokeWidth={2}
        >
          {data.map((d) => (
            <Cell key={d.category} fill={d.fill} stroke="var(--card)" />
          ))}
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !("cx" in viewBox)) return null;
              const { cx, cy } = viewBox as { cx: number; cy: number };
              return (
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan
                    x={cx}
                    y={cy - 6}
                    className="fill-foreground text-xl font-semibold"
                  >
                    {fmtMoney(total)}
                  </tspan>
                  <tspan
                    x={cx}
                    y={cy + 14}
                    className="fill-muted-foreground text-xs"
                  >
                    last 30 days
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
