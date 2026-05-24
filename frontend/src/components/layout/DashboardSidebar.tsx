import { type FC, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
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
  Navigation,
  MessageSquare,
  Bell,
  Settings,
  HelpCircle,
  FileText,
  Star,
  CreditCard,
  Wallet,
  LogOut,
  Shield,
  AlertCircle,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { useMessageStore } from "@/stores/message.store";
import tradebridgeLogo from "@/assets/image/logo.png";

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
    },
    {
      name: "Browse Suppliers",
      href: "/retailer/suppliers",
      icon: TrendingUp,
    },
    {
      name: "My Orders",
      href: "/retailer/orders",
      icon: Package,
    },
    {
      name: "Shopping Cart",
      href: "/retailer/cart",
      icon: ShoppingCart,
    },
    {
      name: "My Disputes",
      href: "/retailer/disputes",
      icon: AlertCircle,
    },
  ],

  distributor: {
    main: [
      {
        name: "Dashboard",
        href: "/distributor/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        name: "Manage Products",
        href: "/distributor/products",
        icon: Package,
      },
    ],
    retailOperations: [
      {
        name: "Incoming Orders",
        href: "/distributor/orders",
        icon: ShoppingCart,
      },
      {
        name: "Delivery Management",
        href: "/distributor/delivery",
        icon: Truck,
      },
      {
        name: "Broadcast Promotions",
        href: "/distributor/promotions",
        icon: TrendingUp,
      },
      {
        name: "My Disputes",
        href: "/distributor/disputes",
        icon: AlertCircle,
      },
      {
        name: "Seller Wallet",
        href: "/distributor/wallet",
        icon: Wallet,
      },
    ],
    purchasing: [
      {
        name: "purchase Products",
        href: "/distributor/browse-products",
        icon: Factory,
      },
      {
        name: "Purchase Cart",
        href: "/distributor/cart",
        icon: ShoppingCart,
      },
      {
        name: "Purchase Orders",
        href: "/distributor/purchase-orders",
        icon: FileText,
      },
    ],
    analytics: [
      {
        name: "Export Reports",
        href: "/distributor/reports",
        icon: FileText,
      },
    ],
  },

  factory: [
    { name: "Dashboard", href: "/factory/dashboard", icon: LayoutDashboard },
    {
      name: "Manage Products",
      href: "/factory/products",
      icon: Package,
    },
    {
      name: "Order Management",
      href: "/factory/orders",
      icon: Package,
    },
    {
      name: "My Disputes",
      href: "/factory/disputes",
      icon: AlertCircle,
    },
    {
      name: "Seller Wallet",
      href: "/factory/wallet",
      icon: Wallet,
    },
    {
      name: "Agents",
      href: "/factory/agents",
      icon: Warehouse,
    },
    {
      name: "Delivery Management",
      href: "/factory/delivery",
      icon: Truck,
    },
    { name: "Export Reports", href: "/factory/reports", icon: FileText },
    {
      name: "Broadcast Announcements",
      href: "/factory/announcements",
      icon: Bell,
    },
  ],

  driver: [
    { name: "Dashboard", href: "/driver/dashboard", icon: LayoutDashboard },
    { name: "Deliveries", href: "/driver/deliveries", icon: TrendingUp },
    { name: "Live Tracking", href: "/driver/tracking", icon: Navigation },
    { name: "Report Issues", href: "/driver/issues", icon: AlertCircle },
  ],

  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users },
    {
      name: "Supplier Approvals",
      href: "/admin/approvals",
      icon: Shield,
    },
    { name: "Product Listings", href: "/admin/products", icon: Package },
    {
      name: "Dispute Management",
      href: "/admin/disputes",
      icon: HelpCircle,
    },
    {
      name: "User Reports",
      href: "/admin/user-reports",
      icon: AlertCircle,
    },
    {
      name: "Payout Approvals",
      href: "/admin/withdrawals",
      icon: Wallet,
    },
    { name: "Platform Analytics", href: "/admin/analytics", icon: BarChart3 },
  ],
};

