import api from "@/lib/api";
import { type ApiResponse } from "@/features/auth/auth.types";
import { type Cart, type CartItem } from "./cart.types";

const cartService = {
  async getCart() {
    const response = await api.get<ApiResponse<Cart>>("/cart");
    return response.data;
  },

  async addToCart(productId: string, quantity: number) {
    const response = await api.post<ApiResponse<Cart>>("/cart", {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  async updateCartItem(itemId: string, quantity: number) {
    // Backend may return a plain cart item for this endpoint.
    const response = await api.put<ApiResponse<CartItem> | CartItem>(`/cart/items/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  async removeFromCart(itemId: string) {
    const response = await api.delete<ApiResponse<Cart>>(`/cart/${itemId}`);
    return response.data;
  },

  async clearCart() {
    const response = await api.delete<ApiResponse<{ success: boolean }>>("/cart");
    return response.data;
  },
};

export default cartService;

