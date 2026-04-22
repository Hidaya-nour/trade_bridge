import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  MessageSquare,
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
import { useNotificationStore } from "@/stores/notification.store";
import type { Notification } from "@/types/notification.types";

const NotificationsPage: React.FC = () => {
  // Get notifications from store
  const {
    notifications,
    fetchCounts,
    counts,
    fetchNotifications,
    markAsRead,
    markAllRead,
    clearAll,
    deleteNotification,
    setFilters,
  } = useNotificationStore();

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const handleMarkAsRead = async (notificationId?: string) => {
    if (notificationId) {
      await markAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllRead();
  };

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    fetchCounts();

    const interval = setInterval(() => {
      fetchCounts();
    }, 300000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchCounts]);

  // Function to get icon based on notification type
  const getIconForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case "order":
      case "order_created":
      case "order_confirmed":
      case "order_processing":
        return Package;
      case "delivery":
      case "order_shipped":
      case "delivery_assigned":
      case "delivery_in_transit":
        return Truck;
      case "payment":
      case "payment_received":
      case "payment_successful":
        return CreditCard;
      case "promotion":
      case "trending":
        return TrendingUp;
      case "message":
      case "message_received":
        return MessageSquare;
      default:
        return Bell;
    }
  };

  // Function to get colors based on notification type
  const getColorsForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case "order":
      case "order_created":
      case "order_confirmed":
        return {
          color: "text-blue-500",
          bg: "bg-blue-100 dark:bg-blue-950/30",
        };
      case "payment":
      case "payment_received":
      case "payment_successful":
        return {
          color: "text-green-500",
          bg: "bg-green-100 dark:bg-green-950/30",
        };
      case "delivery":
      case "order_shipped":
      case "delivery_in_transit":
        return {
          color: "text-purple-500",
          bg: "bg-purple-100 dark:bg-purple-950/30",
        };
      case "message":
      case "message_received":
        return {
          color: "text-indigo-500",
          bg: "bg-indigo-100 dark:bg-indigo-950/30",
        };
      case "promotion":
      case "trending":
        return {
          color: "text-yellow-500",
          bg: "bg-yellow-100 dark:bg-yellow-950/30",
        };
      case "alert":
      case "error":
        return { color: "text-red-500", bg: "bg-red-100 dark:bg-red-950/30" };
      case "success":
        return {
          color: "text-green-500",
          bg: "bg-green-100 dark:bg-green-950/30",
        };
      case "pending":
        return {
          color: "text-orange-500",
          bg: "bg-orange-100 dark:bg-orange-950/30",
        };
      default:
        return { color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800" };
    }
  };

  // Format time ago from ISO string
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  const [filterType, setFilterType] = useState("all");
  const [showRead, setShowRead] = useState(true);

  const unreadCount = counts.unread;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType !== "all" && n.type !== filterType) return false;
    if (!showRead && n.is_read) return false;
    return true;
  });

  const getNotificationTarget = (type: string) => {
    if (!user) return "/notifications";

    if (type === "message" || type === "message_received") {
      return user.role === "driver" ? "/driver/messages" : "/messages";
    }

    if (
      [
        "delivery",
        "delivery_assigned",
        "delivery_in_transit",
        "order",
        "order_created",
        "order_confirmed",
        "order_processing",
        "order_shipped",
      ].includes(type)
    ) {
      if (user.role === "driver") return "/driver/deliveries";
      if (user.role === "distributor") return "/distributor/delivery";
      if (user.role === "factory") return "/factory/delivery";
      if (user.role === "retailer") return "/retailer/orders";
    }

    if (type === "dispute" || type === "alert" || type === "error") {
      return user.role === "driver" ? "/driver/issues" : "/support";
    }

    return user.role === "driver" ? "/driver/notifications" : "/notifications";
  };

  const openNotification = async (notification: (typeof notifications)[number]) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    navigate(getNotificationTarget(notification.type));
  };

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
            onClick={markAllRead}
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
              <Select
                value={filterType}
                onValueChange={(value) => {
                  setFilterType(value);
                  setFilters({ type: value === "all" ? undefined : value });
                  void fetchNotifications({
                    type: value === "all" ? undefined : value,
                  });
                }}
              >
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
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void clearAll()}
                  disabled={notifications.length === 0}
                >
                  Clear all
                </Button>
              </div>
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
                          !notification.is_read && "bg-primary/5",
                        )}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleMarkAsRead(notification.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleMarkAllAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="flex items-start gap-4">
                          {getIconForType(notification.type) && (
                            <div
                              className={cn(
                                getColorsForType(notification.type).bg,
                                "p-2 rounded-full",
                              )}
                            >
                              {React.createElement(
                                getIconForType(notification.type),
                                {
                                  className: cn(
                                    "h-4 w-4",
                                    getColorsForType(notification.type).color,
                                  ),
                                },
                              )}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold">
                                    {notification.title}
                                  </h4>
                                  {!notification.is_read && (
                                    <Badge
                                      variant="secondary"
                                      className="h-5 text-xs"
                                    >
                                      New
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {notification.created_at
                                      ? formatTimeAgo(notification.created_at)
                                      : ""}
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
                                {/* {notification.actionable && (
                                  <Button size="sm" variant="outline" asChild>
                                    <Link to={notification.link}>
                                      {notification.actionLabel || "View"}
                                    </Link>
                                  </Button>
                                )} */}

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {!notification.is_read && (
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          void handleMarkAsRead(
                                            notification.id,
                                          );
                                        }}
                                      >
                                        <Check className="h-4 w-4 mr-2" />
                                        Mark as Read
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void deleteNotification(
                                          notification.id,
                                        );
                                      }}
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
                {filteredNotifications.filter((n) => !n.is_read).length ===
                0 ? (
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
                  <div className="divide-y">
                    {filteredNotifications
                      .filter((n) => !n.is_read)
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-6 hover:bg-accent/50 transition-colors relative",
                            !notification.is_read && "bg-primary/5",
                          )}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleMarkAsRead(notification.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleMarkAsRead(notification.id);
                            }
                          }}
                        >
                          <div className="flex items-start gap-4">
                            {getIconForType(notification.type) && (
                              <div
                                className={cn(
                                  getColorsForType(notification.type).bg,
                                  "p-2 rounded-full",
                                )}
                              >
                                {React.createElement(
                                  getIconForType(notification.type),
                                  {
                                    className: cn(
                                      "h-4 w-4",
                                      getColorsForType(notification.type).color,
                                    ),
                                  },
                                )}
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold">
                                      {notification.title}
                                    </h4>
                                    {!notification.is_read && (
                                      <Badge
                                        variant="secondary"
                                        className="h-5 text-xs"
                                      >
                                        New
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      {notification.created_at
                                        ? formatTimeAgo(notification.created_at)
                                        : ""}
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
                                  {/* {notification.actionable && (
                                  <Button size="sm" variant="outline" asChild>
                                    <Link to={notification.link}>
                                      {notification.actionLabel || "View"}
                                    </Link>
                                  </Button>
                                )} */}

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {!notification.is_read && (
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            void markAsRead(notification.id);
                                          }}
                                        >
                                          <Check className="h-4 w-4 mr-2" />
                                          Mark as Read
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          void deleteNotification(
                                            notification.id,
                                          );
                                        }}
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
