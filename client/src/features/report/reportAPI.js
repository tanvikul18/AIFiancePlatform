// reportApi.js
import { apiClient } from "../../app/api-client.js";

export const reportApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    getAllReports: builder.query({
      query: (params) => {
        const { pageNumber = 1, pageSize = 20 } = params;
        return {
          url: "/report/all",
          method: "GET",
          params: { pageNumber, pageSize },
        };
      },
    }),

    updateReportSetting: builder.mutation({
      query: (payload) => ({
        url: "/report/update",
        method: "PUT",
        body: payload,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllReportsQuery,
  useUpdateReportSettingMutation,
} = reportApi;
