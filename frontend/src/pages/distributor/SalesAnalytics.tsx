import React from "react";
import {
  AnalyticsDashboard,
  type AnalyticsConfig,
} from "@/components/shared/AnalyticsDashboard";
import { Store } from "lucide-react";

// ============================================================================
// MOCK DATA
// ============================================================================

const monthlyData = [
  {
    month: "Jan",
    primaryValue: 420000,
    secondaryValue: 45,
    tertiaryValue: 28,
    profit: 63000,
  },
  {
    month: "Feb",
    primaryValue: 480000,
    secondaryValue: 52,
    tertiaryValue: 32,
    profit: 72000,
  },
  {
    month: "Mar",
    primaryValue: 510000,
    secondaryValue: 58,
    tertiaryValue: 35,
    profit: 76500,
  },
  {
    month: "Apr",
    primaryValue: 540000,
    secondaryValue: 62,
    tertiaryValue: 38,
    profit: 81000,
  },
  {
    month: "May",
    primaryValue: 590000,
    secondaryValue: 68,
    tertiaryValue: 42,
    profit: 88500,
  },
  {
    month: "Jun",
    primaryValue: 620000,
    secondaryValue: 72,
    tertiaryValue: 45,
    profit: 93000,
  },
  {
    month: "Jul",
    primaryValue: 680000,
    secondaryValue: 78,
    tertiaryValue: 48,
    profit: 102000,
  },
  {
    month: "Aug",
    primaryValue: 720000,
    secondaryValue: 84,
    tertiaryValue: 52,
    profit: 108000,
  },
  {
    month: "Sep",
    primaryValue: 780000,
    secondaryValue: 91,
    tertiaryValue: 56,
    profit: 117000,
  },
  {
    month: "Oct",
    primaryValue: 820000,
    secondaryValue: 96,
    tertiaryValue: 60,
    profit: 123000,
  },
  {
    month: "Nov",
    primaryValue: 840000,
    secondaryValue: 98,
    tertiaryValue: 62,
    profit: 126000,
  },
  {
    month: "Dec",
    primaryValue: 845000,
    secondaryValue: 99,
    tertiaryValue: 63,
    profit: 126750,
  },
];

const topProducts = [
  {
    id: 1,
    name: "White Teff Flour",
    category: "Grains",
    quantity: 3450,
    value: 414000,
    growth: 12.5,
    margin: 18.5,
  },
  {
    id: 2,
    name: "Cement",
    category: "Construction",
    quantity: 1850,
    value: 1147000,
    growth: 8.2,
    margin: 15.2,
  },
  {
    id: 3,
    name: "Yirgacheffe Coffee",
    category: "Beverages",
    quantity: 1250,
    value: 562500,
    growth: 15.8,
    margin: 22.5,
  },
  {
    id: 4,
    name: "Steel Rebars",
    category: "Construction",
    quantity: 180,
    value: 1530000,
    growth: 5.6,
    margin: 12.8,
  },
  {
    id: 5,
    name: "Soybean Oil",
    category: "Food",
    quantity: 5200,
    value: 936000,
    growth: 10.2,
    margin: 14.5,
  },
  {
    id: 6,
    name: "Tomato Paste",
    category: "Food",
    quantity: 8900,
    value: 756500,
    growth: 7.8,
    margin: 11.2,
  },
  {
    id: 7,
    name: "Notebooks",
    category: "Stationery",
    quantity: 12500,
    value: 562500,
    growth: 18.2,
    margin: 25.5,
  },
  {
    id: 8,
    name: "Plastic Chairs",
    category: "Furniture",
    quantity: 850,
    value: 382500,
    growth: 4.5,
    margin: 20.8,
  },
];

