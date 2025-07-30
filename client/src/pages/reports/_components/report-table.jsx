import { DataTable } from "../../../components/data-table/index.jsx";
import { reportColumns } from "./column";
import { useState } from "react";
import { useGetAllReportsQuery } from "../../../features/report/reportAPI.js";
import { TransactionType } from "../../../../../backend/src/models/transactionModel.js";
const ReportTable = () => {
  const [filter, setFilter] = useState({
    pageNumber: 1,
    pageSize: 10,
  });

  const { data, isFetching } = useGetAllReportsQuery(filter);
  console.log("Reportsdata",data)
  const pagination = {
    totalItems: data?.pagination?.totalCount || 0,
    totalPages: data?.pagination?.totalPages || 1,
    pageNumber: filter.pageNumber,
    pageSize: filter.pageSize,
  };

  const handlePageChange = (pageNumber) => {
    setFilter((prev) => ({ ...prev, pageNumber }));
  };

  const handlePageSizeChange = (pageSize) => {
    setFilter((prev) => ({ ...prev, pageSize }));
  };

  return (
    <DataTable
      data={data?.reports || []} //data?.reports || []
      columns={reportColumns}
      isLoading={isFetching}
      showSearch={false}
      filters={[]}
      className="[&_td]:!w-[5%]"
      pagination={pagination}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
};

export default ReportTable;