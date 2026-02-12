import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Factory,
  Warehouse,
  Store,
  BarChart3,
  TrendingUp,
  MessageSquare,
  Bell,
  Settings,
  HelpCircle,
  FileText,
  Star,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle,
  Shield,
  AlertCircle,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Mock user - will be replaced with auth
const mockUser = {
  name: "Hidaya Nurmeika",
  email: "hidaya@tradebridge.com",
  role: "admin",
  avatar: "",
  verified: true,
  joinDate: "December 2025",
  business: "ABC Retail Shop",
  rating: 4.8,
  totalOrders: 156,
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Role-specific navigation based on your documentation
const roleNavigation = {
  retailer: [
    {
      name: "Dashboard",
      href: "/retailer/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Browse Products",
      href: "/retailer/products",
      icon: Store,
      badge: "24",
    },
    { name: "Browse Suppliers", href: "/retailer/suppliers", icon: TrendingUp },
    { name: "My Orders", href: "/retailer/orders", icon: Package, badge: "5" },
    {
      name: "Shopping Cart",
      href: "/retailer/cart",
      icon: ShoppingCart,
      badge: "3",
    },
    { name: "Analytics", href: "/retailer/analytics", icon: BarChart3 },
  ],
  distributor: [
    {
      name: "Dashboard",
      href: "/distributor/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Manage Products",
      href: "/distributor/products",
      icon: Package,
      badge: "12",
    },
    {
      name: "Inventory",
      href: "/distributor/inventory",
      icon: Warehouse,
      badge: "Low Stock",
    },
    {
      name: "Incoming Orders",
      href: "/distributor/orders",
      icon: ShoppingCart,
      badge: "8",
    },
    { name: "Approve Orders", href: "/distributor/approve", icon: Shield },
    {
      name: "Broadcast Promotions",
      href: "/distributor/promotions",
      icon: TrendingUp,
    },
    {
      name: "Supplier Partnerships",
      href: "/distributor/partners",
      icon: Factory,
    },
    { name: "Delivery Management", href: "/distributor/delivery", icon: Truck },
    {
      name: "Sales Analytics",
      href: "/distributor/analytics",
      icon: BarChart3,
    },
    { name: "Export Reports", href: "/distributor/reports", icon: FileText },
  ],
  factory: [
    { name: "Dashboard", href: "/factory/dashboard", icon: LayoutDashboard },
    {
      name: "Production",
      href: "/factory/production",
      icon: Factory,
      badge: "15",
    },
    {
      name: "Order Management",
      href: "/factory/orders",
      icon: Package,
      badge: "7",
    },
    { name: "Approve Orders", href: "/factory/approve", icon: Shield },
    {
      name: "Distributor Partners",
      href: "/factory/partners",
      icon: Warehouse,
    },
    { name: "Demand Forecast", href: "/factory/forecast", icon: TrendingUp },
    { name: "Sales Reports", href: "/factory/sales", icon: BarChart3 },
    { name: "Inventory Planning", href: "/factory/inventory", icon: FileText },
    {
      name: "Broadcast Announcements",
      href: "/factory/announcements",
      icon: Bell,
    },
  ],
  driver: [
    { name: "Dashboard", href: "/driver/dashboard", icon: LayoutDashboard },
    {
      name: "Active Deliveries",
      href: "/driver/active",
      icon: Truck,
      badge: "3",
    },
    { name: "Delivery History", href: "/driver/history", icon: Package },
    { name: "Live Tracking", href: "/driver/tracking", icon: TrendingUp },
    { name: "Route Management", href: "/driver/routes", icon: Map },
    {
      name: "Report Issues",
      href: "/driver/issues",
      icon: AlertCircle,
      badge: "1",
    },
    { name: "Delivery Stats", href: "/driver/stats", icon: BarChart3 },
  ],
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users, badge: "5" },
    {
      name: "Supplier Approvals",
      href: "/admin/approve",
      icon: Shield,
      badge: "3",
    },
    { name: "Product Listings", href: "/admin/products", icon: Package },
    { name: "Order Oversight", href: "/admin/orders", icon: ShoppingCart },
    {
      name: "Dispute Management",
      href: "/admin/disputes",
      icon: HelpCircle,
      badge: "2",
    },
    { name: "Platform Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
    { name: "Payment Monitoring", href: "/admin/payments", icon: CreditCard },
  ],
};

const secondaryNavigation = [
  { name: "Messages", href: "/messages", icon: MessageSquare, badge: "2" },
  { name: "Notifications", href: "/notifications", icon: Bell, badge: "4" },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "/support", icon: HelpCircle },
];

