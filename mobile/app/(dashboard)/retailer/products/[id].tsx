import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { useCartStore } from "@/features/cart/cart.store";
import { useOrderStore } from "@/features/orders/order.store";
import { useProductStore } from "@/features/products/product.store";
import { useRetailerCompareStore } from "@/features/retailer-marketplace/compare.store";
import { getLocationLabel } from "@/features/retailer-marketplace/marketplace.utils";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);
};

const parseSpecifications = (raw: unknown): Record<string, unknown> => {
  if (!raw) return {};
  if (typeof raw === "object") return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
};

const formatLabel = (input: string) =>
  input
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();

const StarRating = ({ rating }: { rating: number }) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= Math.round(rating) ? "star" : "star-outline"}
        size={14}
        color="#f59e0b"
      />
    ))}
  </View>
);

export default function RetailerProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">(
    "description",
  );
  const [refreshing, setRefreshing] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const { product, products, isLoading, error, fetchProductById, fetchProducts } = useProductStore();
  const { items, addToCart, updateQuantity, fetchCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const toggleCompareSupplier = useRetailerCompareStore((state) => state.toggleSupplier);

  const loadProduct = useCallback(async () => {
    if (!id) return;
    const fetched = await fetchProductById(id);
    if (fetched) {
      setQuantity(Math.max(fetched.min_order_amount, 1));
    }
    if (!products.length) {
      await fetchProducts({ is_available: true, limit: 40 }, { replace: true });
    }
    await fetchCart();
  }, [fetchCart, fetchProductById, fetchProducts, id, products.length]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProduct();
    setRefreshing(false);
  }, [loadProduct]);

  const currentCartItem = useMemo(() => {
    if (!product) return null;
    return items.find((item) => item.product_id === product.id) ?? null;
  }, [items, product]);
  const supplierName =
    product?.supplier?.business_name || product?.supplier?.full_name || "Unknown Supplier";
  const supplierLocation = getLocationLabel(product?.supplier?.addresses);
  const isInStock = Number(product?.stock_quantity || 0) > 0;

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && p.category === product.category)
      .filter((p) => String(p.supplier?.role || "").toLowerCase() !== "factory")
      .slice(0, 4);
  }, [product, products]);

  const specifications = useMemo(() => parseSpecifications(product?.specifications), [product]);

  const incrementQuantity = useCallback(() => {
    if (!product) return;
    setQuantity((prev) => Math.min(prev + product.min_order_amount, product.stock_quantity));
  }, [product]);

  const decrementQuantity = useCallback(() => {
    if (!product) return;
    setQuantity((prev) => Math.max(prev - product.min_order_amount, product.min_order_amount));
  }, [product]);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    const inStock = Number(product.stock_quantity || 0) > 0;
    if (!inStock) {
      Alert.alert("Out of stock", "This product is currently unavailable.");
      return;
    }

    if (currentCartItem) {
      await updateQuantity(currentCartItem.id, currentCartItem.quantity + quantity);
    } else {
      await addToCart(product.id, quantity);
    }
  }, [addToCart, currentCartItem, product, quantity, updateQuantity]);

  const handleBuyNow = useCallback(async () => {
    if (!product) return;
    const inStock = Number(product.stock_quantity || 0) > 0;
    if (!inStock) {
      Alert.alert("Out of stock", "This product is currently unavailable.");
      return;
    }

    setIsBuyingNow(true);
    try {
      const order = await createOrder({
        supplier_id: product.supplier_id,
        items: [{ product_id: product.id, quantity, unit_price: Number(product.price) }],
        notes: `Quick order from product details for ${product.name}`,
      });

      if (order) {
        Alert.alert("Order placed", "Your order was placed successfully.", [
          { text: "View Orders", onPress: () => router.push("/retailer/orders") },
          { text: "Done", style: "cancel" },
        ]);
        return;
      }

      Alert.alert("Order failed", "Unable to place order right now. Please try again.");
    } finally {
      setIsBuyingNow(false);
    }
  }, [createOrder, product, quantity, router]);

  const handleShare = useCallback(async () => {
    if (!product) return;
    await Share.share({
      message: `${product.name} - ${formatCurrency(Number(product.price))}/${product.unit_type}`,
      title: product.name,
    });
  }, [product]);

  const handleCompareSupplier = useCallback(() => {
    if (!product) return;
    const result = toggleCompareSupplier(product.supplier_id);
    if (result === "limit") {
      Alert.alert("Compare limit reached", "You can compare up to 4 suppliers.");
      return;
    }
    Alert.alert(
      result === "added" ? "Added to compare" : "Removed from compare",
      `${supplierName} has been ${result === "added" ? "added to" : "removed from"} compare.`,
      [
        { text: "Stay Here", style: "cancel" },
        { text: "Open Compare", onPress: () => router.push("/retailer/compare") },
      ],
    );
  }, [product, router, supplierName, toggleCompareSupplier]);

  if (isLoading && !product) {
    return (
      <ScreenWrapper title="Product Details" subtitle="Retailer">
        <View style={styles.centeredWrap}>
          <ActivityIndicator size="small" color="#1f3a8a" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!product || !id) {
    return (
      <ScreenWrapper title="Product Details" subtitle="Retailer">
        <View style={styles.centeredWrap}>
          <Text style={styles.emptyTitle}>Product not found</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable style={styles.ghostButton} onPress={() => router.push("/retailer/products")}>
            <Text style={styles.ghostButtonText}>Back to products</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  const rating = Number(product.rating || 0);
  const reviews = product.reviews || [];
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.min_order_amount * 2;

  return (
    <ScreenWrapper title={product.name} subtitle="Retailer">
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.breadcrumbRow}>
          <Pressable onPress={() => router.push("/retailer/products")}>
            <Text style={styles.linkText}>Products</Text>
          </Pressable>
          <Ionicons name="chevron-forward" size={13} color="#64748b" />
          <Text style={styles.breadcrumbCurrent} numberOfLines={1}>
            {product.name}
          </Text>
        </View>

        <View style={styles.heroImage}>
          <Ionicons name="cube-outline" size={68} color="#94a3b8" />
        </View>

        <View style={styles.mainCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleCol}>
              <Text style={styles.productTitle}>{product.name}</Text>
              <Text style={styles.categoryText}>Category: {product.category}</Text>
            </View>
            {product.supplier?.is_verified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#166534" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.ratingRow}>
            <StarRating rating={rating} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewCountText}>({product.review_count || 0} reviews)</Text>
          </View>

          <Text style={styles.priceText}>
            {formatCurrency(Number(product.price))}/{product.unit_type}
          </Text>
          <Text style={styles.minOrderText}>
            Minimum order: {product.min_order_amount} {product.unit_type}
          </Text>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Availability:</Text>
            <View
              style={[
                styles.statusPill,
                isInStock ? (isLowStock ? styles.lowStockPill : styles.inStockPill) : styles.outStockPill,
              ]}
            >
              <Text style={styles.statusPillText}>
                {isInStock ? (isLowStock ? "Low Stock" : "In Stock") : "Out of Stock"}
              </Text>
            </View>
            <Text style={styles.stockMeta}>{product.stock_quantity} units</Text>
          </View>

          <View style={styles.quantityWrap}>
            <Text style={styles.sectionLabel}>Quantity</Text>
            <View style={styles.quantityBox}>
              <Pressable
                style={styles.qtyButton}
                onPress={decrementQuantity}
                disabled={quantity <= product.min_order_amount}
              >
                <Ionicons name="remove" size={15} color="#334155" />
              </Pressable>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Pressable
                style={styles.qtyButton}
                onPress={incrementQuantity}
                disabled={quantity >= product.stock_quantity}
              >
                <Ionicons name="add" size={15} color="#334155" />
              </Pressable>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={[styles.primaryButton, !isInStock && styles.disabledButton]} onPress={handleAddToCart} disabled={!isInStock}>
              <Ionicons name="cart-outline" size={16} color="#ffffff" />
              <Text style={styles.primaryButtonText}>
                Add to Cart {currentCartItem ? `(${currentCartItem.quantity})` : ""}
              </Text>
            </Pressable>
            <Pressable style={styles.iconOnlyButton} onPress={handleCompareSupplier}>
              <Ionicons name="git-compare-outline" size={18} color="#334155" />
            </Pressable>
            <Pressable style={styles.iconOnlyButton} onPress={() => void handleShare()}>
              <Ionicons name="share-social-outline" size={18} color="#334155" />
            </Pressable>
          </View>

          <Pressable style={[styles.compareButton, (!isInStock || isBuyingNow) && styles.disabledButton]} onPress={() => void handleBuyNow()} disabled={!isInStock || isBuyingNow}>
            <Ionicons name="flash-outline" size={15} color="#1d4ed8" />
            <Text style={styles.compareButtonText}>{isBuyingNow ? "Placing order..." : "Buy now"}</Text>
          </Pressable>

          <Pressable style={styles.compareButton} onPress={() => router.push("/retailer/cart")}>
            <Ionicons name="git-compare-outline" size={15} color="#1d4ed8" />
            <Text style={styles.compareButtonText}>Go to cart</Text>
          </Pressable>
        </View>

        <View style={styles.supplierCard}>
          <View style={styles.supplierHeader}>
            <View style={styles.supplierAvatar}>
              <Text style={styles.supplierAvatarText}>{supplierName.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.supplierInfo}>
              <Text style={styles.supplierName}>{supplierName}</Text>
              <View style={styles.supplierMetaRow}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={styles.supplierMetaText}>{Number(product.supplier?.rating || 4.5).toFixed(1)}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.supplierMetaText}>{supplierLocation}</Text>
              </View>
            </View>
            <Pressable
              style={styles.ghostButton}
              onPress={() => router.push(`/retailer/suppliers/${product.supplier_id}`)}
            >
              <Text style={styles.ghostButtonText}>View Profile</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.tabsCard}>
          <View style={styles.tabHeader}>
            {(["description", "specifications", "reviews"] as const).map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                  {tab === "reviews" ? `Reviews (${product.review_count || 0})` : formatLabel(tab)}
                </Text>
              </Pressable>
            ))}
          </View>

          {activeTab === "description" ? (
            <View style={styles.tabBody}>
              <Text style={styles.descriptionText}>
                {product.description || "No product description available."}
              </Text>
              <View style={styles.deliveryBox}>
                <Text style={styles.deliveryTitle}>Delivery Information</Text>
                <Text style={styles.deliveryText}>
                  Delivery available: {product.delivery_available === false ? "No" : "Yes"}
                </Text>
                <Text style={styles.deliveryText}>
                  Delivery pricing: {product.delivery_pricing || "free"}
                </Text>
                {product.delivery_fee_per_km ? (
                  <Text style={styles.deliveryText}>
                    Fee per km: {formatCurrency(Number(product.delivery_fee_per_km))}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {activeTab === "specifications" ? (
            <View style={styles.tabBody}>
              {Object.keys(specifications).length > 0 ? (
                Object.entries(specifications).map(([key, value]) => (
                  <View key={key} style={styles.specRow}>
                    <Text style={styles.specKey}>{formatLabel(key)}</Text>
                    <Text style={styles.specValue}>
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyHint}>No specifications available for this product.</Text>
              )}
            </View>
          ) : null}

          {activeTab === "reviews" ? (
            <View style={styles.tabBody}>
              {reviews.length ? (
                reviews.map((review) => (
                  <View key={review.id} style={styles.reviewRow}>
                    <View style={styles.reviewHeader}>
                      <StarRating rating={review.rating} />
                      <Text style={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString("en-US")}
                      </Text>
                    </View>
                    <Text style={styles.reviewText}>{review.comment || "No comment provided."}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyHint}>No reviews yet. Be the first to review this product.</Text>
              )}
            </View>
          ) : null}
        </View>

        {relatedProducts.length ? (
          <View style={styles.relatedWrap}>
            <Text style={styles.relatedTitle}>You might also like</Text>
            <View style={styles.relatedGrid}>
              {relatedProducts.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.relatedCard}
                  onPress={() => router.push(`/retailer/products/${item.id}`)}
                >
                  <Ionicons name="cube-outline" size={24} color="#94a3b8" />
                  <Text style={styles.relatedName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.relatedPrice}>
                    {formatCurrency(Number(item.price))}/{item.unit_type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 36,
    gap: 12,
  },
  centeredWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  linkText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "600",
  },
  breadcrumbCurrent: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  heroImage: {
    height: 230,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  mainCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 10,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  titleCol: {
    flex: 1,
    gap: 3,
  },
  productTitle: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 20,
  },
  categoryText: {
    color: "#64748b",
    fontSize: 12,
  },
  verifiedBadge: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  starRow: {
    flexDirection: "row",
    gap: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "700",
  },
  reviewCountText: {
    color: "#64748b",
    fontSize: 12,
  },
  priceText: {
    fontSize: 24,
    color: "#1d4ed8",
    fontWeight: "800",
  },
  minOrderText: {
    fontSize: 12,
    color: "#475569",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
  },
  statusPill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inStockPill: {
    backgroundColor: "#dcfce7",
  },
  lowStockPill: {
    backgroundColor: "#fef3c7",
  },
  outStockPill: {
    backgroundColor: "#fee2e2",
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
  },
  stockMeta: {
    fontSize: 11,
    color: "#64748b",
  },
  quantityWrap: {
    gap: 6,
  },
  sectionLabel: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
  },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  qtyButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
  },
  qtyValue: {
    minWidth: 50,
    textAlign: "center",
    color: "#0f172a",
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#1d4ed8",
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  disabledButton: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  iconOnlyButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  compareButton: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
    paddingVertical: 9,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  compareButtonText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "700",
  },
  supplierCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
  },
  supplierHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  supplierAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  supplierAvatarText: {
    color: "#1e3a8a",
    fontWeight: "800",
    fontSize: 13,
  },
  supplierInfo: {
    flex: 1,
    gap: 3,
  },
  supplierName: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "700",
  },
  supplierMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  supplierMetaText: {
    color: "#64748b",
    fontSize: 11,
  },
  dot: {
    color: "#94a3b8",
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  ghostButtonText: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "700",
  },
  tabsCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    overflow: "hidden",
  },
  tabHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
  },
  tabButtonActive: {
    backgroundColor: "#ffffff",
  },
  tabButtonText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
  },
  tabButtonTextActive: {
    color: "#1d4ed8",
  },
  tabBody: {
    padding: 12,
    gap: 10,
  },
  descriptionText: {
    color: "#334155",
    fontSize: 13,
    lineHeight: 20,
  },
  deliveryBox: {
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  deliveryTitle: {
    color: "#1e3a8a",
    fontSize: 12,
    fontWeight: "700",
  },
  deliveryText: {
    color: "#334155",
    fontSize: 12,
  },
  specRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 8,
    gap: 3,
  },
  specKey: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
  },
  specValue: {
    color: "#0f172a",
    fontSize: 12,
  },
  reviewRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 8,
    gap: 4,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewDate: {
    color: "#64748b",
    fontSize: 10,
  },
  reviewText: {
    color: "#334155",
    fontSize: 12,
  },
  emptyHint: {
    color: "#64748b",
    fontSize: 12,
  },
  relatedWrap: {
    gap: 8,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  relatedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  relatedCard: {
    width: "48%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 10,
    alignItems: "center",
    gap: 4,
  },
  relatedName: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "700",
    width: "100%",
    textAlign: "center",
  },
  relatedPrice: {
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyTitle: {
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "700",
  },
  errorText: {
    color: "#991b1b",
    fontSize: 12,
    textAlign: "center",
  },
});

