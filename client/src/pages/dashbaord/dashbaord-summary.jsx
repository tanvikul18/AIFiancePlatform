// DashboardSummary.js
import React from "react";

import DashboardHeader from "./components/dashbaord-header.jsx";
import DashboardStats from "./components/dashboard-stats.jsx";
import { useSelector } from "react-redux";

export default function DashboardSummary({ dateRange, setDateRange }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="w-full">
      <DashboardHeader
        title={`Welcome back, ${user?.name || "Unknown"}`}
        subtitle="This is your overview report for the selected period"
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      <DashboardStats dateRange={dateRange} />
    </div>
  );
}
