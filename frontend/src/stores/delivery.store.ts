import { create } from 'zustand';
import deliveryService from '@/services/delivery.service';
import driverIssueService from '@/services/driver-issue.service';

interface DeliveryState {
  items: any[];
  currentItem: any | null;
  isLoading: boolean;
  error: string | null;
  
  fetchAll: (params?: any) => Promise<void>;
  fetchById: (id: string) => Promise<any | null>;
  create: (data: any) => Promise<any | null>;
  update: (id: string, data: any) => Promise<any | null>;
  delete: (id: string) => Promise<boolean>;
  reportIssue: (data: { deliveryId?: string; description: string; location?: string }) => Promise<any | null>;
  clearError: () => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,

  fetchAll: async (params?: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deliveryService.getAll(params);
      set({ items: response.data || response, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch items',
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
