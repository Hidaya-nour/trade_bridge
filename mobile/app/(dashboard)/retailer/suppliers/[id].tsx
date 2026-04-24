import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import productService from "@/features/products/product.service";
import { type Product } from "@/features/products/product.types";
import { useSupplierStore } from "@/features/suppliers/supplier.store";
import {
  formatCurrency,
  getLocationLabel,
  getSupplierInitials,
  getSupplierName,
} from "@/features/retailer-marketplace/marketplace.utils";

export default function RetailerSupplierDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const supplierId = String(id || "");

  const { fetchSupplierById } = useSupplierStore();

  const [supplier, setSupplier] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supplierId) return;

    setLoading(true);
    setError(null);
    try {
      const [supplierResult, productsResult] = await Promise.all([
        fetchSupplierById(supplierId),
        productService.getProducts({ supplier_id: supplierId, is_available: true, limit: 40 }),
      ]);

      setSupplier(supplierResult);
      setProducts(productsResult.data?.products ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load supplier");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [fetchSupplierById, supplierId]);

  useEffect(() => {
    void load();
  }, [load]);

  const supplierName = useMemo(() => getSupplierName(supplier), [supplier]);
  const locationLabel = useMemo(() => getLocationLabel(supplier?.addresses), [supplier?.addresses]);
  const verified =
    supplier?.verified === true || supplier?.is_verified === true;
  const phone = String(supplier?.phone || "").trim();
  const email = String(supplier?.email || "").trim();

  const openDialer = useCallback(async () => {
    if (!phone) return;
    const cleaned = phone.replace(/\s+/g, "");
    await Linking.openURL(`tel:${cleaned}`);
  }, [phone]);

  const openEmail = useCallback(async () => {
    if (!email) return;
    await Linking.openURL(`mailto:${email}`);
  }, [email]);

  return (
    <ScreenWrapper title="Supplier Profile" subtitle="Retailer">
      {loading ? (
        <View style={styles.centeredWrap}>
          <ActivityIndicator size="small" color="#1d4ed8" />
          <Text style={styles.loadingText}>Loading supplierâ€¦</Text>
        </View>
      ) : !supplierId || !supplier ? (
        <View style={styles.centeredWrap}>
          <Text style={styles.title}>Supplier not found</Text>
          {error ? <Text style={styles.subtitle}>{error}</Text> : null}
          <Pressable style={styles.primaryButton} onPress={() => void load()}>
            <Text style={styles.primaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <View style={styles.headerRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getSupplierInitials(supplierName)}</Text>
              </View>
              <View style={styles.headerCopy}>
                <View style={styles.nameRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {supplierName}
                  </Text>
                  {verified ? (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="shield-checkmark" size={14} color="#166534" />
                    </View>
                  ) : null}
                </View>
                <Text style={styles.metaText}>{locationLabel}</Text>
                <Text style={styles.metaText}>
                  {supplier?.role ? String(supplier.role).toUpperCase() : "SUPPLIER"}
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={[styles.actionButton, styles.actionPrimary]}
                onPress={() => router.push(`/retailer/products?supplierId=${supplierId}` as never)}
              >
                <Ionicons name="bag-handle-outline" size={16} color="#ffffff" />
                <Text style={[styles.actionText, styles.actionTextPrimary]}>Browse products</Text>
              </Pressable>
              <Pressable
                style={styles.actionButton}
                onPress={() => router.push(`/retailer/messages/${supplierId}` as never)}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#334155" />
                <Text style={styles.actionText}>Chat</Text>
              </Pressable>
            </View>

            <View style={styles.contactRow}>
              <Pressable
                style={[styles.contactChip, !phone && styles.contactChipDisabled]}
                onPress={openDialer}
                disabled={!phone}
              >
                <Ionicons name="call-outline" size={14} color={phone ? "#1d4ed8" : "#94a3b8"} />
                <Text style={[styles.contactText, !phone && styles.contactTextDisabled]}>
                  {phone || "Phone unavailable"}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.contactChip, !email && styles.contactChipDisabled]}
                onPress={openEmail}
                disabled={!email}
              >
                <Ionicons name="mail-outline" size={14} color={email ? "#1d4ed8" : "#94a3b8"} />
                <Text style={[styles.contactText, !email && styles.contactTextDisabled]} numberOfLines={1}>
                  {email || "Email unavailable"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Products</Text>
              <Text style={styles.sectionSubtitle}>{products.length} items</Text>
            </View>

            {products.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No products yet</Text>
                <Text style={styles.emptySubtitle}>This supplier has not published products.</Text>
              </View>
            ) : (
              products.slice(0, 12).map((product) => (
                <Pressable
                  key={product.id}
                  style={styles.productRow}
                  onPress={() => router.push(`/retailer/products/${product.id}` as never)}
                >
                  <View style={styles.productCopy}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productMeta} numberOfLines={1}>
                      MOQ {product.min_order_amount} â€¢ Stock {product.stock_quantity}
                    </Text>
                  </View>
                  <View style={styles.productRight}>
                    <Text style={styles.productPrice}>{formatCurrency(Number(product.price || 0), 2)}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                  </View>
                </Pressable>
              ))
            )}

            {products.length > 12 ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => router.push(`/retailer/products?supplierId=${supplierId}` as never)}
              >
                <Text style={styles.secondaryButtonText}>View all products</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  centeredWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: "#64748b",
  },
  headerCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
  },
  verifiedBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionPrimary: {
    backgroundColor: "#1d4ed8",
    borderColor: "#1d4ed8",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  actionTextPrimary: {
    color: "#ffffff",
  },
  contactRow: {
    gap: 10,
  },
  contactChip: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactChipDisabled: {
    backgroundColor: "#f8fafc",
  },
  contactText: {
    fontSize: 13,
    color: "#0f172a",
    flex: 1,
  },
  contactTextDisabled: {
    color: "#94a3b8",
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  productRow: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  productCopy: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  productMeta: {
    fontSize: 12,
    color: "#64748b",
  },
  productRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 6,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#1d4ed8",
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  secondaryButton: {
    alignSelf: "center",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#eff6ff",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1d4ed8",
  },
});
