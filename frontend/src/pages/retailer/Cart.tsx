// pages/retailer/cart.tsx
import React from "react";
import { CartPage } from "@/features/cart/CartPage";
import type { CartConfig } from "@/types/cart.types";
import { Store } from "lucide-react";

const RetailerCartPage: React.FC = () => {
  const config: CartConfig = {
    role: "retailer",
    title: "Shopping Cart",
    description: "Review and manage your items before checkout",
    continueShoppingPath: "/retailer/products",
    supplierPath: "/retailer/suppliers/:id",
    supplierLabel: "Supplier",
    supplierIcon: Store,
    ordersPath: "/retailer/orders",
    productsPath: "/retailer/products",
    emptyStateMessage:
      "Looks like you haven't added any products to your cart yet. Start browsing products from verified suppliers.",
    bulkDiscountThreshold: 50000,
    bulkDiscountPercentage: 0.1,
    vatPercentage: 0.15,
    shippingCostPerSupplier: 250,
  };

  return <CartPage config={config} />;
};

export default RetailerCartPage;
