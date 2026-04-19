import { create } from "zustand";

import broadcastService from "@/services/broadcast.service";
import type {
  BroadcastRecord,
  CreateBroadcastPayload,
  UpdateBroadcastPayload,
} from "@/types/broadcast.types";

interface BroadcastState {
  items: BroadcastRecord[];
  currentItem: BroadcastRecord | null;
  isLoading: boolean;
  error: string | null;
  fetchMine: () => Promise<void>;
  fetchById: (id: string) => Promise<BroadcastRecord | null>;
  create: (data: CreateBroadcastPayload) => Promise<BroadcastRecord | null>;
  update: (id: string, data: UpdateBroadcastPayload) => Promise<BroadcastRecord | null>;
  updateStatus: (id: string, status: string) => Promise<BroadcastRecord | null>;
  delete: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useBroadcastStore = create<BroadcastState>((set, get) => ({
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,

  fetchMine: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await broadcastService.getMine();
      set({
        items: response.data || [],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch broadcasts",
        isLoading: false,
      });
    }
  },

  fetchById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await broadcastService.getById(id);
      const item = response.data || null;
      set({
        currentItem: item,
        isLoading: false,
      });
      return item;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch broadcast",
        isLoading: false,
      });
      return null;
    }
  },

  create: async (data: CreateBroadcastPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await broadcastService.create(data);
      const created = response.data || null;
      set((state) => ({
        items: created ? [created, ...state.items] : state.items,
        currentItem: created,
        isLoading: false,
      }));
      return created;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create broadcast",
        isLoading: false,
      });
      return null;
    }
  },

  update: async (id: string, data: UpdateBroadcastPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await broadcastService.update(id, data);
      const updated = response.data || null;
      set((state) => ({
        items: updated
          ? state.items.map((item) => (item.id === id ? updated : item))
          : state.items,
        currentItem: updated,
        isLoading: false,
      }));
      return updated;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update broadcast",
        isLoading: false,
      });
      return null;
    }
  },

  updateStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await broadcastService.updateStatus(id, status);
      const updated = response.data || null;
      set((state) => ({
        items: updated
          ? state.items.map((item) => (item.id === id ? updated : item))
          : state.items,
        currentItem: updated,
        isLoading: false,
      }));
      return updated;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update broadcast status",
        isLoading: false,
      });
      return null;
    }
  },

  delete: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await broadcastService.delete(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        currentItem: state.currentItem?.id === id ? null : state.currentItem,
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete broadcast",
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
