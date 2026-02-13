import React, { useState } from "react";
import {
  ProductCatalog,
  type CatalogConfig,
} from "@/components/shared/ProductCatalog";
import { factoryProducts } from "./data";
import { Factory } from "lucide-react";

const categories = [
  "All Categories",
  "Construction",
  "Textiles",
  "Beverages",
  "Grains",
  "Food",
  "Raw Materials",
];

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
  const [cart, setCart] = useState<{ [key: number]: number }>({});

  const addToCart = (productId: number, quantity: number) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity,
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getCartQuantity = (productId: number) => cart[productId] || 0;
  const getTotalCartItems = () =>
    Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const getTotalCartValue = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = factoryProducts.find((p) => p.id === parseInt(id));
      return sum + (product?.price || 0) * qty;
    }, 0);
  };

  const config: CatalogConfig = {
    role: "distributor",
    title: "Factory Products",
    description:
      "Source products directly from Ethiopian manufacturers and factories",
    supplierLabel: "Factory",
    supplierPath: "/factories",
    icon: Factory,
    categories,
    locations,
    showVolumeDiscount: true,
    cartPath: "/distributor/factory-cart",
    ordersPath: "/distributor/factory-orders",
  };

  return (
    <ProductCatalog
      config={config}
      products={factoryProducts}
      onAddToCart={addToCart}
      onRemoveFromCart={removeFromCart}
      getCartQuantity={getCartQuantity}
      getTotalCartItems={getTotalCartItems}
      getTotalCartValue={getTotalCartValue}
    />
  );
};

export default DistributorMarketplacePage;
