// TransactionTable.js
import React, { useMemo, useState } from "react";
import { DataTable } from "../../data-table/index.jsx";
import { transactionColumns } from "./column";
import { TRANSACTION_TYPE } from "../../../constant/index.js";
import useDebouncedSearch from "../../../hooks/use-debounce-search.js";
import {
  useBulkDeleteTransactionMutation,
  useGetAllTransactionsQuery,
} from "../../../features/transaction/transactionAPI.js";
import { toast } from "sonner";

import useEditTransactionDrawer from "../../../hooks/use-edit-transaction-drawer.js";

const TransactionTable = ({ pageSize = 10, isShowPagination }) => {
  const [filter, setFilter] = useState({
    type: undefined,
    recurringStatus: undefined,
    pageNumber: 1,
    pageSize,
  });

  const { debouncedTerm, setSearchTerm } = useDebouncedSearch("", {
    delay: 500,
  });

  const [bulkDeleteTransaction, { isLoading: isBulkDeleting }] =
    useBulkDeleteTransactionMutation();

   

  const { data, isFetching } = useGetAllTransactionsQuery({
    keyword: debouncedTerm,
    type: filter.type,
    recurringStatus: filter.recurringStatus,
    pageNumber: filter.pageNumber,
    pageSize: filter.pageSize,
  });

  // Ensure transactions list isn't undefined
  const transactions = useMemo(() => data?.transactions ?? [], [
    data?.transactions,
  ]);

  const columns = useMemo(() => transactionColumns, [transactionColumns]);
  
  const pagination = useMemo(
    () => ({
      totalItems: data?.pagination?.totalCount || 0,
      totalPages: data?.pagination?.totalPages || 0,
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize,
    }),
    [
      data?.pagination?.totalCount,
      data?.pagination?.totalPages,
      filter.pageNumber,
      filter.pageSize,
    ]
  );


  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilter((prev) => ({ ...prev, pageNumber: 1 }));
  };

  const handleFilterChange = ({ type, frequently }) => {
    setFilter((prev) => ({
      ...prev,
      type,
      recurringStatus: frequently,
      pageNumber: 1,
    }));
  };

  const handlePageChange = (pageNumber) =>
    setFilter((prev) => ({ ...prev, pageNumber }));

  const handlePageSizeChange = (pageSize) =>
    setFilter((prev) => ({ ...prev, pageSize, pageNumber: 1 }));

  const handleBulkDelete = (transactionIds) => {
  
    bulkDeleteTransaction(transactionIds)
      .unwrap()
      .then(() => toast.success("Transactions deleted successfully"))
      .catch((error) =>
        toast.error(error.data?.message || "Failed to delete transactions")
      );
  };

 

  return (
    <DataTable
      data={transactions}
      columns={transactionColumns}
      searchPlaceholder="Search transactions..."
      isLoading={isFetching}
      isBulkDeleting={isBulkDeleting}
      isShowPagination={isShowPagination}
      pagination={pagination}
      filters={[
        {
          key: "type",
          label: "All Types",
          options: [
            { value: TRANSACTION_TYPE.INCOME, label: "Income" },
            { value: TRANSACTION_TYPE.EXPENSE, label: "Expense" },
          ],
        },
        {
          key: "frequently",
          label: "Frequency",
          options: [
            { value: "RECURRING", label: "Recurring" },
            { value: "NON_RECURRING", label: "Non-Recurring" },
          ],
        },
      ]}
      onSearch={handleSearch}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onFilterChange={handleFilterChange}
      onBulkDelete={handleBulkDelete}
      
      />
 
  );
};

export default TransactionTable;
