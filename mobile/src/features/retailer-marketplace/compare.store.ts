import { create } from "zustand";

const MAX_COMPARE_SUPPLIERS = 4;

type ToggleCompareResult = "added" | "removed" | "limit";

interface CompareStoreState {
  supplierIds: string[];
  toggleSupplier: (supplierId: string) => ToggleCompareResult;
  setSupplierIds: (supplierIds: string[]) => void;
  clearSuppliers: () => void;
}

export const useRetailerCompareStore = create<CompareStoreState>((set, get) => ({
  supplierIds: [],

  toggleSupplier: (supplierId) => {
    const current = get().supplierIds;

    if (current.includes(supplierId)) {
      set({ supplierIds: current.filter((id) => id !== supplierId) });
      return "removed";
    }

    if (current.length >= MAX_COMPARE_SUPPLIERS) {
      return "limit";
    }

    set({ supplierIds: [...current, supplierId] });
    return "added";
  },

  setSupplierIds: (supplierIds) => {
    set({ supplierIds: supplierIds.slice(0, MAX_COMPARE_SUPPLIERS) });
  },

  clearSuppliers: () => set({ supplierIds: [] }),
}));
