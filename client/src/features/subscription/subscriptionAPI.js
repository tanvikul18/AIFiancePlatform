// reportApi.js
import { apiClient } from "../../app/api-client.js";

export const subscriptionApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    verifyPayments: builder.mutation({
      query: ({razorpay_order_id}) => ({
        url: "/subscription/verify",
        method: "POST",
        body: {razorpay_order_id},
      }),
    }),

    doPayments: builder.mutation({
      query: ({planId}) => ({
        url: "/subscription/pay",
        method: "POST",
        body: {planId},
      }),
       invalidatesTags: ["billingSubscription"],
    }),
  }),
  overrideExisting: false,
});

export const {
 useDoPaymentsMutation,
 useVerifyPaymentsMutation
} = subscriptionApi;
