// analyticsApi.js
import { apiClient } from "../../app/api-client.js";

export const analyticsApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    summaryAnalytics: builder.query({
      query: ({ preset, from, to }) => ({
        url: "/analytics/summary",
        method: "GET",
        params: { preset, from, to },
      }),
      providesTags: ["analytics"],
    }),
    chartAnalytics: builder.query({
      query: ({ preset, from, to }) => ({
        url: "/analytics/chart",
        method: "GET",
        params: { preset, from, to },
      }),
      providesTags: ["analytics"],
    }),
    expensePieChartBreakdown: builder.query({
      query: ({ preset, from, to }) => ({
        url: "/analytics/piechart",
        method: "GET",
        params: { preset, from, to },
      }),
      providesTags: ["analytics"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSummaryAnalyticsQuery,
  useChartAnalyticsQuery,
  useExpensePieChartBreakdownQuery,
} = analyticsApi;
