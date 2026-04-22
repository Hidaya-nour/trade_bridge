import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  ShoppingCart,
  Package,
  Truck,
  TrendingUp,
  CreditCard,
} from "lucide-react";

import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { useMessageStore } from "@/stores/message.store";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import type { Notification } from "@/types/notification.types";
import { m } from "framer-motion";

// Keep messages mock for now (you can replace with real message store later)
const messages = [
  {
    id: 1,
    sender: "Ethiopia Coffee Export",
    avatar: "",
    message: "Your order of 50kg Yirgacheffe is ready for pickup",
    time: "10:30 AM",
    unread: true,
  },
  {
    id: 2,
    sender: "Adama Wholesalers",
    avatar: "",
    message: "New prices available for bulk orders",
    time: "Yesterday",
    unread: true,
  },
  {
    id: 3,
    sender: "Support Team",
    avatar: "",
    message: "Your ticket #TB-789 has been resolved",
    time: "Yesterday",
    unread: false,
  },
];

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotificationSheet, setShowNotificationSheet] = useState(false);
  useState<Notification | null>(null);

  // Get notifications from store
  const {
    notifications,
    fetchCounts,
    counts,
    fetchNotifications,
    markAsRead,
    markAllRead,
    isLoading,
  } = useNotificationStore();
  const { unreadCount, fetchUnreadCount } = useMessageStore();

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    fetchCounts();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchCounts();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchCounts, fetchUnreadCount]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching:", searchQuery);
    // Implement search
  };

  const handleMarkAsRead = async (notificationId?: string) => {
    if (notificationId) {
      await markAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllRead();
  };

  if (!user) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-16 bg-sidebar border-b border-border/40",
        )}
      >
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  const messagesHref = user.role === "driver" ? "/driver/messages" : "/messages";
  const notificationsHref =
    user.role === "driver" ? "/driver/notifications" : "/notifications";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-3 lg:px-6">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Search Bar */}
        <div className="flex-1 lg:max-w-md lg:mx-auto">
          <form onSubmit={handleSearch}>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200" />
              <Input
                type="search"
                placeholder="Search products, orders, suppliers..."
                className="w-full pl-9 pr-20 bg-muted/50 border-muted/50 focus:bg-background focus:border-primary/30 transition-all duration-200 placeholder:text-muted-foreground/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-accent/50"
                      >
                        <Filter className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Advanced Filters
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <kbd className="hidden lg:inline-flex h-6 select-none items-center gap-1 rounded-md border border-border/60 bg-muted/80 px-1.5 font-mono text-[11px] font-medium text-muted-foreground shadow-sm">
                  ⌘ K
                </kbd>
              </div>
            </div>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-1">
            {(user.role === "retailer" || user.role === "distributor") && (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      asChild
                    >
                      <Link to={`/${user.role}/cart`}>
                        <ShoppingCart className="h-5 w-5" />
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-[10px] font-medium text-primary-foreground ring-2 ring-background">
                          3
                        </Badge>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    View Cart
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Separator
              orientation="vertical"
              className="h-5 mx-0.5 bg-border/40"
            />
          </div>

          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  asChild
                >
                  <Link to={messagesHref}>
                    <MessageSquare className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 flex items-center justify-center bg-primary text-[10px] font-medium text-primary-foreground ring-2 ring-background">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Open Messages
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notifications Sheet */}
          <Sheet
            open={showNotificationSheet}
            onOpenChange={setShowNotificationSheet}
          >
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                <Bell className="h-5 w-5" />
                {counts.unread > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 flex items-center justify-center bg-primary text-[10px] font-medium text-primary-foreground ring-2 ring-background">
                    {counts.unread}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg p-0 gap-0">
              <SheetHeader className="p-6 pb-4 border-b border-border/40">
                <SheetTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </span>
                  {counts.unread > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  View and manage your notifications
                </SheetDescription>
                <Button variant="link" className="h-auto w-fit p-0 text-xs" asChild>
                  <Link to={notificationsHref} onClick={() => setShowNotificationSheet(false)}>
                    Open full notifications
                  </Link>
                </Button>
              </SheetHeader>
              <Tabs defaultValue="all" className="flex-1">
                <div className="px-6 pt-4">
                  <TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-muted/50">
                    <TabsTrigger
                      value="all"
                      className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value="unread"
                      className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      Unread
                      {counts.unread > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-1.5 h-4 px-1 text-[10px]"
                        >
                          {counts.unread}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="all" className="mt-0 flex-1">
                  <ScrollArea className="h-[calc(100vh-200px)] px-6 pb-6">
                    <div className="space-y-1 pt-2">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <p className="text-sm text-muted-foreground">
                            Loading notifications...
                          </p>
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notification) => {
                          const Icon = getIconForType(notification.type);
                          const colors = getColorsForType(notification.type);

                          return (
                            <div
                              key={notification.id}
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-accent/50 cursor-pointer",
                                !notification.is_read && "bg-muted/30",
                              )}
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <div
                                className={cn(
                                  "rounded-full p-2 shrink-0",
                                  colors.bg,
                                )}
                              >
                                <Icon className={cn("h-4 w-4", colors.color)} />
                              </div>
                              <div className="flex-1 space-y-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium leading-none">
                                    {notification.title}
                                  </p>
                                  {!notification.is_read && (
                                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-[11px] text-muted-foreground/70">
                                  {formatTimeAgo(notification.created_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                          <p className="text-sm font-medium">
                            No notifications
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            You're all caught up!
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="unread" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-200px)] px-6 pb-6">
                    <div className="space-y-1 pt-2">
                      {notifications.filter((n) => !n.is_read).length > 0 ? (
                        notifications
                          .filter((n) => !n.is_read)
                          .map((notification) => {
                            const Icon = getIconForType(notification.type);
                            const colors = getColorsForType(notification.type);

                            return (
                              <div
                                key={notification.id}
                                className="flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-accent/50 cursor-pointer bg-muted/30"
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                              >
                                <div
                                  className={cn(
                                    "rounded-full p-2 shrink-0",
                                    colors.bg,
                                  )}
                                >
                                  <Icon
                                    className={cn("h-4 w-4", colors.color)}
                                  />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {notification.message}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground/70">
                                    {formatTimeAgo(notification.created_at)}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                          <p className="text-sm font-medium">
                            No unread notifications
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            You're all caught up!
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 gap-2 px-2 hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-7 w-7 ring-1 ring-primary/20 ring-offset-1 ring-offset-background transition-all hover:ring-primary/30">
                  <AvatarImage src={user.profile_image} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="hidden lg:block h-4 w-4 text-muted-foreground/60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 mt-1 p-1">
              <DropdownMenuLabel className="p-3 font-normal">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src={user.profile_image} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {user.full_name}
                      </p>
                      {user.verified && (
                        <Badge
                          variant="outline"
                          className="h-5 px-1.5 text-[10px] border-green-200 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70">
                      {user.business_name}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer rounded-md py-2 px-2 text-sm focus:bg-accent/50"
                >
                  <Link to="/settings">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Profile</span>
                    <DropdownMenuShortcut className="text-muted-foreground/70">
                      ⇧⌘P
                    </DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer rounded-md py-2 px-2 text-sm focus:bg-accent/50"
                >
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Settings</span>
                    <DropdownMenuShortcut className="text-muted-foreground/70">
                      ⌘S
                    </DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer rounded-md py-2 px-2 text-sm focus:bg-accent/50"
                >
                  <Link to="/support">
                    <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                className="cursor-pointer rounded-md py-2 px-2 text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                <DropdownMenuShortcut className="text-destructive/70">
                  ⇧⌘Q
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {user &&
        (user.role === "factory" || user.role === "distributor") &&
        !user.verified && (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <span>
                Your account is not verified yet. Please upload your business
                license for admin approval.
              </span>
              <Button asChild size="sm" variant="outline">
                <Link to="/settings?tab=business">Verify account</Link>
              </Button>
            </div>
          </div>
        )}

      {/* Mobile Search */}
      <div className="lg:hidden px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-9 bg-muted/50 border-muted/50 focus:bg-background focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>
    </header>
  );
};

export default DashboardHeader;
