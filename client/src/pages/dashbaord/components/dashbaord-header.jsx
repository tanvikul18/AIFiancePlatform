// DashboardHeader.js
import React from "react";
import  DateRangeSelect  from "../../../components/data-range-select/index.jsx";
import AddTransactionDrawer from "../../../components/transaction/add-transaction-drawer";

export default function DashboardHeader({ title, subtitle, dateRange, setDateRange }) {
  return (
    <div className="flex flex-col lg:flex-row items-start justify-between space-y-7">
      <div className="space-y-1">
        <h2 className="text-2xl lg:text-4xl font-medium">{title}</h2>
        <p className="text-white/60 text-sm">{subtitle}</p>
      </div>
      <div className="flex justify-end gap-4 mb-6">
        <DateRangeSelect
          dateRange={dateRange || null}
          setDateRange={(range) => setDateRange && setDateRange(range)}
        />
        <AddTransactionDrawer />
      </div>
    </div>
  );
}
