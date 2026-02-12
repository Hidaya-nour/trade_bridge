import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Star,
  Archive,
  Trash2,
  Flag,
  Users,
  Package,
  Truck,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Mock conversations
const conversations = [
  {
    id: 1,
    name: "Ethiopia Coffee Export",
    avatar: "EC",
    role: "supplier",
    lastMessage: "Your order #TB-2026-0892 has been shipped",
    timestamp: "10:30 AM",
    unread: 2,
    online: true,
    verified: true,
    messages: [
      {
        id: 1,
        sender: "supplier",
        content:
          "Hello! Your order of Yirgacheffe Coffee is ready for shipment.",
        timestamp: "09:45 AM",
        status: "read",
      },
      {
        id: 2,
        sender: "me",
        content: "Great! When will it be dispatched?",
        timestamp: "09:50 AM",
        status: "read",
      },
      {
        id: 3,
        sender: "supplier",
        content:
          "Your order #TB-2026-0892 has been shipped. Tracking number: TRK-7892-01",
        timestamp: "10:30 AM",
        status: "delivered",
      },
      {
        id: 4,
        sender: "supplier",
        content: "Expected delivery is February 13th.",
        timestamp: "10:31 AM",
        status: "delivered",
      },
    ],
  },
  {
    id: 2,
    name: "Adama Wholesalers",
    avatar: "AW",
    role: "supplier",
    lastMessage: "New prices available for bulk orders",
    timestamp: "Yesterday",
    unread: 1,
    online: false,
    verified: true,
    messages: [
      {
        id: 1,
        sender: "supplier",
        content:
          "We have updated our prices for bulk orders effective this month.",
        timestamp: "Yesterday",
        status: "read",
      },
      {
        id: 2,
        sender: "supplier",
        content: "White Teff Flour: ETB 110/kg (was 120)",
        timestamp: "Yesterday",
        status: "read",
      },
      {
        id: 3,
        sender: "supplier",
        content: "Soybean Oil: ETB 165/liter (was 180)",
        timestamp: "Yesterday",
        status: "delivered",
      },
    ],
  },
  {
    id: 3,
    name: "Support Team",
    avatar: "ST",
    role: "support",
    lastMessage: "Your ticket #TB-789 has been resolved",
    timestamp: "Yesterday",
    unread: 0,
    online: true,
    verified: true,
    messages: [
      {
        id: 1,
        sender: "me",
        content:
          "I need help with payment verification for order #TB-2026-0862",
        timestamp: "Feb 10",
        status: "read",
      },
      {
        id: 2,
        sender: "support",
        content:
          "Hi Hidaya, I can help you with that. Could you provide more details?",
        timestamp: "Feb 10",
        status: "read",
      },
      {
        id: 3,
        sender: "me",
        content:
          "I paid via mobile banking but the order still shows as pending payment.",
        timestamp: "Feb 10",
        status: "read",
      },
      {
        id: 4,
        sender: "support",
        content:
          "I've checked your payment. It was successful but delayed in processing. I've manually updated your order status.",
        timestamp: "Feb 11",
        status: "read",
      },
      {
        id: 5,
        sender: "support",
        content:
          "Your order #TB-2026-0862 is now confirmed and being processed.",
        timestamp: "Feb 11",
        status: "read",
      },
    ],
  },
  {
    id: 4,
    name: "Bahir Dar Honey",
    avatar: "BH",
    role: "supplier",
    lastMessage: "Your review has been received. Thank you!",
    timestamp: "2 days ago",
    unread: 0,
    online: false,
    verified: true,
    messages: [],
  },
  {
    id: 5,
    name: "Ethiopian Textile",
    avatar: "ET",
    role: "supplier",
    lastMessage: "Cotton fabric back in stock",
    timestamp: "3 days ago",
    unread: 0,
    online: false,
    verified: false,
    messages: [],
  },
];

