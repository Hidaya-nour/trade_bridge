import { create } from 'zustand';
import deliveryService from '@/services/delivery.service';
import driverIssueService from '@/services/driver-issue.service';

interface DeliveryState {
  items: any[];
  currentItem: any | null;
  isLoading: boolean;
  error: string | null;
  lastFetchMode: "all" | "my" | "supplier" | null;
  lastFetchParams: any;
  
  fetchAll: (params?: any) => Promise<void>;
  fetchMyDeliveries: () => Promise<void>;
  fetchSupplierDeliveries: () => Promise<void>;
  fetchById: (id: string) => Promise<any | null>;
  create: (data: any) => Promise<any | null>;
  update: (id: string, data: any) => Promise<any | null>;
  delete: (id: string) => Promise<boolean>;
  reportIssue: (data: { deliveryId?: string; description: string; location?: string }) => Promise<any | null>;

  // Realtime helpers
  upsertItems: (items: any[]) => void;
  refreshLastSilent: () => Promise<void>;
  refreshByIdSilent: (id: string) => Promise<any | null>;
  clearError: () => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,
  lastFetchMode: null,
  lastFetchParams: undefined,

  upsertItems: (incoming: any[]) => {
    if (!Array.isArray(incoming) || incoming.length === 0) return;
    const existing = get().items || [];
    const byId = new Map(existing.map((item) => [String(item?.id), item]));

    for (const nextItem of incoming) {
      const id = String(nextItem?.id);
      if (!id) continue;
      const prev = byId.get(id);
      byId.set(id, prev ? { ...prev, ...nextItem } : nextItem);
    }

    const kept = existing
      .map((item) => byId.get(String(item?.id)) || item)
      .filter(Boolean);
    const appended = incoming.filter(
      (item) => !existing.some((e) => String(e?.id) === String(item?.id)),
    );

    set({ items: [...kept, ...appended] });
  },

  refreshLastSilent: async () => {
    const mode = get().lastFetchMode;
    if (!mode) return;
    try {
      const data =
        mode === "my"
          ? await deliveryService.getMyDeliveries()
          : mode === "supplier"
            ? await deliveryService.getSupplierDeliveries()
            : await deliveryService.getAll(get().lastFetchParams);
      const rows = (data as any)?.data || data;
      const incoming = Array.isArray(rows) ? rows : [];
      get().upsertItems(incoming);
    } catch {
      // silent
    }
  },

  refreshByIdSilent: async (id: string) => {
    try {
      const data = await deliveryService.getById(id);
      const item = (data as any)?.data || data;
      if (item) {
        const current = get().currentItem;
        set({ currentItem: current ? { ...current, ...item } : item });
        get().upsertItems([item]);
      }
      return item || null;
    } catch {
      return null;
    }
  },

  fetchAll: async (params?: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deliveryService.getAll(params);
      const rows = response?.data || response;
      set({
        items: rows,
        lastFetchMode: "all",
        lastFetchParams: params,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch items',
        isLoading: false,
      });
    }
  },

  fetchMyDeliveries: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await deliveryService.getMyDeliveries();
      const rows = (response as any)?.data || response;
      set({
        items: rows,
        lastFetchMode: "my",
        lastFetchParams: undefined,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch deliveries",
        isLoading: false,
      });
    }
  },

  fetchSupplierDeliveries: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await deliveryService.getSupplierDeliveries();
      const rows = (response as any)?.data || response;
      set({
        items: rows,
        lastFetchMode: "supplier",
        lastFetchParams: undefined,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch deliveries",
        isLoading: false,
      });
    }
  },

  fetchById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deliveryService.getById(id);
      set({ currentItem: response.data || response, isLoading: false });
      return response.data || response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch item',
        isLoading: false,
      });
      return null;
    }
  },

  create: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deliveryService.create(data);
      // Optional: Refresh list
      // await get().fetchAll();
      set({ isLoading: false });
      return response.data || response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create item',
        isLoading: false,
      });
      return null;
    }
  },

  update: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deliveryService.update(id, data);
      
      const items = get().items.map(p => 
        p.id === id ? (response.data || response) : p
      );
      
      set({ items, currentItem: response.data || response, isLoading: false });
      return response.data || response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update item',
        isLoading: false,
      });
      return null;
    }
  },

  delete: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deliveryService.delete(id);
      
      const items = get().items.filter(p => p.id !== id);
      set({ items, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete item',
        isLoading: false,
      });
      return false;
    }
  },

  reportIssue: async (data: { deliveryId?: string; description: string; location?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        delivery_id: data.deliveryId,
        category: "delivery_issue",
        sub_type: "Delivery issue",
        location: data.location || "N/A",
        urgency: "medium",
        description: data.description,
      };
      const response = await driverIssueService.create(payload as any);
      set({ isLoading: false });
      return response?.data?.report || response?.data || response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to report issue',
        isLoading: false,
      });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
