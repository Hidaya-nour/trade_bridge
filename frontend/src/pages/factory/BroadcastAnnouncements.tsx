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

type DistributorSnapshot = {
  id: string;
  name: string;
  orderCount: number;
  totalValue: number;
  hasOpenOrders: boolean;
};

type ProductDemand = {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  orderCount: number;
  quantity: number;
  revenue: number;
  distributors: Set<string>;
};

const ACTIVE_ORDER_STATUSES = new Set(["pending", "approved", "processing"]);
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

const getDistributorName = (order: Order) =>
  order.buyer?.business_name || order.buyer?.full_name || "Distributor";

const getDistributorSnapshots = (orders: Order[]): DistributorSnapshot[] => {
  const distributors = new Map<string, DistributorSnapshot>();

  orders.forEach((order) => {
    const distributorId = String(order.buyer_id || "unknown");
    const current = distributors.get(distributorId);
    const amount = Number(order.total_price || 0);

    distributors.set(distributorId, {
      id: distributorId,
      name: getDistributorName(order),
      orderCount: (current?.orderCount || 0) + 1,
      totalValue: (current?.totalValue || 0) + amount,
      hasOpenOrders:
        current?.hasOpenOrders ||
        false ||
        ACTIVE_ORDER_STATUSES.has(order.order_status),
    });
  });

  return [...distributors.values()];
};

const getAudienceSegments = (orders: Order[]): AudienceSegment[] => {
  const distributors = getDistributorSnapshots(orders);
  const activePartners = distributors.filter(
    (partner) => partner.hasOpenOrders,
  );
  const highValuePartners = distributors.filter(
    (partner) => partner.totalValue >= 100000 || partner.orderCount >= 2,
  );
  const newPartners = distributors.filter(
    (partner) => partner.orderCount === 1,
  );

  return [
    {
      id: "active-distributors",
      name: "Active Distributors",
      count: activePartners.length,
      description: "Partners with pending, approved, or processing orders",
    },
    {
      id: "high-value-distributors",
      name: "High Value Partners",
      count: highValuePartners.length,
      description: "Distributors with ETB 100K+ value or repeat orders",
    },
    {
      id: "new-distributors",
      name: "New Partners",
      count: newPartners.length,
      description: "Distributors that have placed exactly one order",
    },
  ].filter((segment) => segment.count > 0);
};

const getProductDemand = (orders: Order[]): ProductDemand[] => {
  const demand = new Map<string, ProductDemand>();

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const productId = String(item.product_id || item.product?.id || item.id);
      const existing = demand.get(productId);
      const quantity = Number(item.quantity || 0);
      const revenue = quantity * Number(item.unit_price || 0);

      if (existing) {
        existing.orderCount += 1;
        existing.quantity += quantity;
        existing.revenue += revenue;
        existing.distributors.add(String(order.buyer_id || "unknown"));
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
        distributors: new Set([String(order.buyer_id || "unknown")]),
      });
    });
  });

  return [...demand.values()];
};

