// pages/factory/my-product-detail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MyProductDetail } from "@/components/shared/MyProductDetail";
import { useProductStore } from "@/stores/product.store";
import { Button } from "@/components/ui/button";
import { EditProductDialog } from "@/components/shared/EditProductDialog";

const FactoryMyProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, fetchProductById, isLoading, updateProduct, deleteProduct } =
    useProductStore();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    await deleteProduct(id!);
    navigate("/factory/products");
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-4" onClick={() => navigate("/factory/products")}>
          Back to My Products
        </Button>
      </div>
    );
  }

  // Transform product for factory's own view
  const productForDetail = {
    ...product,
    available: product.stock_quantity,
    average_rating: product.rating ?? 0,
  };

  return (
    <>
      <MyProductDetail
        role="factory"
        product={productForDetail}
        onEdit={() => setEditDialogOpen(true)}
        onDelete={handleDelete}
        onUpdateStock={handleUpdateStock}
        onUpdatePrice={handleUpdatePrice}
      />
      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={product}
        mode="edit"
        onSave={updateProduct}
      />
    </>
  );
};

export default FactoryMyProductDetailPage;
