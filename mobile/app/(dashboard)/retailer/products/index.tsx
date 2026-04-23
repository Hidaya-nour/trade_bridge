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
import { useLocalSearchParams, useRouter } from "expo-router";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import BottomSheetModal from "@/components/retailer/BottomSheetModal";
import ProductCard from "@/components/retailer/ProductCard";
import SearchBar from "@/components/shared/SearchBar";
import { useCartStore } from "@/features/cart/cart.store";
import { useOrderStore } from "@/features/orders/order.store";
import { useProductStore } from "@/features/products/product.store";
import { type Product } from "@/features/products/product.types";
import { useRetailerCompareStore } from "@/features/retailer-marketplace/compare.store";
import {
  formatCurrency,
  getProductLocationLabel,
  getSupplierName,
} from "@/features/retailer-marketplace/marketplace.utils";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const FETCH_LIMIT = 120;
const VISIBLE_BATCH_SIZE = 12;
const DEFAULT_MAX_PRICE = 10000;

const sortOptions = [
  { key: "recommended", label: "Recommended" },
  { key: "price-low", label: "Price Low" },
  { key: "price-high", label: "Price High" },
  { key: "rating", label: "Top Rated" },
  { key: "name", label: "A-Z" },
] as const;

type SortKey = (typeof sortOptions)[number]["key"];

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.filterChip, active && styles.filterChipActive]} onPress={onPress}>
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function RetailerProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ supplierId?: string }>();
  const { setTabBarVisible } = useRoleShell();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState<SortKey>("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_BATCH_SIZE);
  const [minPriceInput, setMinPriceInput] = useState("0");
  const [maxPriceInput, setMaxPriceInput] = useState(String(DEFAULT_MAX_PRICE));
  const [buyingProductId, setBuyingProductId] = useState<string | null>(null);
  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    fetchProducts,
    fetchCategories,
    categories,
  } = useProductStore();
  const {
    items: cartItems,
    totalItems: cartTotalItems,
    totalPrice: cartTotalPrice,
    error: cartError,
    fetchCart,
    addToCart,
    updateQuantity,
  } = useCartStore();
  const { createOrder, isLoading: orderLoading } = useOrderStore();
  const compareSupplierIds = useRetailerCompareStore((state) => state.supplierIds);
  const toggleCompareSupplier = useRetailerCompareStore((state) => state.toggleSupplier);

  const minPrice = Number(minPriceInput || 0);
  const maxPrice = Number(maxPriceInput || DEFAULT_MAX_PRICE);

  const loadProducts = useCallback(async () => {
    await Promise.all([
      fetchProducts({ is_available: true, limit: FETCH_LIMIT }, { replace: true }),
      fetchCategories(),
      fetchCart(),
    ]);
  }, [fetchCart, fetchCategories, fetchProducts]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (params.supplierId) {
      setSelectedSupplier(String(params.supplierId));
    }
  }, [params.supplierId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, [loadProducts]);

  const supplierOptions = useMemo(() => {
    return Array.from(
      new Map(
        products.map((product) => [
          product.supplier_id,
          {
            id: product.supplier_id,
            name: getSupplierName(product.supplier),
          },
        ]),
      ).values(),
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const categoryOptions = useMemo(() => {
    const available = new Set<string>([
      ...categories,
      ...products.map((product) => product.category).filter(Boolean),
    ]);
    return ["All Categories", ...Array.from(available).sort((a, b) => a.localeCompare(b))];
  }, [categories, products]);

  const locationOptions = useMemo(() => {
    const available = new Set<string>();

    products.forEach((product) => {
      const label = getProductLocationLabel(product);
      if (label !== "Location pending") {
        available.add(label);
      }
    });

    return ["All Locations", ...Array.from(available).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const supplierName = getSupplierName(product.supplier);
      const locationLabel = getProductLocationLabel(product);
      const normalizedSearch = searchQuery.trim().toLowerCase();
      const productPrice = Number(product.price || 0);

      const matchesSearch =
        normalizedSearch === "" ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        supplierName.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All Categories" || product.category === selectedCategory;
      const matchesSupplier = !selectedSupplier || product.supplier_id === selectedSupplier;
      const matchesLocation =
        selectedLocation === "All Locations" || locationLabel === selectedLocation;
      const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSupplier &&
        matchesLocation &&
        matchesPrice
      );
    });
  }, [
    maxPrice,
    minPrice,
    products,
    searchQuery,
    selectedCategory,
    selectedLocation,
    selectedSupplier,
  ]);

  const sortedProducts = useMemo(() => {
    const cloned = [...filteredProducts];

    switch (sortBy) {
      case "price-low":
        return cloned.sort((a, b) => Number(a.price) - Number(b.price));
      case "price-high":
        return cloned.sort((a, b) => Number(b.price) - Number(a.price));
      case "rating":
        return cloned.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
      case "name":
        return cloned.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return cloned.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }
  }, [filteredProducts, sortBy]);

  useEffect(() => {
    setVisibleCount(VISIBLE_BATCH_SIZE);
  }, [searchQuery, selectedCategory, selectedSupplier, selectedLocation, sortBy, minPriceInput, maxPriceInput]);

  const visibleProducts = useMemo(
    () => sortedProducts.slice(0, visibleCount),
    [sortedProducts, visibleCount],
  );

  const getCartQuantity = useCallback(
    (productId: string) => cartItems.find((item) => item.product_id === productId)?.quantity ?? 0,
    [cartItems],
  );

  const handleAddToCart = useCallback(
    async (product: Product) => {
      const currentItem = cartItems.find((item) => item.product_id === product.id);

      if (currentItem) {
        await updateQuantity(currentItem.id, currentItem.quantity + product.min_order_amount);
        return;
      }

      await addToCart(product.id, product.min_order_amount);
    },
    [addToCart, cartItems, updateQuantity],
  );

  const handleQuickBuy = useCallback(
    async (product: Product) => {
      setBuyingProductId(product.id);

      try {
        const order = await createOrder({
          supplier_id: product.supplier_id,
          items: [
            {
              product_id: product.id,
              quantity: product.min_order_amount,
              unit_price: Number(product.price),
            },
          ],
          notes: `Quick order from mobile catalog for ${product.name}`,
        });

        if (order) {
          Alert.alert(
            "Order placed",
            `Quick order for ${product.name} was created successfully.`,
            [
              {
                text: "View Orders",
                onPress: () => router.push("/retailer/orders"),
              },
              { text: "Stay Here", style: "cancel" },
            ],
          );
          return;
        }

        Alert.alert("Order failed", "We couldn't place that order right now. Please try again.");
      } finally {
        setBuyingProductId(null);
      }
    },
    [createOrder, router],
  );

  const confirmQuickBuy = useCallback(
    (product: Product) => {
      Alert.alert(
        "Buy now",
        `Place a quick order for ${product.min_order_amount} ${product.unit_type} of ${product.name}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Place Order",
            onPress: () => {
              void handleQuickBuy(product);
            },
          },
        ],
      );
    },
    [handleQuickBuy],
  );

  const handleCompare = useCallback(
    (supplierId: string) => {
      const result = toggleCompareSupplier(supplierId);

      if (result === "limit") {
        Alert.alert("Compare limit reached", "You can compare up to 4 suppliers at once.");
      }
    },
    [toggleCompareSupplier],
  );

  const clearAllFilters = useCallback(() => {
    setSelectedCategory("All Categories");
    setSelectedSupplier(params.supplierId ? String(params.supplierId) : "");
    setSelectedLocation("All Locations");
    setMinPriceInput("0");
    setMaxPriceInput(String(DEFAULT_MAX_PRICE));
    setSearchQuery("");
  }, [params.supplierId]);

  const activeFilters = useMemo(() => {
    const chips: string[] = [];

    if (searchQuery.trim()) chips.push(`Search: ${searchQuery.trim()}`);
    if (selectedCategory !== "All Categories") chips.push(selectedCategory);
    if (selectedSupplier) {
      const supplier = supplierOptions.find((item) => item.id === selectedSupplier);
      if (supplier) chips.push(supplier.name);
    }
    if (selectedLocation !== "All Locations") chips.push(selectedLocation);
    if (minPrice > 0 || maxPrice < DEFAULT_MAX_PRICE) {
      chips.push(`${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`);
    }

    return chips;
  }, [maxPrice, minPrice, searchQuery, selectedCategory, selectedLocation, selectedSupplier, supplierOptions]);

  const hasActiveFilters = activeFilters.length > 0;

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Browse products built for quick retail restocking</Text>
            <Text style={styles.heroSubtitle}>
              Search, compare supplier options, and place quick buys without leaving the catalog.
            </Text>
          </View>
          <Pressable style={styles.cartButton} onPress={() => router.push("/retailer/cart")}>
            <Ionicons name="cart-outline" size={18} color="#1d4ed8" />
            <Text style={styles.cartButtonText}>{cartTotalItems}</Text>
          </Pressable>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="Search products, suppliers, categories..."
        />

        <View style={styles.heroActions}>
          <Pressable style={styles.filterButton} onPress={() => setShowFilters(true)}>
            <Ionicons name="options-outline" size={16} color="#0f172a" />
            <Text style={styles.filterButtonText}>
              Filters{hasActiveFilters ? ` (${activeFilters.length})` : ""}
            </Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.push("/retailer/compare")}>
            <Ionicons name="git-compare-outline" size={16} color="#1d4ed8" />
            <Text style={styles.secondaryButtonText}>Compare ({compareSupplierIds.length})</Text>
          </Pressable>
        </View>

        <View style={styles.cartSummaryRow}>
          <Text style={styles.resultCountText}>{sortedProducts.length} products</Text>
          <Text style={styles.cartSummaryText}>Cart value {formatCurrency(cartTotalPrice)}</Text>
        </View>
      </View>

      <View style={styles.sortSection}>
        <Text style={styles.sectionLabel}>Sort By</Text>
        <View style={styles.chipWrap}>
          {sortOptions.map((option) => (
            <FilterChip
              key={option.key}
              label={option.label}
              active={sortBy === option.key}
              onPress={() => setSortBy(option.key)}
            />
          ))}
        </View>
      </View>

      {activeFilters.length ? (
        <View style={styles.activeFilterWrap}>
          {activeFilters.map((chip) => (
            <View key={chip} style={styles.activeFilterPill}>
              <Text style={styles.activeFilterText}>{chip}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {productsError || cartError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{productsError || cartError}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <ScreenWrapper title="Browse Products" subtitle="Retailer">
      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item, index }) => (
          <View style={[styles.cardColumn, index % 2 === 0 ? styles.leftColumn : styles.rightColumn]}>
            <ProductCard
              product={item}
              locationLabel={getProductLocationLabel(item)}
              cartQuantity={getCartQuantity(item.id)}
              compared={compareSupplierIds.includes(item.supplier_id)}
              busy={buyingProductId === item.id && orderLoading}
              onPress={() => router.push(`/retailer/products/${item.id}`)}
              onSupplierPress={() => router.push(`/retailer/suppliers/${item.supplier_id}`)}
              onAddToCart={() => {
                void handleAddToCart(item);
              }}
              onBuyNow={() => confirmQuickBuy(item)}
              onCompare={() => handleCompare(item.supplier_id)}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          productsLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#1d4ed8" />
              <Text style={styles.emptyTitle}>Loading catalog</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={22} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No products matched</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your filters or search terms.</Text>
            </View>
          )
        }
        ListFooterComponent={
          visibleProducts.length > 0 ? (
            <View style={styles.footerState}>
              <Text style={styles.footerText}>
                {visibleCount < sortedProducts.length
                  ? `Showing ${visibleProducts.length} of ${sortedProducts.length}`
                  : "You have reached the end of the catalog"}
              </Text>
            </View>
          ) : null
        }
        onEndReached={() => {
          if (visibleCount < sortedProducts.length) {
            setVisibleCount((current) => Math.min(current + VISIBLE_BATCH_SIZE, sortedProducts.length));
          }
        }}
        onEndReachedThreshold={0.35}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheetModal
        visible={showFilters}
        title="Refine products"
        subtitle="Use mobile-friendly filters instead of the web sidebar."
        onClose={() => setShowFilters(false)}
      >
        <View style={styles.filterSection}>
          <Text style={styles.sheetSectionTitle}>Categories</Text>
          <View style={styles.chipWrap}>
            {categoryOptions.map((option) => (
              <FilterChip
                key={option}
                label={option}
                active={selectedCategory === option}
                onPress={() => setSelectedCategory(option)}
              />
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.sheetSectionTitle}>Suppliers</Text>
          <View style={styles.chipWrap}>
            <FilterChip
              label="All Suppliers"
              active={!selectedSupplier}
              onPress={() => setSelectedSupplier("")}
            />
            {supplierOptions.map((supplier) => (
              <FilterChip
                key={supplier.id}
                label={supplier.name}
                active={selectedSupplier === supplier.id}
                onPress={() => setSelectedSupplier(supplier.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.sheetSectionTitle}>Locations</Text>
          <View style={styles.chipWrap}>
            {locationOptions.map((option) => (
              <FilterChip
                key={option}
                label={option}
                active={selectedLocation === option}
                onPress={() => setSelectedLocation(option)}
              />
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.sheetSectionTitle}>Price range</Text>
          <View style={styles.priceInputRow}>
            <View style={styles.priceInputBox}>
              <Text style={styles.priceInputLabel}>Min</Text>
              <TextInput
                style={styles.priceInput}
                value={minPriceInput}
                keyboardType="numeric"
                onChangeText={(value) => setMinPriceInput(value.replace(/[^\d]/g, ""))}
                placeholder="0"
              />
            </View>
            <View style={styles.priceInputBox}>
              <Text style={styles.priceInputLabel}>Max</Text>
              <TextInput
                style={styles.priceInput}
                value={maxPriceInput}
                keyboardType="numeric"
                onChangeText={(value) => setMaxPriceInput(value.replace(/[^\d]/g, ""))}
                placeholder={String(DEFAULT_MAX_PRICE)}
              />
            </View>
          </View>
        </View>

        <View style={styles.sheetFooter}>
          <Pressable style={styles.clearButton} onPress={clearAllFilters}>
            <Text style={styles.clearButtonText}>Clear filters</Text>
          </Pressable>
          <Pressable style={styles.applyButton} onPress={() => setShowFilters(false)}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </Pressable>
        </View>
      </BottomSheetModal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 28,
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
    lineHeight: 27,
    fontWeight: "800",
    color: "#0f172a",
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748b",
  },
  cartButton: {
    minWidth: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  cartButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
  },
  filterButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  cartSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  resultCountText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  cartSummaryText: {
    fontSize: 13,
    color: "#64748b",
  },
  sortSection: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#1d4ed8",
  },
  activeFilterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  activeFilterPill: {
    borderRadius: 999,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0369a1",
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
  columnWrapper: {
    justifyContent: "space-between",
  },
  cardColumn: {
    flex: 1,
    marginBottom: 12,
  },
  leftColumn: {
    marginRight: 6,
  },
  rightColumn: {
    marginLeft: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  footerState: {
    paddingTop: 8,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#64748b",
  },
  filterSection: {
    gap: 10,
  },
  sheetSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  priceInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  priceInputBox: {
    flex: 1,
    gap: 6,
  },
  priceInputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  priceInput: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0f172a",
  },
  sheetFooter: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
  },
  clearButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  applyButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1d4ed8",
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
