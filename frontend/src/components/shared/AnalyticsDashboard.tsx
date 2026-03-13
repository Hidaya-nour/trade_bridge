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

export interface TopItem {
  id: number;
  name: string;
  category: string;
  quantity: number; // Units sold or produced
  value: number; // Revenue or production value
  growth: number;
  margin?: number; // Optional for factory
}

export interface TopPartner {
  id: number;
  name: string;
  location: string;
  orders: number; // Orders placed or received
  value: number; // Revenue from or to partner
  averageOrderValue: number;
  growth: number;
}

export interface CategoryData {
  category: string;
  value: number; // Revenue or production value
  orders: number; // Orders or batches
  growth: number;
  share: number;
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
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
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
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Email Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={`Total ${config.primaryMetricLabel}`}
          value={formatPrice(config.totalPrimary)}
          change={formatPercentage(config.primaryGrowth)}
          trend={config.primaryGrowth > 0 ? "up" : "down"}
          icon={DollarSign}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />

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

      {/* Category Performance & Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Performance */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
            <CardDescription>
              {config.primaryMetricLabel} distribution across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {config.categoryData.slice(0, 6).map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: [
                            "#3b82f6",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#8b5cf6",
                            "#ec4899",
                          ][index % 6],
                        }}
                      />
                      <span className="text-sm font-medium">
                        {category.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {formatCompactPrice(category.value)}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {category.share}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={category.share} className="h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {category.orders}{" "}
                      {config.role === "distributor" ? "orders" : "batches"}
                    </span>
                    <span
                      className={
                        category.growth > 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {category.growth > 0 ? "+" : ""}
                      {category.growth}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top {config.itemLabel}</CardTitle>
            <CardDescription>
              Best performing {config.itemLabel.toLowerCase()} by{" "}
              {config.primaryMetricLabel.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {config.topItems.slice(0, 5).map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-sm font-semibold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {item.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.quantity.toLocaleString()} units
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCompactPrice(item.value)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {item.growth > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={cn(
                          "text-xs font-medium",
                          item.growth > 0 ? "text-green-600" : "text-red-600",
                        )}
                      >
                        {item.growth > 0 ? "+" : ""}
                        {item.growth}%
                      </span>
                    </div>
                    {item.margin && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Margin: {item.margin}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Partners & Monthly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Partners */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top {config.partnerLabel}</CardTitle>
            <CardDescription>
              Highest{" "}
              {config.role === "distributor" ? "revenue generating" : "value"}{" "}
              {config.partnerLabel.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{config.partnerLabel.slice(0, -1)}</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">
                    {config.role === "distributor" ? "Orders" : "Batches"}
                  </TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.topPartners.map((partner) => (
                  <TableRow
                    key={partner.id}
                    className="cursor-pointer hover:bg-accent/50"
                  >
                    <TableCell className="font-medium">
                      <Link
                        to={`/${config.role}${config.partnerPath}/${partner.id}`}
                        className="hover:text-primary"
                      >
                        {partner.name}
                      </Link>
                    </TableCell>
                    <TableCell>{partner.location}</TableCell>
                    <TableCell className="text-right">
                      {partner.orders}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCompactPrice(partner.value)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          partner.growth > 0
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
                        {partner.growth > 0 ? "+" : ""}
                        {partner.growth}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {config.primaryMetricLabel}
                </span>
                <span className="text-lg font-bold">
                  {formatPrice(config.currentMonth.primaryValue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {config.secondaryMetricLabel}
                </span>
                <span className="text-lg font-bold">
                  {config.currentMonth.secondaryValue}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {config.tertiaryMetricLabel}
                </span>
                <span className="text-lg font-bold">
                  {config.currentMonth.tertiaryValue}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Avg. {config.secondaryMetricLabel}
                </span>
                <span className="text-lg font-bold">
                  {formatPrice(
                    config.currentMonth.primaryValue /
                      config.currentMonth.secondaryValue,
                  )}
                </span>
              </div>
              <Separator />
              {config.currentMonth.profit && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Profit Margin</span>
                    <span className="text-lg font-bold text-green-600">
                      {(
                        (config.currentMonth.profit /
                          config.currentMonth.primaryValue) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Estimated Profit
                    </span>
                    <span className="text-base font-semibold">
                      {formatPrice(config.currentMonth.profit)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4">
              <h4 className="text-xs font-semibold mb-3 flex items-center">
                <Award className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Achievements
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">
                    {config.primaryMetricLabel} target:{" "}
                    <span className="font-medium text-foreground">
                      {Math.round(
                        (config.currentMonth.primaryValue / 1000000) * 100,
                      )}
                      %
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground">
                    {config.partnerLabel} retention:{" "}
                    <span className="font-medium text-foreground">94%</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    On-time delivery:{" "}
                    <span className="font-medium text-foreground">98%</span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options Bar */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Export Reports</h4>
                <p className="text-xs text-muted-foreground">
                  Download detailed analytics in your preferred format
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport("pdf", "summary")}
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF Summary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport("excel", "detailed")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Excel Report
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport("csv", "complete")}
              >
                <FileText className="h-4 w-4 mr-2" />
                CSV Data
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Mail className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
