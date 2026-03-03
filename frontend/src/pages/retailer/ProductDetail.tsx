import { ProductDetail } from "@/components/shared/ProductDetails";
import { useCartStore } from "@/stores/cart.store";
import { useProductStore } from "@/stores/product.store";
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const RetailerProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, fetchProductById, isLoading } = useProductStore();
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const handleAddToCart = (quantity: number) => {
    if (product) {
      addToCart(product.id, quantity);
    }
  };
  const handleCompare = () => {
    navigate(`/retailer/compare?product=${id}`);
  };
  console.log("ID:", id);

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>;
  }

  // Transform product to match ProductDetail expected props
  const productForDetail = {
    ...product,
    review_count: product.review_count || 0,
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
      role="retailer"
      product={productForDetail}
      onAddToCart={handleAddToCart}
      onCompare={handleCompare}
    />
  );
};

export default RetailerProductDetailPage;
