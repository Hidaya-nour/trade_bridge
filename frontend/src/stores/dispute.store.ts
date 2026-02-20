import { create } from 'zustand';
import disputeService from '@/services/dispute.service';

interface DisputeState {
  items: any[];
  currentItem: any | null;
  isLoading: boolean;
  error: string | null;
  
  fetchAll: (params?: any) => Promise<void>;
  fetchById: (id: string) => Promise<any | null>;
  create: (data: any) => Promise<any | null>;
  update: (id: string, data: any) => Promise<any | null>;
  delete: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useDisputeStore = create<DisputeState>((set, get) => ({
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,

  fetchAll: async (params?: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await disputeService.getAll(params);
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
      const response = await disputeService.getById(id);
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
      const response = await disputeService.create(data);
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
      const response = await disputeService.update(id, data);
      
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
      await disputeService.delete(id);
      
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

  clearError: () => set({ error: null }),
}));
