import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/api/payment",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation({
      query: (amount) => ({
        url: "/create-order",
        method: "POST",
        body: { amount },
      }),
    }),
    verifyPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/verify-payment",
        method: "POST",
        body: paymentData,
      }),
    }),
  }),
});

export const { useCreateRazorpayOrderMutation, useVerifyPaymentMutation } = paymentApi;
