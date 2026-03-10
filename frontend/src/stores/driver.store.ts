import { create } from "zustand";
import DriverService, {
  type Driver,
} from "@/services/driver.service";

interface DriverState {
  drivers: Driver[];
  isLoading: boolean;
  error: string | null;

  fetchMyDrivers: () => Promise<void>;
  addDriver: (data: {
    driver_id: string;
    vehicle_type?: string;
    license_plate?: string;
  }) => Promise<Driver | null>;
  updateDriver: (
    id: string,
    data: Partial<
      Pick<Driver, "vehicle_type" | "license_plate" | "active">
    >,
  ) => Promise<Driver | null>;
  removeDriver: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useDriverStore = create<DriverState>(
  (set, get) => ({
    drivers: [],
    isLoading: false,
    error: null,

    fetchMyDrivers: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await DriverService.getMyDrivers();
        const list = Array.isArray(data?.drivers) ? data.drivers : [];
        set({ drivers: list, isLoading: false });
      } catch (error: any) {
        set({
          error:
            error?.response?.data?.message ||
            "Failed to fetch drivers",
          isLoading: false,
        });
      }
    },

    addDriver: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        await DriverService.addDriver(payload);
        // Refetch so the list includes the new driver with nested user info (name, phone) for dropdown
        await get().fetchMyDrivers();
        return true;
      } catch (error: any) {
        set({
          error:
            error?.response?.data?.message ||
            "Failed to add driver to supplier",
          isLoading: false,
        });
        return null;
      }
    },

    updateDriver: async (id, payload) => {
      set({ isLoading: true, error: null });
      try {
        const updated = await DriverService.updateDriver(id, payload);
        set({
          drivers: get().drivers.map((d) => (d.id === id ? updated : d)),
          isLoading: false,
        });
        return updated;
      } catch (error: any) {
        set({
          error:
            error?.response?.data?.message ||
            "Failed to update driver",
          isLoading: false,
        });
        return null;
      }
    },

    removeDriver: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await DriverService.removeDriver(id);
        set({
          drivers: get().drivers.filter((d) => d.id !== id),
          isLoading: false,
        });
        return true;
      } catch (error: any) {
        set({
          error:
            error?.response?.data?.message ||
            "Failed to remove driver",
          isLoading: false,
        });
        return false;
      }
    },

    clearError: () => set({ error: null }),
  }),
);

