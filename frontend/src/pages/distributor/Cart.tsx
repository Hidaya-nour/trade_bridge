// pages/distributor/factory-cart.tsx
import React from "react";
import { Factory } from "lucide-react";
import type { CartConfig } from "@/types/cart.types";
import { CartPage } from "@/features/cart/CartPage";

const DistributorCartPage: React.FC = () => {
  const config: CartConfig = {
    role: "distributor",
    title: "Factory Cart",
    description: "Review and manage your factory orders before checkout",
    continueShoppingPath: "/distributor/products",
    supplierPath: "/distributor/factories/:id",
    supplierLabel: "Factory",
    supplierIcon: Factory,
    ordersPath: "/distributor/orders",
    productsPath: "/distributor/products",
    emptyStateMessage:
      "Your factory cart is empty. Start sourcing products from Ethiopian manufacturers.",
    bulkDiscountThreshold: 100000,
    bulkDiscountPercentage: 0.15,
    vatPercentage: 0.15,
    shippingCostPerSupplier: 500,
  };

  return <CartPage config={config} />;
};

export default DistributorCartPage;
