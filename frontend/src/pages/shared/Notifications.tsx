import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Settings,
  Package,
  Truck,
  ShoppingCart,
  Store,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  CreditCard,
  Filter,
  MoreVertical,
  Check,
  X,
  Smartphone,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Mock notifications
const allNotifications = [
  {
    id: 1,
    type: "order",
    title: "Order Confirmed",
    description:
      "Order #TB-2026-0892 has been confirmed by Ethiopia Coffee Export.",
    time: "5 minutes ago",
    read: false,
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
    link: "/retailer/orders/TB-2026-0892",
    actionable: true,
    actionLabel: "View Order",
  },
  {
    id: 2,
    type: "shipping",
    title: "Order Shipped",
    description: "Order #TB-2026-0885 has been shipped. Tracking: TRK-7885-02",
    time: "2 hours ago",
    read: false,
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-100",
    link: "/retailer/tracking/TB-2026-0885",
    actionable: true,
    actionLabel: "Track Order",
  },
  {
    id: 3,
    type: "promotion",
    title: "Flash Sale! 20% Off",
    description:
      "Selected electronics at Adama Wholesalers. Limited time offer.",
    time: "5 hours ago",
    read: true,
    icon: TrendingUp,
    color: "text-purple-600",
    bg: "bg-purple-100",
    link: "/retailer/products?sale=flash",
    actionable: true,
    actionLabel: "Shop Now",
  },
  {
    id: 4,
    type: "payment",
    title: "Payment Successful",
    description:
      "Your payment of ETB 12,500 for order #TB-2026-0892 has been processed.",
    time: "1 day ago",
    read: true,
    icon: CreditCard,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    link: "/retailer/orders/TB-2026-0892",
    actionable: false,
  },
  {
    id: 5,
    type: "review",
    title: "Review Request",
    description:
      "How was your order from Ethiopia Coffee Export? Share your feedback.",
    time: "1 day ago",
    read: false,
    icon: Star,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    link: "/retailer/reviews?order=TB-2026-0892",
    actionable: true,
    actionLabel: "Write Review",
  },
  {
    id: 6,
    type: "supplier",
    title: "New Supplier",
    description: "Bahir Dar Honey is now verified and available in your area.",
    time: "2 days ago",
    read: true,
    icon: Store,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    link: "/retailer/suppliers/104",
    actionable: true,
    actionLabel: "View Supplier",
  },
  {
    id: 7,
    type: "inventory",
    title: "Low Stock Alert",
    description: "Yirgacheffe Coffee is running low. Restock soon.",
    time: "2 days ago",
    read: true,
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-100",
    link: "/retailer/products/1",
    actionable: true,
    actionLabel: "Reorder",
  },
  {
    id: 8,
    type: "order",
    title: "Order Delivered",
    description: "Order #TB-2026-0851 has been delivered successfully.",
    time: "3 days ago",
    read: true,
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
    link: "/retailer/orders/TB-2026-0851",
    actionable: true,
    actionLabel: "Review Order",
  },
  {
    id: 9,
    type: "system",
    title: "Maintenance Scheduled",
    description: "Platform maintenance on Feb 15, 2026 from 2:00 AM - 4:00 AM.",
    time: "3 days ago",
    read: true,
    icon: Clock,
    color: "text-gray-600",
    bg: "bg-gray-100",
    link: "/support/announcements",
    actionable: false,
  },
];

const notificationGroups = {
  today: allNotifications.filter(
    (n) => n.time.includes("minute") || n.time.includes("hour"),
  ),
  yesterday: allNotifications.filter(
    (n) => n.time.includes("yesterday") || n.time.includes("day"),
  ),
  earlier: allNotifications.filter(
    (n) => n.time.includes("days") || n.time.includes("week"),
  ),
};

const getIcon = (notification: any) => {
  const Icon = notification.icon;
  return (
    <div className={cn("p-2 rounded-full", notification.bg)}>
      <Icon className={cn("h-4 w-4", notification.color)} />
    </div>
  );
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState(allNotifications);
  const [filterType, setFilterType] = useState("all");
  const [showRead, setShowRead] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType !== "all" && n.type !== filterType) return false;
    if (!showRead && n.read) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="px-3 py-1">{unreadCount} unread</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Stay updated with your orders, suppliers, and platform updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Notification Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notif" className="text-sm">
                    Email Notifications
                  </Label>
                  <Switch id="email-notif" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notif" className="text-sm">
                    Push Notifications
                  </Label>
                  <Switch id="push-notif" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notif" className="text-sm">
                    SMS Notifications
                  </Label>
                  <Switch id="sms-notif" />
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings/notifications" className="cursor-pointer">
                  Advanced Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="order">Orders</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="promotion">Promotions</SelectItem>
                  <SelectItem value="supplier">Suppliers</SelectItem>
                  <SelectItem value="review">Reviews</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-read"
                  checked={showRead}
                  onCheckedChange={setShowRead}
                />
                <Label htmlFor="show-read">Show read notifications</Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">
                {filteredNotifications.length} notifications
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-6 pt-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="mentions">Mentions</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              <ScrollArea className="h-[600px]">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No notifications
                    </h3>
                    <p className="text-muted-foreground text-center max-w-sm">
                      You're all caught up! Check back later for updates.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-6 hover:bg-accent/50 transition-colors relative",
                          !notification.read && "bg-primary/5",
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {getIcon(notification)}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <Badge
                                      variant="secondary"
                                      className="h-5 text-xs"
                                    >
                                      New
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {notification.time}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] capitalize"
                                  >
                                    {notification.type}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {notification.actionable && (
                                  <Button size="sm" variant="outline" asChild>
                                    <Link to={notification.link}>
                                      {notification.actionLabel || "View"}
                                    </Link>
                                  </Button>
                                )}

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {!notification.read && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          markAsRead(notification.id)
                                        }
                                      >
                                        <Check className="h-4 w-4 mr-2" />
                                        Mark as Read
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() =>
                                        deleteNotification(notification.id)
                                      }
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="unread">
              <ScrollArea className="h-[600px]">
                {filteredNotifications.filter((n) => !n.read).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <CheckCheck className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No unread notifications
                    </h3>
                    <p className="text-muted-foreground">
                      You've read everything!
                    </p>
                  </div>
                ) : (
                  // Similar rendering for unread
                  <div>Unread notifications content</div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="mentions">
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No mentions</h3>
                <p className="text-muted-foreground">
                  When someone mentions you, it will appear here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notification Preferences Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Enabled</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Daily digest</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium">SMS Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Only order updates
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="link" className="h-auto p-0 text-xs" asChild>
              <Link to="/settings/notifications">
                Configure notification settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
