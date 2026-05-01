// components/shared/PlaceOrderDialog.tsx
import { BadgeDollarSign, Minus, Plus, Truck } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { resolveBoolean } from "@/lib/coerce";
import { formatPrice } from "@/lib/formatters";
import { geocodeAreaName, haversineKm } from "@/lib/geo";
import addressService from "@/services/address.service";
import type { Address } from "@/types/address.types";
import type { OrderItem } from "@/types/order.types";
import type { PaymentDetails, PaymentMethod } from "@/types/payment.types";
import toast from "react-hot-toast";
import { Textarea } from "../ui/textarea";

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
  supplierAllowedMethods?: PaymentMethod[];
  supplierPaymentMethods?: any[];
  onPlaceOrder?: (
    paymentMethod?: string,
    deliveryOption?: string,
    deliveryAddress?: string,
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
  onUpdateItemQuantity?: (productId: string, nextQuantity: number) => void;
  isPlacing?: boolean;
}

export const PlaceOrderDialog: React.FC<PlaceOrderDialogProps> = ({
  open,
  onOpenChange,
  items,
  summary,
  config,
  showPostOrderDialog = true,
  supplierAllowedMethods,
  supplierPaymentMethods,
  onPlaceOrder,
  onProcessPayment,
  onUpdateItemQuantity,
  isPlacing: externalIsPlacing,
}) => {
  const navigate = useNavigate();
  const DEFAULT_DISTANCE_KM = 1;
  const [deliveryOption] = React.useState("supplier_policy");
  const [deliveryAddress, setDeliveryAddress] = React.useState("");
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = React.useState(false);
  const [addressesError, setAddressesError] = React.useState<string | null>(
    null,
  );
  const [useSavedLocation, setUseSavedLocation] = React.useState(false);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>("");
  const [buyerCoords, setBuyerCoords] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoLoading, setGeoLoading] = React.useState(false);
  const [geoError, setGeoError] = React.useState<string | null>(null);
  const [internalIsPlacing, setInternalIsPlacing] = React.useState(false);

  // Credit request flag – defaults to false (normal order, no upfront payment method)
  const [requestCredit, setRequestCredit] = React.useState(false);

  const toFinite = (value: any) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const formatAddress = (addr: Address) => {
    const parts = [addr.common_name, addr.subcity, addr.city, addr.region]
      .map((v) => String(v || "").trim())
      .filter(Boolean);
    return parts
      .filter(
        (value, index, all) =>
          all.findIndex((v) => v.toLowerCase() === value.toLowerCase()) ===
          index,
      )
      .join(", ");
  };

  const sortedAddresses = React.useMemo(() => {
    if (!Array.isArray(addresses)) return [];
    const safeDate = (value: any) => {
      const d = value ? new Date(value) : null;
      return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
    };
    return [...addresses].sort(
      (a, b) => safeDate(b.created_at) - safeDate(a.created_at),
    );
  }, [addresses]);

  const selectedSavedAddress = React.useMemo(() => {
    if (!useSavedLocation) return null;
    if (!selectedAddressId) return sortedAddresses[0] || null;
    return (
      sortedAddresses.find((a) => a.id === selectedAddressId) ||
      sortedAddresses[0] ||
      null
    );
  }, [selectedAddressId, sortedAddresses, useSavedLocation]);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const loadAddresses = async () => {
      setAddressesLoading(true);
      setAddressesError(null);
      try {
        const response = await addressService.getAll();
        const data = (response as any)?.data || response;
        const next = Array.isArray(data) ? (data as Address[]) : [];
        if (cancelled) return;
        setAddresses(next);

        if (next.length > 0 && !deliveryAddress.trim()) {
          const preferred = next.slice().sort((a, b) => {
            const at = a.created_at
              ? new Date(a.created_at as any).getTime()
              : 0;
            const bt = b.created_at
              ? new Date(b.created_at as any).getTime()
              : 0;
            return bt - at;
          })[0];
          if (preferred) {
            setUseSavedLocation(true);
            setSelectedAddressId(preferred.id);
            setDeliveryAddress(formatAddress(preferred));
          }
        }
      } catch (err: any) {
        if (cancelled) return;
        setAddresses([]);
        setAddressesError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load saved locations",
        );
      } finally {
        if (!cancelled) setAddressesLoading(false);
      }
    };

    void loadAddresses();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    if (!useSavedLocation) return;
    if (!selectedSavedAddress) return;
    const formatted = formatAddress(selectedSavedAddress);
    if (!formatted) return;
    setDeliveryAddress((prev) => (prev.trim() ? prev : formatted));
  }, [open, selectedSavedAddress, useSavedLocation]);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const savedLat = selectedSavedAddress
      ? toFinite(selectedSavedAddress.latitude)
      : null;
    const savedLng = selectedSavedAddress
      ? toFinite(selectedSavedAddress.longitude)
      : null;
    if (savedLat !== null && savedLng !== null) {
      setBuyerCoords({ lat: savedLat, lng: savedLng });
      setGeoError(null);
      return;
    }

    const query = deliveryAddress.trim();
    if (!query) {
      setBuyerCoords(null);
      setGeoError(null);
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    const timer = setTimeout(async () => {
      try {
        const coords = await geocodeAreaName(query);
        if (cancelled) return;
        setBuyerCoords(coords);
        if (!coords) {
          setGeoError("Unable to resolve this area name to coordinates.");
        }
      } catch (err: any) {
        if (cancelled) return;
        setBuyerCoords(null);
        setGeoError(err?.message || "Failed to resolve location.");
      } finally {
        if (!cancelled) setGeoLoading(false);
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      setGeoLoading(false);
    };
  }, [deliveryAddress, open, selectedSavedAddress]);

  const deliveryPolicyRows = React.useMemo(() => {
    return items
      .map((item) => {
        const product = item.product as any;
        if (!product) return null;
        const supplierId = String(
          product.supplier_id ||
            product.supplierId ||
            product.supplier?.id ||
            "",
        ).trim();

        const deliveryAvailable = resolveBoolean(
          product.delivery_available,
          true,
        );
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
          supplierId: supplierId || null,
          name: product.name || "Product",
          deliveryAvailable,
          deliveryPricing,
          feePerKm,
          freeMaxKm,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      supplierId: string | null;
      name: string;
      deliveryAvailable: boolean;
      deliveryPricing: "free" | "paid";
      feePerKm: number;
      freeMaxKm: number | null;
    }>;
  }, [items]);

  const shippingEstimate = React.useMemo(() => {
    const distanceBySupplier: Record<string, number> = {};
    const missingSupplierCoords = new Set<string>();

    const getSupplierCoords = (product: any) => {
      const addr = product?.supplier?.addresses?.[0] || null;
      const lat = toFinite(addr?.latitude ?? product?.latitude);
      const lng = toFinite(addr?.longitude ?? product?.longitude);
      if (lat === null || lng === null) return null;
      return { lat, lng };
    };

    const coordsBySupplier = new Map<string, { lat: number; lng: number }>();
    for (const item of items) {
      const product = (item as any)?.product;
      if (!product) continue;
      const supplierId = String(
        product?.supplier_id || product?.supplier?.id || "",
      ).trim();
      if (!supplierId) continue;
      if (coordsBySupplier.has(supplierId)) continue;
      const coords = getSupplierCoords(product);
      if (coords) coordsBySupplier.set(supplierId, coords);
      else missingSupplierCoords.add(supplierId);
    }

    if (buyerCoords) {
      coordsBySupplier.forEach((coords, supplierId) => {
        distanceBySupplier[supplierId] = Number(
          haversineKm(buyerCoords, coords).toFixed(2),
        );
      });
    }

    const shippingBySupplier: Record<string, number> = {};
    let usedFallbackDistance = false;

    for (const row of deliveryPolicyRows) {
      const supplierId = row.supplierId || "unknown";
      const distanceKm =
        buyerCoords && distanceBySupplier[supplierId] !== undefined
          ? distanceBySupplier[supplierId]
          : DEFAULT_DISTANCE_KM;

      if (!buyerCoords || distanceBySupplier[supplierId] === undefined) {
        usedFallbackDistance = true;
      }

      if (!row.deliveryAvailable) continue;

      const freeMaxKm = row.freeMaxKm;
      if (freeMaxKm !== null && distanceKm <= freeMaxKm) {
        shippingBySupplier[supplierId] = Math.max(
          shippingBySupplier[supplierId] || 0,
          0,
        );
        continue;
      }

      // For paid delivery we do not add any shipping here because the delivery fee will be added by the supplier upon approval
    }

    const shipping = Number(
      Object.values(shippingBySupplier)
        .reduce((sum, fee) => sum + fee, 0)
        .toFixed(2),
    );

    const knownDistances = Object.values(distanceBySupplier);
    const singleSupplierKm =
      knownDistances.length === 1 ? knownDistances[0] : null;

    return {
      shipping,
      usedFallbackDistance,
      missingSupplierCoordsCount: missingSupplierCoords.size,
      supplierCount: new Set(
        deliveryPolicyRows.map((r) => r.supplierId || "unknown"),
      ).size,
      singleSupplierKm,
    };
  }, [buyerCoords, deliveryPolicyRows, items]);

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

  const handlePlaceOrder = async () => {
    if (onPlaceOrder) {
      setInternalIsPlacing(true);
      try {
        const normalizedAddress = deliveryAddress.trim();
        if (!normalizedAddress) {
          toast.error("Please provide a delivery address.");
          return;
        }

        // Determine payment method: only send 'credit' if requested, otherwise undefined
        const paymentMethod = requestCredit ? "credit" : undefined;

        const result = await onPlaceOrder(
          paymentMethod,
          deliveryOption,
          normalizedAddress,
        );
        if (result?.primaryOrderId) {
          onOpenChange(false);
          navigate(config.ordersPath);
          return;
        }

        onOpenChange(false);
        navigate(config.ordersPath);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to place order",
        );
      } finally {
        setInternalIsPlacing(false);
      }
      return;
    }

    // Default behavior if no onPlaceOrder provided
    setInternalIsPlacing(true);
    try {
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
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <div className="min-w-0">
                      <span className="font-medium">{item.product?.name}</span>
                      {onUpdateItemQuantity ? (
                        <div className="mt-1 flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            disabled={
                              isPlacing ||
                              item.quantity <=
                                Math.max(
                                  1,
                                  Number(
                                    (item.product as any)?.min_order_amount ||
                                      1,
                                  ),
                                )
                            }
                            onClick={() => {
                              const productId = String(
                                item.product_id ||
                                  (item.product as any)?.id ||
                                  item.id,
                              );
                              const min = Math.max(
                                1,
                                Number(
                                  (item.product as any)?.min_order_amount || 1,
                                ),
                              );
                              onUpdateItemQuantity(
                                productId,
                                Math.max(min, item.quantity - 1),
                              );
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <Input
                            type="number"
                            value={item.quantity}
                            min={Math.max(
                              1,
                              Number(
                                (item.product as any)?.min_order_amount || 1,
                              ),
                            )}
                            defaultValue={item.quantity}
                            disabled={isPlacing}
                            onBlur={(e) => {
                              const productId = String(
                                item.product_id ||
                                  (item.product as any)?.id ||
                                  item.id,
                              );
                              const min = Math.max(
                                1,
                                Number(
                                  (item.product as any)?.min_order_amount || 1,
                                ),
                              );
                              const parsed = parseInt(e.target.value, 10);
                              if (!Number.isFinite(parsed)) return;
                              onUpdateItemQuantity(
                                productId,
                                Math.max(min, parsed),
                              );
                            }}
                            className="h-7 w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            disabled={isPlacing}
                            onClick={() => {
                              const productId = String(
                                item.product_id ||
                                  (item.product as any)?.id ||
                                  item.id,
                              );
                              const min = Math.max(
                                1,
                                Number(
                                  (item.product as any)?.min_order_amount || 1,
                                ),
                              );
                              onUpdateItemQuantity(
                                productId,
                                Math.max(min, item.quantity + 1),
                              );
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>

                          <span className="text-xs text-muted-foreground truncate">
                            {item.product?.unit_type}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground ml-2">
                          x{item.quantity} {item.product?.unit_type}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Credit Request Option */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="requestCredit"
                  checked={requestCredit}
                  onCheckedChange={(checked) => setRequestCredit(!!checked)}
                />
                <Label
                  htmlFor="requestCredit"
                  className="text-sm font-medium cursor-pointer"
                >
                  Request Credit (pay later after supplier approval)
                </Label>
              </div>
              {requestCredit && (
                <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                  <BadgeDollarSign className="inline h-4 w-4 mr-1" />
                  Your credit request will be reviewed by the supplier. If
                  approved, you will have credit terms (due date and limit). No
                  upfront payment required.
                </div>
              )}
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

            {/* Delivery Address */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Delivery Address</h4>
              <p className="text-xs text-muted-foreground">
                Provide the destination location for supplier delivery or an
                independent driver.
              </p>
              {addressesLoading && sortedAddresses.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  Loading saved locations...
                </div>
              ) : null}
              {sortedAddresses.length > 0 ? (
                <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={useSavedLocation}
                      onCheckedChange={(next) => {
                        const checked = Boolean(next);
                        setUseSavedLocation(checked);
                        if (checked && sortedAddresses.length > 0) {
                          const preferred =
                            selectedSavedAddress || sortedAddresses[0];
                          if (preferred) {
                            setSelectedAddressId(preferred.id);
                            setDeliveryAddress((prev) =>
                              prev.trim() ? prev : formatAddress(preferred),
                            );
                          }
                        }
                      }}
                    />
                    <Label className="text-sm">Use saved location</Label>
                  </div>
                  {useSavedLocation ? (
                    <Select
                      value={selectedSavedAddress?.id || ""}
                      onValueChange={(value) => setSelectedAddressId(value)}
                      disabled={addressesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a saved location" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedAddresses.map((addr) => (
                          <SelectItem key={addr.id} value={addr.id}>
                            {formatAddress(addr) || "Saved location"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                  {addressesError ? (
                    <div className="text-xs text-red-600">{addressesError}</div>
                  ) : null}
                </div>
              ) : null}
              <Textarea
                placeholder="City, sub-city, street, landmark, phone (if needed)…"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {geoLoading ? (
                  <span>Resolving area to coordinates...</span>
                ) : null}
                {geoError ? (
                  <span className="text-red-600">{geoError}</span>
                ) : null}
                {!geoLoading && !geoError && buyerCoords ? (
                  <span>
                    {typeof shippingEstimate.singleSupplierKm === "number"
                      ? `Estimated distance: ${shippingEstimate.singleSupplierKm} km`
                      : `Estimated distance calculated for ${shippingEstimate.supplierCount} supplier(s)`}
                  </span>
                ) : null}
                {shippingEstimate.usedFallbackDistance ? (
                  <span>
                    Using {DEFAULT_DISTANCE_KM} km for items missing
                    coordinates.
                  </span>
                ) : null}
              </div>
            </div>

            {/* Order Total */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(summary.subtotal)}</span>
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
                    {formatPrice(
                      summary.subtotal +
                        (buyerCoords
                          ? shippingEstimate.shipping
                          : summary.shipping) +
                        summary.tax -
                        summary.discount,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Estimate Note */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="h-3 w-3" />
              <span>Delivery cost is not included in the Total</span>
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
