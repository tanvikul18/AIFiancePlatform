// DashboardStats.js
import React from "react";
import { useSummaryAnalyticsQuery } from "../../../features/analytics/analyticsAPI.js";
import SummaryCard from "./summarycard.jsx";

export default function DashboardStats({ dateRange }) {
  const { data, isFetching } = useSummaryAnalyticsQuery(
    { preset: dateRange?.value },
    { skip: !dateRange }
  );
  const summaryData = data?.data;
 
  return (
    <div className="flex flex-row items-center">
      <div className="flex-1 lg:flex-[1] grid grid-cols-1 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Available Balance"
          value={summaryData?.availableBalance}
          percentageChange={summaryData?.percentageChange?.balance}
          dateRange={dateRange}
          isLoading={isFetching}
          cardType="balance"
        />
        <SummaryCard
          title="Total Income"
          value={summaryData?.totalIncome}
          percentageChange={summaryData?.percentageChange?.income}
          dateRange={dateRange}
          isLoading={isFetching}
          cardType="income"
        />
        <SummaryCard
          title="Total Expenses"
          value={summaryData?.totalExpense}
          percentageChange={summaryData?.percentageChange?.expenses}
          dateRange={dateRange}
          isLoading={isFetching}
          cardType="expenses"
        />
        <SummaryCard
          title="Savings Rate"
          value={summaryData?.savingRate?.percentage}
          expenseRatio={summaryData?.savingRate?.expenseRatio}
          isPercentageValue
          dateRange={dateRange}
          isLoading={isFetching}
          cardType="savings"
        />
      </div>
    </div>
  );
}
