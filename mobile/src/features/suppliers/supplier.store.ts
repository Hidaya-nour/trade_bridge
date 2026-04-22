import { create } from "zustand";
import supplierService from "./supplier.service";
import { type Supplier } from "./supplier.types";

interface SupplierStoreState {
  suppliers: Supplier[];
  supplier: Supplier | null;
  isLoading: boolean;
  error: string | null;
  fetchSuppliers: () => Promise<void>;
  fetchSupplierById: (id: string) => Promise<Supplier | null>;
  clearSupplier: () => void;
  clearError: () => void;
}

const getSupplierErrorMessage = (error: any) => {
  if (!error?.response) {
    return "Unable to fetch suppliers. Check network/backend connection.";
  }

  return error?.response?.data?.message ?? "Failed to fetch suppliers";
};

export const useSupplierStore = create<SupplierStoreState>((set) => ({
  suppliers: [],
  supplier: null,
  isLoading: false,
  error: null,

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await supplierService.getSuppliers({ limit: 50 });
      set({
        suppliers: response.data.suppliers ?? [],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: getSupplierErrorMessage(error),
        isLoading: false,
      });
    }
  },

  fetchSupplierById: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const response = await supplierService.getSupplierById(id);
      const supplier = response.data.supplier ?? null;
      set({ supplier, isLoading: false });
      return supplier;
    } catch (error: any) {
      set({
        error: getSupplierErrorMessage(error),
        isLoading: false,
      });
      return null;
    }
  },

  clearSupplier: () => set({ supplier: null }),
  clearError: () => set({ error: null }),
}));