interface DashboardSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  collapsed = false,
  onToggle,
}) => {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // For now using retailer navigation - will be dynamic with role-based routing
  const navigation = roleNavigation.factory;

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar/99 border-r border-border/40 transition-all duration-300 h-screen",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/40 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/90",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {collapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-sm">
            <span className="font-bold text-lg text-primary-foreground">
              TB
            </span>
          </div>
        ) : (
          <>
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-sm transition-transform group-hover:scale-105">
                <span className="font-bold text-lg text-primary-foreground">
                  TB
                </span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                TradeBridge
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={onToggle}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* User Profile Section */}
      <div
        className={cn(
          "border-b border-border/40 bg-gradient-to-br from-sidebar/90 via-sidebar/85 to-sidebar",
          collapsed ? "p-3" : "p-4",
        )}
      >
        {collapsed ? (
          <div className="flex justify-center">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10 ring-offset-2 ring-offset-sidebar transition-all hover:ring-primary/30">
              <AvatarImage src={mockUser.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(mockUser.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex w-full items-center gap-3 rounded-lg p-2 transition-all hover:bg-accent/50 group"
            >
              <Avatar className="h-10 w-10 ring-2 ring-primary/10 ring-offset-2 ring-offset-sidebar">
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(mockUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold leading-none">
                  {mockUser.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockUser.business}
                </p>
              </div>
            </button>

            {isProfileOpen && (
              <div className="space-y-2 px-2 pt-1 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className="px-2 py-0.5 text-[11px] font-medium bg-primary/5"
                    >
                      {mockUser.role}
                    </Badge>
                    {mockUser.verified && (
                      <Badge
                        variant="outline"
                        className="px-2 py-0.5 text-[11px] border-green-200 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
                      >
                        Verified
                      </Badge>
                    )}
                  </div>
                  <span className="flex items-center text-xs font-medium">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                    {mockUser.rating}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-md bg-muted/50 px-2 py-1.5">
                    <p className="text-[10px] text-muted-foreground">Orders</p>
                    <p className="text-xs font-semibold">
                      {mockUser.totalOrders}
                    </p>
                  </div>
                  <div className="rounded-md bg-muted/50 px-2 py-1.5">
                    <p className="text-[10px] text-muted-foreground">Joined</p>
                    <p className="text-xs font-semibold">{mockUser.joinDate}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 min-h-0">
        <div className={cn("space-y-4", collapsed ? "px-2 py-4" : "px-3 py-4")}>
          <div className="space-y-0.5">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "secondary" : "ghost"}
                size={collapsed ? "icon" : "default"}
                className={cn(
                  "group relative transition-all",
                  collapsed
                    ? "h-10 w-10 mx-auto hover:bg-accent"
                    : "w-full justify-start px-3",
                  !collapsed && "hover:translate-x-0.5",
                  isActive(item.href) &&
                    !collapsed &&
                    "bg-primary/10 text-primary hover:bg-primary/15",
                  isActive(item.href) &&
                    collapsed &&
                    "bg-primary/10 text-primary hover:bg-primary/15",
                )}
                asChild
              >
                <Link to={item.href}>
                  {!collapsed && isActive(item.href) && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <div
                    className={cn(
                      "flex items-center",
                      collapsed ? "justify-center" : "justify-between w-full",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive(item.href)
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      {!collapsed && (
                        <span
                          className={cn(
                            "text-sm transition-colors",
                            isActive(item.href) ? "font-medium" : "font-normal",
                          )}
                        >
                          {item.name}
                        </span>
                      )}
                    </div>
                    {!collapsed && item.badge && (
                      <Badge
                        variant={isActive(item.href) ? "default" : "secondary"}
                        className={cn(
                          "ml-auto text-[10px] px-1.5 py-0.5 font-medium",
                          item.badge === "Low Stock" &&
                            "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800",
                          isActive(item.href) &&
                            item.badge !== "Low Stock" &&
                            "bg-primary text-primary-foreground",
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              </Button>
            ))}
          </div>

          <Separator className="bg-border/50" />

          {/* Secondary Navigation */}
          <div className="space-y-0.5">
            {!collapsed && (
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Support
              </p>
            )}
            {secondaryNavigation.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "secondary" : "ghost"}
                size={collapsed ? "icon" : "default"}
                className={cn(
                  "group relative transition-all",
                  collapsed
                    ? "h-10 w-10 mx-auto hover:bg-accent"
                    : "w-full justify-start px-3",
                  isActive(item.href) &&
                    !collapsed &&
                    "bg-primary/10 text-primary hover:bg-primary/15",
                )}
                asChild
              >
                <Link to={item.href}>
                  <div
                    className={cn(
                      "flex items-center",
                      collapsed ? "justify-center" : "justify-between w-full",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      {!collapsed && (
                        <span className="text-sm">{item.name}</span>
                      )}
                    </div>
                    {!collapsed && item.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-auto text-[10px] px-1.5 py-0.5 font-medium"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              </Button>
            ))}
          </div>

          {/* Quick Stats Card - Enhanced */}
          {!collapsed && (
            <div className="mt-6 rounded-xl bg-gradient-to-br from-primary/5 via-primary/5 to-primary/10 p-4 border border-primary/10 shadow-sm">
              <h4 className="text-xs font-semibold mb-3 flex items-center text-foreground/80">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Performance
              </h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Order Fulfillment
                    </span>
                    <span className="font-medium text-foreground">92%</span>
                  </div>
                  <Progress
                    value={92}
                    className="h-1.5 bg-primary/10 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/80"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      On-time Delivery
                    </span>
                    <span className="font-medium text-foreground">88%</span>
                  </div>
                  <Progress
                    value={88}
                    className="h-1.5 bg-primary/10 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/80"
                  />
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-primary/10">
                  <span className="text-xs text-muted-foreground">
                    Monthly Spend
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    ETB 45.2K
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-border/40 bg-gradient-to-t from-sidebar/90 to-sidebar",
          collapsed ? "p-3" : "p-4",
        )}
      >
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 mx-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            asChild
          >
            <Link to="/logout">
              <LogOut className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors group"
              asChild
            >
              <Link to="/logout">
                <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                Logout
              </Link>
            </Button>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground/60">
                © 2026 TradeBridge
              </p>
              <span className="text-[10px] font-medium text-muted-foreground/60 px-1.5 py-0.5 bg-sidebar/90 rounded">
                v2.0
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;
