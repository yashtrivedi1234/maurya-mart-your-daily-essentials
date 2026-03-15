import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const heroApi = createApi({
  reducerPath: "heroApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "http://localhost:5001/api/heroes",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Hero"],
  endpoints: (builder) => ({
    getHeroSlides: builder.query({
      query: () => "/",
      providesTags: ["Hero"],
    }),
    createHeroSlide: builder.mutation({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Hero"],
    }),
    updateHeroSlide: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Hero"],
    }),
    deleteHeroSlide: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Hero"],
    }),
  }),
});

export const { 
  useGetHeroSlidesQuery, 
  useCreateHeroSlideMutation, 
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation 
} = heroApi;
