import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoLinking from "expo-linking";
import { useRouter } from "expo-router";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import BottomSheetModal from "@/components/retailer/BottomSheetModal";
import PaymentSheet, {
  type PaymentSheetSubmitPayload,
} from "@/components/retailer/PaymentSheet";
import addressService, {
  type RetailerAddress,
} from "../../../src/features/address/address.service";
import { useCartStore } from "@/features/cart/cart.store";
import { type CartItem } from "@/features/cart/cart.types";
import { useOrderStore } from "@/features/orders/order.store";
import paymentService from "@/features/payments/payment.service";
import {
  formatCurrency,
  getSupplierInitials,
  getSupplierName,
  resolveProductShipping,
  resolveProductVatRate,
} from "@/features/retailer-marketplace/marketplace.utils";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

type SupplierGroup = {
  supplierId: string;
  supplierName: string;
  supplierVerified: boolean;
  items: CartItem[];
};

const BULK_DISCOUNT_PERCENTAGE = 0.1;
const BULK_DISCOUNT_THRESHOLD = 1000;

export default function RetailerCartScreen() {
  const router = useRouter();
  const { setTabBarVisible } = useRoleShell();
  const [refreshing, setRefreshing] = useState(false);
  const [selectAll, setSelectAll] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [itemSelection, setItemSelection] = useState<Record<string, boolean>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [requestCredit, setRequestCredit] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<RetailerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  const {
    items: cartItems,
    totalItems,
    isLoading,
    error,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCartStore();
  const { createOrder, isLoading: orderLoading, error: orderError, clearError } = useOrderStore();

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!cartItems.length) {
      setItemSelection({});
      setSelectAll(false);
      return;
    }

    setItemSelection((current) => {
      const next: Record<string, boolean> = {};
      let hasAnyCurrent = false;

      cartItems.forEach((item) => {
        const existing = current[item.id];
        next[item.id] = existing ?? true;
        if (existing !== undefined) {
          hasAnyCurrent = true;
        }
      });

      if (!hasAnyCurrent) {
        cartItems.forEach((item) => {
          next[item.id] = true;
        });
      }

      const allSelected = cartItems.every((item) => next[item.id]);
      setSelectAll(allSelected);
      return next;
    });
  }, [cartItems]);

  useEffect(() => {
    if (!checkoutOpen || savedAddresses.length > 0) return;
    let cancelled = false;

    const loadAddresses = async () => {
      setAddressesLoading(true);
      setAddressesError(null);
      try {
        const response = await addressService.getAll();
        const data = response?.data;
        const next = Array.isArray(data) ? data : [];
        if (!cancelled) {
          setSavedAddresses(next);
        }
      } catch (error: any) {
        if (!cancelled) {
          setAddressesError(
            error?.response?.data?.message || error?.message || "Failed to load saved locations",
          );
        }
      } finally {
        if (!cancelled) setAddressesLoading(false);
      }
    };

    void loadAddresses();
    return () => {
      cancelled = true;
    };
  }, [checkoutOpen, savedAddresses.length]);

  useEffect(() => {
    if (!selectedAddressId) return;
    const selected = savedAddresses.find((address) => address.id === selectedAddressId);
    if (!selected) return;
    const formatted = [
      selected.common_name,
      selected.subcity,
      selected.city,
      selected.region,
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(", ");
    if (formatted) {
      setDeliveryAddress(formatted);
    }
  }, [selectedAddressId, savedAddresses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCart();
    setRefreshing(false);
  }, [fetchCart]);

  const selectedItems = useMemo(
    () => cartItems.filter((item) => itemSelection[item.id]),
    [cartItems, itemSelection],
  );

  const supplierGroups = useMemo(() => {
    const groups = new Map<string, SupplierGroup>();

    cartItems.forEach((item) => {
      const supplierId = item.product?.supplier_id || item.supplier?.id || "unknown";
      const supplierName =
        getSupplierName(item.product?.supplier || item.supplier) || "Unknown Supplier";
      const supplierVerified = Boolean(item.product?.supplier?.verified || item.product?.supplier?.is_verified);

      if (!groups.has(supplierId)) {
        groups.set(supplierId, {
          supplierId,
          supplierName,
          supplierVerified,
          items: [],
        });
      }

      groups.get(supplierId)!.items.push(item);
    });

    return Array.from(groups.values());
  }, [cartItems]);

  const subtotal = useMemo(
    () =>
      selectedItems.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0),
    [selectedItems],
  );

  const shipping = useMemo(() => {
    const supplierShippingMap: Record<string, number> = {};

    selectedItems.forEach((item) => {
      const supplierId = item.product?.supplier_id;
      if (!supplierId) return;

      const { shipping: itemShipping } = resolveProductShipping(item.product);
      supplierShippingMap[supplierId] = Math.max(supplierShippingMap[supplierId] || 0, itemShipping);
    });

    return Object.values(supplierShippingMap).reduce((sum, value) => sum + value, 0);
  }, [selectedItems]);

  const discount = promoApplied ? subtotal * BULK_DISCOUNT_PERCENTAGE : 0;

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

        acc[supplierId].subtotal += Number(item.product?.price || 0) * item.quantity;
        return acc;
      },
      {} as Record<string, { subtotal: number; vatRate: number }>,
    );

    return Object.values(supplierTotals).reduce((sum, supplierTotal) => {
      const supplierDiscount = promoApplied ? supplierTotal.subtotal * BULK_DISCOUNT_PERCENTAGE : 0;
      return sum + (supplierTotal.subtotal - supplierDiscount) * supplierTotal.vatRate;
    }, 0);
  }, [promoApplied, selectedItems]);

  const total = subtotal + shipping + tax - discount;
  const remainingForDiscount = Math.max(0, BULK_DISCOUNT_THRESHOLD - subtotal);

  const toggleItem = useCallback(
    (itemId: string) => {
      setItemSelection((current) => {
        const next = { ...current, [itemId]: !current[itemId] };
        setSelectAll(cartItems.every((item) => next[item.id]));
        return next;
      });
    },
    [cartItems],
  );

  const toggleSelectAll = useCallback(() => {
    const nextValue = !selectAll;
    setSelectAll(nextValue);
    setItemSelection(
      cartItems.reduce(
        (acc, item) => {
          acc[item.id] = nextValue;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    );
  }, [cartItems, selectAll]);

  const handleUpdateQuantity = useCallback(
    async (item: CartItem, nextQuantity: number) => {
      const minOrder = item.product?.min_order_amount || 1;
      const maxOrder = item.product?.stock_quantity || Infinity;
      const quantity = Math.max(minOrder, Math.min(nextQuantity, maxOrder));
      await updateQuantity(item.id, quantity);
    },
    [updateQuantity],
  );

  const handleRemoveItem = useCallback(
    async (itemId: string) => {
      await removeFromCart(itemId);
      setItemSelection((current) => {
        const next = { ...current };
        delete next[itemId];
        return next;
      });
    },
    [removeFromCart],
  );

  const handleRemoveSelected = useCallback(async () => {
    for (const item of selectedItems) {
      await removeFromCart(item.id);
    }
  }, [removeFromCart, selectedItems]);

  const applyPromo = useCallback(() => {
    if (promoCode.toUpperCase() === "TRADE10") {
      setPromoApplied(true);
      return;
    }

    Alert.alert("Invalid promo", "Use TRADE10 to apply the current mobile promo.");
  }, [promoCode]);

  const handlePlaceOrder = useCallback(async () => {
    clearError();

    const blockedSuppliers: string[] = [];
    const ordersBySupplier = selectedItems.reduce(
      (acc, item) => {
        const supplierId = item.product?.supplier_id;

        if (!supplierId) {
          return acc;
        }

        if (!acc[supplierId]) {
          acc[supplierId] = {
            supplier_id: supplierId,
            supplier_name: getSupplierName(item.product?.supplier),
            items: [],
            subtotal: 0,
            shipping: 0,
            vatRate: resolveProductVatRate(item.product),
            hasNoDeliveryItem: false,
          };
        }

        const { shipping: itemShipping, blocked } = resolveProductShipping(item.product);

        if (blocked) {
          acc[supplierId].hasNoDeliveryItem = true;
        }

        acc[supplierId].shipping = Math.max(acc[supplierId].shipping, itemShipping);
        acc[supplierId].items.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: Number(item.product?.price || 0),
        });
        acc[supplierId].subtotal += Number(item.product?.price || 0) * item.quantity;

        return acc;
      },
      {} as Record<
        string,
        {
          supplier_id: string;
          supplier_name: string;
          items: Array<{ product_id: string; quantity: number; unit_price: number }>;
          subtotal: number;
          shipping: number;
          vatRate: number;
          hasNoDeliveryItem: boolean;
        }
      >,
    );

    Object.values(ordersBySupplier).forEach((group) => {
      if (group.hasNoDeliveryItem) {
        blockedSuppliers.push(group.supplier_name);
      }
    });

    if (blockedSuppliers.length) {
      Alert.alert(
        "Delivery blocked",
        `Some selected items cannot be delivered: ${blockedSuppliers.join(", ")}.`,
      );
      return;
    }

    const createdOrders: Array<{ id: string; total_price: number }> = [];

    for (const [supplierId, group] of Object.entries(ordersBySupplier)) {
      const supplierDiscount = promoApplied ? group.subtotal * BULK_DISCOUNT_PERCENTAGE : 0;
      const supplierTax = (group.subtotal - supplierDiscount) * group.vatRate;

      const order = await createOrder({
        supplier_id: supplierId,
        items: group.items,
        total_price: Number((group.subtotal + group.shipping + supplierTax - supplierDiscount).toFixed(2)),
        shipping_cost: Number(group.shipping.toFixed(2)),
        tax_amount: Number(supplierTax.toFixed(2)),
        discount_amount: Number(supplierDiscount.toFixed(2)),
        delivery_option: "supplier_policy",
        delivery_address: deliveryAddress || undefined,
        notes: checkoutNotes || undefined,
        payment_method: requestCredit ? "credit" : undefined,
      });

      if (order) {
        createdOrders.push({
          id: order.id,
          total_price: Number(order.total_price),
        });
      }
    }

    if (!createdOrders.length) {
      Alert.alert("Checkout failed", orderError || "We couldn't place your order.");
      return;
    }

    for (const item of selectedItems) {
      await removeFromCart(item.id);
    }

    setCheckoutOpen(false);

    Alert.alert(
      "Order placed",
      `${createdOrders.length} order(s) created successfully.`,
      [
        {
          text: "Finish",
          onPress: () => router.push("/retailer/orders"),
        },

      ],
    );
  }, [
    checkoutNotes,
    clearError,
    createOrder,
    deliveryAddress,
    orderError,
    promoApplied,
    removeFromCart,
    router,
    selectedItems,
  ]);

  const handlePaymentSubmit = useCallback(
    async ({ method, notes, payment_details, proofFile }: PaymentSheetSubmitPayload) => {
      if (!paymentOrderId) return;

      setPaymentProcessing(true);
      try {
        let proofDocumentId: string | undefined;

        // Upload proof file if provided
        if (proofFile?.uri) {
          try {
            proofDocumentId = await paymentService.uploadProofFile(proofFile.uri);
          } catch (uploadError: any) {
            console.error('Failed to upload proof file:', uploadError);
            Alert.alert('Upload Failed', 'Could not upload payment proof. Please try again.');
            setPaymentProcessing(false);
            return;
          }
        }

        const result = await paymentService.submitByOrder(paymentOrderId, {
          payment_method: method,
          amount_paid: method === "app_payment" ? undefined : paymentTotal,
          notes,
          payment_details,
          proof_document_id: proofDocumentId,
        });

        if (method === "app_payment") {
          const checkoutUrl =
            result?.data?.chapa?.checkout_url || result?.data?.payment?.chapa_payment_url;

          if (checkoutUrl) {
            await ExpoLinking.openURL(checkoutUrl);
          }
        }

        setPaymentOpen(false);
        router.push("/retailer/orders");
      } catch (paymentError: any) {
        Alert.alert(
          "Payment failed",
          paymentError?.response?.data?.message || paymentError?.message || "Please try again.",
        );
      } finally {
        setPaymentProcessing(false);
      }
    },
    [paymentOrderId, paymentTotal, router],
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Shopping Cart</Text>
            <Text style={styles.heroSubtitle}>
              Review items, manage quantities, and place grouped supplier orders from mobile.
            </Text>
          </View>
          <Pressable style={styles.continueButton} onPress={() => router.push("/retailer/products")}>
            <Ionicons name="arrow-back-outline" size={16} color="#1d4ed8" />
            <Text style={styles.continueButtonText}>Browse</Text>
          </Pressable>
        </View>

        <View style={styles.summaryStrip}>
          <View style={styles.summaryPill}>
            <Ionicons name="cart-outline" size={14} color="#1d4ed8" />
            <Text style={styles.summaryPillText}>{totalItems} items</Text>
          </View>
          <View style={styles.summaryPill}>
            <Ionicons name="card-outline" size={14} color="#1d4ed8" />
            <Text style={styles.summaryPillText}>{formatCurrency(total, 2)}</Text>
          </View>
        </View>
      </View>

      {cartItems.length ? (
        <View style={styles.selectionBar}>
          <Pressable style={styles.selectionLeft} onPress={toggleSelectAll}>
            <Ionicons
              name={selectAll ? "checkbox-outline" : "square-outline"}
              size={20}
              color="#1d4ed8"
            />
            <Text style={styles.selectionText}>Select all ({cartItems.length})</Text>
          </Pressable>
          <Pressable
            style={[styles.removeSelectedButton, !selectedItems.length && styles.buttonDisabled]}
            disabled={!selectedItems.length}
            onPress={() => void handleRemoveSelected()}
          >
            <Ionicons name="trash-outline" size={15} color="#dc2626" />
            <Text style={styles.removeSelectedText}>Remove</Text>
          </Pressable>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

  const renderSupplierGroup = ({ item }: { item: SupplierGroup }) => (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getSupplierInitials(item.supplierName)}</Text>
        </View>
        <View style={styles.groupCopy}>
          <Text style={styles.groupTitle}>{item.supplierName}</Text>
          <Text style={styles.groupSubtitle}>{item.items.length} items in this supplier group</Text>
        </View>
        {item.supplierVerified ? (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedBadgeText}>Verified</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.groupItems}>
        {item.items.map((cartItem) => {
          const product = cartItem.product;
          const itemShipping = resolveProductShipping(product);
          const lineTotal = Number(product?.price || 0) * cartItem.quantity;

          return (
            <View key={cartItem.id} style={styles.itemRow}>
              <Pressable onPress={() => toggleItem(cartItem.id)}>
                <Ionicons
                  name={itemSelection[cartItem.id] ? "checkbox-outline" : "square-outline"}
                  size={20}
                  color="#1d4ed8"
                />
              </Pressable>

              <Pressable
                style={styles.imageBox}
                onPress={() => router.push(`/retailer/products/${cartItem.product_id}`)}
              >
                <Ionicons name="cube-outline" size={24} color="#94a3b8" />
              </Pressable>

              <View style={styles.itemCopy}>
                <Pressable onPress={() => router.push(`/retailer/products/${cartItem.product_id}`)}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {product?.name || "Product"}
                  </Text>
                </Pressable>
                <Text style={styles.itemMeta}>
                  {formatCurrency(Number(product?.price || 0), 2)}/{product?.unit_type}
                </Text>
                <Text style={styles.itemMeta}>
                  Min {product?.min_order_amount} • Stock {product?.stock_quantity}
                </Text>
                <Text style={styles.itemMeta}>
                  {itemShipping.blocked ? "No delivery" : `Shipping ${formatCurrency(itemShipping.shipping, 2)}`}
                </Text>
              </View>

              <View style={styles.itemActions}>
                <View style={styles.qtyBox}>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() => void handleUpdateQuantity(cartItem, cartItem.quantity - 1)}
                    disabled={cartItem.quantity <= Number(product?.min_order_amount || 1)}
                  >
                    <Ionicons name="remove" size={14} color="#334155" />
                  </Pressable>
                  <Text style={styles.qtyValue}>{cartItem.quantity}</Text>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() => void handleUpdateQuantity(cartItem, cartItem.quantity + 1)}
                    disabled={cartItem.quantity >= Number(product?.stock_quantity || Infinity)}
                  >
                    <Ionicons name="add" size={14} color="#334155" />
                  </Pressable>
                </View>

                <Text style={styles.lineTotal}>{formatCurrency(lineTotal, 2)}</Text>

                <Pressable onPress={() => void handleRemoveItem(cartItem.id)}>
                  <Ionicons name="trash-outline" size={18} color="#dc2626" />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!cartItems.length) return null;

    return (
      <View style={styles.footerWrap}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <Text style={styles.summarySubtitle}>{selectedItems.length} items selected</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal, 2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>{formatCurrency(shipping, 2)}</Text>
          </View>
          {promoApplied ? (
            <View style={styles.summaryRow}>
              <Text style={styles.discountLabel}>Discount (10%)</Text>
              <Text style={styles.discountValue}>-{formatCurrency(discount, 2)}</Text>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT</Text>
            <Text style={styles.summaryValue}>{formatCurrency(tax, 2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total, 2)}</Text>
          </View>

          <View style={styles.promoSection}>
            <Text style={styles.promoLabel}>Promo code</Text>
            <View style={styles.promoRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter code"
                value={promoCode}
                onChangeText={setPromoCode}
                editable={!promoApplied}
              />
              <Pressable
                style={[styles.applyPromoButton, (promoApplied || !promoCode) && styles.buttonDisabled]}
                disabled={promoApplied || !promoCode}
                onPress={applyPromo}
              >
                <Text style={styles.applyPromoText}>{promoApplied ? "Applied" : "Apply"}</Text>
              </Pressable>
            </View>
            {!promoApplied && remainingForDiscount > 0 ? (
              <Text style={styles.promoHint}>
                Add {formatCurrency(remainingForDiscount, 2)} more to hit the bulk discount threshold.
              </Text>
            ) : null}
          </View>

          <Pressable
            style={[styles.checkoutButton, !selectedItems.length && styles.buttonDisabled]}
            disabled={!selectedItems.length}
            onPress={() => setCheckoutOpen(true)}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </Pressable>

          <Pressable style={styles.clearCartButton} onPress={() => void clearCart()}>
            <Text style={styles.clearCartText}>Clear cart</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (!isLoading && !cartItems.length) {
    return (
      <ScreenWrapper title="Cart" subtitle="Retailer">
        <View style={styles.emptyWrap}>
          <Ionicons name="cart-outline" size={40} color="#94a3b8" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add products from verified suppliers, then come back here to review and checkout.
          </Text>
          <Pressable style={styles.checkoutButton} onPress={() => router.push("/retailer/products")}>
            <Text style={styles.checkoutButtonText}>Browse Products</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Cart" subtitle="Retailer">
      <FlatList
        data={supplierGroups}
        keyExtractor={(item) => item.supplierId}
        renderItem={renderSupplierGroup}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color="#1d4ed8" />
              <Text style={styles.loadingText}>Loading cart...</Text>
            </View>
          ) : null
        }
      />

      <BottomSheetModal
        visible={checkoutOpen}
        title="Confirm checkout"
        subtitle="Review totals and place grouped supplier orders."
        onClose={() => setCheckoutOpen(false)}
      >
        <View style={styles.checkoutInfoCard}>
          <Text style={styles.checkoutInfoTitle}>{selectedItems.length} items ready</Text>
          <Text style={styles.checkoutInfoText}>
            Shipping follows each supplier's configured delivery policy.
          </Text>
        </View>

        <View style={styles.checkoutSummaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal, 2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>{formatCurrency(shipping, 2)}</Text>
          </View>
          {promoApplied ? (
            <View style={styles.summaryRow}>
              <Text style={styles.discountLabel}>Discount</Text>
              <Text style={styles.discountValue}>-{formatCurrency(discount, 2)}</Text>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT</Text>
            <Text style={styles.summaryValue}>{formatCurrency(tax, 2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total, 2)}</Text>
          </View>
        </View>

        {savedAddresses.length > 0 ? (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Saved locations</Text>
            <View style={styles.savedAddressList}>
              {savedAddresses.map((address) => {
                const formatted = [
                  address.common_name,
                  address.subcity,
                  address.city,
                  address.region,
                ]
                  .map((value) => String(value || "").trim())
                  .filter(Boolean)
                  .join(", ");

                const selected = selectedAddressId === address.id;
                return (
                  <Pressable
                    key={address.id}
                    style={[styles.savedAddressItem, selected && styles.savedAddressItemSelected]}
                    onPress={() => setSelectedAddressId(address.id)}
                  >
                    <Text style={styles.savedAddressText}>{formatted || "Saved location"}</Text>
                    <Ionicons
                      name={selected ? "checkmark-circle" : "ellipse-outline"}
                      size={18}
                      color={selected ? "#1d4ed8" : "#94a3b8"}
                    />
                  </Pressable>
                );
              })}
              {addressesLoading ? (
                <Text style={styles.savedAddressInfo}>Loading saved locations...</Text>
              ) : null}
              {addressesError ? (
                <Text style={styles.savedAddressError}>{addressesError}</Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Delivery address</Text>
          <TextInput
            style={[styles.promoInput, styles.notesInput]}
            placeholder="Optional delivery address"
            value={deliveryAddress}
            onChangeText={(text) => {
              setSelectedAddressId("");
              setDeliveryAddress(text);
            }}
            multiline
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Order notes</Text>
          <TextInput
            style={[styles.promoInput, styles.notesInput]}
            placeholder="Optional note for supplier"
            value={checkoutNotes}
            onChangeText={setCheckoutNotes}
            multiline
          />
        </View>

        <Pressable style={styles.creditRow} onPress={() => setRequestCredit((current) => !current)}>
          <Ionicons
            name={requestCredit ? "checkbox" : "square-outline"}
            size={20}
            color={requestCredit ? "#1d4ed8" : "#94a3b8"}
          />
          <Text style={styles.creditText}>Request credit (pay later after supplier approval)</Text>
        </Pressable>

        <View style={styles.sheetFooter}>
          <Pressable style={styles.sheetCancelButton} onPress={() => setCheckoutOpen(false)}>
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.sheetSubmitButton, orderLoading && styles.buttonDisabled]}
            disabled={orderLoading}
            onPress={() => void handlePlaceOrder()}
          >
            <Text style={styles.sheetSubmitText}>{orderLoading ? "Placing..." : "Place Order"}</Text>
          </Pressable>
        </View>
      </BottomSheetModal>

      <PaymentSheet
        visible={paymentOpen}
        amount={paymentTotal}
        orderLabel={paymentOrderId ? `order ${paymentOrderId.slice(-8)}` : "your order"}
        onClose={() => setPaymentOpen(false)}
        onSubmit={handlePaymentSubmit}
        submitting={paymentProcessing}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  headerContent: {
    gap: 16,
    paddingBottom: 18,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748b",
  },
  continueButton: {
    minHeight: 42,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  continueButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  summaryStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  summaryPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  selectionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  selectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  removeSelectedButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  removeSelectedText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#dc2626",
  },
  errorBox: {
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#b91c1c",
  },
  groupCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 14,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  groupCopy: {
    flex: 1,
    gap: 3,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  groupSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  verifiedBadge: {
    borderRadius: 999,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  groupItems: {
    gap: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  imageBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  itemCopy: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  itemMeta: {
    fontSize: 12,
    color: "#64748b",
  },
  itemActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    overflow: "hidden",
  },
  qtyButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  qtyValue: {
    minWidth: 34,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  lineTotal: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  footerWrap: {
    paddingTop: 4,
  },
  summaryCard: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 12,
  },
  summaryHeader: {
    gap: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  summarySubtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#475569",
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  discountLabel: {
    fontSize: 13,
    color: "#15803d",
  },
  discountValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#15803d",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  promoSection: {
    gap: 8,
  },
  promoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  promoRow: {
    flexDirection: "row",
    gap: 10,
  },
  promoInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0f172a",
  },
  applyPromoButton: {
    minWidth: 88,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  applyPromoText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  promoHint: {
    fontSize: 12,
    color: "#64748b",
  },
  checkoutButton: {
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
  clearCartButton: {
    alignItems: "center",
    paddingTop: 4,
  },
  clearCartText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#dc2626",
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 320,
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: "#64748b",
  },
  checkoutInfoCard: {
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    padding: 16,
    gap: 6,
  },
  checkoutInfoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  checkoutInfoText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#1e40af",
  },
  checkoutSummaryCard: {
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 10,
  },
  formSection: {
    gap: 8,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  notesInput: {
    minHeight: 84,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  sheetFooter: {
    flexDirection: "row",
    gap: 12,
  },
  sheetCancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  sheetSubmitButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetSubmitText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  savedAddressList: {
    gap: 10,
  },
  savedAddressItem: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
  },
  savedAddressItemSelected: {
    borderColor: "#1d4ed8",
    backgroundColor: "#eff6ff",
  },
  savedAddressText: {
    fontSize: 13,
    color: "#0f172a",
  },
  savedAddressInfo: {
    fontSize: 12,
    color: "#64748b",
  },
  savedAddressError: {
    fontSize: 12,
    color: "#dc2626",
  },
  creditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  creditText: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
  },
});
