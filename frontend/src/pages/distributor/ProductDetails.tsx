// pages/distributor/product-detail.tsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductDetail } from "@/features/products/ProductDetails";
import { useProductStore } from "@/stores/product.store";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { WithAsync } from "@/components/shared/WithAsync";
import type { ProductDetailData } from "@/types/product.types";
import toast from "react-hot-toast";

const DistributorProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, fetchProductById, isLoading } = useProductStore();
  const { addToCart, updateQuantity, removeFromCart, items } = useCartStore();
  const navigate = useNavigate();

  const currentCartItem = product
    ? items.find((item) => item.product_id === product.id) || null
    : null;

  const cartQuantity = currentCartItem?.quantity || 0;

  const handleAddToCart = async (quantity: number) => {
    if (!product) return;
    try {
      if (currentCartItem) {
        await updateQuantity(currentCartItem.id, currentCartItem.quantity + quantity);
      } else {
        await addToCart(product.id, quantity);
      }

      const updatedItems = useCartStore.getState().items;
      const updatedQuantity =
        updatedItems.find((item) => item.product_id === product.id)?.quantity || 0;

      toast.success(`Added to cart (${updatedQuantity})`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to add to cart");
    }
  };

  const handleSetCartQuantity = async (quantity: number) => {
    if (!product || !currentCartItem) return;
    try {
      if (quantity <= 0) {
        await removeFromCart(currentCartItem.id);
        toast.success("Removed from cart");
        return;
      }

      await updateQuantity(currentCartItem.id, quantity);
      toast.success(`Updated cart (${quantity})`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update cart");
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

  const resolvedError = !isLoading && !product ? "Product not found" : null;

  // Transform product for distributor view (buying from factories)
  const productForDetail: ProductDetailData | null = product
    ? {
        ...product,
        review_count: product.review_count || 0,
        maxOrder: product.stock_quantity,
        reserved: 0,
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
        reviews:
          product.reviews?.map((r) => ({
            id: r.id,
            user: r.user_id,
            rating: r.rating,
            comment: r.comment || "",
            date: new Date(r.created_at).toISOString(),
          })) || [],
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
            onClick={() => navigate("/distributor/products")}
          >
            Back to Products
          </Button>
        </div>
      }
    >
      {productForDetail && (
        <ProductDetail
          role="distributor"
          product={productForDetail}
          onAddToCart={handleAddToCart}
          cartQuantity={cartQuantity}
          onSetCartQuantity={handleSetCartQuantity}
          onViewSupplier={handleViewSupplier}
          onCompare={handleCompare}
        />
      )}
    </WithAsync>
  );
};

export default DistributorProductDetailPage;
