import { create } from "zustand";
import productService from "../services/product.service";
import { type Product, type ProductFilters } from "../types/product.types";

interface ProductStoreState {
  products: Product[];
  product: Product | null;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  categories: string[];
  filters: ProductFilters;
  isLoading: boolean;
  error: string | null;
  fetchProducts: (filters?: ProductFilters, options?: { replace?: boolean }) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchCategories: () => Promise<void>;
  clearProduct: () => void;
  clearError: () => void;
}

const getProductErrorMessage = (error: any) => {
  if (!error?.response) {
    return "Unable to fetch products. Check network/backend connection.";
  }

  return error?.response?.data?.message ?? "Failed to fetch products";
};

export const useProductStore = create<ProductStoreState>((set, get) => ({
  products: [],
  product: null,
  totalProducts: 0,
  currentPage: 1,
  totalPages: 1,
  categories: [],
  filters: {},
  isLoading: false,
  error: null,

  fetchProducts: async (filters, options) => {
    set({ isLoading: true, error: null });

    try {
      const mergedFilters = {
        ...(options?.replace ? {} : get().filters),
        ...filters,
      };

      const response = await productService.getProducts(mergedFilters);
      const data = response.data;

      set({
        products: data?.products ?? [],
        totalProducts: data?.total ?? 0,
        currentPage: data?.page ?? mergedFilters.page ?? 1,
        totalPages: data?.totalPages ?? 1,
        filters: mergedFilters,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: getProductErrorMessage(error),
        isLoading: false,
      });
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const response = await productService.getProductById(id);
      const product = response.data.product;
      set({ product, isLoading: false });
      return product;
    } catch (error: any) {
      set({
        error: getProductErrorMessage(error),
        isLoading: false,
      });
      return null;
    }
  },

  fetchCategories: async () => {
    try {
      const response = await productService.getCategories();
      set({ categories: response.data.categories ?? [] });
    } catch (error: any) {
      set({ error: getProductErrorMessage(error) });
    }
  },

  clearProduct: () => set({ product: null }),
  clearError: () => set({ error: null }),
}));

