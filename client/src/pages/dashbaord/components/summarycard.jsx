// SummaryCard.js
import React from "react";
import CountUp from "react-countup";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card.jsx";
import { formatCurrency } from "../../../lib/format-currency";
import { formatPercentage } from "../../../lib/format-percentage";
import { Skeleton } from "../../../components/ui/skeleton";
import { cn } from "../../../lib/utils";
import { DateRangeEnum } from "../../../components/data-range-select/index.jsx";

function getCardStatus(value, cardType, expenseRatio) {
  if (cardType === "savings") {
    if (value === 0) {
      return {
        label: "No Savings Record",
        color: "text-gray-400",
        Icon: TrendingDownIcon,
      };
    }
    if (value < 10) {
      return {
        label: "Low Savings",
        color: "text-red-400",
        Icon: TrendingDownIcon,
        description: `Only ${value.toFixed(1)}% saved`,
      };
    }
    if (value < 20) {
      return {
        label: "Moderate",
        color: "text-yellow-400",
        Icon: TrendingDownIcon,
        description: `${expenseRatio?.toFixed(0)}% spent`,
      };
    }
    if (expenseRatio > 75) {
      return {
        label: "High Spend",
        color: "text-red-400",
        Icon: TrendingDownIcon,
        description: `${expenseRatio.toFixed(0)}% spent`,
      };
    }
    if (expenseRatio > 60) {
      return {
        label: "Warning: High Spend",
        color: "text-orange-400",
        Icon: TrendingDownIcon,
        description: `${expenseRatio.toFixed(0)}% spent`,
      };
    }
    return {
      label: "Good Savings",
      color: "text-green-400",
      Icon: TrendingUpIcon,
    };
  }

  if (value === 0) {
    let typeLabel =
      cardType === "income"
        ? "Income"
        : cardType === "expenses"
        ? "Expenses"
        : "Balance";
    return {
      label: `No ${typeLabel}`,
      color: "text-gray-400",
      Icon: TrendingDownIcon,
      description: "",
    };
  }

  if (cardType === "balance" && value < 0) {
    return {
      label: "Overdrawn",
      color: "text-red-400",
      Icon: TrendingDownIcon,
      description: "Balance is negative",
    };
  }

  return {
    label: "",
    color: "",
    Icon: TrendingDownIcon,
  };
}

function getTrendDirection(value, cardType) {
  if (cardType === "expenses") {
    return value <= 0 ? "positive" : "negative";
  }
  return value >= 0 ? "positive" : "negative";
}

export default function SummaryCard({
  title,
  value = 0,
  dateRange,
  percentageChange,
  isPercentageValue,
  isLoading,
  expenseRatio,
  cardType = "balance",
}) {
  const status = getCardStatus(value, cardType, expenseRatio);
  const showTrend =
    percentageChange != null && cardType !== "savings";
  const trendDirection =
    showTrend && percentageChange !== 0
      ? getTrendDirection(percentageChange, cardType)
      : null;

  if (isLoading) {
    return (
      <Card className="!border-none !bg-white/5">
        <CardHeader className="flex justify-between pb-5">
          <Skeleton className="h-4 w-24 bg-white/30" />
        </CardHeader>
        <CardContent className="space-y-8">
          <Skeleton className="h-10.5 w-full bg-white/30" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12 bg-white/30" />
            <Skeleton className="h-3 w-16 bg-white/30" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCountupValue = (val) => {
    return isPercentageValue
      ? formatPercentage(val, { decimalPlaces: 1 })
      : formatCurrency(val, {
          isExpense: cardType === "expenses",
          showSign: cardType === "balance" && val < 0,
        });
  };

  return (
    <Card className="!border-none !bg-white/5">
      <CardHeader className="flex justify-between pb-5">
        <CardTitle className="text-[15px] text-gray-300 font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div
          className={cn(
            "text-4xl font-bold",
            cardType === "balance" && value < 0
              ? "text-red-400"
              : "text-white"
          )}
        >
          <CountUp
            start={0}
            end={value}
            preserveValue
            decimals={2}
            formattingFn={formatCountupValue}
          />
        </div>

        <div className="text-sm text-muted-foreground mt-2">
          {cardType === "savings" ? (
            <div className="flex items-center gap-1.5">
              <status.Icon className={cn("size-3.5", status.color)} />
              <span className={status.color}>
                {status.label} {value !== 0 && `(${formatPercentage(value)})`}
              </span>
              {status.description && (
                <span className="text-gray-400 ml-1">
                  • {status.description}
                </span>
              )}
            </div>
          ) : dateRange?.value === DateRangeEnum.ALL_TIME ? (
            <span className="text-gray-400">Showing {dateRange?.label}</span>
          ) : value === 0 || status.label ? (
            <div className="flex items-center gap-1.5">
              <status.Icon className={cn("size-3.5", status.color)} />
              <span className={status.color}>{status.label}</span>
              {status.description && (
                <span className="text-gray-400">• {status.description}</span>
              )}
              {!status.description && (
                <span className="text-gray-400">• {dateRange?.label}</span>
              )}
            </div>
          ) : showTrend ? (
            <div className="flex items-center gap-1.5">
              {percentageChange !== 0 && (
                <div
                  className={cn(
                    "flex items-center gap-0.5",
                    trendDirection === "positive"
                      ? "text-green-500"
                      : "text-red-500"
                  )}
                >
                  {trendDirection === "positive" ? (
                    <TrendingUpIcon className="size-3" />
                  ) : (
                    <TrendingDownIcon className="size-3" />
                  )}
                  <span>
                    {formatPercentage(percentageChange, {
                      showSign: percentageChange !== 0,
                      isExpense: cardType === "expenses",
                      decimalPlaces: 1,
                    })}
                  </span>
                </div>
              )}

              {percentageChange === 0 && (
                <div className="flex items-center gap-0.5 text-gray-400">
                  <TrendingDownIcon className="size-3" />
                  <span>
                    {formatPercentage(0, {
                      decimalPlaces: 1,
                    })}
                  </span>
                </div>
              )}
              <span className="text-gray-400">• {dateRange?.label}</span>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
