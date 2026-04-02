// components/shared/PlaceOrderDialog.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Wallet, Truck, Building } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import { formatPrice } from "@/lib/formatters";
import toast from "react-hot-toast";
import type { OrderItem } from "@/types/order.types";
import { PaymentDialog } from "../payment/PaymentDialog";
import type { PaymentDetails, PaymentMethod } from "../payment/PaymentDialog";

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  promoApplied?: boolean;
  discountPercentage?: number;
  vatPercentage?: number;
}

export interface PlaceOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: OrderItem[];
  summary: OrderSummary;
  config: {
    role: "retailer" | "distributor";
    ordersPath: string;
    vatPercentage?: number;
    bulkDiscountPercentage?: number;
  };
  showPostOrderDialog?: boolean;
  onPlaceOrder?: (
    paymentMethod?: string,
    deliveryOption?: string,
  ) => Promise<{
    primaryOrderId: string;
    orderIds?: string[];
    total?: number;
  } | void>;
  onProcessPayment?: (
    orderId: string,
    paymentMethod: PaymentMethod,
    paymentDetails?: PaymentDetails,
    documents?: File[],
  ) => Promise<boolean>;
  isPlacing?: boolean;
}

export const PAYMENT_METHODS = [
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
    id: "mobile_banking",
    name: "Mobile Banking",
    icon: Wallet,
    description: "Pay with mobile money",
  },
  {
    id: "chapa",
    name: "Online Payment",
    icon: CreditCard,
    description: "Pay with Chapa, Telebirr, etc.",
  },
];

