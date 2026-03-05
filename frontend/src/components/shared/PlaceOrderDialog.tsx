// components/shared/PlaceOrderDialog.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Wallet,
  Building,
  Truck,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import { formatPrice } from "@/lib/formatters";
import toast from "react-hot-toast";

// ============================================================================
// TYPES
// ============================================================================

export interface OrderItem {
  id: string;
  product?: {
    name: string;
    unit_type: string;
    price: number;
  };
  product_id: string;
  quantity: number;
}

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
  onPlaceOrder?: (
    paymentMethod: string,
    deliveryOption: string,
  ) => Promise<void>;
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

export const DELIVERY_OPTIONS = [
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

export const PlaceOrderDialog: React.FC<PlaceOrderDialogProps> = ({
  open,
  onOpenChange,
  items,
  summary,
  config,
  onPlaceOrder,
  isPlacing: externalIsPlacing,
}) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = React.useState("cash");
  const [deliveryOption, setDeliveryOption] = React.useState("standard");
  const [internalIsPlacing, setInternalIsPlacing] = React.useState(false);

  const isPlacing =
    externalIsPlacing !== undefined ? externalIsPlacing : internalIsPlacing;

  const handlePlaceOrder = async () => {
    // If external onPlaceOrder is provided, use it with the selected values
    if (onPlaceOrder) {
      setInternalIsPlacing(true);
      try {
        await onPlaceOrder(paymentMethod, deliveryOption);
        // Don't close or navigate here - let the parent handle it
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
            Review your order details and select payment method
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
              <h4 className="text-sm font-medium">Delivery Option</h4>
              <RadioGroup
                value={deliveryOption}
                onValueChange={setDeliveryOption}
              >
                {DELIVERY_OPTIONS.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
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
                  <div key={method.id} className="flex items-center space-x-2">
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
                  <span>VAT ({(summary.vatPercentage || 0.15) * 100}%)</span>
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
                Estimated delivery:{" "}
                {deliveryOption === "standard" ? "3-5" : "1-2"} business days
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
    </Dialog>
  );
};