interface DashboardSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const DashboardSidebar: FC<DashboardSidebarProps> = ({
  collapsed = false,
  onToggle,
}) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = user?.role as keyof typeof roleNavigation;
  const isDistributor = userRole === "distributor";
  const isActive = (href: string) => location.pathname === href;
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { fetchCounts, counts } = useNotificationStore();
  const { fetchUserMessages, fetchUnreadCount, unreadCount } =
    useMessageStore();

  // Fetch notifications on mount
  useEffect(() => {
    fetchCounts();
    fetchUserMessages();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchCounts();
      fetchUnreadCount();
    }, 300000);

    return () => clearInterval(interval);
  }, [fetchCounts, fetchUnreadCount, fetchUserMessages]);

  if (!user) {
    return (
      <div
        className={cn(
          "flex flex-col bg-sidebar/99 border-r border-border/40 transition-all duration-300 h-screen",
        )}
      >
        <p className="p-4 text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }
  const secondaryNavigation = [
    {
      name: "Messages",
      href: userRole === "driver" ? "/driver/messages" : "/messages",
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount.toString() : undefined,
    },
    {
      name: "Notifications",
      href: userRole === "driver" ? "/driver/notifications" : "/notifications",
      icon: Bell,
      badge: counts.unread > 0 ? counts.unread.toString() : undefined,
    },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help & Support", href: "/support", icon: HelpCircle },
  ];

  const renderDistributorNav = () => {
    const nav = roleNavigation.distributor;

    return (
      <div className={cn("space-y-4", collapsed ? "px-2 py-4" : "px-3 py-4")}>
        {/* Main Menu */}
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Main Menu
            </p>
          )}
          {nav.main.map((item) =>
            (() => {
              const badge = (item as any).badge;

              return (
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
                              isActive(item.href)
                                ? "font-medium"
                                : "font-normal",
                            )}
                          >
                            {item.name}
                          </span>
                        )}
                      </div>
                      {!collapsed && badge && (
                        <Badge
                          variant={
                            isActive(item.href) ? "default" : "secondary"
                          }
                          className={cn(
                            "ml-auto text-[10px] px-1.5 py-0.5 font-medium",
                            badge === "Low Stock" &&
                              "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800",
                          )}
                        >
                          {badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </Button>
              );
            })(),
          )}
        </div>

        <Separator className="bg-border/50" />

        {/* Retail Operations */}
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <ShoppingCart className="h-3 w-3" />
              RETAIL OPERATIONS
            </p>
          )}
          {nav.retailOperations.map((item) => (
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
                  "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/15",
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
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive(item.href)
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    {!collapsed && (
                      <span
                        className={cn(
                          "text-sm transition-colors",
                          isActive(item.href)
                            ? "font-medium text-blue-600 dark:text-blue-400"
                            : "font-normal",
                        )}
                      >
                        {item.name}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>

        <Separator className="bg-border/50" />

        {/* Purchasing */}
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Factory className="h-3 w-3" />
              PURCHASING
            </p>
          )}
          {nav.purchasing.map((item) => (
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
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15",
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
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive(item.href)
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    {!collapsed && (
                      <span
                        className={cn(
                          "text-sm transition-colors",
                          isActive(item.href)
                            ? "font-medium text-emerald-600 dark:text-emerald-400"
                            : "font-normal",
                        )}
                      >
                        {item.name}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>

        <Separator className="bg-border/50" />

        {/* Analytics */}
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              ANALYTICS
            </p>
          )}
          {nav.analytics.map((item) => (
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
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderRegularNav = () => {
    const nav: any[] = roleNavigation[userRole] as any[];

    return (
      <div className={cn("space-y-4", collapsed ? "px-2 py-4" : "px-3 py-4")}>
        <div className="space-y-0.5">
          {nav?.map((item) => (
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
      </div>
    );
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
            <div className="flex justify-center ">
              <img
                src={tradebridgeLogo}
                alt="TradeBridge Logo"
                className="h-11 object-contain drop-shadow-lg transform hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
        ) : (
          <>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex justify-center ">
                <img
                  src={tradebridgeLogo}
                  alt="TradeBridge Logo"
                  className="h-11 object-contain drop-shadow-lg transform hover:scale-110 transition-transform duration-300"
                />
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
              <AvatarImage src={user.profile_image} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(user.full_name)}
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
                <AvatarImage src={user.profile_image} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold leading-none">
                  {user.full_name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user.business_name || user.email}
                </p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 min-h-0">
        {isDistributor ? renderDistributorNav() : renderRegularNav()}

        {/* Secondary Navigation (Support) */}
        <div className={cn("px-3 py-4 border-t border-border/40")}>
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
            onClick={async () => {
              await useAuthStore.getState().logout();
              navigate("/login");
            }}
          >
            <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            Logout
          </Button>
        ) : (
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors group"
              onClick={async () => {
                await useAuthStore.getState().logout(); // clear Zustand store
                navigate("/login"); // redirect to login page
              }}
            >
              <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              Logout
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
