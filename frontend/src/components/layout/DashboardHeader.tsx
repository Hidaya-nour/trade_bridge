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
    bg: "bg-blue-100",
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
    bg: "bg-green-100",
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
    bg: "bg-purple-100",
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
    bg: "bg-emerald-100",
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
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4 lg:px-6">
        {/* Mobile Menu Button */}
        
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
      <div className={cn(
        "flex h-16 items-center border-b bg-muted/50 justify-between px-4"
      )}>
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <span className="font-bold text-lg text-primary-foreground">TB</span>
          </div>
         
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              TradeBridge
            </span>
         
        </Link>
      
      </div>

        {/* Search Bar - Enhanced */}
        <div className="flex-1 lg:max-w-md lg:mx-auto">
          <form onSubmit={handleSearch}>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Search products, orders, suppliers..."
                className="w-full pl-9 pr-20 bg-muted/50 focus:bg-background transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6">
                        <Filter className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Advanced Filters</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Actions - New */}
          <div className="hidden md:flex items-center gap-1">
            {mockUser.role === "retailer" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/cart">
                      <ShoppingCart className="h-5 w-5" />
                      <Badge className=" ">
                        3
                      </Badge>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Cart</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            )}
            
            {mockUser.role === "retailer" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/orders">
                      <Package className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>My Orders</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            )}
            <Separator orientation="vertical" className="h-6 mx-1" />
          </div>

          {/* Date/Time - New */}
          <div className="hidden xl:flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}</span>
          </div>

          {/* Theme Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isDarkMode ? "Light mode" : "Dark mode"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Messages Dropdown - Enhanced */}
          <DropdownMenu open={showMessageSheet} onOpenChange={setShowMessageSheet}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="h-5 w-5" />
                {unreadMessages > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0">
                    {unreadMessages}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Messages</span>
                <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs">
                  Mark all as read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[400px]">
                {messages.map((message) => (
                  <DropdownMenuItem
                    key={message.id}
                    className="cursor-pointer p-3 focus:bg-accent"
                    onClick={() => navigate("/messages")}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {message.sender.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{message.sender}</p>
                          <span className="text-xs text-muted-foreground">{message.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {message.message}
                        </p>
                      </div>
                      {message.unread && (
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center text-primary">
                View all messages
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications Sheet - Enhanced */}
          <Sheet open={showNotificationSheet} onOpenChange={setShowNotificationSheet}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>Notifications</span>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Mark all as read
                  </Button>
                </SheetTitle>
              </SheetHeader>
              <Tabs defaultValue="all" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="mentions">Mentions</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-lg transition-colors",
                            !notification.read && "bg-muted/50"
                          )}
                        >
                          <div className={cn("rounded-full p-2", notification.bg)}>
                            <notification.icon className={cn("h-4 w-4", notification.color)} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{notification.title}</p>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {notification.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="unread">
                  <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                    No unread notifications
                  </div>
                </TabsContent>
                <TabsContent value="mentions">
                  <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                    No mentions
                  </div>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          {/* User Menu - Enhanced */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 gap-2 px-2">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    {getInitials(mockUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex lg:flex-col lg:items-start">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold">{mockUser.name}</span>
                    {mockUser.verified && (
                      <Badge variant="outline" className="h-4 px-1 text-[10px] bg-primary/5">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs capitalize text-muted-foreground">
                    {mockUser.role} • {mockUser.business}
                  </span>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{mockUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {mockUser.email}
                  </p>
                 
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/support" className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => navigate("/logout")}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search - Collapsible */}
      <div className="lg:hidden px-4 pb-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-9 bg-muted"
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