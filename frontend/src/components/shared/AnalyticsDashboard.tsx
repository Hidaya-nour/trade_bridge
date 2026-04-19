import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Store,
  Calendar,
  Download,
  ChevronDown,
  ChevronRight,
  Star,
  Truck,
  Clock,
  Award,
  Target,
  FileText,
  Printer,
  Mail,
  Factory,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import { StatsCard } from "@/components";
import {
  formatPrice,
  formatCompactPrice,
  formatPercentage,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type AnalyticsRole = "distributor" | "factory";

export interface MonthlyData {
  month: string;
  primaryValue: number; // Revenue for distributor, Production value for factory
  secondaryValue: number; // Orders for distributor, Units produced for factory
  tertiaryValue: number; // Customers for distributor, Efficiency for factory
  profit?: number; // Profit margin (optional for factory)
}

export interface AnalyticsConfig {
  role: AnalyticsRole;
  title: string;
  description: string;

  // Labels
  primaryMetricLabel: string; // "Revenue" or "Production Value"
  secondaryMetricLabel: string; // "Orders" or "Units Produced"
  tertiaryMetricLabel: string; // "Customers" or "Efficiency"
  partnerLabel: string; // "Retailers" or "Distributors"
  partnerPath: string; // "/retailers" or "/distributors"
  itemLabel: string; // "Products" or "Products" (same)

  // Icons
  icon: React.ElementType; // Store or Factory

  // Data
  monthlyData: MonthlyData[];
  topItems: TopItem[];
  topPartners: TopPartner[];
  categoryData: CategoryData[];

  // Stats
  currentMonth: MonthlyData;
  previousMonth: MonthlyData;
  totalPrimary: number;
  totalSecondary: number;
  totalTertiary: number;
  averageSecondary: number;

  // Growth calculations
  primaryGrowth: number;
  secondaryGrowth: number;
  tertiaryGrowth: number;
}

// ============================================================================
// PROPS
// ============================================================================

interface AnalyticsDashboardProps {
  config: AnalyticsConfig;
  onExport: (format: "pdf" | "excel" | "csv", reportType: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  config,
  onExport,
}) => {
  const [dateRange, setDateRange] = useState("year");
  const [selectedView, setSelectedView] = useState("primary");

  const PartnerIcon = config.icon;

  // Calculate max values for dynamic chart scaling
  const maxPrimary = Math.max(...config.monthlyData.map((m) => m.primaryValue));
  const maxSecondary = Math.max(
    ...config.monthlyData.map((m) => m.secondaryValue),
  );
  const maxTertiary = Math.max(
    ...config.monthlyData.map((m) => m.tertiaryValue),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {config.title}
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Real-time
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{config.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Dropdown */}
          <DropdownMenu>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Export Report</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport("pdf", "summary")}>
                <FileText className="h-4 w-4 mr-2" />
                Summary (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("excel", "detailed")}>
                <FileText className="h-4 w-4 mr-2" />
                Detailed Report (Excel)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("csv", "items")}>
                <FileText className="h-4 w-4 mr-2" />
                {config.itemLabel} Performance (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("csv", "partners")}>
                <FileText className="h-4 w-4 mr-2" />
                {config.partnerLabel} Analysis (CSV)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open(
                    "mailto:?subject=Analytics Report&body=Please find the analytics report attached.",
                  )
                }
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title={`Total ${config.secondaryMetricLabel}`}
          value={config.totalSecondary.toLocaleString()}
          change={formatPercentage(config.secondaryGrowth)}
          trend={config.secondaryGrowth > 0 ? "up" : "down"}
          icon={config.role === "distributor" ? ShoppingCart : Package}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        <StatsCard
          title={`Active ${config.tertiaryMetricLabel}`}
          value={config.totalTertiary.toLocaleString()}
          change={formatPercentage(config.tertiaryGrowth)}
          trend={config.tertiaryGrowth > 0 ? "up" : "down"}
          icon={config.role === "distributor" ? Store : Users}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        <StatsCard
          title={`Avg. ${config.secondaryMetricLabel}`}
          value={formatPrice(config.averageSecondary)}
          change="+5.2%"
          trend="up"
          icon={Target}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* Chart - FIXED with dynamic scaling */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>{config.primaryMetricLabel} Overview</CardTitle>
            <CardDescription>
              Monthly {config.primaryMetricLabel.toLowerCase()} and{" "}
              {config.secondaryMetricLabel.toLowerCase()} trends
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedView} onValueChange={setSelectedView}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">
                  {config.primaryMetricLabel}
                </SelectItem>
                <SelectItem value="secondary">
                  {config.secondaryMetricLabel}
                </SelectItem>
                <SelectItem value="tertiary">
                  {config.tertiaryMetricLabel}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-end justify-between gap-2">
            {config.monthlyData.map((month, index) => {
              let height = 0;
              let color = "";
              let displayValue = "";

              if (selectedView === "primary") {
                height =
                  maxPrimary > 0 ? (month.primaryValue / maxPrimary) * 250 : 30;
                color = "from-primary to-primary/70";
                displayValue = formatCompactPrice(month.primaryValue);
              } else if (selectedView === "secondary") {
                height =
                  maxSecondary > 0
                    ? (month.secondaryValue / maxSecondary) * 250
                    : 30;
                color = "from-blue-500 to-blue-400";
                displayValue = `${month.secondaryValue} ${config.role === "distributor" ? "orders" : "units"}`;
              } else {
                height =
                  maxTertiary > 0
                    ? (month.tertiaryValue / maxTertiary) * 250
                    : 30;
                color = "from-purple-500 to-purple-400";
                displayValue = `${month.tertiaryValue} ${config.role === "distributor" ? "cust" : "%"}`;
              }

              return (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1 group"
                >
                  <div className="relative w-full px-1">
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-all duration-300 hover:opacity-90 bg-gradient-to-t",
                        color,
                      )}
                      style={{ height: `${Math.max(30, height)}px` }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none shadow-md">
                      {selectedView === "primary" &&
                        formatCompactPrice(month.primaryValue)}
                      {selectedView === "secondary" &&
                        `${month.secondaryValue} ${config.role === "distributor" ? "orders" : "units"}`}
                      {selectedView === "tertiary" &&
                        `${month.tertiaryValue}${config.role === "distributor" ? " customers" : "% efficiency"}`}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-3 font-medium">
                    {month.month}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {displayValue}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">
                {config.primaryMetricLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-xs text-muted-foreground">
                {config.secondaryMetricLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span className="text-xs text-muted-foreground">
                {config.tertiaryMetricLabel}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
