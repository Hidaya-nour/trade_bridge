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
  role: "retailer",
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
    { name: "Dashboard", href: "/retailer/dashboard", icon: LayoutDashboard, exact: true },
    { name: "Browse Products", href: "/retailer/products", icon: Store, badge: "24" },
    { name: "Compare Suppliers", href: "/retailer/compare", icon: TrendingUp },
    { name: "Shopping Cart", href: "/retailer/cart", icon: ShoppingCart, badge: "3" },
    { name: "My Orders", href: "/retailer/orders", icon: Package, badge: "5" },
    { name: "Order Tracking", href: "/retailer/tracking", icon: Truck },
    { name: "Supplier Directory", href: "/retailer/suppliers", icon: Users },
    { name: "Ratings & Reviews", href: "/retailer/reviews", icon: Star },
    { name: "Reorder Items", href: "/retailer/reorder", icon: FileText },
    { name: "Analytics", href: "/retailer/analytics", icon: BarChart3 },
  ],
  distributor: [
    { name: "Dashboard", href: "/distributor/dashboard", icon: LayoutDashboard },
    { name: "Manage Products", href: "/distributor/products", icon: Package, badge: "12" },
    { name: "Inventory", href: "/distributor/inventory", icon: Warehouse, badge: "Low Stock" },
    { name: "Incoming Orders", href: "/distributor/orders", icon: ShoppingCart, badge: "8" },
    { name: "Approve Orders", href: "/distributor/approve", icon: Shield },
    { name: "Broadcast Promotions", href: "/distributor/promotions", icon: TrendingUp },
    { name: "Supplier Partnerships", href: "/distributor/partners", icon: Factory },
    { name: "Delivery Management", href: "/distributor/delivery", icon: Truck },
    { name: "Sales Analytics", href: "/distributor/analytics", icon: BarChart3 },
    { name: "Export Reports", href: "/distributor/reports", icon: FileText },
  ],
  factory: [
    { name: "Dashboard", href: "/factory/dashboard", icon: LayoutDashboard },
    { name: "Production", href: "/factory/production", icon: Factory, badge: "15" },
    { name: "Order Management", href: "/factory/orders", icon: Package, badge: "7" },
    { name: "Approve Orders", href: "/factory/approve", icon: Shield },
    { name: "Distributor Partners", href: "/factory/partners", icon: Warehouse },
    { name: "Demand Forecast", href: "/factory/forecast", icon: TrendingUp },
    { name: "Sales Reports", href: "/factory/sales", icon: BarChart3 },
    { name: "Inventory Planning", href: "/factory/inventory", icon: FileText },
    { name: "Broadcast Announcements", href: "/factory/announcements", icon: Bell },
  ],
  driver: [
    { name: "Dashboard", href: "/driver/dashboard", icon: LayoutDashboard },
    { name: "Active Deliveries", href: "/driver/active", icon: Truck, badge: "3" },
    { name: "Delivery History", href: "/driver/history", icon: Package },
    { name: "Live Tracking", href: "/driver/tracking", icon: TrendingUp },
    { name: "Route Management", href: "/driver/routes", icon: Map },
    { name: "Report Issues", href: "/driver/issues", icon: AlertCircle, badge: "1" },
    { name: "Delivery Stats", href: "/driver/stats", icon: BarChart3 },
  ],
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users, badge: "5" },
    { name: "Supplier Approvals", href: "/admin/approve", icon: Shield, badge: "3" },
    { name: "Product Listings", href: "/admin/products", icon: Package },
    { name: "Order Oversight", href: "/admin/orders", icon: ShoppingCart },
    { name: "Dispute Management", href: "/admin/disputes", icon: HelpCircle, badge: "2" },
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
  onToggle 
}) => {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(true);
  
  // For now using retailer navigation - will be dynamic with role-based routing
  const navigation = roleNavigation.retailer;

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    
    <div className={cn(
"flex flex-col bg-card transition-all duration-300 h-screen",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* User Profile Section - Enhanced */}
      <div className={cn(
        "border-b bg-gradient-to-br from-muted/50 to-muted",
        collapsed ? "p-3" : "p-4"
      )}>
        {collapsed ? (
          <div className="flex justify-center">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={mockUser.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(mockUser.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex w-full items-center justify-between hover:bg-accent/50 rounded-lg p-2 transition-all"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 ring-2 ring-primary/20 ring-offset-2">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    {getInitials(mockUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-semibold">{mockUser.name}</p>
                    {mockUser.verified && (
                      <Badge variant="outline" className="h-4 px-1 text-[10px] bg-primary/10">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{mockUser.email}</p>
                </div>
              </div>
            </button>
            
            {isProfileOpen && (
              <div className="mt-3 space-y-2 px-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Business</span>
                  <span className="font-medium">{mockUser.business}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium flex items-center">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                    {mockUser.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Orders</span>
                  <span className="font-medium">{mockUser.totalOrders}</span>
                </div>
                <Separator className="my-2" />
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link to="/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    View Profile
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 min-h-0">
        <div className={cn("space-y-4", collapsed ? "px-2 py-4" : "px-3 py-4")}>
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Main Menu
              </p>
            )}
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "secondary" : "ghost"}
                size={collapsed ? "icon" : "default"}
                className={cn(
                  "w-full transition-all",
                  collapsed ? "h-10 w-10 mx-auto" : "justify-start",
                  isActive(item.href) && "bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary"
                )}
                asChild
              >
                <Link to={item.href}>
                  <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between w-full")}>
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "h-4 w-4",
                        isActive(item.href) ? "text-primary" : "text-muted-foreground"
                      )} />
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && item.badge && (
                      <Badge 
                        variant={isActive(item.href) ? "default" : "secondary"}
                        className={cn(
                          "ml-auto text-xs",
                          item.badge === "Low Stock" && "bg-amber-100 text-amber-700"
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

          <Separator />

          {/* Secondary Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Support
              </p>
            )}
            {secondaryNavigation.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "secondary" : "ghost"}
                size={collapsed ? "icon" : "default"}
                className={cn(
                  "w-full",
                  collapsed ? "h-10 w-10 mx-auto" : "justify-start"
                )}
                asChild
              >
                <Link to={item.href}>
                  <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between w-full")}>
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && item.badge && (
                      <Badge variant="secondary" className="ml-auto">
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
            <div className="mt-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                Performance
              </h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Order Fulfillment</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">On-time Delivery</span>
                    <span className="font-medium">88%</span>
                  </div>
                  <Progress value={88} className="h-1.5" />
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-muted-foreground">Monthly Spend</span>
                  <span className="font-medium">ETB 45,200</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className={cn(
        "border-t bg-muted/30",
        collapsed ? "p-3" : "p-4"
      )}>
        {collapsed ? (
          <Button variant="ghost" size="icon" className="h-10 w-10 mx-auto" asChild>
            <Link to="/logout">
              <LogOut className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" asChild>
              <Link to="/logout">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Link>
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              © 2026 TradeBridge v2.0
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;