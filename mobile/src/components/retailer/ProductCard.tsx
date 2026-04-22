import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import MarketplaceActionButton from "@/components/retailer/MarketplaceActionButton";
import { type Product } from "@/features/products/product.types";
import {
  formatCurrency,
  getSupplierName,
} from "@/features/retailer-marketplace/marketplace.utils";

interface ProductCardProps {
  product: Product;
  locationLabel: string;
  cartQuantity: number;
  compared: boolean;
  busy?: boolean;
  onPress: () => void;
  onSupplierPress: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onCompare: () => void;
}

function ProductCard({
  product,
  locationLabel,
  cartQuantity,
  compared,
  busy = false,
  onPress,
  onSupplierPress,
  onAddToCart,
  onBuyNow,
  onCompare,
}: ProductCardProps) {
  const supplierName = getSupplierName(product.supplier);
  const rating = Number(product.rating || 0).toFixed(1);
  const hasStock = Number(product.stock_quantity || 0) > 0;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Ionicons name="cube-outline" size={28} color="#94a3b8" />
        <View style={styles.minOrderBadge}>
          <Text style={styles.minOrderBadgeText}>Min {product.min_order_amount}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>
        <Pressable onPress={onSupplierPress} hitSlop={6}>
          <Text style={styles.supplierLink} numberOfLines={1}>
            {supplierName}
          </Text>
        </Pressable>

        <View style={styles.metaRow}>
          <Ionicons name="star" size={12} color="#f59e0b" />
          <Text style={styles.metaText}>{rating}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{product.review_count || 0} reviews</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color="#64748b" />
          <Text style={styles.metaText} numberOfLines={1}>
            {locationLabel}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {product.description || "Fresh catalog listing from this supplier."}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {formatCurrency(Number(product.price))}/{product.unit_type}
          </Text>
          <Text style={[styles.stock, !hasStock && styles.stockMuted]}>
            {hasStock ? `${product.stock_quantity} in stock` : "Out of stock"}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <MarketplaceActionButton
            icon="cart-outline"
            variant="icon"
            badge={cartQuantity > 0 ? cartQuantity : undefined}
            onPress={onAddToCart}
          />
          <MarketplaceActionButton
            icon={compared ? "git-compare" : "git-compare-outline"}
            variant="icon"
            active={compared}
            onPress={onCompare}
          />
          <View style={styles.buyNowWrap}>
            <MarketplaceActionButton
              icon="flash-outline"
              label={busy ? "Working..." : "Buy Now"}
              variant="primary"
              onPress={onBuyNow}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  imageWrap: {
    height: 118,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  minOrderBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 999,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  minOrderBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  body: {
    padding: 14,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    minHeight: 40,
  },
  supplierLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    flexShrink: 1,
    fontSize: 12,
    color: "#64748b",
  },
  metaDot: {
    fontSize: 12,
    color: "#94a3b8",
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
    minHeight: 36,
  },
  priceRow: {
    gap: 3,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  stock: {
    fontSize: 12,
    color: "#15803d",
  },
  stockMuted: {
    color: "#b91c1c",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  buyNowWrap: {
    flex: 1,
  },
});