// Mock contacts
const contacts = [
  {
    id: 1,
    name: "Ethiopia Coffee Export",
    avatar: "EC",
    role: "supplier",
    online: true,
    unread: 2,
  },
  {
    id: 2,
    name: "Adama Wholesalers",
    avatar: "AW",
    role: "supplier",
    online: false,
    unread: 1,
  },
  {
    id: 3,
    name: "Support Team",
    avatar: "ST",
    role: "support",
    online: true,
    unread: 0,
  },
  {
    id: 4,
    name: "Bahir Dar Honey",
    avatar: "BH",
    role: "supplier",
    online: false,
    unread: 0,
  },
  {
    id: 5,
    name: "Mekelle Steel",
    avatar: "MS",
    role: "supplier",
    online: true,
    unread: 0,
  },
];

const MessagesPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState(
    conversations[0],
  );
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Add message logic here
      setMessageInput("");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    if (timestamp.includes(":")) return timestamp;
    return timestamp;
  };

  return (
    <div className="h-[calc(100vh-8rem)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Chat with suppliers and support team
          </p>
        </div>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Messages Container */}
      <Card className="h-[calc(100vh-12rem)] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar - Conversations List */}
          <div className="w-full md:w-80 border-r flex flex-col">
            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="px-4">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex-1">
                  Unread
                </TabsTrigger>
                <TabsTrigger value="suppliers" className="flex-1">
                  Suppliers
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Conversations */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg transition-colors",
                      selectedConversation.id === conversation.id
                        ? "bg-accent"
                        : "hover:bg-accent/50",
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback
                          className={cn(
                            "bg-primary/10 text-primary",
                            conversation.role === "support" &&
                              "bg-blue-100 text-blue-600",
                          )}
                        >
                          {conversation.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold truncate">
                            {conversation.name}
                          </span>
                          {conversation.verified && (
                            <Badge
                              variant="outline"
                              className="h-4 px-1 text-[10px] bg-primary/5"
                            >
                              ✓
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {conversation.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate text-left">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 capitalize"
                        >
                          {conversation.role}
                        </Badge>
                        {conversation.unread > 0 && (
                          <Badge className="h-5 w-5 p-0 flex items-center justify-center">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={cn(
                        "bg-primary/10 text-primary",
                        selectedConversation.role === "support" &&
                          "bg-blue-100 text-blue-600",
                      )}
                    >
                      {selectedConversation.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {selectedConversation.name}
                      </h3>
                      {selectedConversation.verified && (
                        <Badge
                          variant="outline"
                          className="h-4 px-1 text-[10px] bg-primary/5"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 capitalize"
                      >
                        {selectedConversation.role}
                      </Badge>
                      {selectedConversation.online ? (
                        <span className="text-xs text-green-600">● Online</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Offline
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Conversation Details</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-3">
                            <AvatarFallback className="bg-primary/10 text-primary text-xl">
                              {selectedConversation.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-lg">
                            {selectedConversation.name}
                          </h3>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {selectedConversation.role}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">About</h4>
                          {selectedConversation.role === "supplier" ? (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Member since
                                </span>
                                <span>2023</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Orders placed
                                </span>
                                <span>12</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Response time
                                </span>
                                <span>&lt; 2 hours</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Ticket #
                                </span>
                                <span>TB-789</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Status
                                </span>
                                <Badge
                                  variant="outline"
                                  className="bg-green-100 text-green-700"
                                >
                                  Resolved
                                </Badge>
                              </div>
                            </>
                          )}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Actions</h4>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive Conversation
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-destructive"
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Report
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Mark as Important
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages?.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender === "me"
                          ? "justify-end"
                          : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          message.sender === "me"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted",
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <div
                          className={cn(
                            "flex items-center gap-1 mt-1 text-xs",
                            message.sender === "me"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          <span>{formatTime(message.timestamp)}</span>
                          {message.sender === "me" && (
                            <>
                              {message.status === "read" ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : message.status === "delivered" ? (
                                <Check className="h-3 w-3" />
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message..."
                      className="min-h-[80px] resize-none"
                      value={messageInput}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setMessageInput(e.target.value)
                      }
                      onKeyDown={(
                        e: React.KeyboardEvent<HTMLTextAreaElement>,
                      ) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach File
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Press Enter to send, Shift+Enter for new line
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No conversation selected
                </h3>
                <p className="text-muted-foreground mb-4">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MessagesPage;
