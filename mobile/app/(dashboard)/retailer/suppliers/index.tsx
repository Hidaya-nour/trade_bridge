import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import BottomSheetModal from "@/components/retailer/BottomSheetModal";
import SupplierCard from "@/components/retailer/SupplierCard";
import SearchBar from "@/components/shared/SearchBar";
import { useProductStore } from "@/features/products/product.store";
import { useRetailerCompareStore } from "@/features/retailer-marketplace/compare.store";
import { deriveSupplierDirectory } from "@/features/retailer-marketplace/marketplace.utils";
import { useSupplierStore } from "@/features/suppliers/supplier.store";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const FETCH_LIMIT = 120;
const VISIBLE_BATCH_SIZE = 8;

const ratingOptions = [
  { key: 0, label: "Any rating" },
  { key: 4, label: "4.0+" },
  { key: 4.5, label: "4.5+" },
] as const;

const sortOptions = [
  { key: "rating", label: "Top Rated" },
  { key: "products", label: "Most Products" },
  { key: "reviews", label: "Most Reviews" },
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

export default function RetailerSuppliersScreen() {
  const router = useRouter();
  const { setTabBarVisible } = useRoleShell();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minimumRating, setMinimumRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortKey>("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_BATCH_SIZE);
  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  const {
    suppliers,
    isLoading: suppliersLoading,
    error: suppliersError,
    fetchSuppliers,
  } = useSupplierStore();
  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    fetchProducts,
  } = useProductStore();
  const compareSupplierIds = useRetailerCompareStore((state) => state.supplierIds);
  const toggleCompareSupplier = useRetailerCompareStore((state) => state.toggleSupplier);
  const clearComparedSuppliers = useRetailerCompareStore((state) => state.clearSuppliers);

  const loadDirectory = useCallback(async () => {
    await Promise.all([
      fetchSuppliers(),
      fetchProducts({ is_available: true, limit: FETCH_LIMIT }, { replace: true }),
    ]);
  }, [fetchProducts, fetchSuppliers]);

  useEffect(() => {
    void loadDirectory();
  }, [loadDirectory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDirectory();
    setRefreshing(false);
  }, [loadDirectory]);

  const supplierDirectory = useMemo(
    () => deriveSupplierDirectory(products, suppliers),
    [products, suppliers],
  );

  const categoryOptions = useMemo(() => {
    const available = new Set<string>();
    supplierDirectory.forEach((supplier) => {
      supplier.categories.forEach((category) => available.add(category));
    });
    return ["All Categories", ...Array.from(available).sort((a, b) => a.localeCompare(b))];
  }, [supplierDirectory]);

  const locationOptions = useMemo(() => {
    const available = new Set<string>();
    supplierDirectory.forEach((supplier) => {
      if (supplier.locationLabel !== "Location pending") {
        available.add(supplier.locationLabel);
      }
    });
    return ["All Locations", ...Array.from(available).sort((a, b) => a.localeCompare(b))];
  }, [supplierDirectory]);

  const filteredSuppliers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return supplierDirectory.filter((supplier) => {
      const matchesSearch =
        normalizedSearch === "" ||
        supplier.name.toLowerCase().includes(normalizedSearch) ||
        supplier.categories.some((category) => category.toLowerCase().includes(normalizedSearch)) ||
        supplier.locationLabel.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All Categories" || supplier.categories.includes(selectedCategory);
      const matchesLocation =
        selectedLocation === "All Locations" || supplier.locationLabel === selectedLocation;
      const matchesVerified = !verifiedOnly || supplier.verifiedState;
      const matchesRating = supplier.averageRating >= minimumRating;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesVerified &&
        matchesRating
      );
    });
  }, [
    minimumRating,
    searchQuery,
    selectedCategory,
    selectedLocation,
    supplierDirectory,
    verifiedOnly,
  ]);

  const sortedSuppliers = useMemo(() => {
    const cloned = [...filteredSuppliers];

    switch (sortBy) {
      case "products":
        return cloned.sort((a, b) => b.productCount - a.productCount);
      case "reviews":
        return cloned.sort((a, b) => b.reviewCount - a.reviewCount);
      case "name":
        return cloned.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return cloned.sort((a, b) => b.averageRating - a.averageRating);
    }
  }, [filteredSuppliers, sortBy]);

  useEffect(() => {
    setVisibleCount(VISIBLE_BATCH_SIZE);
  }, [searchQuery, selectedCategory, selectedLocation, verifiedOnly, minimumRating, sortBy]);

  const visibleSuppliers = useMemo(
    () => sortedSuppliers.slice(0, visibleCount),
    [sortedSuppliers, visibleCount],
  );

  const handleCompareToggle = useCallback(
    (supplierId: string) => {
      const result = toggleCompareSupplier(supplierId);

      if (result === "limit") {
        Alert.alert("Compare limit reached", "You can compare up to 4 suppliers at once.");
      }
    },
    [toggleCompareSupplier],
  );

  const activeFilters = useMemo(() => {
    const chips: string[] = [];

    if (searchQuery.trim()) chips.push(`Search: ${searchQuery.trim()}`);
    if (selectedCategory !== "All Categories") chips.push(selectedCategory);
    if (selectedLocation !== "All Locations") chips.push(selectedLocation);
    if (verifiedOnly) chips.push("Verified only");
    if (minimumRating > 0) chips.push(`${minimumRating}+ rating`);

    return chips;
  }, [minimumRating, searchQuery, selectedCategory, selectedLocation, verifiedOnly]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedLocation("All Locations");
    setVerifiedOnly(false);
    setMinimumRating(0);
  }, []);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.heroCard}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Browse suppliers with comparison-ready mobile cards</Text>
          <Text style={styles.heroSubtitle}>
            Find verified partners, filter by category or region, then jump straight into comparison.
          </Text>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="Search suppliers by name, category, location..."
        />

        <View style={styles.heroActions}>
          <Pressable style={styles.filterButton} onPress={() => setShowFilters(true)}>
            <Ionicons name="options-outline" size={16} color="#0f172a" />
            <Text style={styles.filterButtonText}>
              Filters{activeFilters.length ? ` (${activeFilters.length})` : ""}
            </Text>
          </Pressable>
          <Pressable style={styles.compareButton} onPress={() => router.push("/retailer/compare")}>
            <Ionicons name="git-compare-outline" size={16} color="#ffffff" />
            <Text style={styles.compareButtonText}>Compare ({compareSupplierIds.length})</Text>
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>{sortedSuppliers.length} suppliers</Text>
          {compareSupplierIds.length ? (
            <Pressable onPress={clearComparedSuppliers}>
              <Text style={styles.clearComparedText}>Clear compare list</Text>
            </Pressable>
          ) : null}
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

      {suppliersError || productsError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{suppliersError || productsError}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <ScreenWrapper title="Browse Suppliers" subtitle="Retailer">
      <FlatList
        data={visibleSuppliers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <SupplierCard
              supplier={item}
              compared={compareSupplierIds.includes(item.id)}
              onPress={() => router.push(`/retailer/suppliers/${item.id}`)}
              onCompareToggle={() => handleCompareToggle(item.id)}
              onBrowseProducts={() => router.push(`/retailer/products?supplierId=${item.id}`)}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          suppliersLoading || productsLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#1d4ed8" />
              <Text style={styles.emptyTitle}>Loading suppliers</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={22} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No suppliers matched</Text>
              <Text style={styles.emptySubtitle}>Try a broader search or reset the filters.</Text>
            </View>
          )
        }
        ListFooterComponent={
          visibleSuppliers.length > 0 ? (
            <View style={styles.footerState}>
              <Text style={styles.footerText}>
                {visibleCount < sortedSuppliers.length
                  ? `Showing ${visibleSuppliers.length} of ${sortedSuppliers.length}`
                  : "You have reached the end of the supplier list"}
              </Text>
            </View>
          ) : null
        }
        onEndReached={() => {
          if (visibleCount < sortedSuppliers.length) {
            setVisibleCount((current) => Math.min(current + VISIBLE_BATCH_SIZE, sortedSuppliers.length));
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
        title="Filter suppliers"
        subtitle="Mobile filters keep the directory fast without recreating the desktop sidebar."
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
          <Text style={styles.sheetSectionTitle}>Quality filters</Text>
          <View style={styles.chipWrap}>
            <FilterChip
              label="Verified only"
              active={verifiedOnly}
              onPress={() => setVerifiedOnly((current) => !current)}
            />
            {ratingOptions.map((option) => (
              <FilterChip
                key={option.label}
                label={option.label}
                active={minimumRating === option.key}
                onPress={() => setMinimumRating(option.key)}
              />
            ))}
          </View>
        </View>

        <View style={styles.sheetFooter}>
          <Pressable style={styles.clearButton} onPress={clearFilters}>
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
  heroCopy: {
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
  compareButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: "#1d4ed8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  compareButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  clearComparedText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1d4ed8",
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
  cardWrap: {
    marginBottom: 12,
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
