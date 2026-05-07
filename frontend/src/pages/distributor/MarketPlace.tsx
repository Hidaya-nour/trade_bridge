import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCatalog } from "@/features/products/ProductCatalog";
import { useProductStore } from "@/stores/product.store";
import { useCartStore } from "@/stores/cart.store";
import { Factory, ShieldOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth.store";
import type { CatalogConfig } from "@/types/product.types";
import broadcastService from "@/services/broadcast.service";
import { ActivePromotionsPanel } from "@/components/shared/ActivePromotionsPanel";
import type { BroadcastRecord } from "@/types/broadcast.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

// Helper function to map promotion to product link
const getPromotionProductLink = (promotion: BroadcastRecord): string | null => {
  // If the broadcast has a direct product ID in metadata
  if (promotion.metadata?.product_id) {
    return `/distributor/marketplace/product/${promotion.metadata.product_id}`;
  }
  
  // If it has a category filter
  if (promotion.target_audience === 'segment' && promotion.audience_segments?.length) {
    const categorySegment = promotion.audience_segments.find(seg => 
      categories.includes(seg)
    );
    if (categorySegment) {
      return `/distributor/marketplace?category=${encodeURIComponent(categorySegment)}`;
    }
  }
  
  // If it has a supplier/owner ID
  if (promotion.owner_id) {
    return `/distributor/marketplace?supplier=${promotion.owner_id}`;
  }
  
  // Default - navigate to marketplace
  return `/distributor/marketplace?promo=${promotion.code || promotion.id}`;
};

const DistributorMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<BroadcastRecord[]>([]);
  const user = useAuthStore((state) => state.user);

  // Check if distributor is verified
  const isVerified = user?.verified === true;
  const isDistributor = user?.role === "distributor";

  // Block unverified distributors from browsing products
  if (isDistributor && !isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <ShieldOff className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verification Required
            </h2>
            <p className="text-gray-600 mb-6">
              You must verify your distributor account before browsing products
              and placing orders.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please upload your business license and required documents for
              admin review.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/distributor/dashboard")}
              >
                Go Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate("/settings?tab=business")}
              >
                Upload Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // Load promotions
  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const response = await broadcastService.getActive([
          "factory",
          "distributor",
        ]);
        setPromotions(response.data || []);
      } catch (error) {
        console.error(
          "Failed to load distributor marketplace promotions:",
          error,
        );
        setPromotions([]);
      }
    };

    loadPromotions();
  }, []);

  // Handle promotion product click for analytics
  const handlePromotionClick = useCallback((promotion: BroadcastRecord) => {
    console.log('Promotion clicked:', {
      id: promotion.id,
      title: promotion.title,
      type: promotion.type,
    });
    
    // Optional: Track analytics
    // analytics.track('promotion_clicked', { promotion_id: promotion.id });
    
    // Optional: Show toast
    toast.success(`Viewing ${promotion.title}`);
  }, []);

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
        supplier: p.supplier,
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
        latitude: Number.isFinite(Number(p.supplier?.addresses?.[0]?.latitude))
          ? Number(p.supplier?.addresses?.[0]?.latitude)
          : null,
        longitude: Number.isFinite(
          Number(p.supplier?.addresses?.[0]?.longitude),
        )
          ? Number(p.supplier?.addresses?.[0]?.longitude)
          : null,
        deliveryTime: p.delivery_time || "2-3 days",
        verified: p.is_verified || false,
        image: p.images?.[0] || null,
        description: p.description || "",
        tags: p.tags || [],
        delivery_available: p.delivery_available,
        delivery_pricing: p.delivery_pricing,
        delivery_fee_per_km: p.delivery_fee_per_km,
        free_delivery_max_distance_km: p.free_delivery_max_distance_km,
        volumeDiscount: p.volume_discount,
        leadTime: p.lead_time || "2-3 days",
        paymentTerms: p.payment_terms || ["App Payment", "Mobile Banking"],
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

      const nextQuantity = cartItem.quantity - 1;
      if (nextQuantity <= 0) {
        const result = await removeFromCart(cartItem.id);
        if (result) {
          toast.success(`Removed ${product.name} from cart`);
        }
      } else {
        const result = await updateQuantity(cartItem.id, nextQuantity);
        if (result) {
          toast.success(`Updated ${product.name} quantity`);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to remove from cart");
    }
  };

  const handleRemoveItemFromCart = async (productId: string) => {
    try {
      const product = localProducts.find((p) => p.id === productId);
      if (!product) return;

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
    <div className="space-y-6">
      {promotions.length > 0 && (
        <ActivePromotionsPanel
          title="🔥 Hot Deals & Promotions"
          description="Limited time offers from verified suppliers. Click to shop now!"
          items={promotions}
          emptyTitle="No active marketplace promotions"
          emptyDescription="Factory and distributor offers will show up here when they go live."
          getProductLink={getPromotionProductLink}
          onProductClick={handlePromotionClick}
          scrollable={true}
        />
      )}
      <ProductCatalog
        config={config}
        products={localProducts}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onRemoveItemFromCart={handleRemoveItemFromCart}
        getCartQuantity={getCartQuantity}
        getTotalCartItems={getTotalCartItems}
        getTotalCartValue={getTotalCartValue}
      />
    </div>
  );
};

export default DistributorMarketplacePage;