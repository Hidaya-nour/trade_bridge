// stores/supplier.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supplierService } from '@/services/supplier.service';

export interface PublicSupplier {
  id: string;
  business_name: string;
  full_name?: string;
  role: 'factory' | 'distributor';
  business_address?: string;
  country?: string;
  profile_image?: string;
  is_verified: boolean;
  total_products: number;
  total_orders: number;
  joined_date: string;
  payment_terms?: string[];
  delivery_options?: string[];
}

export interface SupplierProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit_type: string;
  min_order_amount: number;
  stock_quantity: number;
  images: string[];
  // rating: number;
  review_count: number;
}

interface SupplierStoreState {
  // Cache of suppliers by ID
  suppliers: Record<string, PublicSupplier>;
  currentSupplier: PublicSupplier | null;
  supplierProducts: SupplierProduct[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  productsPage: number;
  productsTotalPages: number;
  productsTotal: number;
  
  // Actions
  fetchSupplier: (supplierId: string, forceRefresh?: boolean) => Promise<PublicSupplier | null>;
  fetchSuppliers: (supplierIds: string[]) => Promise<void>;
  fetchSupplierProducts: (supplierId: string, page?: number, limit?: number) => Promise<void>;
  searchSuppliers: (query: string, filters?: any) => Promise<PublicSupplier[]>;
  getTopSuppliers: (limit?: number) => Promise<PublicSupplier[]>;
  clearCurrentSupplier: () => void;
  clearError: () => void;
  clearCache: () => void;
}

export const useSupplierStore = create<SupplierStoreState>()(
  persist(
    (set, get) => ({
      suppliers: {},
      currentSupplier: null,
      supplierProducts: [],
      isLoading: false,
      error: null,
      productsPage: 1,
      productsTotalPages: 1,
      productsTotal: 0,
      
      fetchSupplier: async (supplierId, forceRefresh = false) => {
        // Check cache first
        if (!forceRefresh && get().suppliers[supplierId]) {
          return get().suppliers[supplierId];
        }
        
        set({ isLoading: true, error: null });
        try {
          const response = await supplierService.getSupplierById(supplierId);
          const supplier = response.data.supplier;
          
          set(state => ({
            suppliers: { ...state.suppliers, [supplierId]: supplier },
            currentSupplier: supplier,
            isLoading: false
          }));
          
          return supplier;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch supplier', 
            isLoading: false 
          });
          return null;
        }
      },
      
      fetchSuppliers: async (supplierIds) => {
        const uniqueIds = [...new Set(supplierIds)];
        const missingIds = uniqueIds.filter(id => !get().suppliers[id]);
        
        if (missingIds.length === 0) return;
        
        set({ isLoading: true, error: null });
        try {
          const response = await supplierService.getSuppliersByIds(missingIds);
          const fetchedSuppliers = response.data.suppliers;
          
          const newSuppliers = fetchedSuppliers.reduce((acc: any, supplier: any) => {
            acc[supplier.id] = supplier;
            return acc;
          }, {});
          
          set(state => ({
            suppliers: { ...state.suppliers, ...newSuppliers },
            isLoading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch suppliers', 
            isLoading: false 
          });
        }
      },
      
      fetchSupplierProducts: async (supplierId, page = 1, limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const response = await supplierService.getSupplierProducts(supplierId, { page, limit });
          set({ 
            supplierProducts: response.data.products,
            productsPage: response.data.page,
            productsTotalPages: response.data.totalPages,
            productsTotal: response.data.total,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch products', 
            isLoading: false 
          });
        }
      },
      
      searchSuppliers: async (query, filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await supplierService.searchSuppliers({ query, ...filters });
          set({ isLoading: false });
          return response.data.suppliers;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Search failed', 
            isLoading: false 
          });
          return [];
        }
      },
      
      getTopSuppliers: async (limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const response = await supplierService.getTopSuppliers(limit);
          set({ isLoading: false });
          return response.data.suppliers;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch top suppliers', 
            isLoading: false 
          });
          return [];
        }
      },
      
      clearCurrentSupplier: () => set({ currentSupplier: null }),
      clearError: () => set({ error: null }),
      clearCache: () => set({ suppliers: {} }),
    }),
    {
      name: 'supplier-storage',
      partialize: (state) => ({
        suppliers: state.suppliers, // Cache suppliers for offline access
      }),
    }
  )
);