import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import cartService from '@/services/cart.service';
import type { CartItem, CartStoreState } from '@/types/cart.types';

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      cart: null,
      items: [],
      currentItem: null,
      totalItems: 0,
      totalPrice: 0,
      isLoading: false,
      error: null,

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await cartService.getAll();
          
          // Handle different response structures
          const data = response.data?.data || response.data || response;
          const cart = data.cart || null;
          const items = data.items || data || [];
          
          // Calculate totals
          const totalItems = items.reduce((sum: number, item: CartItem) => 
            sum + item.quantity, 0
          );
          
          const totalPrice = items.reduce((sum: number, item: CartItem) => {
            const price = item.product?.price || 0;
            return sum + (price * item.quantity);
          }, 0);

          set({ 
            cart,
            items: Array.isArray(items) ? items : [],
            totalItems,
            totalPrice,
            isLoading: false 
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch cart',
            isLoading: false,
          });
        }
      },

      addToCart: async (productId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        try {  
          const response = await cartService.create({ 
            product_id: productId, 
            quantity 
          });
          
          const newItem = response.data?.data || response.data || response;
          
          // Refresh cart
          await get().fetchCart();
          
          set({ isLoading: false });
          return newItem;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to add to cart',
            isLoading: false,
          });
          return null;
        }
      },

      updateQuantity: async (itemId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await cartService.update(itemId, { quantity });
          const updatedItem = response.data?.data || response.data || response;
          
          // Refresh cart to get updated totals
          await get().fetchCart();
          
          set({ isLoading: false });
          return updatedItem;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update quantity',
            isLoading: false,
          });
          return null;
        }
      },

      removeFromCart: async (itemId: string) => {
        set({ isLoading: true, error: null });
        try {
          await cartService.delete(itemId);
          
          // Refresh cart
          await get().fetchCart();
          
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to remove item',
            isLoading: false,
          });
          return false;
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const { items } = get();
          await Promise.all(items.map(item => cartService.delete(item.id)));
          
          set({ 
            items: [], 
            cart: null, 
            totalItems: 0,
            totalPrice: 0,
            isLoading: false 
          });
          return true;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to clear cart',
            isLoading: false,
          });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        // Only persist non-sensitive data if needed
        // cart: state.cart,
        // items: state.items,
      }),
    }
  )
);