const topRetailers = [
  {
    id: 201,
    name: "ABC Retail Shop",
    location: "Adama",
    orders: 45,
    value: 385000,
    averageOrderValue: 8556,
    growth: 15.2,
  },
  {
    id: 202,
    name: "Mega Mart",
    location: "Addis Ababa",
    orders: 38,
    value: 412000,
    averageOrderValue: 10842,
    growth: 12.8,
  },
  {
    id: 203,
    name: "City Supermarket",
    location: "Adama",
    orders: 32,
    value: 298000,
    averageOrderValue: 9313,
    growth: 8.5,
  },
  {
    id: 204,
    name: "Addis Mart",
    location: "Addis Ababa",
    orders: 29,
    value: 275000,
    averageOrderValue: 9483,
    growth: 10.2,
  },
  {
    id: 205,
    name: "Bole Superstore",
    location: "Addis Ababa",
    orders: 26,
    value: 312000,
    averageOrderValue: 12000,
    growth: 18.5,
  },
  {
    id: 206,
    name: "Hawassa Wholesale",
    location: "Hawassa",
    orders: 22,
    value: 189000,
    averageOrderValue: 8591,
    growth: 6.5,
  },
];

const categoryData = [
  {
    category: "Construction",
    value: 2677000,
    orders: 245,
    growth: 7.8,
    share: 32.5,
  },
  { category: "Food", value: 1692500, orders: 312, growth: 9.2, share: 20.5 },
  {
    category: "Beverages",
    value: 562500,
    orders: 98,
    growth: 15.8,
    share: 6.8,
  },
  { category: "Grains", value: 414000, orders: 76, growth: 12.5, share: 5.0 },
  {
    category: "Stationery",
    value: 562500,
    orders: 145,
    growth: 18.2,
    share: 6.8,
  },
  { category: "Furniture", value: 382500, orders: 52, growth: 4.5, share: 4.6 },
  { category: "Textiles", value: 736000, orders: 38, growth: 3.2, share: 8.9 },
  { category: "Household", value: 382500, orders: 41, growth: 5.5, share: 4.6 },
];

const SalesAnalyticsPage: React.FC = () => {
  // Calculate summary stats
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];

  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.primaryValue, 0);
  const totalOrders = monthlyData.reduce((sum, m) => sum + m.secondaryValue, 0);
  const totalCustomers = monthlyData.reduce(
    (sum, m) => sum + m.tertiaryValue,
    0,
  );
  const avgOrderValue = totalRevenue / totalOrders;

  const revenueGrowth =
    ((currentMonth.primaryValue - previousMonth.primaryValue) /
      previousMonth.primaryValue) *
    100;
  const ordersGrowth =
    ((currentMonth.secondaryValue - previousMonth.secondaryValue) /
      previousMonth.secondaryValue) *
    100;
  const customersGrowth =
    ((currentMonth.tertiaryValue - previousMonth.tertiaryValue) /
      previousMonth.tertiaryValue) *
    100;

  const config: AnalyticsConfig = {
    role: "distributor",
    title: "Sales Analytics",
    description: "Comprehensive sales performance, trends, and insights",

    // Labels
    primaryMetricLabel: "Revenue",
    secondaryMetricLabel: "Orders",
    tertiaryMetricLabel: "Customers",
    partnerLabel: "Retailers",
    partnerPath: "/retailers",
    itemLabel: "Products",

    // Icons
    icon: Store,

    // Data
    monthlyData,
    topItems: topProducts,
    topPartners: topRetailers,
    categoryData,

    // Stats
    currentMonth,
    previousMonth,
    totalPrimary: totalRevenue,
    totalSecondary: totalOrders,
    totalTertiary: totalCustomers,
    averageSecondary: avgOrderValue,

    // Growth
    primaryGrowth: revenueGrowth,
    secondaryGrowth: ordersGrowth,
    tertiaryGrowth: customersGrowth,
  };

  const handleExport = (
    format: "pdf" | "excel" | "csv",
    reportType: string,
  ) => {
    console.log(`Exporting ${reportType} report as ${format}`);
    // API call would go here
  };

  return <AnalyticsDashboard config={config} onExport={handleExport} />;
};

export default SalesAnalyticsPage;
