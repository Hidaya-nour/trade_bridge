import { create } from 'zustand';
import type { Product, ProductFilters } from '../types/product.types';
import productService from '@/services/product.service';

interface ProductState {
  products: Product[];
  product: Product | null;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  categories: string[];
  
  // Actions - FIXED: Added options parameter
  fetchProducts: (filters?: ProductFilters, options?: { replace?: boolean }) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchCategories: () => Promise<void>;
  createProduct: (data: any) => Promise<Product | null>;
  updateProduct: (id: string, data: any) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateStock: (id: string, quantity: number) => Promise<boolean>;
  toggleAvailability: (id: string) => Promise<boolean>;
  setFilters: (filters: ProductFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  product: null,
  totalProducts: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  filters: {},
  categories: [],

  fetchProducts: async (filters?: ProductFilters, options?: { replace?: boolean }) => {
    set({ isLoading: true, error: null });
    try {
      const mergedFilters = { 
        ...(options?.replace ? {} : get().filters), 
        ...filters 
      };
      
      const response = await productService.getProducts(mergedFilters);
      
      // Handle different response structures
      const productsData = response.data?.products || response.data || [];
      const total = response.data?.total || productsData.length;
      const page = response.data?.page || 1;
      const totalPages = response.data?.totalPages || Math.ceil(total / (mergedFilters.limit || 20));
      
      set({
        products: productsData,
        totalProducts: total,
        currentPage: page,
        totalPages: totalPages,
        filters: mergedFilters,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Fetch products error:", error);
      set({
        error: error.response?.data?.message || 'Failed to fetch products',
        isLoading: false,
      });
    }
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.getProductById(id);
      set({ isLoading: false, product: response.data.product });
      return response.data.product;
      
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch product',
        isLoading: false,
      });
      return null;
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await productService.getCategories();
      set({ categories });
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
    }
  },

  createProduct: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.createProduct(data);
      
      // Refresh product list
      await get().fetchProducts();
      
      set({ isLoading: false });
      return response.data.product;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create product',
        isLoading: false,
      });
      return null;
    }
  },

  updateProduct: async (id: string, data: any) => {
  set({ isLoading: true, error: null });

  try {
    const response = await productService.updateProduct(id, data);
    const updatedProduct = response.data.product;

    const state = get();

    set({
      // 🔥 Update list
      products: state.products.map((p) =>
        p.id === id ? updatedProduct : p
      ),

      // 🔥 Update single product (THIS WAS MISSING)
      product:
        state.product && state.product.id === id
          ? updatedProduct
          : state.product,

      isLoading: false,
    });

    return updatedProduct;
  } catch (error: any) {
    set({
      error:
        error.response?.data?.message || "Failed to update product",
      isLoading: false,
    });

    return null;
  }
},

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await productService.deleteProduct(id);
      
      // Remove from list
      const products = get().products.filter(p => p.id !== id);
      
      set({ products, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete product',
        isLoading: false,
      });
      return false;
    }
  },

  updateStock: async (id: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.updateStock(id, quantity);
      
      // Update product in list
      const products = get().products.map(p => 
        p.id === id ? { ...p, stock_quantity: quantity } : p
      );
      
      set({ products, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update stock',
        isLoading: false,
      });
      return false;
    }
  },

  toggleAvailability: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.toggleAvailability(id);
      
      // Update product in list
      const products = get().products.map(p => 
        p.id === id ? { ...p, is_available: response.data.is_available } : p
      );
      
      set({ products, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to toggle availability',
        isLoading: false,
      });
      return false;
    }
  },

  setFilters: (filters: ProductFilters) => {
    set({ filters: { ...get().filters, ...filters } });
    get().fetchProducts();
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchProducts();
  },

  clearError: () => set({ error: null }),
}));