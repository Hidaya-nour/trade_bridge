import React, { useEffect, useMemo } from "react";

import {
  BroadcastPage,
  type AudienceSegment,
  type BroadcastItem,
} from "@/components";
import { formatCompactPrice, formatPrice } from "@/lib/formatters";
import { useAuthStore } from "@/stores/auth.store";
import { useBroadcastStore } from "@/stores/broadcast.store";
import { useOrderStore } from "@/stores/order.store";
import { useProductStore } from "@/stores/product.store";
import type { CreateBroadcastPayload } from "@/types/broadcast.types";
import type { Order } from "@/types/order.types";
import type { Product } from "@/types/product.types";
import { mapBroadcastRecordToItem } from "@/types/broadcast.types";

type RetailerSnapshot = {
  id: string;
  name: string;
  orderCount: number;
  totalValue: number;
  hasRecentOrder: boolean;
};

type ProductDemand = {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  orderCount: number;
  quantity: number;
  revenue: number;
  retailers: Set<string>;
};

const RECENT_ORDER_STATUSES = new Set([
  "pending",
  "approved",
  "processing",
  "shipped",
  "delivered",
  "closed",
]);
const DEFAULT_DURATION_DAYS = 7;

const toIsoDate = (value?: string) =>
  value && value.trim()
    ? new Date(value).toISOString()
    : new Date().toISOString();

const getEndDate = (value?: string) =>
  value && value.trim()
    ? new Date(value).toISOString()
    : new Date(
        Date.now() + DEFAULT_DURATION_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString();

const toNullableNumber = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toCreatePayload = (
  item: any,
  createdBy: string,
): CreateBroadcastPayload => ({
  title: item.title,
  description: item.description,
  summary: item.summary || null,
  type: item.type,
  discount_type: item.discountType || null,
  discount_value: toNullableNumber(item.discountValue),
  min_order: toNullableNumber(item.minOrder),
  max_discount: toNullableNumber(item.maxDiscount),
  start_date: toIsoDate(item.startDate),
  end_date: getEndDate(item.endDate),
  status: item.status,
  created_by: createdBy,
  sent_count: Number(item.sentCount || 0),
  viewed_count: Number(item.viewedCount || 0),
  redeemed_count: Number(item.redeemedCount || 0),
  code: item.code || item.promoCode || null,
  priority: item.priority || "medium",
  target_audience: item.targetAudience || "all",
  audience_segments: item.selectedSegments || item.audienceSegments || [],
});

const getRetailerName = (order: Order) =>
  order.buyer?.business_name || order.buyer?.full_name || "Retailer";

const getRetailerSnapshots = (orders: Order[]): RetailerSnapshot[] => {
  const retailers = new Map<string, RetailerSnapshot>();

  orders.forEach((order) => {
    const retailerId = String(order.buyer_id || "unknown");
    const current = retailers.get(retailerId);
    const amount = Number(order.total_price || 0);

    retailers.set(retailerId, {
      id: retailerId,
      name: getRetailerName(order),
      orderCount: (current?.orderCount || 0) + 1,
      totalValue: (current?.totalValue || 0) + amount,
      hasRecentOrder:
        current?.hasRecentOrder ||
        false ||
        RECENT_ORDER_STATUSES.has(order.order_status),
    });
  });

  return [...retailers.values()];
};

const getAudienceSegments = (orders: Order[]): AudienceSegment[] => {
  const retailers = getRetailerSnapshots(orders);
  const frequentBuyers = retailers.filter(
    (retailer) => retailer.orderCount >= 2,
  );
  const premiumRetailers = retailers.filter(
    (retailer) => retailer.totalValue >= 50000,
  );
  const newCustomers = retailers.filter(
    (retailer) => retailer.orderCount === 1,
  );

  return [
    {
      id: "frequent-buyers",
      name: "Frequent Buyers",
      count: frequentBuyers.length,
      description: "Retailers with repeat purchase activity",
    },
    {
      id: "premium-retailers",
      name: "Premium Retailers",
      count: premiumRetailers.length,
      description: "Retailers with ETB 50K+ order value",
    },
    {
      id: "new-customers",
      name: "New Customers",
      count: newCustomers.length,
      description: "Retailers that have placed exactly one order",
    },
  ].filter((segment) => segment.count > 0);
};

const getProductDemand = (orders: Order[]): ProductDemand[] => {
  const demand = new Map<string, ProductDemand>();

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const productId = String(item.product_id || item.product?.id || item.id);
      const current = demand.get(productId);
      const quantity = Number(item.quantity || 0);
      const revenue = quantity * Number(item.unit_price || 0);

      if (current) {
        current.orderCount += 1;
        current.quantity += quantity;
        current.revenue += revenue;
        current.retailers.add(String(order.buyer_id || "unknown"));
        return;
      }

      demand.set(productId, {
        productId,
        name: item.product?.name || "Product",
        sku: item.product?.sku || productId,
        unit: item.product?.unit_type || "units",
        orderCount: 1,
        quantity,
        revenue,
        retailers: new Set([String(order.buyer_id || "unknown")]),
      });
    });
  });

  return [...demand.values()];
};

