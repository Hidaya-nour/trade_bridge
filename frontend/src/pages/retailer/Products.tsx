import React, { useEffect } from "react";
import {
  ProductCatalog,
  type CatalogConfig,
  type CatalogProduct,
} from "@/components/shared/ProductCatalog";
import { Store } from "lucide-react";
import { useProductStore } from "@/stores/product.store";
import { useCartStore } from "@/stores/cart.store";
// import { useAuthStore } from "@/stores/auth.store";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";

const categories = ["All Categories", "Beverages", "Food"];

const locations = [
  "Addis Ababa",
  "Adama",
  "Bahir Dar",
  "Mekelle",
  "Hawassa",
  "Dire Dawa",
];

const RetailerProductsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    products,
    isLoading: productsLoading,
    fetchProducts,
  } = useProductStore();

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
    fetchProducts({ is_available: true });
    fetchCart();
  }, [fetchProducts, fetchCart]);

  const addToCart = async (productId: string | number, quantity: number) => {
    try {
      const productIdStr = productId.toString();

      // Check if product already in cart
      const existingItem = cartItems?.find(
        (item: any) => item.product_id === productIdStr,
      );

      if (existingItem) {
        // Update existing cart item
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Create new cart item
        await addToCartStore(productIdStr, quantity);
      }

      // Refresh cart to get updated data
      await fetchCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const removeFromCart = async (productId: string | number) => {
    try {
      const productIdStr = productId.toString();
      const existingItem = cartItems?.find(
        (item: any) => item.product_id === productIdStr,
      );

      if (existingItem) {
        if (existingItem.quantity > 1) {
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
    ...new Set(products?.map((p) => p.category).filter(Boolean)),
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
    locations,
    showVolumeDiscount: false,
    cartPath: "/retailer/cart",
    ordersPath: "/retailer/orders",
  };

  // Transform products to match CatalogProduct type
  const transformedProducts: CatalogProduct[] =
    products?.map((product) => ({
      id: product.id,
      name: product.name,
      supplier:
        product.supplier?.business_name ||
        product.supplier?.full_name ||
        "Unknown Supplier",
      supplierName:
        product.supplier?.business_name ||
        product.supplier?.full_name ||
        "Unknown Supplier",
      supplierId: product.supplier_id as any,
      price: Number(product.price),
      category: product.category || "Uncategorized",
      image: product.images?.[0] || "/placeholder-product.png",
      rating: 4.5,
      reviews: 0,
      location: "Addis Ababa",
      minOrder: product.min_order_amount,
      unit: product.unit_type,
      description: product.description || "",
      stock: product.stock_quantity,
      isAvailable: product.is_available === 1,
      deliveryTime: "2-3 days",
      tags: [product.category].filter(Boolean),
    })) || [];
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
    <ProductCatalog
      config={config}
      products={transformedProducts}
      onAddToCart={addToCart}
      onRemoveFromCart={removeFromCart}
      getCartQuantity={getCartQuantity}
      getTotalCartItems={getTotalCartItems}
      getTotalCartValue={getTotalCartValue}
    />
  );
};

export default RetailerProductsPage;
