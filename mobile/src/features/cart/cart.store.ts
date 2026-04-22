import { create } from "zustand";
import cartService from "./cart.service";
import { type Cart, type CartItem } from "./cart.types";

interface CartStoreState {
  cart: Cart | null;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  clearError: () => void;
}

const extractItems = (cart: Cart | null) => {
  const items = cart?.items ?? [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = Number(item.product?.price ?? 0);
    return sum + price * item.quantity;
  }, 0);

  return { items, totalItems, totalPrice };
};

const getCartErrorMessage = (error: any) => {
  if (!error?.response) {
    return "Unable to update cart. Check network/backend connection.";
  }

  return error?.response?.data?.message ?? "Failed to update cart";
};

export const useCartStore = create<CartStoreState>((set, get) => ({
  cart: null,
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await cartService.getCart();
      const cart = response.data ?? null;
      const computed = extractItems(cart);

      set({
        cart,
        ...computed,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: getCartErrorMessage(error),
        isLoading: false,
      });
    }
  },

  addToCart: async (productId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      await cartService.addToCart(productId, quantity);
      await get().fetchCart();
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: getCartErrorMessage(error),
        isLoading: false,
      });
      return false;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      await cartService.updateCartItem(itemId, quantity);
      await get().fetchCart();
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: getCartErrorMessage(error),
        isLoading: false,
      });
      return false;
    }
  },

  removeFromCart: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      await cartService.removeFromCart(itemId);
      await get().fetchCart();
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: getCartErrorMessage(error),
        isLoading: false,
      });
      return false;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartService.clearCart();
      await get().fetchCart();
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: getCartErrorMessage(error),
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

