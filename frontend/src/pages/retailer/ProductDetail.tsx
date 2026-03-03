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
    id: parseInt(product.id) || 0,
    name: product.name,
    category: product.category,
    price: product.price,
    unit_type: product.unit_type,
    min_order_amount: product.min_order_amount,
    stock_quantity: product.stock_quantity,
    description: product.description,
    images: product.images || [],
    rating: product.rating || 0,

    tags: [],
    review_count: 0,
    maxOrder: product.stock_quantity,
    reserved: 0,
    supplier:
      product.supplier?.business_name ||
      product.supplier?.full_name ||
      "Unknown",
    supplierId: product.supplier_id,
    location: "Unknown",
    deliveryTime: "2-3 days",
    created_at: product.created_at || new Date().toISOString(),
    updated_at: product.updated_at || new Date().toISOString(),
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
