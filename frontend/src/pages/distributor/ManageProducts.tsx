import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductManagement } from "@/features/products/ProductManagement";
import { useProductStore } from "@/stores/product.store";
import supplierPaymentMethodService from "@/services/supplier-payment-method.service";
// import { suppliers } from "./data";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth.store";
import type { Product } from "@/types/product.types";

const suppliers = [
  { id: "101", name: "Ethiopia Coffee Export" },
  { id: "102", name: "Adama Wholesalers" },
  { id: "103", name: "Ethiopian Textile" },
  { id: "104", name: "Bahir Dar Honey" },
  { id: "105", name: "Mekelle Steel" },
  { id: "106", name: "Adama Plastics" },
  { id: "107", name: "Ethiopia Agri" },
  { id: "108", name: "Mugher Cement" },
];
const DistributorManageProductsPage: React.FC = () => {
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const user = useAuthStore((state) => state.user);
  const {
    products,
    categories,
    isLoading,
    error,
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability,
    clearError,
  } = useProductStore();
  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchProducts({ supplier_id: user.id });
      fetchCategories();
    }
  }, [fetchProducts, fetchCategories, user?.id]);

  // Transform store products to match component Product type (aligned with DB schema)
  useEffect(() => {
    if (products && products.length > 0) {
      const transformedProducts: Product[] = products.map((item: any) => ({
        ...item,
      }));
      setLocalProducts(transformedProducts);
    } else {
      setLocalProducts([]);
    }
  }, [products]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleAddProduct = async (productData: any) => {
    const loadingToast = toast.loading("Adding product...");

    try {
      const newProduct = await createProduct({
        name: productData.name,
        category: productData.category,
        price: parseFloat(productData.price),
        unit_type: productData.unit_type,
        min_order_amount: parseInt(productData.min_order_amount),
        stock_quantity: parseInt(productData.stock_quantity),
        description: productData.description,
        images: productData.images,
        specifications: productData.specifications,
        is_available: productData.is_available,
      });

      if (newProduct) {
        toast.success("Product added successfully", {
          id: loadingToast,
        });
        await fetchProducts({ supplier_id: user?.id });

        try {
          const response =
            await supplierPaymentMethodService.getActiveBySupplierId(
              user?.id || "",
            );
          const activeMethods = response.data || response;
          if (!Array.isArray(activeMethods) || activeMethods.length === 0) {
            toast.custom((t) => (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                <div className="font-semibold">No active payment methods</div>
                <p className="mt-1">
                  Buyers cannot place orders until you add one in Settings.
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex rounded-md bg-yellow-600 px-3 py-1 text-white hover:bg-yellow-700"
                  onClick={() => {
                    navigate("/settings?tab=payment");
                    toast.dismiss(t.id);
                  }}
                >
                  Add Payment Method
                </button>
              </div>
            ));
          }
        } catch (error) {
          console.error("Unable to check supplier payment methods", error);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add product", {
        id: loadingToast,
      });
    }
  };

  const handleEditProduct = async (id: string, productData: any) => {
    const toastId = toast.loading("Updating product...");

    try {
      const updated = await updateProduct(id, {
        name: productData.name,
        price: parseFloat(productData.price),
        stock_quantity: parseInt(productData.stock_quantity),
        description: productData.description,
        images: productData.images,
        specifications: productData.specifications,
        is_available: productData.is_available,
      });

      if (updated) {
        toast.success("Product updated successfully", {
          id: toastId,
        });
        await fetchProducts({ supplier_id: user?.id });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update product", {
        id: toastId,
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const toastId = toast.loading("Deleting product...");

    try {
      const deleted = await deleteProduct(id);
      if (deleted) {
        toast.success("Product deleted successfully", {
          id: toastId,
        });
        await fetchProducts({ supplier_id: user?.id });
      }
    } catch (error: any) {
      toast.error("Failed to delete product", {
        id: toastId,
      });
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    const toastId = toast.loading("Duplicating product...");

    try {
      const duplicatedData = {
        name: `${product.name} (Copy)`,
        category: product.category,
        price: product.price,
        unit_type: product.unit_type,
        min_order_amount: product.min_order_amount,
        stock_quantity: 0,
        description: product.description,
        is_available: false,
        supplier_id: product.supplier_id,
      };

      const newProduct = await createProduct(duplicatedData);
      if (newProduct) {
        toast.success("Product duplicated successfully", {
          id: toastId,
        });
        await fetchProducts({ supplier_id: user?.id });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to duplicate product", {
        id: toastId,
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    const toastId = toast.loading("Updating product status...");

    try {
      const toggled = await toggleAvailability(id);
      if (toggled) {
        toast.success("Product status updated successfully", {
          id: toastId,
        });
        await fetchProducts({ supplier_id: user?.id });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update product status", {
        id: toastId,
      });
    }
  };

  // Prepare categories for the filter (add "All Categories" at the beginning)
  const filterCategories = useMemo(
    () => ["All Categories", ...(categories || [])],
    [categories],
  );

  return (
    <ProductManagement
      config={{
        role: "distributor",
        title: "Manage Products",
        description: "Add, edit, and manage your product inventory",
        addButtonLabel: "Add Product",
        supplierPath: "/suppliers",
      }}
      products={localProducts}
      categories={filterCategories}
      suppliers={suppliers}
      onAddProduct={handleAddProduct}
      onEditProduct={handleEditProduct}
      onDeleteProduct={handleDeleteProduct}
      onDuplicateProduct={handleDuplicateProduct}
      onToggleStatus={handleToggleStatus}
    />
  );
};

export default DistributorManageProductsPage;
