import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Package,
  ShoppingCart,
  Truck,
  Star,
  Shield,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  CreditCard,
  Scale,
  Factory,
  Store,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { StatusBadge } from "@/components";
import { formatPrice, formatDate } from "@/lib/formatters";
import { getInitials, cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type ProfileRole = "retailer" | "distributor" | "factory";

export interface PartnerProfile {
  id: number;
  name: string;
  type: "supplier" | "distributor" | "factory" | "retailer";
  logo?: string;
  banner?: string;
  verified: boolean;
  tier?: "platinum" | "gold" | "silver" | "bronze" | "new";

  // Basic Info
  description: string;
  established: string;
  employees?: string;
  website?: string;

  // Location
  location: string;
  region: string;
  address?: string;

  // Contact
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  alternatePhone?: string;

  // Business Details
  businessType: string[];
  categories: string[];
  products: number;

  // Performance
  rating: number;
  review_count: number;
  totalOrders: number;
  totalValue: number;
  avgOrderValue: number;
  onTimeDelivery: number;
  responseTime: string;

  // Credit
  creditLimit?: number;
  creditUsed?: number;
  paymentTerms?: string;

  // Contract
  contractStart?: string;
  contractEnd?: string;
  contractStatus?:
    | "active"
    | "expiring"
    | "expired"
    | "negotiating"
    | "pending";

  // Stats
  monthlyStats?: {
    month: string;
    orders: number;
    value: number;
  }[];

  // Recent Activity
  recentOrders?: {
    id: string;
    date: string;
    amount: number;
    status: string;
  }[];

  // Reviews
  recentReviews?: {
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];

  // Social/Additional
  social?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };

  certificates?: string[];
}

export interface PartnerProfileConfig {
  role: ProfileRole;
  partnerType: string; // "Supplier", "Distributor", "Factory", "Retailer"
  backPath: string; // "/suppliers", "/factories", etc.
  actionButtons: {
    label: string;
    path: string;
    icon: React.ElementType;
    variant?: "default" | "outline";
  }[];
}

// ============================================================================
// PROPS
// ============================================================================