const buildPromotions = (
  orders: Order[],
  products: Product[],
  createdBy: string,
): BroadcastItem[] => {
  const promotions: BroadcastItem[] = [];
  const retailers = getRetailerSnapshots(orders);
  const productDemand = getProductDemand(orders).sort(
    (a, b) => b.revenue - a.revenue,
  );

  const topDemandProduct = productDemand[0];
  if (topDemandProduct) {
    promotions.push({
      id: `top-demand-${topDemandProduct.productId}`,
      title: `${topDemandProduct.name} repeat-order boost`,
      description:
        "This promotion is based on your strongest-selling item and targets the retailers already showing repeat demand.",
      summary: `${topDemandProduct.orderCount} orders, ${topDemandProduct.quantity.toLocaleString()} ${topDemandProduct.unit}, ${formatCompactPrice(topDemandProduct.revenue)}`,
      isPersisted: false,
      type: "discount",
      discountType: "percentage",
      discountValue: topDemandProduct.orderCount >= 4 ? 12 : 8,
      minOrder: Math.max(
        1,
        Math.round(topDemandProduct.quantity / topDemandProduct.orderCount),
      ),
      maxDiscount: Math.round(topDemandProduct.revenue * 0.1),
      startDate: orders[0]?.created_at || new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      createdAt: orders[0]?.created_at || new Date().toISOString(),
      createdBy,
      sentCount: topDemandProduct.retailers.size,
      viewedCount: topDemandProduct.orderCount,
      redeemedCount: Math.max(1, Math.floor(topDemandProduct.orderCount * 0.6)),
      code: topDemandProduct.sku,
      priority: topDemandProduct.revenue >= 50000 ? "high" : "medium",
      targetAudience: "segment",
      audienceSegments: ["frequent-buyers"],
    });
  }

  const premiumRetailers = retailers.filter(
    (retailer) => retailer.totalValue >= 50000,
  );
  if (premiumRetailers.length > 0) {
    const premiumValue = premiumRetailers.reduce(
      (sum, retailer) => sum + retailer.totalValue,
      0,
    );

    promotions.push({
      id: "premium-retailer-reward",
      title: "Premium retailer loyalty reward",
      description:
        "A loyalty offer for your highest-value retail accounts to keep reorder velocity strong this week.",
      summary: `${premiumRetailers.length} premium retailers generated ${formatCompactPrice(premiumValue)}`,
      isPersisted: false,
      type: "discount",
      discountType: "percentage",
      discountValue: 10,
      minOrder: 25000,
      maxDiscount: 10000,
      startDate: orders[0]?.created_at || new Date().toISOString(),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
      createdAt: orders[0]?.created_at || new Date().toISOString(),
      createdBy,
      sentCount: premiumRetailers.length,
      viewedCount: premiumRetailers.length,
      redeemedCount: Math.max(1, Math.floor(premiumRetailers.length / 2)),
      code: "LOYAL10",
      priority: "high",
      targetAudience: "segment",
      audienceSegments: ["premium-retailers"],
    });
  }

  const lowStockProduct = [...products]
    .filter((product) => product.is_available && product.stock_quantity > 0)
    .sort(
      (a, b) =>
        a.stock_quantity / Math.max(a.min_order_amount, 1) -
        b.stock_quantity / Math.max(b.min_order_amount, 1),
    )[0];

  if (lowStockProduct) {
    promotions.push({
      id: `stock-push-${lowStockProduct.id}`,
      title: `${lowStockProduct.name} stock closeout`,
      description:
        "A stock-driven campaign for inventory that should move quickly before availability gets too tight for normal retailer demand.",
      summary: `${lowStockProduct.stock_quantity.toLocaleString()} ${lowStockProduct.unit_type} left at ${formatPrice(lowStockProduct.price)} each`,
      isPersisted: false,
      type: "clearance",
      discountType: "percentage",
      discountValue:
        lowStockProduct.stock_quantity <= lowStockProduct.min_order_amount * 2
          ? 20
          : 12,
      startDate: lowStockProduct.updated_at,
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status:
        lowStockProduct.stock_quantity <= lowStockProduct.min_order_amount * 2
          ? "active"
          : "draft",
      createdAt: lowStockProduct.updated_at,
      createdBy,
      sentCount: retailers.length,
      viewedCount: 0,
      redeemedCount: 0,
      code: lowStockProduct.sku,
      priority:
        lowStockProduct.stock_quantity <= lowStockProduct.min_order_amount * 2
          ? "high"
          : "medium",
      targetAudience: "all",
    });
  }

  const latestProduct = [...products].sort(
    (a, b) =>
      new Date(b.created_at || b.updated_at).getTime() -
      new Date(a.created_at || a.updated_at).getTime(),
  )[0];

  if (latestProduct) {
    promotions.push({
      id: `launch-${latestProduct.id}`,
      title: `Launch push for ${latestProduct.name}`,
      description:
        "A draft promotion built from your newest catalog item so you can introduce it to retailers with a simple opening incentive.",
      summary: `${formatPrice(latestProduct.price)} per ${latestProduct.unit_type}, minimum order ${latestProduct.min_order_amount.toLocaleString()} ${latestProduct.unit_type}`,
      isPersisted: false,
      type: "bundle",
      startDate: latestProduct.created_at,
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: "draft",
      createdAt: latestProduct.created_at,
      createdBy,
      sentCount: retailers.length,
      viewedCount: 0,
      redeemedCount: 0,
      code: latestProduct.sku,
      priority: "medium",
      targetAudience: "all",
    });
  }

  const newCustomers = retailers.filter(
    (retailer) => retailer.orderCount === 1,
  );
  if (newCustomers.length > 0) {
    promotions.push({
      id: "new-customer-welcome",
      title: "Welcome offer for new retailers",
      description:
        "This campaign is aimed at retailers who just placed their first order and need a reason to come back quickly.",
      summary: `${newCustomers.length} new retailers are ready for a second-order incentive`,
      isPersisted: false,
      type: "free-shipping",
      minOrder: 10000,
      startDate:
        orders[orders.length - 1]?.created_at || new Date().toISOString(),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "draft",
      createdAt: orders[0]?.created_at || new Date().toISOString(),
      createdBy,
      sentCount: newCustomers.length,
      viewedCount: newCustomers.length,
      redeemedCount: Math.max(0, Math.floor(newCustomers.length / 2)),
      code: "WELCOME",
      priority: "medium",
      targetAudience: "segment",
      audienceSegments: ["new-customers"],
    });
  }

  return promotions.slice(0, 6);
};

