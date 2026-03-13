// pages/distributor/my-product-detail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MyProductDetail } from "@/features/products/MyProductDetail";
import { useProductStore } from "@/stores/product.store";
import { Button } from "@/components/ui/button";
import { EditProductDialog } from "@/components/product/EditProductDialog";
import { WithAsync } from "@/components/shared/WithAsync";

const DistributorMyProductDetailPage: React.FC = () => {
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

  const handleDelete = async () => {
    await deleteProduct(id!);
    navigate("/distributor/products");
  };

  const handleUpdateStock = async (newStock: number) => {
    await updateProduct(id!, { stock_quantity: newStock });
  };

  const handleUpdatePrice = async (newPrice: number) => {
    await updateProduct(id!, { price: newPrice });
  };

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id, fetchProductById]);

  const resolvedError = !isLoading && !product ? "Product not found" : null;

  // Transform product for distributor's own view
  const productForDetail = {
    ...product,
    available: product?.stock_quantity,
    average_rating: product?.rating ?? 0,
  };

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
            onClick={() => navigate("/distributor/products")}
          >
            Back to My Products
          </Button>
        </div>
      }
    >
      <>
        <MyProductDetail
          role="factory"
          product={productForDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdateStock={handleUpdateStock}
          onUpdatePrice={handleUpdatePrice}
        />

        <EditProductDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          product={product}
          mode="edit"
          onSave={handleSaveProduct}
        />
      </>
    </WithAsync>
  );
};

export default DistributorMyProductDetailPage;
