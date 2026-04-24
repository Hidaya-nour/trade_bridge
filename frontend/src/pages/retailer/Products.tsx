import React, { useEffect } from "react";
import { ProductCatalog } from "@/features/products/ProductCatalog";
import type { CatalogConfig, CatalogProduct } from "@/types/product.types";
import { Store } from "lucide-react";
import { useProductStore } from "@/stores/product.store";
import { useCartStore } from "@/stores/cart.store";
import broadcastService from "@/services/broadcast.service";
import { ActivePromotionsPanel } from "@/components/shared/ActivePromotionsPanel";
import type { BroadcastRecord } from "@/types/broadcast.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  applyDiscountToUnitPrice,
  resolveBestDiscountPromotion,
} from "@/lib/promotion-utils";
import toast from "react-hot-toast";
// import { useAuthStore } from "@/stores/auth.store";

const categories = ["All Categories", "Beverages", "Food"];
const defaultLocations = [
  "All Locations",
  "Addis Ababa",
  "Adama",
  "Bahir Dar",
  "Mekelle",
  "Hawassa",
  "Dire Dawa",
];

const RetailerProductsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    products,
    isLoading: productsLoading,
    fetchProducts,
  } = useProductStore();
  const [promotions, setPromotions] = useState<BroadcastRecord[]>([]);

  const {
    items: cartItems,
    // isLoading: cartLoading,
    fetchCart,
    addToCart: addToCartStore,
    updateQuantity,
    removeFromCart: removeFromCartStore,
  } = useCartStore();

  // Fetch products and cart on mount
  useEffect(() => {
    const promotionSku = new URLSearchParams(location.search).get("promotion");
    fetchProducts({
      is_available: true,
      ...(promotionSku ? { search: promotionSku } : {}),
    } as any);
    fetchCart();
  }, [fetchProducts, fetchCart, location.search]);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const response = await broadcastService.getActive(["distributor"]);
        setPromotions(response.data || []);
      } catch (error) {
        console.error("Failed to load retailer promotions:", error);
        setPromotions([]);
      }
    };

    loadPromotions();
  }, []);

  useEffect(() => {
    const promotionSku = new URLSearchParams(location.search).get("promotion");
    if (!promotionSku) return;

    const match = products?.find(
      (product) =>
        String(product.sku || "").trim().toUpperCase() ===
        promotionSku.trim().toUpperCase(),
    );

    if (match?.id) {
      navigate(`/retailer/products/${match.id}`, { replace: true });
    }
  }, [location.search, navigate, products]);

  const addToCart = async (productId: string | number, quantity: number) => {
    try {
      const productIdStr = productId.toString();
      const product = transformedProducts.find((p) => String(p.id) === productIdStr);
      const minOrder = Math.max(1, Number(product?.min_order_amount || 1));
      const stock = Number(product?.stock_quantity || 0);

      // Check if product already in cart
      const existingItem = cartItems?.find(
        (item: any) => item.product_id === productIdStr,
      );

      if (existingItem) {
        // Update existing cart item
        const nextQuantity = existingItem.quantity + quantity;
        if (stock > 0 && nextQuantity > stock) {
          toast.error(`Only ${stock} available`);
          return;
        }
        await updateQuantity(existingItem.id, nextQuantity);
      } else {
        // Create new cart item
        const initialQuantity = Math.max(quantity, minOrder);
        if (stock > 0 && initialQuantity > stock) {
          toast.error(`Only ${stock} available`);
          return;
        }
        await addToCartStore(productIdStr, initialQuantity);
      }

      // Refresh cart to get updated data
      await fetchCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error((error as any)?.message || "Failed to add to cart");
    }
  };

  const removeFromCart = async (productId: string | number) => {
    try {
      const productIdStr = productId.toString();
      const product = transformedProducts.find((p) => String(p.id) === productIdStr);
      const minOrder = Math.max(1, Number(product?.min_order_amount || 1));
      const existingItem = cartItems?.find(
        (item: any) => item.product_id === productIdStr,
      );

      if (existingItem) {
        if (existingItem.quantity - 1 < minOrder) {
          // If decrement would break MOQ, remove the item instead.
          await removeFromCartStore(existingItem.id);
        } else if (existingItem.quantity > 1) {
          // Decrease quantity
          await updateQuantity(existingItem.id, existingItem.quantity - 1);
        } else {
          // Remove item
          await removeFromCartStore(existingItem.id);
        }

        // Refresh cart
        await fetchCart();
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      toast.error((error as any)?.message || "Failed to update cart");
    }
  };

  const removeItemFromCart = async (productId: string | number) => {
    try {
      const productIdStr = productId.toString();
      const existingItem = cartItems?.find(
        (item: any) => item.product_id === productIdStr,
      );

      if (existingItem) {
        await removeFromCartStore(existingItem.id);
        await fetchCart();
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  const getCartQuantity = (productId: string | number): number => {
    const productIdStr = productId.toString();
    const item = cartItems?.find(
      (item: any) => item.product_id === productIdStr,
    );
    return item?.quantity || 0;
  };

  const getTotalCartItems = (): number => {
    return cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const getTotalCartValue = (): number => {
    return (
      cartItems?.reduce((sum, item) => {
        const price = item.product?.price || 0;
        return sum + price * item.quantity;
      }, 0) || 0
    );
  };

  // Get unique categories from products
  const availableCategories = [
    "All Categories",
    ...new Set(
      products
        ?.map((p) => p.category)
        .filter((category): category is string => Boolean(category)),
    ),
  ];
  const availableLocations = [
    "All Locations",
    ...new Set(
      products
        ?.map((p) => {
          const address = p.supplier?.addresses?.[0];
          return address?.city || address?.region;
        })
        .filter((location): location is string => Boolean(location)),
    ),
  ];

  const config: CatalogConfig = {
    role: "retailer",
    title: "Browse Products",
    description: "Discover products from verified suppliers across Ethiopia",
    supplierLabel: "Supplier",
    supplierPath: "/suppliers",
    icon: Store,
    categories:
      availableCategories.length > 1 ? availableCategories : categories,
    locations:
      availableLocations.length > 1 ? availableLocations : defaultLocations,
    showVolumeDiscount: false,
    cartPath: "/retailer/cart",
    ordersPath: "/retailer/orders",
    productsPath: "/retailer/products",
    continueShoppingPath: "/retailer/products",
  };

  // Transform products to match CatalogProduct type
  const transformedProducts: CatalogProduct[] =
    products?.map((product) => {
      const supplierAddress = product.supplier?.addresses?.[0];
      const minQty = Math.max(1, Number(product.min_order_amount || 1));
      const bestPromotion = resolveBestDiscountPromotion(
        promotions,
        product.sku,
        minQty,
      );
      const basePrice = Number(product.price);
      const discountedPrice = applyDiscountToUnitPrice(
        basePrice,
        minQty,
        bestPromotion,
      );
      const promotionLabel =
        bestPromotion && bestPromotion.discount_type && bestPromotion.discount_value
          ? bestPromotion.discount_type === "percentage"
            ? `${Number(bestPromotion.discount_value)}% off`
            : `ETB ${Number(bestPromotion.discount_value)} off`
          : null;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        supplier_id: product.supplier_id,
        supplier_name:
          product.supplier?.business_name ||
          product.supplier?.full_name ||
          "Unknown Supplier",
        supplier: product.supplier,
        price: discountedPrice,
        original_price:
          discountedPrice < basePrice ? basePrice : undefined,
        category: product.category || "Uncategorized",
        image: product.images?.[0] || "/placeholder-product.png",
        rating: product.rating,
        review_count: product.review_count || 0,
        location:
          supplierAddress?.city ||
          supplierAddress?.region ||
          "Unknown Location",
        latitude: Number.isFinite(Number(supplierAddress?.latitude))
          ? Number(supplierAddress?.latitude)
          : null,
        longitude: Number.isFinite(Number(supplierAddress?.longitude))
          ? Number(supplierAddress?.longitude)
          : null,
        min_order_amount: minQty,
        unit: product.unit_type,
        description: product.description || "",
        stock_quantity: Number(product.stock_quantity || 0),
        delivery_available: product.delivery_available,
        delivery_pricing: product.delivery_pricing,
        delivery_fee_per_km: product.delivery_fee_per_km,
        free_delivery_max_distance_km: product.free_delivery_max_distance_km,
        delivery_time: "2-3 days",
        tags: [product.category].filter((tag): tag is string => Boolean(tag)),
        promotion_label: promotionLabel,
        promotion_ends_at: bestPromotion?.end_date || null,
      };
    }) || [];
  // Show loading state
  if (productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {promotions.length > 0 && (
        <ActivePromotionsPanel
          title="Retailer Promotions"
          description="Live promotions from distributors while you browse products."
          items={promotions}
          getProductLink={(promotion) => {
            const code = promotion.code?.trim();
            if (!code) return null;
            const match = products?.find(
              (product) =>
                String(product.sku || "").trim().toUpperCase() ===
                code.toUpperCase(),
            );
            return match?.id ? `/retailer/products/${match.id}` : null;
          }}
          emptyTitle="No active retailer promotions"
          emptyDescription="Distributor offers will show up here when they go live."
        />
      )}
      <ProductCatalog
        config={config}
        products={transformedProducts}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onRemoveItemFromCart={removeItemFromCart}
        getCartQuantity={getCartQuantity}
        getTotalCartItems={getTotalCartItems}
        getTotalCartValue={getTotalCartValue}
      />
    </div>
  );
};

export default RetailerProductsPage;
