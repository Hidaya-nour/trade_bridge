import { ProductDetail } from "@/features/products/ProductDetails";
import { useCartStore } from "@/stores/cart.store";
import { useProductStore } from "@/stores/product.store";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WithAsync } from "@/components/shared/WithAsync";
import type { ProductDetailData } from "@/types/product.types";
import toast from "react-hot-toast";
import broadcastService from "@/services/broadcast.service";
import type { BroadcastRecord } from "@/types/broadcast.types";
import {
  applyDiscountToUnitPrice,
  resolveBestDiscountPromotion,
} from "@/lib/promotion-utils";

const RetailerProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, fetchProductById, isLoading } = useProductStore();
  const { addToCart, updateQuantity, removeFromCart, items } = useCartStore();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<BroadcastRecord[]>([]);

  const currentCartItem = product
    ? items.find((item) => item.product_id === product.id) || null
    : null;

  const cartQuantity = currentCartItem?.quantity || 0;

  const handleAddToCart = async (quantity: number) => {
    if (!product) return;
    try {
      if (currentCartItem) {
        await updateQuantity(
          currentCartItem.id,
          currentCartItem.quantity + quantity,
        );
      } else {
        await addToCart(product.id, quantity);
      }

      const updatedItems = useCartStore.getState().items;
      const updatedQuantity =
        updatedItems.find((item) => item.product_id === product.id)?.quantity ||
        0;

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
  const handleCompare = () => {
    navigate(`/retailer/compare?product=${id}`);
  };
  console.log("ID:", id);

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id, fetchProductById]);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const response = await broadcastService.getActive(["distributor"]);
        setPromotions(response.data || []);
      } catch (error) {
        setPromotions([]);
      }
    };

    loadPromotions();
  }, []);

  const isFactoryProduct = useMemo(() => {
    const role = String(
      (product as any)?.supplier?.role ||
        (product as any)?.supplier_role ||
        (product as any)?.supplierRole ||
        "",
    )
      .trim()
      .toLowerCase();
    return role === "factory";
  }, [product]);

  useEffect(() => {
    if (!isLoading && product && isFactoryProduct) {
      toast.error("Factory products are only available to distributors.");
      navigate("/retailer/products", { replace: true });
    }
  }, [isFactoryProduct, isLoading, navigate, product]);

  const resolvedError = !isLoading && !product ? "Product not found" : null;

  // Transform product to match ProductDetail expected props
  const productForDetail: ProductDetailData | null = useMemo(() => {
    if (!product) return null;

    const minQty = Math.max(1, Number(product.min_order_amount || 1));
    const bestPromotion = resolveBestDiscountPromotion(
      promotions,
      product.sku,
      minQty,
    );
    const basePrice = Number(product.price);
    const discountedPrice = applyDiscountToUnitPrice(
      basePrice,
      minQty,
      bestPromotion,
    );
    const promotionLabel =
      bestPromotion && bestPromotion.discount_type && bestPromotion.discount_value
        ? bestPromotion.discount_type === "percentage"
          ? `${Number(bestPromotion.discount_value)}% off`
          : `ETB ${Number(bestPromotion.discount_value)} off`
        : null;

    return {
        ...product,
        price: discountedPrice,
        original_price: discountedPrice < basePrice ? basePrice : undefined,
        promotion_label: promotionLabel,
        promotion_ends_at: bestPromotion?.end_date || null,
        review_count: product.review_count || 0,
        maxOrder: product.stock_quantity,
        reserved: 0,
        supplierId: product.supplier_id,
        supplierName:
          product.supplier?.business_name ||
          product.supplier?.full_name ||
          "Unknown",
        supplierRating: product.supplier?.rating,
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
      };
  }, [product, promotions]);

  return (
    <WithAsync
      isLoading={isLoading}
      error={resolvedError}
      loadingComponent={
        <div className="flex justify-center items-center h-64">Loading...</div>
      }
      errorComponent={<div className="text-center py-12">{resolvedError}</div>}
    >
      {productForDetail && (
        <ProductDetail
          role="retailer"
          product={productForDetail}
          onAddToCart={handleAddToCart}
          cartQuantity={cartQuantity}
          onSetCartQuantity={handleSetCartQuantity}
          onCompare={handleCompare}
        />
      )}
    </WithAsync>
  );
};

export default RetailerProductDetailPage;
