import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import MarketplaceActionButton from "@/components/retailer/MarketplaceActionButton";
import { type SupplierDirectoryItem } from "@/features/suppliers/supplier.types";
import {
  formatCurrency,
  getSupplierInitials,
} from "@/features/retailer-marketplace/marketplace.utils";

interface SupplierCardProps {
  supplier: SupplierDirectoryItem;
  compared: boolean;
  onPress: () => void;
  onCompareToggle: () => void;
  onBrowseProducts: () => void;
}

function SupplierCard({
  supplier,
  compared,
  onPress,
  onCompareToggle,
  onBrowseProducts,
}: SupplierCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getSupplierInitials(supplier.name)}</Text>
        </View>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {supplier.name}
            </Text>
            {supplier.verifiedState ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark-outline" size={12} color="#166534" />
              </View>
            ) : null}
          </View>
          <Text style={styles.metaText} numberOfLines={1}>
            {supplier.locationLabel}
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{supplier.averageRating.toFixed(1)}</Text>
          <Text style={styles.metricLabel}>Rating</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{supplier.productCount}</Text>
          <Text style={styles.metricLabel}>Products</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{supplier.reviewCount}</Text>
          <Text style={styles.metricLabel}>Reviews</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {supplier.categories.length
          ? `${supplier.categories.slice(0, 3).join(", ")} supplies with mobile-friendly ordering and fast discovery tools.`
          : "Verified supplier ready for product browsing and ordering."}
      </Text>

      <View style={styles.tagRow}>
        {supplier.categories.slice(0, 2).map((category) => (
          <View key={category} style={styles.tag}>
            <Text style={styles.tagText}>{category}</Text>
          </View>
        ))}
        {supplier.startingPrice ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>From {formatCurrency(supplier.startingPrice)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <MarketplaceActionButton
          icon={compared ? "git-compare" : "git-compare-outline"}
          label={compared ? "Compared" : "Compare"}
          active={compared}
          onPress={onCompareToggle}
        />
        <View style={styles.browseWrap}>
          <MarketplaceActionButton
            icon="arrow-forward-outline"
            label="Browse Products"
            variant="primary"
            onPress={onBrowseProducts}
          />
        </View>
      </View>
    </Pressable>
  );
}

export default memo(SupplierCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  metaText: {
    fontSize: 13,
    color: "#64748b",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricBox: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  metricLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  browseWrap: {
    flex: 1,
  },
});