const DistributorBroadcastPage: React.FC = () => {
  const authUser = useAuthStore((state) => state.user);
  const {
    items: savedBroadcasts,
    fetchMine,
    create,
    updateStatus,
    delete: deleteBroadcast,
    error: broadcastError,
  } = useBroadcastStore();
  const {
    orders,
    fetchOrdersAsSupplier,
    isLoading: ordersLoading,
  } = useOrderStore();
  const {
    products,
    fetchProducts,
    isLoading: productsLoading,
  } = useProductStore();

  useEffect(() => {
    fetchMine();
    fetchOrdersAsSupplier({
      sortBy: "created_at",
      sortOrder: "DESC",
      limit: 50,
    });
    fetchProducts(
      {
        supplier_id: authUser?.id,
        sortBy: "created_at",
        sortOrder: "DESC",
        limit: 50,
      },
      {
        replace: true,
      },
    );
  }, [authUser?.id, fetchMine, fetchOrdersAsSupplier, fetchProducts]);

  const segments = useMemo(() => getAudienceSegments(orders), [orders]);

  const suggestedPromotions = useMemo(
    () =>
      buildPromotions(
        orders,
        products,
        authUser?.full_name || authUser?.business_name || "Distributor team",
      ),
    [authUser, orders, products],
  );

  const promotions = useMemo(
    () => [
      ...savedBroadcasts.map(mapBroadcastRecordToItem),
      ...suggestedPromotions,
    ],
    [savedBroadcasts, suggestedPromotions],
  );

  const stats = useMemo(
    () => ({
      active: promotions.filter((item) => item.status === "active").length,
      scheduled: promotions.filter((item) => item.status === "scheduled")
        .length,
      draft: promotions.filter((item) => item.status === "draft").length,
    }),
    [promotions],
  );

  if (ordersLoading && productsLoading && promotions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">Loading promotions...</div>
    );
  }

  return (
    <BroadcastPage
      role="distributor"
      items={promotions}
      segments={segments}
      stats={stats}
      productsForLink={(products || []).map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
      }))}
      onCreateItem={async (item) => {
        const createdBy =
          authUser?.full_name || authUser?.business_name || "Distributor team";
        const created = await create(toCreatePayload(item, createdBy));
        if (!created) {
          throw new Error(broadcastError || "Failed to create promotion");
        }
      }}
      onDeleteItem={async (id) => {
        const ok = await deleteBroadcast(id);
        if (!ok) {
          throw new Error(broadcastError || "Failed to delete promotion");
        }
      }}
      onDuplicateItem={async (item) => {
        const createdBy =
          authUser?.full_name || authUser?.business_name || "Distributor team";
        const duplicated = await create(
          toCreatePayload(
            {
              ...item,
              title: `${item.title} Copy`,
              status: "draft",
              sentCount: 0,
              viewedCount: 0,
              redeemedCount: 0,
            },
            createdBy,
          ),
        );
        if (!duplicated) {
          throw new Error(broadcastError || "Failed to duplicate promotion");
        }
      }}
      onUpdateStatus={async (id, status) => {
        const updated = await updateStatus(id, status);
        if (!updated) {
          throw new Error(broadcastError || "Failed to update promotion");
        }
      }}
    />
  );
};

export default DistributorBroadcastPage;
