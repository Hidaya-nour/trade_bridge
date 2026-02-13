import React from "react";
import {
  AnalyticsDashboard,
  type AnalyticsConfig,
} from "@/components/shared/AnalyticsDashboard";
import { Factory } from "lucide-react";

// ============================================================================
// MOCK DATA
// ============================================================================

const monthlyData = [
  {
    month: "Jan",
    primaryValue: 12450000,
    secondaryValue: 245,
    tertiaryValue: 78,
    profit: 1867500,
  },
  {
    month: "Feb",
    primaryValue: 13200000,
    secondaryValue: 268,
    tertiaryValue: 81,
    profit: 1980000,
  },
  {
    month: "Mar",
    primaryValue: 14100000,
    secondaryValue: 285,
    tertiaryValue: 79,
    profit: 2115000,
  },
  {
    month: "Apr",
    primaryValue: 13800000,
    secondaryValue: 276,
    tertiaryValue: 82,
    profit: 2070000,
  },
  {
    month: "May",
    primaryValue: 15200000,
    secondaryValue: 298,
    tertiaryValue: 84,
    profit: 2280000,
  },
  {
    month: "Jun",
    primaryValue: 15800000,
    secondaryValue: 312,
    tertiaryValue: 83,
    profit: 2370000,
  },
  {
    month: "Jul",
    primaryValue: 16500000,
    secondaryValue: 325,
    tertiaryValue: 85,
    profit: 2475000,
  },
  {
    month: "Aug",
    primaryValue: 17100000,
    secondaryValue: 338,
    tertiaryValue: 86,
    profit: 2565000,
  },
  {
    month: "Sep",
    primaryValue: 16800000,
    secondaryValue: 342,
    tertiaryValue: 87,
    profit: 2520000,
  },
  {
    month: "Oct",
    primaryValue: 17500000,
    secondaryValue: 351,
    tertiaryValue: 88,
    profit: 2625000,
  },
  {
    month: "Nov",
    primaryValue: 18200000,
    secondaryValue: 365,
    tertiaryValue: 89,
    profit: 2730000,
  },
  {
    month: "Dec",
    primaryValue: 18900000,
    secondaryValue: 378,
    tertiaryValue: 91,
    profit: 2835000,
  },
];

const topProducts = [
  {
    id: 1001,
    name: "Portland Cement",
    category: "Construction",
    quantity: 12500,
    value: 6500000,
    growth: 12.5,
    margin: 18.5,
  },
  {
    id: 1002,
    name: "Steel Rebars 12mm",
    category: "Construction",
    quantity: 230,
    value: 1725000,
    growth: 8.2,
    margin: 15.2,
  },
  {
    id: 1004,
    name: "Yirgacheffe Coffee",
    category: "Beverages",
    quantity: 5200,
    value: 1976000,
    growth: 15.8,
    margin: 22.5,
  },
  {
    id: 1005,
    name: "White Teff Grain",
    category: "Food",
    quantity: 25000,
    value: 2375000,
    growth: 10.2,
    margin: 14.5,
  },
  {
    id: 1006,
    name: "Cotton Fabric",
    category: "Textiles",
    quantity: 8000,
    value: 2240000,
    growth: 7.8,
    margin: 11.2,
  },
  {
    id: 1008,
    name: "Macadamia Nuts",
    category: "Food",
    quantity: 3200,
    value: 1856000,
    growth: 18.2,
    margin: 25.5,
  },
];

const topDistributors = [
  {
    id: 102,
    name: "Adama Wholesalers",
    location: "Adama",
    orders: 45,
    value: 1250000,
    averageOrderValue: 27778,
    growth: 15.2,
  },
  {
    id: 101,
    name: "Ethiopia Coffee Export",
    location: "Addis Ababa",
    orders: 38,
    value: 980000,
    averageOrderValue: 25789,
    growth: 12.8,
  },
  {
    id: 105,
    name: "Mekelle Steel Distributors",
    location: "Mekelle",
    orders: 32,
    value: 2450000,
    averageOrderValue: 76563,
    growth: 8.5,
  },
  {
    id: 108,
    name: "Dire Dawa Trading",
    location: "Dire Dawa",
    orders: 28,
    value: 820000,
    averageOrderValue: 29286,
    growth: 10.2,
  },
  {
    id: 106,
    name: "Adama Plastics",
    location: "Adama",
    orders: 24,
    value: 450000,
    averageOrderValue: 18750,
    growth: 6.5,
  },
];

const categoryData = [
  {
    category: "Construction",
    value: 8225000,
    orders: 345,
    growth: 7.8,
    share: 42.5,
  },
  { category: "Food", value: 4231000, orders: 212, growth: 9.2, share: 21.8 },
  {
    category: "Beverages",
    value: 1976000,
    orders: 98,
    growth: 15.8,
    share: 10.2,
  },
  {
    category: "Textiles",
    value: 2240000,
    orders: 76,
    growth: 3.2,
    share: 11.6,
  },
  {
    category: "Raw Materials",
    value: 1856000,
    orders: 52,
    growth: 4.5,
    share: 9.6,
  },
  { category: "Packaging", value: 820000, orders: 41, growth: 5.5, share: 4.3 },
];

const ProductionAnalyticsPage: React.FC = () => {
  // Calculate summary stats
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];

  const totalValue = monthlyData.reduce((sum, m) => sum + m.primaryValue, 0);
  const totalBatches = monthlyData.reduce(
    (sum, m) => sum + m.secondaryValue,
    0,
  );
  const avgEfficiency =
    monthlyData.reduce((sum, m) => sum + m.tertiaryValue, 0) /
    monthlyData.length;
  const avgBatchValue = totalValue / totalBatches;

  const valueGrowth =
    ((currentMonth.primaryValue - previousMonth.primaryValue) /
      previousMonth.primaryValue) *
    100;
  const batchesGrowth =
    ((currentMonth.secondaryValue - previousMonth.secondaryValue) /
      previousMonth.secondaryValue) *
    100;
  const efficiencyGrowth =
    ((currentMonth.tertiaryValue - previousMonth.tertiaryValue) /
      previousMonth.tertiaryValue) *
    100;

  const config: AnalyticsConfig = {
    role: "factory",
    title: "Production Analytics",
    description: "Comprehensive production performance, trends, and insights",

    // Labels
    primaryMetricLabel: "Production Value",
    secondaryMetricLabel: "Batches",
    tertiaryMetricLabel: "Efficiency %",
    partnerLabel: "Distributors",
    partnerPath: "/distributors",
    itemLabel: "Products",

    // Icons
    icon: Factory,

    // Data
    monthlyData,
    topItems: topProducts,
    topPartners: topDistributors,
    categoryData,

    // Stats
    currentMonth,
    previousMonth,
    totalPrimary: totalValue,
    totalSecondary: totalBatches,
    totalTertiary: Math.round(avgEfficiency),
    averageSecondary: avgBatchValue,

    // Growth
    primaryGrowth: valueGrowth,
    secondaryGrowth: batchesGrowth,
    tertiaryGrowth: efficiencyGrowth,
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

export default ProductionAnalyticsPage;
