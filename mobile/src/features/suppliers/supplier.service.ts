import api from "@/lib/api";
import { type ApiResponse } from "@/features/auth/auth.types";
import { type Supplier, type SupplierFilters } from "./supplier.types";

const buildSupplierQuery = (filters?: SupplierFilters) => {
  const params = new URLSearchParams();

  if (!filters) {
    return params.toString();
  }

  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));

  return params.toString();
};

const supplierService = {
  async getSuppliers(filters?: SupplierFilters) {
    const query = buildSupplierQuery(filters);
    const path = query ? `/suppliers?${query}` : "/suppliers";
    const response = await api.get<ApiResponse<{ suppliers: Supplier[] }>>(path);
    return response.data;
  },

  async getSupplierById(id: string) {
    const response = await api.get<ApiResponse<{ supplier: Supplier }>>(`/suppliers/${id}`);
    return response.data;
  },
};

export default supplierService;
