import { apiClient } from "../../app/api-client.js";


export const userApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    updateUser: builder.mutation({
      query: (formData) => ({
        url: "/user/update",
        method: "POST",
        body: formData,
         formData: true,
      }),
    }),
  }),
});

export const { useUpdateUserMutation } = userApi;