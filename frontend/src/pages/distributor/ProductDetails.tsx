// pages/distributor/product-detail.tsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductDetail } from "@/components/shared/ProductDetails";
import { useProductStore } from "@/stores/product.store";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";

const DistributorProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, fetchProductById, isLoading } = useProductStore();
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const handleAddToCart = (quantity: number) => {
    if (product) {
      addToCart(product.id, quantity);
    }
  };

  const handleViewSupplier = () => {
    navigate(`/distributor/factories/${product?.supplier_id}`);
  };

  const handleCompare = () => {
    navigate(`/distributor/compare?product=${id}`);
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
        <Button
          className="mt-4"
          onClick={() => navigate("/distributor/products")}
        >
          Back to Products
        </Button>
      </div>
    );
  }

  // Transform product for distributor view (buying from factories)
  const productForDetail = {
    ...product,
    reviewCount: product.totalReviews || 0,
    maxOrder: product.stock_quantity,
    reserved: 0,

    // Supplier info (factory selling the product)
    supplierId: product.supplier_id,
    supplierName:
      product.supplier?.business_name ||
      product.supplier?.full_name ||
      "Unknown",
    supplierRating: product.supplier?.rating || 4.5,
    supplierVerified: product.supplier?.is_verified || false,
    supplierLocation: product.supplier?.email || "Unknown",
    supplierEstablished: product.supplier?.created_at,
    created_at: product.created_at || new Date().toISOString(),
    updated_at: product.updated_at || new Date().toISOString(),

    // Fix reviews typing for ProductDetail
    reviews:
      product.reviews?.map((r) => ({
        id: r.id,
        user: r.user_id,
        rating: r.rating,
        comment: r.comment || "",
        date: new Date(r.created_at).toISOString(),
      })) || [],
  };
  return (
    <ProductDetail
      role="distributor"
      product={productForDetail}
      onAddToCart={handleAddToCart}
      onViewSupplier={handleViewSupplier}
      onCompare={handleCompare}
    />
  );
};

export default DistributorProductDetailPage;
