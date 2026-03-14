// pages/factory/my-product-detail.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MyProductDetail } from "@/features/products/MyProductDetail";
import { useProductStore } from "@/stores/product.store";
import { Button } from "@/components/ui/button";
import { EditProductDialog } from "@/components/product/AddEditProductDialog";
import { WithAsync } from "@/components/shared/WithAsync";
import type { Product } from "@/types/product.types";

const FactoryMyProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { product, fetchProductById, isLoading, updateProduct, deleteProduct } =
    useProductStore();

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // 🔹 Fetch product on mount
  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id, fetchProductById]);

  // 🔹 Edit handler
  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  // 🔹 Save handler (FIXED — prevents reopening bug)
  const handleSaveProduct = async (productId: string, updatedProduct: any) => {
    try {
      await updateProduct(productId, updatedProduct);
      setEditDialogOpen(false); // close AFTER update finishes
    } catch (error) {
      console.error("Failed to update product", error);
    }
  };

  // 🔹 Delete handler
  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteProduct(id);
      navigate("/factory/products");
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  };

  // 🔹 Stock update handler
  const handleUpdateStock = async (newStock: number) => {
    if (!id) return;
    await updateProduct(id, { stock_quantity: newStock });
  };

  // 🔹 Price update handler
  const handleUpdatePrice = async (newPrice: number) => {
    if (!id) return;
    await updateProduct(id, { price: newPrice });
  };

  // 🔹 Loading state
  const resolvedError = !isLoading && !product ? "Product not found" : null;

  // 🔹 Transform for detail component
  const productForDetail:
    | (Product & { available: number; average_rating: number })
    | null = product
    ? {
        id: product.id,
        supplier_id: product.supplier_id,
        name: product.name,
        category: product.category,
        sku: product.sku,
        description: product.description,
        specifications: product.specifications,
        price: product.price,
        stock_quantity: product.stock_quantity,
        min_order_amount: product.min_order_amount,
        unit_type: product.unit_type,
        images: product.images,
        is_available: product.is_available,
        rating: product.rating,
        review_count: product.review_count,
        reviews: product.reviews,
        created_at: product.created_at,
        updated_at: product.updated_at,
        deleted_at: product.deleted_at,
        supplier: product.supplier,
        available: product.stock_quantity,
        average_rating: product.rating ?? 0,
      }
    : null;

  return (
    <WithAsync
      isLoading={isLoading}
      error={resolvedError}
      loadingComponent={
        <div className="flex justify-center items-center h-64">
          <div className="text-center">Loading product details...</div>
        </div>
      }
      errorComponent={
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate("/factory/products")}
          >
            Back to My Products
          </Button>
        </div>
      }
    >
      <>
        {productForDetail && (
          <MyProductDetail
            role="factory"
            product={productForDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdateStock={handleUpdateStock}
            onUpdatePrice={handleUpdatePrice}
          />
        )}

        <EditProductDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          product={product ?? null}
          mode="edit"
          onSave={handleSaveProduct}
        />
      </>
    </WithAsync>
  );
};

export default FactoryMyProductDetailPage;
