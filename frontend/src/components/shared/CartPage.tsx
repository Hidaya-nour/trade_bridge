// components/shared/CartPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Truck,
  Shield,
  CreditCard,
  Wallet,
  Building,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useCartStore } from "@/stores/cart.store";
import { useSupplierStore } from "@/stores/supplier.store";
import { formatPrice } from "@/lib/formatters";
import { getInitials } from "@/lib/utils";
import toast from "react-hot-toast";

// ============================================================================
// TYPES
// ============================================================================

export type CartRole = "retailer" | "distributor";

export interface CartConfig {
  role: CartRole;
  title: string;
  description: string;
  continueShoppingPath: string;
  supplierPath: string;
  supplierLabel: string;
  supplierIcon: React.ElementType;
  ordersPath: string;
  productsPath: string;
  emptyStateMessage: string;
  bulkDiscountThreshold?: number;
  bulkDiscountPercentage?: number;
  vatPercentage?: number;
  shippingCostPerSupplier?: number;
}

// ============================================================================
// PROPS
// ============================================================================

interface CartPageProps {
  config: CartConfig;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_METHODS = [
  {
    id: "cash",
    name: "Cash on Delivery",
    icon: Wallet,
    description: "Pay when you receive your order",
  },
  {
    id: "credit",
    name: "Credit",
    icon: CreditCard,
    description: "Pay with credit (30 days terms)",
  },
  {
    id: "cheque",
    name: "Cheque",
    icon: Building,
    description: "Pay by cheque",
  },
  {
    id: "mobile",
    name: "Mobile Banking",
    icon: Wallet,
    description: "Pay with mobile money",
  },
  {
    id: "online",
    name: "Online Payment",
    icon: CreditCard,
    description: "Pay with Chapa, Telebirr, etc.",
  },
];

const DELIVERY_OPTIONS = [
  {
    id: "standard",
    name: "Standard Delivery",
    days: "3-5 business days",
    cost: "Included",
  },
  {
    id: "express",
    name: "Express Delivery",
    days: "1-2 business days",
    cost: "ETB 500",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const CartPage: React.FC<CartPageProps> = ({ config }) => {
  const navigate = useNavigate();
  const [selectAll, setSelectAll] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
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

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Fetch suppliers for cart items
  useEffect(() => {
    if (cartItems.length > 0) {
      const supplierIds = cartItems
        .map((item) => item.product?.supplier?.id)
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
    const uniqueSuppliers = new Set(
      selectedItems.map((item) => item.product?.supplier?.id).filter(Boolean),
    );
    return uniqueSuppliers.size * (config.shippingCostPerSupplier || 250);
  }, [selectedItems, config.shippingCostPerSupplier]);

  // Calculate discount
  const discount = promoApplied
    ? subtotal * (config.bulkDiscountPercentage || 0.1)
    : 0;

  // Calculate tax
  const tax = (subtotal - discount) * (config.vatPercentage || 0.15);

  // Calculate total
  const total = subtotal + shipping + tax - discount;

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
      // Use Promise.allSettled to handle partial failures
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

  // Apply promo code
  const applyPromo = () => {
    if (promoCode.toUpperCase() === "TRADE10") {
      setPromoApplied(true);
      toast.success("Promo code applied!");
    } else {
      toast.error("Invalid promo code");
    }
  };

  // Group items by supplier
  const supplierGroups = useMemo(() => {
    const groups: Record<string, any> = {};

    selectedItems.forEach((item) => {
      const supplier = item.product?.supplier;
      const supplierId = supplier?.id || "unknown";

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
          shipping: config.shippingCostPerSupplier || 250,
        };
      }

      groups[supplierId].items.push(item);
      groups[supplierId].subtotal += (item.product?.price || 0) * item.quantity;
    });

    return Object.values(groups);
  }, [selectedItems, config.shippingCostPerSupplier]);

  // Get role-specific icon
  const RoleIcon = config.supplierIcon;

  // Check if bulk discount threshold is met
  const bulkDiscountProgress = config.bulkDiscountThreshold
    ? Math.min((subtotal / config.bulkDiscountThreshold) * 100, 100)
    : 0;

  const remainingForDiscount = config.bulkDiscountThreshold
    ? Math.max(0, config.bulkDiscountThreshold - subtotal)
    : 0;

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
            <Button variant="ghost" size="sm" asChild>
              <Link to={config.productsPath} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Browse Products
              </Link>
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
                          {group.items.length} items • Shipping:{" "}
                          {formatPrice(group.shipping)}
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
                                  +{formatPrice(group.shipping)} shipping
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
                    <span className="text-muted-foreground">
                      VAT ({(config.vatPercentage || 0.15) * 100}%)
                    </span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="space-y-2">
                  <Label htmlFor="promo">Promo Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <Button
                      variant="outline"
                      onClick={applyPromo}
                      disabled={promoApplied || !promoCode}
                    >
                      Apply
                    </Button>
                  </div>
                  {promoApplied && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {config.bulkDiscountPercentage! * 100}% discount applied!
                    </p>
                  )}
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

            {/* Delivery Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Estimated Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      {deliveryOption === "standard"
                        ? "3-5 business days"
                        : "1-2 business days"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Secure Transaction</p>
                    <p className="text-xs text-muted-foreground">
                      Your payment information is encrypted
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Review your order and select payment method
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {/* Order Items Summary */}
              <div>
                <h4 className="text-sm font-medium mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">
                          {item.product?.name}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          x{item.quantity} {item.product?.unit_type}
                        </span>
                      </div>
                      <span>
                        {formatPrice(
                          (item.product?.price || 0) * item.quantity,
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Delivery Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Delivery Option</h4>
                <RadioGroup
                  value={deliveryOption}
                  onValueChange={setDeliveryOption}
                >
                  {DELIVERY_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            {option.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {option.cost}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {option.days}
                        </p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Payment Method</h4>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex-1">
                        <div className="flex items-center gap-2">
                          <method.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {method.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          {method.description}
                        </p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Order Total */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>VAT ({(config.vatPercentage || 0.15) * 100}%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCheckoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setCheckoutDialogOpen(false);
                toast.success("Order placed successfully!");
                navigate(config.ordersPath);
              }}
            >
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
