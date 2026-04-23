import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { useProductStore } from "@/features/products/product.store";
import { useRetailerCompareStore } from "@/features/retailer-marketplace/compare.store";
import {
  deriveSupplierDirectory,
  formatCurrency,
  getSupplierInitials,
} from "@/features/retailer-marketplace/marketplace.utils";
import { useSupplierStore } from "@/features/suppliers/supplier.store";

const FETCH_LIMIT = 120;

function CompareMetric({
  label,
  values,
}: {
  label: string;
  values: Array<string | number>;
}) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValuesRow}>
        {values.map((value, index) => (
          <View key={`${label}-${index}`} style={styles.metricValueBox}>
            <Text style={styles.metricValueText}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function RetailerCompareScreen() {
  const router = useRouter();
  const { products, fetchProducts } = useProductStore();
  const { suppliers, fetchSuppliers } = useSupplierStore();
  const supplierIds = useRetailerCompareStore((state) => state.supplierIds);
  const clearSuppliers = useRetailerCompareStore((state) => state.clearSuppliers);
  const toggleSupplier = useRetailerCompareStore((state) => state.toggleSupplier);

  useEffect(() => {
    if (!products.length) {
      void fetchProducts({ is_available: true, limit: FETCH_LIMIT }, { replace: true });
    }
    if (!suppliers.length) {
      void fetchSuppliers();
    }
  }, [fetchProducts, fetchSuppliers, products.length, suppliers.length]);

  const comparedSuppliers = useMemo(() => {
    const directory = deriveSupplierDirectory(products, suppliers);
    return directory.filter((supplier) => supplierIds.includes(supplier.id));
  }, [products, supplierIds, suppliers]);

  if (!comparedSuppliers.length) {
    return (
      <ScreenWrapper title="Compare Suppliers" subtitle="Retailer">
        <View style={styles.emptyWrap}>
          <Ionicons name="git-compare-outline" size={34} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No suppliers selected</Text>
          <Text style={styles.emptySubtitle}>
            Add suppliers from the products or suppliers pages to compare them side by side.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push("/retailer/suppliers")}>
            <Text style={styles.primaryButtonText}>Browse Suppliers</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Compare Suppliers" subtitle="Retailer">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{comparedSuppliers.length} suppliers selected</Text>
          <Pressable onPress={clearSuppliers}>
            <Text style={styles.clearAllText}>Clear all</Text>
          </Pressable>
        </View>

        <View style={styles.cardRow}>
          {comparedSuppliers.map((supplier) => (
            <View key={supplier.id} style={styles.supplierCard}>
              <Pressable
                style={styles.removeButton}
                onPress={() => toggleSupplier(supplier.id)}
              >
                <Ionicons name="close-outline" size={16} color="#334155" />
              </Pressable>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getSupplierInitials(supplier.name)}</Text>
              </View>
              <Text style={styles.supplierName}>{supplier.name}</Text>
              <Text style={styles.supplierMeta}>{supplier.locationLabel}</Text>
              <View style={styles.badgeRow}>
                {supplier.verifiedState ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Verified</Text>
                  </View>
                ) : null}
                {supplier.categories.slice(0, 1).map((category) => (
                  <View key={category} style={styles.badge}>
                    <Text style={styles.badgeText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.comparePanel}>
          <CompareMetric
            label="Average rating"
            values={comparedSuppliers.map((supplier) => supplier.averageRating.toFixed(1))}
          />
          <CompareMetric
            label="Product count"
            values={comparedSuppliers.map((supplier) => supplier.productCount)}
          />
          <CompareMetric
            label="Review volume"
            values={comparedSuppliers.map((supplier) => supplier.reviewCount)}
          />
          <CompareMetric
            label="Starting price"
            values={comparedSuppliers.map((supplier) =>
              supplier.startingPrice ? formatCurrency(supplier.startingPrice) : "N/A",
            )}
          />
          <CompareMetric
            label="Min order"
            values={comparedSuppliers.map((supplier) => supplier.minOrderAmount || "N/A")}
          />
        </View>

        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Mobile UX suggestion</Text>
          <Text style={styles.notesText}>
            Keep compare selection persistent while browsing, then jump back here from any card without losing state.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
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
  primaryButton: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  supplierCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  removeButton: {
    alignSelf: "flex-end",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  supplierName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  supplierMeta: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  comparePanel: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 12,
  },
  metricRow: {
    gap: 8,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
  },
  metricValuesRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricValueBox: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValueText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  notesCard: {
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    padding: 16,
    gap: 6,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1e3a8a",
  },
  notesText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#1e40af",
  },
});