export const PlaceOrderDialog: React.FC<PlaceOrderDialogProps> = ({
  open,
  onOpenChange,
  items,
  summary,
  config,
  showPostOrderDialog = true,
  onPlaceOrder,
  onProcessPayment,
  isPlacing: externalIsPlacing,
}) => {
  const navigate = useNavigate();
  const [deliveryOption] = React.useState("supplier_policy");
  const [internalIsPlacing, setInternalIsPlacing] = React.useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = React.useState(false);
  const [openPostOrderChoice, setOpenPostOrderChoice] = React.useState(false);
  const [createdOrderId, setCreatedOrderId] = React.useState<string | null>(
    null,
  );
  const [createdOrderTotal, setCreatedOrderTotal] = React.useState<number>(
    summary.total,
  );
  const [paymentProcessing, setPaymentProcessing] = React.useState(false);

  const deliveryPolicyRows = React.useMemo(() => {
    return items
      .map((item) => {
        const product = item.product as any;
        if (!product) return null;

        const deliveryAvailable = product.delivery_available !== false;
        const rawDeliveryPricing = String(
          product.delivery_pricing || "",
        ).toLowerCase();
        const feePerKm = Number(product.delivery_fee_per_km || 0);
        const deliveryPricing: "free" | "paid" =
          rawDeliveryPricing === "paid" || feePerKm > 0 ? "paid" : "free";
        const freeMaxKm =
          product.free_delivery_max_distance_km !== null &&
          product.free_delivery_max_distance_km !== undefined
            ? Number(product.free_delivery_max_distance_km)
            : null;

        return {
          id: product.id || item.id,
          name: product.name || "Product",
          deliveryAvailable,
          deliveryPricing,
          feePerKm,
          freeMaxKm,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      name: string;
      deliveryAvailable: boolean;
      deliveryPricing: "free" | "paid";
      feePerKm: number;
      freeMaxKm: number | null;
    }>;
  }, [items]);

  const hasAnyNoDelivery = deliveryPolicyRows.some(
    (row) => !row.deliveryAvailable,
  );
  const paidPolicyCount = deliveryPolicyRows.filter(
    (row) => row.deliveryAvailable && row.deliveryPricing === "paid",
  ).length;
  const freePolicyCount = deliveryPolicyRows.filter(
    (row) => row.deliveryAvailable && row.deliveryPricing === "free",
  ).length;

  const isPlacing =
    externalIsPlacing !== undefined ? externalIsPlacing : internalIsPlacing;
  const handlePaymentSubmit = async (
    method: PaymentMethod,
    details: PaymentDetails,
    documents?: File[],
  ) => {
    if (!onProcessPayment || !createdOrderId) return false;

    setPaymentProcessing(true);
    try {
      const success = await onProcessPayment(
        createdOrderId,
        method,
        details,
        documents,
      );
      if (success) {
        setOpenPaymentDialog(false);
        onOpenChange(false);
        navigate(config.ordersPath);
      }
      return success;
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (onPlaceOrder) {
      setInternalIsPlacing(true);
      try {
        const result = await onPlaceOrder(undefined, deliveryOption);
        if (result?.primaryOrderId && onProcessPayment) {
          if (showPostOrderDialog) {
            setCreatedOrderId(result.primaryOrderId);
            setCreatedOrderTotal(result.total || summary.total);
            setOpenPostOrderChoice(true);
            return;
          }
          onOpenChange(false);
          navigate(config.ordersPath);
          return;
        }

        onOpenChange(false);
        navigate(config.ordersPath);
      } catch (error) {
        toast.error("Failed to place order");
      } finally {
        setInternalIsPlacing(false);
      }
      return;
    }

    // Default behavior if no onPlaceOrder provided
    setInternalIsPlacing(true);
    try {
      // Simulate order placement
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Order placed successfully!");
      onOpenChange(false);
      navigate(config.ordersPath);
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setInternalIsPlacing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Confirm and Place Order</DialogTitle>
          <DialogDescription>
            Review your order details and place your order
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Order Items Summary */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Order Items</h4>
                <Badge variant="outline">{items.length} items</Badge>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.product?.name}</span>
                      <span className="text-muted-foreground ml-2">
                        x{item.quantity} {item.product?.unit_type}
                      </span>
                    </div>
                    <span>
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Delivery Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Delivery Policy</h4>
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                Shipping is applied using each supplier's configured policy.
              </div>
              {deliveryPolicyRows.length > 0 && (
                <div className="rounded-md border bg-muted/40 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Supplier delivery policy for selected items
                  </p>
                  <div className="space-y-1">
                    {deliveryPolicyRows.slice(0, 6).map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="truncate pr-3">{row.name}</span>
                        {!row.deliveryAvailable ? (
                          <Badge variant="outline" className="text-red-600">
                            No delivery
                          </Badge>
                        ) : row.deliveryPricing === "free" ? (
                          <Badge variant="outline" className="text-green-700">
                            Free
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-700">
                            {formatPrice(row.feePerKm)}/km
                            {row.freeMaxKm !== null
                              ? `, free <= ${row.freeMaxKm} km`
                              : ""}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  {hasAnyNoDelivery && (
                    <p className="text-xs text-red-600">
                      Some items are marked as no-delivery by supplier.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="outline" className="text-green-700">
                      Free items: {freePolicyCount}
                    </Badge>
                    <Badge variant="outline" className="text-amber-700">
                      Paid-per-km items: {paidPolicyCount}
                    </Badge>
                    <Badge variant="outline" className="text-red-600">
                      No-delivery items:{" "}
                      {deliveryPolicyRows.length -
                        freePolicyCount -
                        paidPolicyCount}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Order Total */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(summary.shipping)}</span>
                </div>
                {summary.promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({summary.discountPercentage! * 100}%)</span>
                    <span>-{formatPrice(summary.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>
                    {typeof summary.vatPercentage === "number"
                      ? `VAT (${summary.vatPercentage * 100}%)`
                      : "VAT"}
                  </span>
                  <span>{formatPrice(summary.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(summary.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Estimate */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="h-3 w-3" />
              <span>
                Estimated delivery timeline depends on supplier delivery policy.
              </span>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPlacing}
          >
            Cancel
          </Button>
          <Button onClick={handlePlaceOrder} disabled={isPlacing}>
            {isPlacing ? "Placing Order..." : "Place Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
      <AlertDialog
        open={openPostOrderChoice}
        onOpenChange={setOpenPostOrderChoice}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Order Placed Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              Your order has been created. Do you want to finish now or proceed
              with payment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setOpenPostOrderChoice(false);
                onOpenChange(false);
                navigate(config.ordersPath);
              }}
            >
              Finish
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setOpenPostOrderChoice(false);
                setOpenPaymentDialog(true);
              }}
            >
              Pay Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {createdOrderId && (
        <PaymentDialog
          open={openPaymentDialog}
          onOpenChange={setOpenPaymentDialog}
          orderId={createdOrderId}
          orderNumber={createdOrderId.slice(-8)}
          amount={createdOrderTotal}
          onPaymentSubmit={handlePaymentSubmit}
          isProcessing={paymentProcessing}
          config={{
            allowedMethods: [
              "cash",
              "credit",
              "cheque",
              "mobile_banking",
              "chapa",
            ] as PaymentMethod[],
          }}
        />
      )}
    </Dialog>
  );
};