const buildAnnouncements = (
  orders: Order[],
  products: Product[],
  createdBy: string,
): BroadcastItem[] => {
  const announcements: BroadcastItem[] = [];
  const distributors = getDistributorSnapshots(orders);
  const productDemand = getProductDemand(orders).sort(
    (a, b) => b.revenue - a.revenue,
  );

  const topDemandProduct = productDemand[0];
  if (topDemandProduct) {
    announcements.push({
      id: `demand-${topDemandProduct.productId}`,
      title: `High-demand allocation for ${topDemandProduct.name}`,
      description:
        "Distributor demand is rising on this item. Prioritize production and outbound communication for the strongest accounts.",
      summary: `${topDemandProduct.orderCount} orders, ${topDemandProduct.quantity.toLocaleString()} ${topDemandProduct.unit}, ${formatCompactPrice(topDemandProduct.revenue)}`,
      isPersisted: false,
      type: "bundle",
      startDate: orders[0]?.created_at || new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      createdAt: orders[0]?.created_at || new Date().toISOString(),
      createdBy,
      sentCount: topDemandProduct.distributors.size,
      viewedCount: topDemandProduct.orderCount,
      redeemedCount: topDemandProduct.orderCount,
      code: topDemandProduct.sku,
      priority: topDemandProduct.revenue >= 100000 ? "high" : "medium",
      targetAudience: "segment",
      audienceSegments: ["high-value-distributors"],
    });
  }

  const openOrders = orders.filter((order) =>
    ACTIVE_ORDER_STATUSES.has(order.order_status),
  );
  if (openOrders.length > 0) {
    const openOrderValue = openOrders.reduce(
      (sum, order) => sum + Number(order.total_price || 0),
      0,
    );

    announcements.push({
      id: "open-order-queue",
      title: "Order queue and dispatch update",
      description:
        "Use this announcement to keep distributor partners aligned on the current approval and fulfillment pipeline.",
      summary: `${openOrders.length} live orders worth ${formatCompactPrice(openOrderValue)} awaiting completion`,
      isPersisted: false,
      type: "free-shipping",
      minOrder: Math.round(openOrderValue / openOrders.length),
      startDate:
        openOrders[openOrders.length - 1]?.created_at ||
        new Date().toISOString(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      createdAt: openOrders[0]?.created_at || new Date().toISOString(),
      createdBy,
      sentCount: new Set(openOrders.map((order) => String(order.buyer_id)))
        .size,
      viewedCount: openOrders.length,
      redeemedCount: openOrders.filter(
        (order) => order.order_status === "approved",
      ).length,
      code: "QUEUE",
      priority: openOrders.length >= 5 ? "high" : "medium",
      targetAudience: "segment",
      audienceSegments: ["active-distributors"],
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
    const matchingDemand = productDemand.find(
      (item) => item.productId === String(lowStockProduct.id),
    );

    announcements.push({
      id: `stock-${lowStockProduct.id}`,
      title: `Low-stock notice for ${lowStockProduct.name}`,
      description:
        "Inventory is running close to the minimum order threshold. This announcement can warn distributors before availability tightens further.",
      summary: `${lowStockProduct.stock_quantity.toLocaleString()} ${lowStockProduct.unit_type} left, minimum order ${lowStockProduct.min_order_amount.toLocaleString()} ${lowStockProduct.unit_type}`,
      isPersisted: false,
      type: "clearance",
      discountType: "percentage",
      discountValue: Math.min(
        40,
        Math.max(
          5,
          Math.round(
            (lowStockProduct.min_order_amount /
              Math.max(lowStockProduct.stock_quantity, 1)) *
              100,
          ),
        ),
      ),
      startDate: lowStockProduct.updated_at,
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status:
        lowStockProduct.stock_quantity <= lowStockProduct.min_order_amount * 2
          ? "scheduled"
          : "draft",
      createdAt: lowStockProduct.updated_at,
      createdBy,
      sentCount: matchingDemand?.distributors.size || distributors.length,
      viewedCount: matchingDemand?.orderCount || 0,
      redeemedCount: matchingDemand?.quantity || 0,
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
    announcements.push({
      id: `launch-${latestProduct.id}`,
      title: `Catalog spotlight for ${latestProduct.name}`,
      description:
        "This draft is based on your newest catalog item and can be used to introduce it to distributor partners with clear order terms.",
      summary: `${formatPrice(latestProduct.price)} per ${latestProduct.unit_type}, minimum order ${latestProduct.min_order_amount.toLocaleString()} ${latestProduct.unit_type}`,
      isPersisted: false,
      type: "discount",
      discountType: "fixed",
      discountValue: latestProduct.price,
      minOrder: latestProduct.min_order_amount,
      startDate: latestProduct.created_at,
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: "draft",
      createdAt: latestProduct.created_at,
      createdBy,
      sentCount: distributors.length,
      viewedCount: 0,
      redeemedCount: 0,
      code: latestProduct.sku,
      priority:
        latestProduct.stock_quantity > latestProduct.min_order_amount * 3
          ? "medium"
          : "low",
      targetAudience: "all",
    });
  }

  const newPartners = distributors.filter(
    (partner) => partner.orderCount === 1,
  );
  if (newPartners.length > 0) {
    const newPartnerValue = newPartners.reduce(
      (sum, partner) => sum + partner.totalValue,
      0,
    );

    announcements.push({
      id: "new-partner-onboarding",
      title: "New distributor onboarding follow-up",
      description:
        "A draft announcement focused on recently activated distributors so they receive onboarding, fulfillment expectations, and ordering guidance.",
      summary: `${newPartners.length} new distributors have generated ${formatCompactPrice(newPartnerValue)} in first orders`,
      isPersisted: false,
      type: "discount",
      discountType: "percentage",
      discountValue: Math.min(15, Math.max(5, newPartners.length * 2)),
      startDate:
        orders[orders.length - 1]?.created_at || new Date().toISOString(),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "draft",
      createdAt: orders[0]?.created_at || new Date().toISOString(),
      createdBy,
      sentCount: newPartners.length,
      viewedCount: newPartners.length,
      redeemedCount: newPartners.length,
      code: "WELCOME",
      priority: "medium",
      targetAudience: "segment",
      audienceSegments: ["new-distributors"],
    });
  }

  return announcements.slice(0, 6);
};

const FactoryBroadcastPage: React.FC = () => {
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
        sortBy: "created_at",
        sortOrder: "DESC",
        limit: 50,
      },
      {
        replace: true,
      },
    );
  }, [fetchMine, fetchOrdersAsSupplier, fetchProducts]);

  const segments = useMemo(() => getAudienceSegments(orders), [orders]);

  const suggestedAnnouncements = useMemo(
    () =>
      buildAnnouncements(
        orders,
        products,
        authUser?.full_name || authUser?.business_name || "Factory team",
      ),
    [authUser, orders, products],
  );

  const announcements = useMemo(
    () => [
      ...savedBroadcasts.map(mapBroadcastRecordToItem),
      ...suggestedAnnouncements,
    ],
    [savedBroadcasts, suggestedAnnouncements],
  );

  const stats = useMemo(
    () => ({
      active: announcements.filter((item) => item.status === "active").length,
      scheduled: announcements.filter((item) => item.status === "scheduled")
        .length,
      draft: announcements.filter((item) => item.status === "draft").length,
    }),
    [announcements],
  );

  if (ordersLoading && productsLoading && announcements.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading announcements...
      </div>
    );
  }

  return (
    <BroadcastPage
      role="factory"
      items={announcements}
      segments={segments}
      stats={stats}
      onCreateItem={async (item) => {
        const createdBy =
          authUser?.full_name || authUser?.business_name || "Factory team";
        const created = await create(toCreatePayload(item, createdBy));
        if (!created) {
          throw new Error(broadcastError || "Failed to create announcement");
        }
      }}
      onDeleteItem={async (id) => {
        const ok = await deleteBroadcast(id);
        if (!ok) {
          throw new Error(broadcastError || "Failed to delete announcement");
        }
      }}
      onDuplicateItem={async (item) => {
        const createdBy =
          authUser?.full_name || authUser?.business_name || "Factory team";
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
          throw new Error(broadcastError || "Failed to duplicate announcement");
        }
      }}
      onUpdateStatus={async (id, status) => {
        const updated = await updateStatus(id, status);
        if (!updated) {
          throw new Error(broadcastError || "Failed to update announcement");
        }
      }}
    />
  );
};

export default FactoryBroadcastPage;
