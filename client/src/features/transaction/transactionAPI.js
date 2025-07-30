// transactionApi.js
import { apiClient } from "../../app/api-client.js";

export const transactionApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    createTransaction: builder.mutation({
      query: (body) => ({
        url: "/transaction/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["transactions", "analytics"],
    }),

    aiScanReceipt: builder.mutation({
      query: (formData) => ({
        url: "/transaction/scan-receipt",
        method: "POST",
        body: formData,
      }),
    }),

    getAllTransactions: builder.query({
      query: (params) => {
        const {
          keyword = undefined,
          type = undefined,
          recurringStatus = undefined,
          pageNumber = 1,
          pageSize = 10,
        } = params;

        return {
          url: "/transaction/",
          method: "GET",
          params: {
            keyword,
            type,
            recurringStatus,
            pageNumber,
            pageSize,
          },
        };
      },
      providesTags: ["transactions"],
    }),

    getSingleTransaction: builder.query({
      query: (id) => ({
        url: `/transaction/${id}`,
        method: "GET",
      }),
    }),

    duplicateTransaction: builder.mutation({
      query: (id) => ({
        url: `/transaction/duplicate/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["transactions"],
    }),

    updateTransaction: builder.mutation({
      query: ({ id, transaction }) => ({
        url: `/transaction/update/${id}`,
        method: "PUT",
        body: transaction,
      }),
      invalidatesTags: ["transactions", "analytics"],
    }),

    bulkImportTransaction: builder.mutation({
      query: (body) => ({
        url: "/transaction/create-bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["transactions"],
    }),

    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `/transaction/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["transactions", "analytics"],
    }),

    bulkDeleteTransaction: builder.mutation({
      query: (transactionIds) => ({
        url: "/transaction/delete-bulk",
        method: "DELETE",
        body: { transactionIds },
      }),
      invalidatesTags: ["transactions", "analytics"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateTransactionMutation,
  useGetAllTransactionsQuery,
  useAiScanReceiptMutation,
  useGetSingleTransactionQuery,
  useDuplicateTransactionMutation,
  useUpdateTransactionMutation,
  useBulkImportTransactionMutation,
  useDeleteTransactionMutation,
  useBulkDeleteTransactionMutation,
} = transactionApi;
