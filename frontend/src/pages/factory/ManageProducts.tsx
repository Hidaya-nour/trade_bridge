import React from "react";
import { ProductManagement } from "@/components/shared/ProductManagement";
import { factoryProducts, categories } from "./data"; // Factory-specific data

const FactoryManageProductsPage: React.FC = () => {
  return (
    <ProductManagement
      config={{
        role: "factory",
        title: "Manage Products",
        description: "Add, edit, and manage your product catalog",
        addButtonLabel: "Add Product",
        showSupplier: false, // Factory doesn't have suppliers
      }}
      products={factoryProducts}
      categories={["All Categories", ...categories]}
      onAddProduct={(product) => console.log("Add", product)}
      onEditProduct={(id, product) => console.log("Edit", id, product)}
      onDeleteProduct={(id) => console.log("Delete", id)}
      onDuplicateProduct={(product) => console.log("Duplicate", product)}
      onToggleStatus={(id) => console.log("Toggle", id)}
    />
  );
};

export default FactoryManageProductsPage;
