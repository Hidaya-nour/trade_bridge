import React, { useEffect, useState } from "react";
import { ProductCatalog } from "@/features/products/ProductCatalog";
import type { CatalogConfig } from "@/types/product.types";
import { useProductStore } from "@/stores/product.store";
import { useCartStore } from "@/stores/cart.store";
import { Factory } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth.store";

const categories = ["Beverages", "Foods"];

const locations = [
  "All Locations",
  "Addis Ababa",
  "Adama",
  "Mekelle",
  "Bahir Dar",
  "Hawassa",
  "Dire Dawa",
];

const DistributorMarketplacePage: React.FC = () => {
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const user = useAuthStore((state) => state.user);

  const {
    products: storeProducts,
    isLoading,
    error,
    fetchProducts,
    clearError,
  } = useProductStore();

  const {
    items: cartItems,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    isLoading: cartLoading,
  } = useCartStore();

  // Fetch products and cart on component mount

  useEffect(() => {
    fetchProducts(
      {
        is_available: true,
        exclude_supplier_id: user?.id,
      },
      { replace: true },
    );
    fetchCart();
  }, [fetchProducts, fetchCart, user?.id]);

  // Transform store products to match ProductCatalog expected format
  useEffect(() => {
    if (storeProducts && storeProducts.length > 0) {
      console.log("Marketplace store products:", storeProducts);

      const transformedProducts = storeProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        supplier_id: p.supplier_id,
        supplier_name:
          p.supplier_name || p.supplier?.business_name || "Factory",
        category: p.category,
        subcategory: p.subcategory,
        price: Number(p.price) || 0,
        unit: p.unit_type || "kg",
        min_order_amount: p.min_order_amount,
        maxOrder: p.max_order_amount,
        stock: Number(p.stock_quantity) || 0,
        rating: Number(p.rating) || 0,
        reviews: p.review_count || 0,
        location: p.location || p.supplier?.city || "Addis Ababa",
        deliveryTime: p.delivery_time || "2-3 days",
        verified: p.is_verified || false,
        image: p.images?.[0] || null,
        description: p.description || "",
        tags: p.tags || [],
        volumeDiscount: p.volume_discount,
        leadTime: p.lead_time || "2-3 days",
        paymentTerms: p.payment_terms || ["Credit", "Mobile", "Bank Transfer"],
      }));
      setLocalProducts(transformedProducts);
    } else {
      setLocalProducts([]);
    }
  }, [storeProducts]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Cart handlers using your existing cart store
  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      const product = localProducts.find((p) => p.id === productId);
      if (!product) return;

      // Check if quantity meets minimum order
      if (quantity < product.min_order_amount) {
        toast.error(
          `Minimum order is ${product.min_order_amount} ${product.unit}`,
        );
        return;
      }

      // Check if enough stock
      if (quantity > product.stock) {
        toast.error(`Only ${product.stock} ${product.unit} available`);
        return;
      }

      const result = await addToCart(productId, quantity);
      if (result) {
        toast.success(
          `Added ${quantity} ${product.unit} of ${product.name} to cart`,
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    try {
      const product = localProducts.find((p) => p.id === productId);
      if (!product) return;

      // Find the cart item ID for this product
      const cartItem = cartItems.find((item) => item.product_id === productId);
      if (!cartItem) return;

      const result = await removeFromCart(cartItem.id);
      if (result) {
        toast.success(`Removed ${product.name} from cart`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to remove from cart");
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      const product = localProducts.find((p) => p.id === productId);
      if (!product) return;

      // Find the cart item ID for this product
      const cartItem = cartItems.find((item) => item.product_id === productId);
      if (!cartItem) return;

      // Check if quantity meets minimum order
      if (quantity < product.min_order_amount) {
        toast.error(
          `Minimum order is ${product.min_order_amount} ${product.unit}`,
        );
        return;
      }

      // Check if enough stock
      if (quantity > product.stock) {
        toast.error(`Only ${product.stock} ${product.unit} available`);
        return;
      }

      const result = await updateQuantity(cartItem.id, quantity);
      if (result) {
        toast.success(`Updated quantity for ${product.name}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update quantity");
    }
  };

  // Helper functions for cart state
  const getCartQuantity = (productId: string): number => {
    const cartItem = cartItems.find((item) => item.product_id === productId);
    return cartItem?.quantity || 0;
  };

  const getTotalCartItems = (): number => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalCartValue = (): number => {
    return cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const config: CatalogConfig = {
    role: "distributor",
    title: "Purchase Products",
    description:
      "Source products directly from Ethiopian manufacturers and factories",
    supplierLabel: "Factory",
    supplierPath: "/factories",
    icon: Factory,
    categories,
    locations,
    showVolumeDiscount: true,
    cartPath: "/distributor/cart",
    ordersPath: "/distributor/purchase-orders",
    productsPath: "/distributor/marketplace",
    continueShoppingPath: "/distributor/marketplace",
  };

  return (
    <ProductCatalog
      config={config}
      products={localProducts}
      onAddToCart={handleAddToCart}
      onRemoveFromCart={handleRemoveFromCart}
      getCartQuantity={getCartQuantity}
      getTotalCartItems={getTotalCartItems}
      getTotalCartValue={getTotalCartValue}
    />
  );
};

export default DistributorMarketplacePage;
