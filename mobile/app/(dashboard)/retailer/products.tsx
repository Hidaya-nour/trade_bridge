import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../../src/components/layout/ScreenWrapper";
import { useProductStore } from "../../../src/stores/product.store";
import { useCartStore } from "../../../src/stores/cart.store";
import { type Product } from "../../../src/types/product.types";

const ITEMS_PER_PAGE = 8;
const DEFAULT_MAX_PRICE = 10000;
const STATIC_LOCATIONS = ["Addis Ababa", "Adama", "Bahir Dar", "Mekelle", "Hawassa", "Dire Dawa"];

const sortOptions = [
  { key: "recommended", label: "Recommended" },
  { key: "price-low", label: "Price Low" },
  { key: "price-high", label: "Price High" },
  { key: "rating", label: "Top Rated" },
  { key: "name", label: "A-Z" },
] as const;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);
};

type SortKey = (typeof sortOptions)[number]["key"];

export default function RetailerProductsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [minPriceInput, setMinPriceInput] = useState("0");
  const [maxPriceInput, setMaxPriceInput] = useState(String(DEFAULT_MAX_PRICE));
  const [manualInputValue, setManualInputValue] = useState<Record<string, string>>({});

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
    isLoading: cartLoading,
    error: cartError,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useCartStore();

  const minPrice = Number(minPriceInput || 0);
  const maxPrice = Number(maxPriceInput || DEFAULT_MAX_PRICE);

  const loadProducts = useCallback(async () => {
    await Promise.all([
      fetchProducts({ is_available: true, limit: 120 }, { replace: true }),
      fetchCategories(),
      fetchCart(),
    ]);
  }, [fetchProducts, fetchCategories, fetchCart]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, [loadProducts]);

  const suppliers = useMemo(() => {
    return Array.from(
      new Map(
        products.map((product) => [
          product.supplier_id,
          {
            id: product.supplier_id,
            name: product.supplier?.business_name || product.supplier?.full_name || "Unknown Supplier",
          },
        ]),
      ).values(),
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>([
      ...categories,
      ...products.map((product) => product.category).filter(Boolean),
    ]);

    return ["All Categories", ...Array.from(categorySet)];
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const supplierName =
        product.supplier?.business_name || product.supplier?.full_name || "Unknown Supplier";
      const matchesSearch =
        searchQuery.trim() === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Categories" || product.category === selectedCategory;
      const matchesSupplier = !selectedSupplier || product.supplier_id === selectedSupplier;
      const matchesLocation = !selectedLocation || selectedLocation === "Addis Ababa";
      const productPrice = Number(product.price || 0);
      const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

      return matchesSearch && matchesCategory && matchesSupplier && matchesLocation && matchesPrice;
    });
  }, [maxPrice, minPrice, products, searchQuery, selectedCategory, selectedLocation, selectedSupplier]);

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
        return cloned;
    }
  }, [filteredProducts, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sortedProducts]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getCartItem = useCallback(
    (productId: string) => {
      return cartItems.find((item) => item.product_id === productId);
    },
    [cartItems],
  );

  const getCartQuantity = useCallback(
    (productId: string) => {
      return getCartItem(productId)?.quantity ?? 0;
    },
    [getCartItem],
  );

  const handleAddToCart = useCallback(
    async (product: Product, quantity: number) => {
      const existingItem = getCartItem(product.id);
      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
        return;
      }
      await addToCart(product.id, quantity);
    },
    [addToCart, getCartItem, updateQuantity],
  );

  const handleRemoveFromCart = useCallback(
    async (productId: string) => {
      const existingItem = getCartItem(productId);
      if (!existingItem) {
        return;
      }

      if (existingItem.quantity > 1) {
        await updateQuantity(existingItem.id, existingItem.quantity - 1);
      } else {
        await removeFromCart(existingItem.id);
      }
    },
    [getCartItem, removeFromCart, updateQuantity],
  );

  const handleManualQuantityCommit = useCallback(
    async (product: Product) => {
      const raw = manualInputValue[product.id];
      setManualInputValue((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });

      if (!raw || !raw.trim()) {
        return;
      }

      const quantity = Number(raw);
      if (!Number.isFinite(quantity) || quantity < product.min_order_amount) {
        return;
      }

      const existingItem = getCartItem(product.id);
      if (existingItem) {
        await updateQuantity(existingItem.id, quantity);
      } else {
        await addToCart(product.id, quantity);
      }
    },
    [addToCart, getCartItem, manualInputValue, updateQuantity],
  );

  const clearAllFilters = () => {
    setSelectedCategory("All Categories");
    setSelectedSupplier("");
    setSelectedLocation("");
    setMinPriceInput("0");
    setMaxPriceInput(String(DEFAULT_MAX_PRICE));
    setSearchQuery("");
    setCurrentPage(1);
  };

  const renderProductCard = (product: Product) => {
    const quantityInCart = getCartQuantity(product.id);
    const supplierName =
      product.supplier?.business_name || product.supplier?.full_name || "Unknown Supplier";

    return (
      <Pressable
        key={product.id}
        style={[styles.productCard, viewMode === "list" && styles.productCardList]}
        onPress={() => router.push(`/retailer/products/${product.id}`)}
      >
        <View style={styles.productImagePlaceholder}>
          <Ionicons name="cube-outline" size={viewMode === "grid" ? 34 : 28} color="#94a3b8" />
          <View style={styles.minOrderBadge}>
            <Text style={styles.minOrderBadgeText}>Min: {product.min_order_amount}+</Text>
          </View>
        </View>

        <View style={styles.productBody}>
          <Text style={styles.productTitle} numberOfLines={1}>
            {product.name}
          </Text>
          <Pressable
            onPress={() => router.push(`/retailer/suppliers/${product.supplier_id}`)}
            hitSlop={6}
          >
            <Text style={styles.supplierLink} numberOfLines={1}>
              {supplierName}
            </Text>
          </Pressable>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>? {Number(product.rating || 0).toFixed(1)}</Text>
            <Text style={styles.dot}>�</Text>
            <Text style={styles.metaText}>{product.review_count || 0} reviews</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>?? Addis Ababa</Text>
            <Text style={styles.dot}>�</Text>
            <Text style={styles.metaText}>?? 2-3 days</Text>
          </View>

          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description || "No description available."}
          </Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.productPrice}>
                {formatCurrency(Number(product.price))}/{product.unit_type}
              </Text>
              <Text style={styles.stockText}>Stock: {product.stock_quantity}</Text>
            </View>

            {quantityInCart > 0 ? (
              <View style={styles.quantityBox}>
                <Pressable style={styles.qtyButton} onPress={() => handleRemoveFromCart(product.id)}>
                  <Ionicons name="remove" size={14} color="#334155" />
                </Pressable>
                <TextInput
                  style={styles.qtyInput}
                  value={manualInputValue[product.id] ?? String(quantityInCart)}
                  keyboardType="numeric"
                  onChangeText={(text) =>
                    setManualInputValue((prev) => ({
                      ...prev,
                      [product.id]: text.replace(/[^\d]/g, ""),
                    }))
                  }
                  onBlur={() => handleManualQuantityCommit(product)}
                  onSubmitEditing={() => handleManualQuantityCommit(product)}
                />
                <Pressable style={styles.qtyButton} onPress={() => handleAddToCart(product, 1)}>
                  <Ionicons name="add" size={14} color="#334155" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.addButton}
                onPress={() => handleAddToCart(product, product.min_order_amount)}
              >
                <Ionicons name="cart-outline" size={14} color="#fff" />
                <Text style={styles.addButtonText}>Add</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const hasActiveFilters =
    selectedCategory !== "All Categories" ||
    selectedSupplier !== "" ||
    selectedLocation !== "" ||
    minPrice > 0 ||
    maxPrice < DEFAULT_MAX_PRICE;

  return (
    <ScreenWrapper title="Browse Products" subtitle="Retailer">
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Discover products from verified suppliers</Text>
            <View style={styles.viewToggle}>
              <Pressable
                style={[styles.toggleButton, viewMode === "grid" && styles.toggleButtonActive]}
                onPress={() => setViewMode("grid")}
              >
                <Ionicons
                  name="grid-outline"
                  size={16}
                  color={viewMode === "grid" ? "#ffffff" : "#475569"}
                />
              </Pressable>
              <Pressable
                style={[styles.toggleButton, viewMode === "list" && styles.toggleButtonActive]}
                onPress={() => setViewMode("list")}
              >
                <Ionicons
                  name="list-outline"
                  size={16}
                  color={viewMode === "list" ? "#ffffff" : "#475569"}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.outlineAction} onPress={() => router.push("/retailer/orders")}>
              <Text style={styles.outlineActionText}>My Orders</Text>
            </Pressable>
            <Pressable style={styles.primaryAction} onPress={() => router.push("/retailer/cart")}>
              <Ionicons name="cart-outline" size={15} color="#fff" />
              <Text style={styles.primaryActionText}>Cart ({cartTotalItems})</Text>
            </Pressable>
          </View>

          <Text style={styles.cartValueText}>Cart value: {formatCurrency(cartTotalPrice)}</Text>
        </View>

        <View style={styles.searchCard}>
          <View style={styles.searchInputWrap}>
            <Ionicons name="search-outline" size={18} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, suppliers, categories..."
              value={searchQuery}
              onChangeText={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.controlsRow}>
            <Pressable style={styles.smallControlButton} onPress={() => setShowFilters((prev) => !prev)}>
              <Ionicons name="options-outline" size={15} color="#1e3a8a" />
              <Text style={styles.smallControlButtonText}>
                Filters {hasActiveFilters ? "�" : ""}
              </Text>
            </Pressable>
            <View style={styles.sortWrap}>
              <Text style={styles.sortLabel}>Sort:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.sortChips}>
                  {sortOptions.map((option) => (
                    <Pressable
                      key={option.key}
                      style={[styles.sortChip, sortBy === option.key && styles.sortChipActive]}
                      onPress={() => setSortBy(option.key)}
                    >
                      <Text
                        style={[
                          styles.sortChipText,
                          sortBy === option.key && styles.sortChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {showFilters ? (
            <View style={styles.filtersPanel}>
              <Text style={styles.filterTitle}>Categories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterChipRow}>
                  {availableCategories.map((category) => (
                    <Pressable
                      key={category}
                      style={[
                        styles.filterChip,
                        selectedCategory === category && styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setSelectedCategory(category);
                        setCurrentPage(1);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedCategory === category && styles.filterChipTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.filterTitle}>Suppliers</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterChipRow}>
                  <Pressable
                    style={[styles.filterChip, selectedSupplier === "" && styles.filterChipActive]}
                    onPress={() => {
                      setSelectedSupplier("");
                      setCurrentPage(1);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedSupplier === "" && styles.filterChipTextActive,
                      ]}
                    >
                      All Suppliers
                    </Text>
                  </Pressable>
                  {suppliers.map((supplier) => (
                    <Pressable
                      key={supplier.id}
                      style={[
                        styles.filterChip,
                        selectedSupplier === supplier.id && styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setSelectedSupplier(supplier.id);
                        setCurrentPage(1);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedSupplier === supplier.id && styles.filterChipTextActive,
                        ]}
                      >
                        {supplier.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.filterTitle}>Location</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterChipRow}>
                  <Pressable
                    style={[styles.filterChip, selectedLocation === "" && styles.filterChipActive]}
                    onPress={() => setSelectedLocation("")}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedLocation === "" && styles.filterChipTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </Pressable>
                  {STATIC_LOCATIONS.map((location) => (
                    <Pressable
                      key={location}
                      style={[
                        styles.filterChip,
                        selectedLocation === location && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedLocation(location)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedLocation === location && styles.filterChipTextActive,
                        ]}
                      >
                        {location}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.filterTitle}>Price Range</Text>
              <View style={styles.priceInputRow}>
                <TextInput
                  style={styles.priceInput}
                  keyboardType="numeric"
                  value={minPriceInput}
                  onChangeText={(value) => {
                    setMinPriceInput(value.replace(/[^\d]/g, "") || "0");
                    setCurrentPage(1);
                  }}
                  placeholder="Min"
                />
                <Text style={styles.rangeDash}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  keyboardType="numeric"
                  value={maxPriceInput}
                  onChangeText={(value) => {
                    setMaxPriceInput(value.replace(/[^\d]/g, "") || String(DEFAULT_MAX_PRICE));
                    setCurrentPage(1);
                  }}
                  placeholder="Max"
                />
              </View>

              <Pressable style={styles.clearFiltersButton} onPress={clearAllFilters}>
                <Text style={styles.clearFiltersText}>Clear all filters</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {productsError || cartError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{productsError || cartError}</Text>
          </View>
        ) : null}

        <Text style={styles.resultsText}>
          Showing {sortedProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-
          {Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length)} of {sortedProducts.length} products
        </Text>

        {(productsLoading || cartLoading) && sortedProducts.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#1f3a8a" />
          </View>
        ) : sortedProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={34} color="#94a3b8" />
            <Text style={styles.emptyStateTitle}>No products found</Text>
            <Text style={styles.emptyStateSubtitle}>Try adjusting your search or filters.</Text>
            <Pressable style={styles.clearFiltersButton} onPress={clearAllFilters}>
              <Text style={styles.clearFiltersText}>Reset filters</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.productsWrap, viewMode === "grid" ? styles.grid : styles.list]}>
            {currentItems.map((product) => renderProductCard(product))}
          </View>
        )}

        {totalPages > 1 ? (
          <View style={styles.paginationRow}>
            <Pressable
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <Text style={styles.pageButtonText}>Previous</Text>
            </Pressable>
            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>
            <Pressable
              style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <Text style={styles.pageButtonText}>Next</Text>
            </Pressable>
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
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    paddingRight: 10,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 9,
    overflow: "hidden",
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#1e3a8a",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  outlineAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  outlineActionText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 12,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexDirection: "row",
  },
  primaryActionText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  cartValueText: {
    fontSize: 12,
    color: "#475569",
  },
  searchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    gap: 10,
  },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    paddingVertical: 10,
  },
  controlsRow: {
    gap: 10,
  },
  smallControlButton: {
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    flexDirection: "row",
  },
  smallControlButtonText: {
    fontSize: 12,
    color: "#1e3a8a",
    fontWeight: "700",
  },
  sortWrap: {
    gap: 6,
  },
  sortLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  sortChips: {
    flexDirection: "row",
    gap: 6,
  },
  sortChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#ffffff",
  },
  sortChipActive: {
    backgroundColor: "#1e3a8a",
    borderColor: "#1e3a8a",
  },
  sortChipText: {
    fontSize: 11,
    color: "#334155",
    fontWeight: "700",
  },
  sortChipTextActive: {
    color: "#ffffff",
  },
  filtersPanel: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
    gap: 8,
  },
  filterTitle: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "700",
  },
  filterChipRow: {
    flexDirection: "row",
    gap: 6,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
  },
  filterChipActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
  },
  filterChipText: {
    fontSize: 11,
    color: "#334155",
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#1e3a8a",
  },
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#0f172a",
  },
  rangeDash: {
    color: "#475569",
    fontWeight: "700",
  },
  clearFiltersButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  clearFiltersText: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "700",
  },
  errorBox: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    color: "#991b1b",
    fontSize: 12,
  },
  resultsText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyState: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    gap: 6,
    alignItems: "center",
  },
  emptyStateTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyStateSubtitle: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
  },
  productsWrap: {
    gap: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  list: {
    flexDirection: "column",
  },
  productCard: {
    width: "48.5%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
  },
  productCardList: {
    width: "100%",
    flexDirection: "row",
  },
  productImagePlaceholder: {
    height: 108,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  minOrderBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  minOrderBadgeText: {
    fontSize: 10,
    color: "#334155",
    fontWeight: "700",
  },
  productBody: {
    padding: 10,
    gap: 4,
    flex: 1,
  },
  productTitle: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "700",
  },
  supplierLink: {
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    color: "#475569",
    fontSize: 10,
  },
  dot: {
    color: "#94a3b8",
    fontSize: 10,
  },
  productDescription: {
    color: "#64748b",
    fontSize: 11,
    minHeight: 30,
  },
  priceRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  productPrice: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "800",
  },
  stockText: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1d4ed8",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 4,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    overflow: "hidden",
  },
  qtyButton: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: "#f8fafc",
  },
  qtyInput: {
    width: 34,
    textAlign: "center",
    color: "#0f172a",
    fontSize: 11,
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#e2e8f0",
  },
  paginationRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
  },
  pageText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
});
