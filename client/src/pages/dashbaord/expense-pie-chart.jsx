// ExpensePieChart.js
import React from "react";
import { Pie, PieChart, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { formatCurrency } from "../../lib/format-currency";
import { Skeleton } from "../../components/ui/skeleton";
import { formatPercentage } from "../../lib/format-percentage";
import { EmptyState } from "../../components/empty-state";
import { useExpensePieChartBreakdownQuery } from "../../features/analytics/analyticsAPI";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

const chartConfig = {
  amount: { label: "Amount" },
};

export default function ExpensePieChart({ dateRange }) {
  const { data, isFetching } = useExpensePieChartBreakdownQuery({
    preset: dateRange?.value,
  });
  const categories = data?.data?.breakdown || [];
  const totalSpent = data?.data?.totalSpent || 0;

  if (isFetching) {
    return <PieChartSkeleton />;
  }

  const CustomLegend = () => (
    <div className="grid grid-cols-1 gap-x-4 gap-y-2 mt-4">
      {categories.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
          />
          <div className="flex justify-between w-full">
            <span className="text-xs font-medium truncate capitalize">
              {entry.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatCurrency(entry.value)}
              </span>
              <span className="text-xs text-muted-foreground/60">
                ({formatPercentage(entry.percentage, { decimalPlaces: 0 })})
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="!shadow-none border border-gray-100 dark:border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Expenses Breakdown</CardTitle>
        <CardDescription>Total expenses {dateRange?.label}</CardDescription>
      </CardHeader>
      <CardContent className="h-[313px]">
        {categories.length === 0 ? (
          <EmptyState
            title="No expenses found"
            description="There are no expenses recorded for this period."
          />
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[300px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Pie
                data={categories}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                strokeWidth={2}
                stroke="#fff"
              >
                {categories.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>

              {/* Center label */}
              <text
                x="35%"
                y="35%"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                <tspan
                  x="50%"
                  dy="-0.2em"
                  fontSize="18"
                  fontWeight="bold"
                  fill="#000"
                >
                  ${totalSpent.toLocaleString()}
                </tspan>
                <tspan
                  x="50%"
                  dy="1.5em"
                  fontSize="12"
                  fill="#666"
                >
                  Total Spent
                </tspan>
              </text>

              <ChartLegend content={<CustomLegend />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function PieChartSkeleton() {
  return (
    <Card className="!shadow-none border border-gray-100 dark:border-border">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32 mt-1" />
      </CardHeader>
      <CardContent className="h-[313px]">
        <div className="w-full flex items-center justify-center">
          <div className="relative w-[200px] h-[200px]">
            <Skeleton className="rounded-full w-full h-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
        <div className="mt-0 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
