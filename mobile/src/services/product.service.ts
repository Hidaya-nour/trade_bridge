import api from "../lib/api";
import { type ApiResponse } from "../types/auth.types";
import { type Product, type ProductFilters, type ProductsPayload } from "../types/product.types";

const buildProductQuery = (filters?: ProductFilters) => {
  const params = new URLSearchParams();

  if (!filters) {
    return params.toString();
  }

  if (filters.category) params.append("category", filters.category);
  if (filters.minPrice !== undefined) params.append("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.append("maxPrice", String(filters.maxPrice));
  if (filters.supplier_id) params.append("supplierId", filters.supplier_id);
  if (filters.search) params.append("search", filters.search);
  if (filters.is_available !== undefined) params.append("isAvailable", String(filters.is_available));
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

  return params.toString();
};

const productService = {
  async getProducts(filters?: ProductFilters) {
    const query = buildProductQuery(filters);
    const path = query ? `/products?${query}` : "/products";
    const response = await api.get<ApiResponse<ProductsPayload>>(path);
    return response.data;
  },

  async getProductById(id: string) {
    const response = await api.get<ApiResponse<{ product: Product }>>(`/products/${id}`);
    return response.data;
  },

  async getCategories() {
    const response = await api.get<ApiResponse<{ categories: string[] }>>("/products/categories");
    return response.data;
  },
};

export default productService;

