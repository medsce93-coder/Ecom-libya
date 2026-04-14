import {
  useMutation,
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiFetch } from "./api";

type Params = Record<string, string | number | boolean | undefined | null>;

function toSearch(params?: Params) {
  const search = new URLSearchParams();
  if (!params) return "";
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export type Product = {
  id: string;
  slug?: string | null;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  compareAtPrice?: number | null;
  priceQty2?: number | null;
  priceQty3?: number | null;
  imageUrl?: string | null;
  images?: string[];
  categoryId?: string | null;
  categoryName?: string | null;
  stock: number;
  sku?: string | null;
  featured: boolean;
  active: boolean;
  badge?: string | null;
  rating?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  nameAr: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount: number;
  createdAt?: string;
};

export type ProductListResponse = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetProductsParams = {
  categoryId?: string;
  search?: string;
  includeInactive?: string | boolean;
  minPrice?: string | number;
  maxPrice?: string | number;
  inStock?: string | boolean;
  page?: string | number;
  limit?: string | number;
};

export const getGetProductsQueryKey = (
  params?: GetProductsParams,
): QueryKey => ["getProducts", params ?? {}];

export function useGetProducts<
  TData = ProductListResponse,
  TError = Error,
>(
  params?: GetProductsParams,
  options?: {
    query?: UseQueryOptions<ProductListResponse, TError, TData>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGetProductsQueryKey(params);
  const query = useQuery<ProductListResponse, TError, TData>({
    queryKey,
    queryFn: () => apiFetch(`/api/products${toSearch(params)}`),
    ...(options?.query ?? {}),
  });
  return { ...query, queryKey };
}

export const getGetFeaturedProductsQueryKey = (): QueryKey => [
  "getFeaturedProducts",
];

export function useGetFeaturedProducts<
  TData = Product[],
  TError = Error,
>(
  options?: {
    query?: UseQueryOptions<Product[], TError, TData>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey =
    options?.query?.queryKey ?? getGetFeaturedProductsQueryKey();
  const query = useQuery<Product[], TError, TData>({
    queryKey,
    queryFn: () => apiFetch("/api/products/featured"),
    ...(options?.query ?? {}),
  });
  return { ...query, queryKey };
}

export const getGetCategoriesQueryKey = (): QueryKey => ["getCategories"];

export function useGetCategories<
  TData = Category[],
  TError = Error,
>(
  options?: {
    query?: UseQueryOptions<Category[], TError, TData>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGetCategoriesQueryKey();
  const query = useQuery<Category[], TError, TData>({
    queryKey,
    queryFn: () => apiFetch("/api/categories"),
    ...(options?.query ?? {}),
  });
  return { ...query, queryKey };
}

export const getGetProductQueryKey = (id: string): QueryKey => [
  "getProduct",
  id,
];

export function useGetProduct<
  TData = Product,
  TError = Error,
>(
  id: string,
  options?: {
    query?: UseQueryOptions<Product, TError, TData>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGetProductQueryKey(id);
  const query = useQuery<Product, TError, TData>({
    queryKey,
    queryFn: () => apiFetch(`/api/products/${encodeURIComponent(id)}`),
    enabled: Boolean(id),
    ...(options?.query ?? {}),
  });
  return { ...query, queryKey };
}

export type UpdateProductInput = Partial<
  Pick<
    Product,
    | "name"
    | "nameAr"
    | "description"
    | "descriptionAr"
    | "price"
    | "compareAtPrice"
    | "priceQty2"
    | "priceQty3"
    | "imageUrl"
    | "images"
    | "categoryId"
    | "stock"
    | "sku"
    | "featured"
    | "active"
    | "badge"
    | "rating"
  >
>;

export function useUpdateProduct<TError = Error, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<
      Product,
      TError,
      { id: string; data: UpdateProductInput },
      TContext
    >;
  },
): UseMutationResult<
  Product,
  TError,
  { id: string; data: UpdateProductInput },
  TContext
> {
  return useMutation<Product, TError, { id: string; data: UpdateProductInput }, TContext>({
    mutationFn: ({ id, data }) =>
      apiFetch(`/api/products/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: data,
      }),
    ...(options?.mutation ?? {}),
  });
}
