import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/apiBase";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  reviews: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isTrending: boolean;
  createdAt: string;
  updatedAt: string;
}

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${API_BASE_URL}/api/products`,
    prepareHeaders: (headers) => {
      const userToken = localStorage.getItem("token");
      const adminToken = localStorage.getItem("adminToken");
      const token = adminToken || userToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => "/",
      providesTags: ["Product"],
    }),
    getProductById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation({
      query: (newProduct) => ({
        url: "/",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    getTrendingProducts: builder.query({
      query: () => "/trending",
      providesTags: ["Product"],
    }),
    updateProductStatus: builder.mutation({
      query: ({ id, statusData }) => ({
        url: `/admin/${id}/status`,
        method: "PATCH",
        body: statusData,
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const { 
  useGetProductsQuery, 
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetTrendingProductsQuery,
  useUpdateProductStatusMutation
} = productApi;
