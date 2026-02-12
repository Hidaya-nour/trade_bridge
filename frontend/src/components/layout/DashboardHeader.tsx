import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  MessageSquare,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Menu,
  ShoppingCart,
  Package,
  Truck,
  TrendingUp,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock user data from documentation
const mockUser = {
  name: "Hidaya Nurmeika",
  email: "hidaya@tradebridge.com",
  role: "retailer",
  avatar: "",
  verified: true,
  business: "ABC Retail Shop",
  location: "Adama, Ethiopia",
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Notification data
const notifications = [
  {
    id: 1,
    type: "order",
    title: "Order #TB-2026-0892 Confirmed",
    description: "Your order has been confirmed and is being processed.",
    time: "5 minutes ago",
    read: false,
    icon: Package,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-950/30",
  },
  {
    id: 2,
    type: "delivery",
    title: "Order #TB-2026-0885 Shipped",
    description: "Your order is out for delivery. Expected today.",
    time: "2 hours ago",
    read: false,
    icon: Truck,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-950/30",
  },
  {
    id: 3,
    type: "promotion",
    title: "Flash Sale! 20% Off",
    description: "Selected electronics. Limited time offer.",
    time: "5 hours ago",
    read: true,
    icon: TrendingUp,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-950/30",
  },
  {
    id: 4,
    type: "payment",
    title: "Payment Successful",
    description: "Your payment of ETB 15,200 has been processed.",
    time: "1 day ago",
    read: true,
    icon: CreditCard,
    color: "text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-950/30",
  },
];

// Message data
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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotificationSheet, setShowNotificationSheet] = useState(false);
  const [showMessageSheet, setShowMessageSheet] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching:", searchQuery);
    // Implement search
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const unreadMessages = messages.filter((m) => m.unread).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-3 lg:px-6">
        {/* Mobile Menu Button - Hidden by default, shown via props */}
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

        {/* Search Bar - Enhanced */}
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
            {mockUser.role === "retailer" && (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      asChild
                    >
                      <Link to="/cart">
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
            
            <Separator orientation="vertical" className="h-5 mx-0.5 bg-border/40" />
          </div>

          {/* Notifications Sheet - Enhanced */}
          <Sheet open={showNotificationSheet} onOpenChange={setShowNotificationSheet}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 flex items-center justify-center bg-primary text-[10px] font-medium text-primary-foreground ring-2 ring-background">
                    {unreadNotifications}
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Mark all as read
                  </Button>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  View and manage your notifications
                </SheetDescription>
              </SheetHeader>
              <Tabs defaultValue="all" className="flex-1">
                <div className="px-6 pt-4">
                  <TabsList className="grid w-full grid-cols-3 h-9 p-1 bg-muted/50">
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
                      {unreadNotifications > 0 && (
                        <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                          {unreadNotifications}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="mentions" 
                      className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      Mentions
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="all" className="mt-0 flex-1">
                  <ScrollArea className="h-[calc(100vh-200px)] px-6 pb-6">
                    <div className="space-y-1 pt-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-accent/50 cursor-pointer",
                            !notification.read && "bg-muted/30"
                          )}
                        >
                          <div className={cn(
                            "rounded-full p-2 shrink-0",
                            notification.bg
                          )}>
                            <notification.icon className={cn("h-4 w-4", notification.color)} />
                          </div>
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium leading-none">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.description}
                            </p>
                            <p className="text-[11px] text-muted-foreground/70">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="unread" className="mt-0">
                  <div className="flex h-[400px] flex-col items-center justify-center gap-2 text-center px-6">
                    <div className="rounded-full bg-muted p-3">
                      <Bell className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium">No unread notifications</p>
                    <p className="text-xs text-muted-foreground">
                      You're all caught up!
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="mentions" className="mt-0">
                  <div className="flex h-[400px] flex-col items-center justify-center gap-2 text-center px-6">
                    <div className="rounded-full bg-muted p-3">
                      <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium">No mentions</p>
                    <p className="text-xs text-muted-foreground">
                      When someone mentions you, it'll appear here
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          {/* User Menu - Enhanced */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-9 gap-2 px-2 hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-7 w-7 ring-1 ring-primary/20 ring-offset-1 ring-offset-background transition-all hover:ring-primary/30">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(mockUser.name)}
                  </AvatarFallback>
                </Avatar>
               
                <ChevronDown className="hidden lg:block h-4 w-4 text-muted-foreground/60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 mt-1 p-1">
              <DropdownMenuLabel className="p-3 font-normal">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src={mockUser.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(mockUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{mockUser.name}</p>
                      {mockUser.verified && (
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-green-200 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{mockUser.email}</p>
                    <p className="text-[11px] text-muted-foreground/70">{mockUser.business} • {mockUser.location}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="cursor-pointer rounded-md py-2 px-2 text-sm focus:bg-accent/50">
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Profile</span>
                    <DropdownMenuShortcut className="text-muted-foreground/70">⇧⌘P</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-md py-2 px-2 text-sm focus:bg-accent/50">
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Settings</span>
                    <DropdownMenuShortcut className="text-muted-foreground/70">⌘S</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-md py-2 px-2 text-sm focus:bg-accent/50">
                  <Link to="/support">
                    <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                className="cursor-pointer rounded-md py-2 px-2 text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => navigate("/logout")}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                <DropdownMenuShortcut className="text-destructive/70">⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search - Collapsible */}
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