interface PartnerProfileProps {
  config: PartnerProfileConfig;
  profile: PartnerProfile;
  onContact?: () => void;
  onMessage?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const tierColors = {
  platinum: "bg-indigo-100 text-indigo-800",
  gold: "bg-amber-100 text-amber-800",
  silver: "bg-gray-100 text-gray-800",
  bronze: "bg-orange-100 text-orange-800",
  new: "bg-green-100 text-green-800",
};

const contractStatusColors = {
  active: "bg-green-100 text-green-800",
  expiring: "bg-amber-100 text-amber-800",
  expired: "bg-red-100 text-red-800",
  negotiating: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
};

// ============================================================================
// COMPONENT
// ============================================================================

export const PartnerProfile: React.FC<PartnerProfileProps> = ({
  config,
  profile,
  onContact,
  onMessage,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const getRoleIcon = () => {
    switch (profile.type) {
      case "factory":
        return Factory;
      case "distributor":
        return Package;
      case "retailer":
        return Store;
      default:
        return Building2;
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronRight className="h-5 w-5 rotate-180" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
          <p className="text-muted-foreground mt-1">
            {config.partnerType} Profile
          </p>
        </div>
      </div>

      {/* Banner & Avatar */}
      <Card className="overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 relative">
          {profile.banner && (
            <img
              src={profile.banner}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Avatar & Basic Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 mb-4">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                {profile.verified && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {profile.tier && (
                  <Badge className={tierColors[profile.tier]}>
                    {profile.tier.charAt(0).toUpperCase() +
                      profile.tier.slice(1)}{" "}
                    Partner
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Est. {profile.established}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.products} products</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold">{profile.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({profile.review_count} reviews)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="text-lg font-bold mt-1">{profile.totalOrders}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-lg font-bold mt-1">
                  {formatPrice(profile.totalValue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">
                  On-Time Delivery
                </p>
                <p className="text-lg font-bold mt-1 text-green-600">
                  {profile.onTimeDelivery}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {config.actionButtons.map((button, index) => (
          <Button key={index} variant={button.variant || "default"} asChild>
            <Link to={button.path}>
              <button.icon className="h-4 w-4 mr-2" />
              {button.label}
            </Link>
          </Button>
        ))}

        {onMessage && (
          <Button variant="outline" onClick={onMessage}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        )}

        {onContact && (
          <Button variant="outline" onClick={onContact}>
            <Phone className="h-4 w-4 mr-2" />
            Contact
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Company Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {profile.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Business Type
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.businessType.map((type, idx) => (
                          <Badge key={idx} variant="secondary">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Categories
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.categories.slice(0, 3).map((cat, idx) => (
                          <Badge key={idx} variant="outline">
                            {cat}
                          </Badge>
                        ))}
                        {profile.categories.length > 3 && (
                          <Badge variant="outline">
                            +{profile.categories.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {profile.certificates && profile.certificates.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">
                        Certificates
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.certificates.map((cert, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="bg-green-50"
                          >
                            <Award className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.contactPhone}</span>
                  </div>
                  {profile.alternatePhone && (
                    <div className="flex items-center gap-3 pl-7">
                      <span className="text-sm text-muted-foreground">
                        Alt: {profile.alternatePhone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.contactEmail}</span>
                  </div>
                  {profile.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">
                        {profile.address || profile.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile.region}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats & Contract */}
            <div className="space-y-6">
              {/* Contract Status */}
              {profile.contractStatus && (
                <Card>
                  <CardHeader>
                    <CardTitle>Partnership Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <Badge
                        className={contractStatusColors[profile.contractStatus]}
                      >
                        {profile.contractStatus}
                      </Badge>
                    </div>
                    {profile.contractStart && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Started</span>
                        <span className="font-medium">
                          {formatDate(profile.contractStart)}
                        </span>
                      </div>
                    )}
                    {profile.contractEnd && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ends</span>
                        <span className="font-medium">
                          {formatDate(profile.contractEnd)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Credit Information */}
              {profile.creditLimit && (
                <Card>
                  <CardHeader>
                    <CardTitle>Credit Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Credit Limit
                      </span>
                      <span className="font-medium">
                        {formatPrice(profile.creditLimit)}
                      </span>
                    </div>
                    {profile.creditUsed && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Used</span>
                          <span className="font-medium">
                            {formatPrice(profile.creditUsed)}
                          </span>
                        </div>
                        <Progress
                          value={
                            (profile.creditUsed / profile.creditLimit) * 100
                          }
                          className="h-1.5"
                        />
                      </>
                    )}
                    {profile.paymentTerms && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Payment Terms
                        </span>
                        <span className="font-medium">
                          {profile.paymentTerms}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Response Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Levels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-medium">{profile.responseTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Avg. Order Value
                    </span>
                    <span className="font-medium">
                      {formatPrice(profile.avgOrderValue)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                {profile.products} products available from this{" "}
                {config.partnerType.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to={`/${config.role}/products?supplier=${profile.id}`}>
                  <Package className="h-4 w-4 mr-2" />
                  Browse All Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.recentOrders && profile.recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {profile.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <Link
                            to={`/${config.role}/orders/${order.id}`}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {order.id}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatPrice(order.amount)}
                          </p>
                          <StatusBadge status={order.status as any} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No recent orders
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      On-Time Delivery
                    </span>
                    <span className="font-medium">
                      {profile.onTimeDelivery}%
                    </span>
                  </div>
                  <Progress value={profile.onTimeDelivery} className="h-1.5" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Response Rate</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <Progress value={98} className="h-1.5" />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Orders
                    </span>
                    <span className="text-sm font-medium">
                      {profile.totalOrders}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Value
                    </span>
                    <span className="text-sm font-medium">
                      {formatPrice(profile.totalValue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Avg. Order Value
                    </span>
                    <span className="text-sm font-medium">
                      {formatPrice(profile.avgOrderValue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>
                {profile.review_count} reviews • {profile.rating} average rating
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.recentReviews && profile.recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {profile.recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{review.user}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "h-3 w-3",
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300",
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-medium mb-1">No reviews yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Be the first to leave a review
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
