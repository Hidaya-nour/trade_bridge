import { ProductDetail } from "@/features/products/ProductDetails";
import { PlaceOrderDialog } from "@/components/order/PlaceOrderDialog";
import { useCartStore } from "@/stores/cart.store";
import { useOrderStore } from "@/stores/order.store";
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
import paymentService from "@/services/payment.service";
import documentService from "@/services/document.service";
import supplierPaymentMethodService from "@/services/supplier-payment-method.service";
import {
  supplierMethodsToPaymentMethods,
} from "@/lib/payment-method-utils";
import type {
  PaymentMethod,
  SupplierPaymentMethodInfo,
} from "@/types/payment.types";

const RetailerProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, fetchProductById, isLoading } = useProductStore();
  const { addToCart, updateQuantity, removeFromCart, items } = useCartStore();
  const { createOrder, isLoading: orderLoading } = useOrderStore();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<BroadcastRecord[]>([]);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [supplierAllowedMethods, setSupplierAllowedMethods] = useState<
    PaymentMethod[]
  >([]);
  const [supplierPaymentMethods, setSupplierPaymentMethods] = useState<
    SupplierPaymentMethodInfo[]
  >([]);

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

  useEffect(() => {
    if (!productForDetail) return;
    setOrderQuantity(Math.max(1, Number(productForDetail.min_order_amount || 1)));
  }, [productForDetail]);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!orderDialogOpen) return;
      if (!productForDetail?.supplierId) return;

      try {
        const response = await supplierPaymentMethodService.getActiveBySupplierId(
          productForDetail.supplierId,
        );
        const methods =
          (response as any)?.data?.methods ||
          (response as any)?.data ||
          (response as any)?.methods ||
          [];
        const normalized = Array.isArray(methods) ? methods : [];
        setSupplierPaymentMethods(normalized as SupplierPaymentMethodInfo[]);
        setSupplierAllowedMethods(supplierMethodsToPaymentMethods(normalized));
      } catch {
        setSupplierPaymentMethods([]);
        setSupplierAllowedMethods([]);
      }
    };

    void loadPaymentMethods();
  }, [orderDialogOpen, productForDetail?.supplierId]);

  const resolveVatRate = () => {
    const supplier = (productForDetail as any)?.supplier;
    if (!supplier || supplier.is_vat_registered !== true) return 0;
    const parsed = Number(supplier.vat_rate);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) return parsed;
    return 0.15;
  };

  const handlePlaceOrder = async (
    paymentMethod?: string,
    _deliveryOption?: string,
    deliveryAddress?: string,
  ) => {
    if (!productForDetail) return;
    try {
      const normalizedAddress = String(deliveryAddress || "").trim();

      const payload = {
        supplier_id: productForDetail.supplierId || productForDetail.supplier_id,
        items: [
          {
            product_id: productForDetail.id,
            quantity: orderQuantity,
          },
        ],
        ...(normalizedAddress ? { delivery_address: normalizedAddress } : {}),
        ...(paymentMethod ? { payment_method: paymentMethod } : {}),
        notes: "",
      };

      const created = await createOrder(payload);
      if (!created) return;

      toast.success("Order placed successfully!");
      return {
        primaryOrderId: created.id,
        total: Number(created.total_price),
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to place order";
      toast.error(message);
      return;
    }
  };

  const handleProcessPayment = async (
    orderId: string,
    paymentMethod: string,
    paymentDetails?: any,
    documents?: File[],
  ): Promise<boolean> => {
    try {
      let proofDocumentId: string | undefined;
      if (documents && documents.length > 0) {
        const uploaded = await documentService.uploadPaymentProof(documents[0]);
        proofDocumentId = uploaded?.data?.id || uploaded?.data?.data?.id;
      }

      const result = await paymentService.submitByOrder(orderId, {
        payment_method: paymentMethod as any,
        amount_paid:
          paymentMethod === "app_payment"
            ? undefined
            : productForDetail
              ? productForDetail.price * orderQuantity
              : undefined,
        proof_document_id: proofDocumentId,
        notes: paymentDetails?.notes,
        payment_details: paymentDetails,
      });

      if (paymentMethod === "app_payment") {
        const checkoutUrl =
          result?.data?.chapa?.checkout_url ||
          result?.data?.payment?.chapa_payment_url;
        if (!checkoutUrl) return false;
        window.location.href = checkoutUrl;
        return true;
      }

      return true;
    } catch (err: any) {
      toast.error(err?.message || "Failed to process payment.");
      return false;
    }
  };

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
          onOrderNow={(quantity) => {
            setOrderQuantity(Math.max(1, Number(quantity || 1)));
            setOrderDialogOpen(true);
          }}
        />
      )}
      {productForDetail && (
        <PlaceOrderDialog
          open={orderDialogOpen}
          onOpenChange={setOrderDialogOpen}
          items={[
            {
              id: `temp-${productForDetail.id}`,
              order_id: "",
              product_id: productForDetail.id,
              quantity: orderQuantity,
              unit_price: productForDetail.price,
              product: productForDetail as any,
            },
          ]}
          summary={{
            subtotal: productForDetail.price * orderQuantity,
            shipping: 0,
            discount: 0,
            tax: productForDetail.price * orderQuantity * resolveVatRate(),
            total:
              productForDetail.price * orderQuantity +
              productForDetail.price * orderQuantity * resolveVatRate(),
            promoApplied: false,
            vatPercentage: resolveVatRate(),
          }}
          config={{
            role: "retailer",
            ordersPath: "/retailer/orders",
          }}
          supplierAllowedMethods={supplierAllowedMethods}
          supplierPaymentMethods={supplierPaymentMethods}
          onPlaceOrder={handlePlaceOrder}
          onProcessPayment={handleProcessPayment as any}
          onUpdateItemQuantity={(_, nextQuantity) =>
            setOrderQuantity(Math.max(1, Number(nextQuantity || 1)))
          }
          isPlacing={orderLoading}
        />
      )}
    </WithAsync>
  );
};

export default RetailerProductDetailPage;
