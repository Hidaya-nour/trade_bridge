import React, { useEffect, useMemo } from "react";
import { Store } from "lucide-react";

import {
  AnalyticsDashboard,
  type AnalyticsConfig,
} from "@/components/shared/AnalyticsDashboard";
import { useOrderStore } from "@/stores/order.store";
import { useProductStore } from "@/stores/product.store";
import type { Order } from "@/types/order.types";
import type { Product } from "@/types/product.types";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SalesAnalyticsPage: React.FC = () => {
  const { orders, fetchOrdersAsSupplier } = useOrderStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchOrdersAsSupplier({
      sortBy: "created_at",
      sortOrder: "DESC",
      limit: 200,
    });
    fetchProducts(
      {
        sortBy: "created_at",
        sortOrder: "DESC",
        limit: 200,
      } as any,
      { replace: true },
    );
  }, [fetchOrdersAsSupplier, fetchProducts]);

  const analytics = useMemo(() => {
    const ordersList = orders as Order[];
    const productsById = new Map<string, Product>(
      products.map((product) => [String(product.id), product]),
    );
    const currentYear = new Date().getFullYear();

    const monthlyBuckets = MONTH_LABELS.map((month) => ({
      month,
      primaryValue: 0,
      secondaryValue: 0,
      tertiaryValue: 0,
      profit: 0,
      customerIds: new Set<string>(),
    }));

    const itemMap = new Map<
      string,
      {
        id: number;
        name: string;
        category: string;
        quantity: number;
        value: number;
      }
    >();

    const partnerMap = new Map<
      string,
      {
        id: number;
        name: string;
        location: string;
        orders: number;
        value: number;
      }
    >();

    const categoryMap = new Map<
      string,
      {
        category: string;
        value: number;
        orders: number;
      }
    >();

    ordersList.forEach((order) => {
      const createdAt = new Date(order.created_at);
      if (Number.isNaN(createdAt.getTime()) || createdAt.getFullYear() !== currentYear) {
        return;
      }

      const monthIndex = createdAt.getMonth();
      const orderValue = Number(order.total_price || 0);
      const partnerName =
        order.buyer?.business_name || order.buyer?.full_name || "Retailer";
      const partnerId = String(order.buyer_id || 0);

      monthlyBuckets[monthIndex].primaryValue += orderValue;
      monthlyBuckets[monthIndex].secondaryValue += 1;
      monthlyBuckets[monthIndex].customerIds.add(partnerId);
      monthlyBuckets[monthIndex].profit += orderValue * 0.12;

      const existingPartner = partnerMap.get(partnerId);
      partnerMap.set(partnerId, {
        id: Number(order.buyer_id || 0),
        name: partnerName,
        location: order.delivery?.dropoff_location || "Unknown",
        orders: (existingPartner?.orders || 0) + 1,
        value: (existingPartner?.value || 0) + orderValue,
      });

      const seenCategoriesForOrder = new Set<string>();

      order.items?.forEach((item) => {
        const product = item.product || productsById.get(String(item.product_id));
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unit_price || product?.price || 0);
        const itemValue = quantity * unitPrice;
        const itemId = String(item.product_id || product?.id || item.id);
        const itemName = product?.name || "Product";
        const category = product?.category || "General";

        const existingItem = itemMap.get(itemId);
        itemMap.set(itemId, {
          id: Number(product?.id || 0),
          name: itemName,
          category,
          quantity: (existingItem?.quantity || 0) + quantity,
          value: (existingItem?.value || 0) + itemValue,
        });

        const categoryEntry = categoryMap.get(category);
        categoryMap.set(category, {
          category,
          value: (categoryEntry?.value || 0) + itemValue,
          orders:
            (categoryEntry?.orders || 0) + (seenCategoriesForOrder.has(category) ? 0 : 1),
        });
        seenCategoriesForOrder.add(category);
      });
    });

    const monthlyData = monthlyBuckets.map((bucket) => ({
      month: bucket.month,
      primaryValue: bucket.primaryValue,
      secondaryValue: bucket.secondaryValue,
      tertiaryValue: bucket.customerIds.size,
      profit: bucket.profit,
    }));

    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.primaryValue, 0);
    const totalOrders = monthlyData.reduce((sum, month) => sum + month.secondaryValue, 0);
    const totalCustomers = new Set(ordersList.map((order) => String(order.buyer_id || 0))).size;

    const populatedMonths = monthlyData.filter(
      (month) => month.primaryValue > 0 || month.secondaryValue > 0 || month.tertiaryValue > 0,
    );
    const currentMonth = populatedMonths[populatedMonths.length - 1] || monthlyData[new Date().getMonth()];
    const previousMonth =
      populatedMonths[populatedMonths.length - 2] ||
      monthlyData[Math.max(0, new Date().getMonth() - 1)] ||
      currentMonth;

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return ((current - previous) / previous) * 100;
    };

    const topItems = [...itemMap.values()]
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
      .map((item) => ({
        ...item,
        growth: currentMonth.primaryValue > 0 ? (item.value / currentMonth.primaryValue) * 100 : 0,
        margin: 12,
      }));

    const topPartners = [...partnerMap.values()]
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map((partner) => ({
        ...partner,
        averageOrderValue: partner.orders > 0 ? partner.value / partner.orders : 0,
        growth: totalRevenue > 0 ? (partner.value / totalRevenue) * 100 : 0,
      }));

    const categoryData = [...categoryMap.values()]
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
      .map((category) => ({
        ...category,
        growth: totalRevenue > 0 ? (category.value / totalRevenue) * 100 : 0,
        share: totalRevenue > 0 ? (category.value / totalRevenue) * 100 : 0,
      }));

    return {
      monthlyData,
      currentMonth,
      previousMonth,
      totalRevenue,
      totalOrders,
      totalCustomers,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      revenueGrowth: calculateGrowth(currentMonth.primaryValue, previousMonth.primaryValue),
      ordersGrowth: calculateGrowth(currentMonth.secondaryValue, previousMonth.secondaryValue),
      customersGrowth: calculateGrowth(currentMonth.tertiaryValue, previousMonth.tertiaryValue),
      topItems,
      topPartners,
      categoryData,
    };
  }, [orders, products]);

  const config: AnalyticsConfig = {
    role: "distributor",
    title: "Sales Analytics",
    description: "Live sales performance based on your real distributor orders and products",
    primaryMetricLabel: "Revenue",
    secondaryMetricLabel: "Orders",
    tertiaryMetricLabel: "Customers",
    partnerLabel: "Retailers",
    partnerPath: "/retailers",
    itemLabel: "Products",
    icon: Store,
    monthlyData: analytics.monthlyData,
    topItems: analytics.topItems,
    topPartners: analytics.topPartners,
    categoryData: analytics.categoryData,
    currentMonth: analytics.currentMonth,
    previousMonth: analytics.previousMonth,
    totalPrimary: analytics.totalRevenue,
    totalSecondary: analytics.totalOrders,
    totalTertiary: analytics.totalCustomers,
    averageSecondary: analytics.avgOrderValue,
    primaryGrowth: analytics.revenueGrowth,
    secondaryGrowth: analytics.ordersGrowth,
    tertiaryGrowth: analytics.customersGrowth,
  };

  const handleExport = (
    format: "pdf" | "excel" | "csv",
    reportType: string,
  ) => {
    console.log(`Exporting ${reportType} report as ${format}`);
  };

  return <AnalyticsDashboard config={config} onExport={handleExport} />;
};

export default SalesAnalyticsPage;
