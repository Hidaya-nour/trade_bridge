// components/shared/CartPage.tsx
import {
  ArrowLeft,
  ChevronRight,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { resolveBoolean } from "@/lib/coerce";
import { formatPrice } from "@/lib/formatters";
import { supplierMethodsToPaymentMethods } from "@/lib/payment-method-utils";
import { getInitials } from "@/lib/utils";
import documentService from "@/services/document.service";
import paymentService from "@/services/payment.service";
import supplierPaymentMethodService from "@/services/supplier-payment-method.service";
import { useCartStore } from "@/stores/cart.store";
import { useOrderStore } from "@/stores/order.store";
import { useSupplierStore } from "@/stores/supplier.store";
import type { CartConfig, CartItem } from "@/types/cart.types";
import type { OrderItem } from "@/types/order.types";
import type {
  PaymentMethod,
  SupplierPaymentMethodInfo,
} from "@/types/payment.types";
import toast from "react-hot-toast";
import { PlaceOrderDialog } from "../../components/order/PlaceOrderDialog";

interface CartPageProps {
  config: CartConfig;
}

export type { CartConfig };

// ============================================================================
// COMPONENT
// ============================================================================

export const CartPage: React.FC<CartPageProps> = ({ config }) => {
  const DEFAULT_VAT_RATE = 0.15;
  const navigate = useNavigate();
  const [selectAll, setSelectAll] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [supplierAllowedMethods, setSupplierAllowedMethods] = useState<
    PaymentMethod[]
  >([]);
  const [supplierPaymentMethods, setSupplierPaymentMethods] = useState<
    SupplierPaymentMethodInfo[]
  >([]);
  const [itemSelection, setItemSelection] = useState<Record<string, boolean>>(
    {},
  );

  // Get cart data from store
  const {
    items: cartItems,
    totalItems,
    isLoading,
    error,
    fetchCart,
    updateQuantity,
    removeFromCart,
  } = useCartStore();

  const {
    suppliers,
    fetchSuppliers,
    isLoading: suppliersLoading,
  } = useSupplierStore();

  const { createOrder, isLoading: orderLoading } = useOrderStore();

  const resolveProductVatRate = (product?: any) => {
    const supplierId = product?.supplier_id;
    const supplier =
      product?.supplier || (supplierId ? suppliers?.[supplierId] : undefined);
    if (!supplier || supplier.is_vat_registered !== true) return 0;
    const parsedRate = Number(supplier.vat_rate);
    if (Number.isFinite(parsedRate) && parsedRate >= 0 && parsedRate <= 1) {
      return parsedRate;
    }
    return DEFAULT_VAT_RATE;
  };
  const resolveProductShipping = (product?: any) => {
    const deliveryAvailable = resolveBoolean(product?.delivery_available, true);
    if (!deliveryAvailable) return { shipping: 0, blocked: true };

    // Distance-based delivery calculation is no longer available
    // Delivery is either free or blocked based on supplier settings
    const pricing = String(product?.delivery_pricing || "").toLowerCase();

    if (pricing === "paid") {
      // Paid delivery - but we don't calculate based on km anymore
      // Return blocked to indicate delivery needs manual arrangement
      return { shipping: 0, blocked: true };
    }

    // Free delivery or no specific pricing
    return { shipping: 0, blocked: false };
  };

  const handlePlaceOrder = async (
    paymentMethod?: string,
    deliveryOption?: string,
    deliveryAddress?: string,
  ) => {
    const selectedDeliveryOption = deliveryOption || "supplier_policy";
    try {
      const normalizedAddress = (deliveryAddress || "").trim();
      const supplierIds = selectedItems
        .map((item) => item.product?.supplier_id)
        .filter(Boolean) as string[];

      if (supplierIds.length > 0) {
        await fetchSuppliers(supplierIds);
      }

      const ordersBySupplier = selectedItems.reduce(
        (acc, item) => {
          const supplier_id = item.product?.supplier_id;

          if (!supplier_id) {
            console.warn("Item missing supplier_id:", item);
            return acc;
          }

          const supplier = suppliers[supplier_id];

          if (!acc[supplier_id]) {
            acc[supplier_id] = {
              supplier_id: supplier_id,
              supplier_name:
                supplier?.business_name ||
                supplier?.full_name ||
                `Supplier ${supplier_id.slice(0, 8)}`,
              items: [],
              subtotal: 0,
              shipping: 0,
              vatRate: resolveProductVatRate(item.product),
              hasNoDeliveryItem: false,
            };
          }

          const { shipping: itemShipping, blocked } = resolveProductShipping(
            item.product,
          );
          if (blocked) {
            acc[supplier_id].hasNoDeliveryItem = true;
          }
          acc[supplier_id].shipping = Math.max(
            acc[supplier_id].shipping,
            itemShipping,
          );

          acc[supplier_id].items.push({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.product?.price || 0,
            product_name: item.product?.name,
          });

          acc[supplier_id].subtotal +=
            (item.product?.price || 0) * item.quantity;

          return acc;
        },
        {} as Record<string, any>,
      );

      console.log("Orders by supplier:", ordersBySupplier);

      // Check if we have any valid orders
      if (Object.keys(ordersBySupplier).length === 0) {
        toast.error(
          "Cannot place order: Items are missing supplier information",
        );
        return;
      }

      const noDeliverySuppliers = Object.values(ordersBySupplier)
        .filter((supplierOrder: any) => supplierOrder.hasNoDeliveryItem)
        .map((supplierOrder: any) => supplierOrder.supplier_name);
      if (noDeliverySuppliers.length > 0) {
        toast(
          `Some suppliers do not provide delivery for selected items: ${noDeliverySuppliers.join(", ")}. You can request an independent driver after ordering.`,
          { icon: "ℹ️" } as any,
        );
      }

      // Create separate orders for each supplier
      const orders = [];
      for (const [supplierId, orderData] of Object.entries(ordersBySupplier)) {
        // Calculate per-supplier totals
        const supplierSubtotal = orderData.subtotal;
        const supplierShipping = Number(orderData.shipping || 0);
        const supplierDiscount = promoApplied
          ? supplierSubtotal * (config.bulkDiscountPercentage || 0.1)
          : 0;
        const supplierTax =
          (supplierSubtotal - supplierDiscount) *
          Number(orderData.vatRate || 0);

        const orderPayload = {
          supplier_id: supplierId,
          items: orderData.items.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
          // Only request supplier delivery when all selected items for that supplier support delivery.
          ...(normalizedAddress && !orderData.hasNoDeliveryItem
            ? { delivery_address: normalizedAddress }
            : {}),
          notes: "",
          ...(paymentMethod ? { payment_method: paymentMethod } : {}),
        };

        console.log(
          `Sending order for supplier ${orderData.supplier_name} (${supplierId}):`,
          orderPayload,
        );

        const order = await createOrder(orderPayload);
        console.log(`Order created for supplier ${supplierId}:`, order);

        if (order) orders.push(order);
      }

      if (orders.length > 0) {
        toast.success(`${orders.length} order(s) placed successfully!`);

        // Remove all selected items from cart
        await Promise.all(selectedItems.map((item) => removeFromCart(item.id)));
        return {
          primaryOrderId: String(orders[0].id),
          orderIds: orders.map((o: any) => String(o.id)),
          total,
        };
      } else {
        toast.error("No orders were created");
        return;
      }
    } catch (error) {
      console.error("Order placement error:", error);
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Failed to place order";
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
        amount_paid: paymentMethod === "app_payment" ? undefined : total,
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
    } catch (error) {
      console.error("Payment submit failed:", error);
      return false;
    }
  };

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  // Calculate selected items
  const selectedItems = useMemo(() => {
    return cartItems.filter((item) => itemSelection[item.id]);
  }, [cartItems, itemSelection]);

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [selectedItems]);

  // Calculate shipping
  const shipping = useMemo(() => {
    const supplierShippingMap: Record<string, number> = {};

    selectedItems.forEach((item) => {
      const supplierId = item.product?.supplier_id;
      if (!supplierId) return;
      const { shipping: itemShipping } = resolveProductShipping(item.product);
      supplierShippingMap[supplierId] = Math.max(
        supplierShippingMap[supplierId] || 0,
        itemShipping,
      );
    });

    return Object.values(supplierShippingMap).reduce(
      (sum, fee) => sum + fee,
      0,
    );
  }, [selectedItems]);

  // Calculate discount
  const discount = promoApplied
    ? subtotal * (config.bulkDiscountPercentage || 0.1)
    : 0;

  // Calculate tax
  const tax = useMemo(() => {
    const supplierTotals = selectedItems.reduce(
      (acc, item) => {
        const supplierId = item.product?.supplier_id;
        if (!supplierId) return acc;

        if (!acc[supplierId]) {
          acc[supplierId] = {
            subtotal: 0,
            vatRate: resolveProductVatRate(item.product),
          };
        }

        acc[supplierId].subtotal += (item.product?.price || 0) * item.quantity;
        return acc;
      },
      {} as Record<string, { subtotal: number; vatRate: number }>,
    );

    return Object.values(supplierTotals).reduce((sum, supplierTotal) => {
      const supplierDiscount = promoApplied
        ? supplierTotal.subtotal * (config.bulkDiscountPercentage || 0.1)
        : 0;
      const taxableAmount = supplierTotal.subtotal - supplierDiscount;
      return sum + taxableAmount * supplierTotal.vatRate;
    }, 0);
  }, [selectedItems, promoApplied, config.bulkDiscountPercentage]);

  // Calculate total
  const total = subtotal + shipping + tax - discount;

  // Check if bulk discount threshold is met
  const bulkDiscountProgress = config.bulkDiscountThreshold
    ? Math.min((subtotal / config.bulkDiscountThreshold) * 100, 100)
    : 0;

  const remainingForDiscount = config.bulkDiscountThreshold
    ? Math.max(0, config.bulkDiscountThreshold - subtotal)
    : 0;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Update quantity
  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    const minOrder = item.product?.min_order_amount || 1;
    const maxOrder = item.product?.stock_quantity || Infinity;

    const quantity = Math.max(minOrder, Math.min(newQuantity, maxOrder));

    const result = await updateQuantity(itemId, quantity);
    if (result) {
      toast.success("Quantity updated");
    }
  };

  // Toggle item selection
  const toggleItem = (itemId: string) => {
    setItemSelection((prev) => {
      const newSelection = { ...prev, [itemId]: !prev[itemId] };
      const allSelected = cartItems.every((item) => newSelection[item.id]);
      setSelectAll(allSelected);
      return newSelection;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const newSelection = cartItems.reduce(
      (acc, item) => {
        acc[item.id] = newSelectAll;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    setItemSelection(newSelection);
  };

  // Remove item
  const handleRemoveItem = async (itemId: string) => {
    const success = await removeFromCart(itemId);
    if (success) {
      toast.success("Item removed from cart");

      // Update selection
      setItemSelection((prev) => {
        const newSelection = { ...prev };
        delete newSelection[itemId];
        return newSelection;
      });
    }
  };

  // Remove selected items
  const handleRemoveSelected = async () => {
    const selectedIds = Object.entries(itemSelection)
      .filter(([_, selected]) => selected)
      .map(([id]) => id);

    try {
      const results = await Promise.allSettled(
        selectedIds.map((id) => removeFromCart(id)),
      );

      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === 0) {
        toast.success(`${selectedIds.length} items removed successfully`);
      } else {
        toast.error(`${failed} items failed to remove`);
      }
    } catch (error) {
      toast.error("Failed to remove selected items");
    }
  };

  // Group items by supplier
  const supplierGroups = useMemo(() => {
    const groups: Record<string, any> = {};

    selectedItems.forEach((item) => {
      const supplier = item.product?.supplier;
      const supplierId = item.product?.supplier_id || supplier?.id || "unknown";
      const { shipping: itemShipping, blocked } = resolveProductShipping(
        item.product,
      );

      if (!groups[supplierId]) {
        groups[supplierId] = {
          supplierId,
          supplierName:
            supplier?.business_name ||
            supplier?.full_name ||
            "Unknown Supplier",
          supplierVerified: supplier?.is_verified || false,
          items: [],
          subtotal: 0,
          shipping: 0,
          hasNoDeliveryItem: false,
        };
      }

      groups[supplierId].items.push(item);
      groups[supplierId].subtotal += (item.product?.price || 0) * item.quantity;
      groups[supplierId].shipping = Math.max(
        groups[supplierId].shipping,
        itemShipping,
      );
      groups[supplierId].hasNoDeliveryItem =
        groups[supplierId].hasNoDeliveryItem || blocked;
    });

    return Object.values(groups);
  }, [selectedItems]);

  // Get role-specific icon
  const RoleIcon = config.supplierIcon;
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!checkoutDialogOpen) return;
    let cancelled = false;

    const loadMethods = async () => {
      const supplierIds = Array.from(
        new Set(
          selectedItems
            .map((item) => item.product?.supplier_id)
            .filter(Boolean) as string[],
        ),
      );
      if (supplierIds.length === 0) {
        setSupplierAllowedMethods([]);
        setSupplierPaymentMethods([]);
        return;
      }

      try {
        const methodGroups = await Promise.all(
          supplierIds.map(async (supplierId) => {
            const response =
              await supplierPaymentMethodService.getActiveBySupplierId(
                supplierId,
              );
            return response.data || response || [];
          }),
        );
        if (cancelled) return;
        const allMethods = methodGroups.flat();
        const allowedBySupplier = methodGroups.map((methods) =>
          supplierMethodsToPaymentMethods(methods),
        );
        const sharedMethods = allowedBySupplier.reduce<PaymentMethod[]>(
          (shared, methods) =>
            shared.filter((method) => methods.includes(method)),
          allowedBySupplier[0] || [],
        );
        setSupplierPaymentMethods(allMethods);
        setSupplierAllowedMethods(sharedMethods);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load supplier payment methods", error);
        setSupplierAllowedMethods([]);
        setSupplierPaymentMethods([]);
      }
    };

    void loadMethods();
    return () => {
      cancelled = true;
    };
  }, [checkoutDialogOpen, selectedItems]);

  useEffect(() => {
    if (cartItems.length > 0) {
      const supplierIds = cartItems
        .map((item) => item.product?.supplier_id)
        .filter(Boolean) as string[];

      if (supplierIds.length > 0) {
        fetchSuppliers(supplierIds);
      }
    }
  }, [cartItems, fetchSuppliers]);

  // Initialize selection when cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      const initialSelection = cartItems.reduce(
        (acc, item) => {
          acc[item.id] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );
      setItemSelection(initialSelection);
      setSelectAll(true);
    }
  }, [cartItems]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading || suppliersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-muted-foreground mt-1">{config.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
            {totalItems} items
          </Badge>
          <Button variant="ghost" size="sm" asChild>
            <Link to={config.continueShoppingPath} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <Card className="py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {config.emptyStateMessage}
            </p>
            <Button size="lg" asChild>
              <Link to={config.productsPath}>Browse Products</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Select All Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id="select-all"
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                    />
                    <Label htmlFor="select-all" className="text-sm font-medium">
                      Select All ({cartItems.length} items)
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleRemoveSelected}
                    disabled={selectedItems.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Selected
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cart Items by Supplier */}
            {supplierGroups.map((group: any) => (
              <Card key={group.supplierId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(group.supplierName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          <Link
                            to={config.supplierPath.replace(
                              ":id",
                              group.supplierId,
                            )}
                            className="hover:text-primary"
                          >
                            {group.supplierName}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          {group.items.length} items •{" "}
                          {group.hasNoDeliveryItem
                            ? "Contains no-delivery items"
                            : `Shipping: ${formatPrice(group.shipping)}`}
                        </CardDescription>
                      </div>
                    </div>
                    {group.supplierVerified && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Verified {config.supplierLabel}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    {group.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 py-2"
                      >
                        <Checkbox
                          checked={itemSelection[item.id] || false}
                          onCheckedChange={() => toggleItem(item.id)}
                        />

                        {/* Product Image */}
                        <div className="h-16 w-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-full w-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-primary/30" />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                            <div>
                              <Link
                                to={`/${config.role}/products/${item.product_id}`}
                                className="text-sm font-medium hover:text-primary"
                              >
                                {item.product?.name}
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  Unit Price:{" "}
                                  {formatPrice(item.product?.price || 0)}/
                                  {item.product?.unit_type}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  Min: {item.product?.min_order_amount}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-green-50"
                                >
                                  In Stock: {item.product?.stock_quantity}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Quantity Selector */}
                              <div className="flex items-center border rounded-md">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-r-none"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity - 1,
                                    )
                                  }
                                  disabled={
                                    item.quantity <=
                                    (item.product?.min_order_amount || 1)
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-12 text-center text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-l-none"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity + 1,
                                    )
                                  }
                                  disabled={
                                    item.quantity >=
                                    (item.product?.stock_quantity || Infinity)
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Item Total */}
                              <div className="text-right min-w-[100px]">
                                <div className="text-sm font-bold text-primary">
                                  {formatPrice(
                                    (item.product?.price || 0) * item.quantity,
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {group.hasNoDeliveryItem
                                    ? "No delivery available"
                                    : `+${formatPrice(group.shipping)} shipping`}
                                </div>
                              </div>

                              {/* Remove Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary - Right Column */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {selectedItems.length} items selected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{formatPrice(shipping)}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        Discount ({config.bulkDiscountPercentage! * 100}%)
                      </span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={selectedItems.length === 0}
                  onClick={() => setCheckoutDialogOpen(true)}
                >
                  Proceed to Checkout
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By placing this order, you agree to our Terms of Service and
                  Return Policy
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* Place Order Dialog */}
      <PlaceOrderDialog
        open={checkoutDialogOpen}
        onOpenChange={setCheckoutDialogOpen}
        items={selectedItems.map(toOrderItem)}
        summary={{
          subtotal,
          shipping,
          discount,
          tax,
          total,
          promoApplied,
          discountPercentage: config.bulkDiscountPercentage,
        }}
        config={{
          role: config.role,
          ordersPath: config.ordersPath,
          bulkDiscountPercentage: config.bulkDiscountPercentage,
        }}
        showPostOrderDialog={false}
        onPlaceOrder={handlePlaceOrder}
        onProcessPayment={handleProcessPayment as any}
        isPlacing={orderLoading}
        supplierAllowedMethods={supplierAllowedMethods}
        supplierPaymentMethods={supplierPaymentMethods}
      />
    </div>
  );
};
const toOrderItem = (item: CartItem): OrderItem => ({
  id: item.id,
  order_id: "",
  product_id: item.product_id,
  quantity: item.quantity,
  unit_price: item.product?.price || 0,
  product: item.product,
});
