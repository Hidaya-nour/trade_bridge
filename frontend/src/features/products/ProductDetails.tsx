import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Star,
  Truck,
  Clock,
  MapPin,
  XCircle,
  Shield,
  Building2,
  ChevronRight,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  Share2,
  Award,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/formatters";
import { getInitials, cn } from "@/lib/utils";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSpecifications } from "@/components/product/ProductSpecifications";
import SupplierReviewDialog from "@/components/supplier/SupplierReviewDialog";

// ============================================================================
// TYPES
// ============================================================================

export type ProductDetailRole = "retailer" | "distributor" | "factory";

export interface ProductDetailProps {
  role: ProductDetailRole;
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    unit_type: string;
    min_order_amount: number;
    maxOrder?: number;
    stock_quantity: number;
    reserved?: number;
    is_available?: boolean;
    description: string;
    specifications?: Record<string, string> | null;
    images?: string[];
    created_at: string;
    updated_at: string;
    pickup_location?: string;
    // Supplier info
    supplierId?: string;
    supplierName?: string;
    supplierType?: "factory" | "distributor";
    supplierRating?: number;
    supplierVerified?: boolean;
    supplierLocation?: string;
    supplierEstablished?: Date;

    // Factory info (for factory's own products)
    productionTime?: string;
    batchSize?: number;
    rawMaterials?: { name: string; quantity: number; unit: string }[];

    // Delivery options
    deliveryOptions?: {
      offered: boolean;
      cost?: number;
      freeThreshold?: number;
      estimatedDays: string;
      pickupAvailable: boolean;
    };

    // Bulk discounts
    bulkDiscounts?: {
      quantity: number;
      discount: number;
    }[];

    // Reviews
    rating: number;
    review_count: number;
    reviews?: {
      id: string;
      user: string;
      rating: number;
      comment: string;
      date: string;
    }[];

    // Related products
    relatedProducts?: {
      id: number;
      name: string;
      price: number;
      unit: string;
      rating: number;
    }[];
  };

  onAddToCart: (quantity: number) => void;
  cartQuantity?: number;
  onSetCartQuantity?: (quantity: number) => void;
  onViewSupplier?: () => void;
  onCompare?: () => void;
  onRateProduct?: (productId: string, rating: number, review: string) => void;
  onOrderNow?: (quantity: number) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ProductDetail: React.FC<ProductDetailProps> = ({
  role,
  product,
  onAddToCart,
  cartQuantity = 0,
  onSetCartQuantity,
  onViewSupplier,
  onOrderNow,
}) => {
  const [quantity] = useState(product.min_order_amount);
  const [activeTab, setActiveTab] = useState("description");
  const [rateSupplierOpen, setRateSupplierOpen] = useState(false);

  const getSupplierPath = () => {
    switch (role) {
      case "retailer":
        return `/retailer/suppliers/${product.supplierId}`;
      case "distributor":
        return `/distributor/factories/${product.supplierId}`;
      default:
        return "#";
    }
  };

  const handleAddToCart = () => {
    onAddToCart(quantity);
  };

  const handleOrderNow = () => {
    if (!onOrderNow) return;
    const nextQuantity = cartQuantity > 0 ? cartQuantity : quantity;
    onOrderNow(nextQuantity);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to={`/${role}/products`} className="hover:text-primary">
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{product.name}</span>
      </div>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Image */}
        <div className="lg:col-span-1">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        {/* Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {/* SKU: {product.sku} •  */}
                  Category: {product.category}
                </p>
              </div>
              {product.supplierVerified && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= product.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300",
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({product.review_count} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {typeof product.original_price === "number" &&
                  product.original_price > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                <span className="text-sm text-muted-foreground">
                  / {product.unit_type}
                </span>
              </div>
              {product.promotion_label && (
                <p className="mt-1 text-sm font-medium text-emerald-700">
                  {product.promotion_label}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Minimum order: {product.min_order_amount} {product.unit_type}
              </p>
            </div>

            {/* Pickup location */}
            {product.pickup_location ? (
              <div className="mt-3 flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                Pickup:{" "}
                <span className="ml-1 text-foreground font-medium">
                  {product.pickup_location}
                </span>
              </div>
            ) : null}

            {/* Stock Status */}
            <div className="mt-4">
              {product.is_available !== undefined ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Availability:</span>
                    {product.stock_quantity > product.min_order_amount * 2 ? (
                      <Badge className="bg-green-100 text-green-800">
                        In Stock
                      </Badge>
                    ) : product.stock_quantity > 0 ? (
                      <Badge className="bg-amber-100 text-amber-800">
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Availability:</span>
                  <Badge className="bg-green-100 text-green-800">
                    In Stock
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {product.stock_quantity} units available
                  </span>
                </div>
              )}
            </div>

            {/* Bulk Discounts */}
            {product.bulkDiscounts && product.bulkDiscounts.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-blue-800 mb-2">
                  Volume Discounts
                </p>
                <div className="space-y-1">
                  {product.bulkDiscounts.map((discount, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-blue-700">
                        {discount.quantity}+ units
                      </span>
                      <span className="font-medium text-blue-800">
                        {discount.discount}% off
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {cartQuantity > 0 && onSetCartQuantity ? (
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex items-center border rounded-lg overflow-hidden bg-background shadow-sm">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="h-11 w-11 rounded-r-none hover:bg-muted/70"
                      onClick={() =>
                        onSetCartQuantity(
                          Math.max(
                            cartQuantity - 1,
                            product?.min_order_amount || 1,
                          ),
                        )
                      }
                      disabled={
                        cartQuantity <= (product?.min_order_amount || 1)
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="px-5 text-base font-semibold text-foreground">
                      {cartQuantity}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-11 w-11 rounded-l-none hover:bg-muted/70"
                      onClick={() => onSetCartQuantity(cartQuantity + 1)}
                      disabled={
                        product.maxOrder
                          ? cartQuantity + 1 > product.maxOrder
                          : false
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onSetCartQuantity(0)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              )}
              {onOrderNow ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={handleOrderNow}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Place Order
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Details */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({product.review_count})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm leading-relaxed">{product.description}</p>

              {/* Delivery Info */}
              {product.deliveryOptions && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-3">
                    Delivery Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {product.deliveryOptions.estimatedDays}
                      </span>
                    </div>
                    {product.deliveryOptions.offered && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {product.deliveryOptions.cost
                            ? formatPrice(product.deliveryOptions.cost)
                            : "Free Delivery"}
                        </span>
                      </div>
                    )}
                    {product.deliveryOptions.freeThreshold && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Free over{" "}
                          {formatPrice(product.deliveryOptions.freeThreshold)}
                        </span>
                      </div>
                    )}
                    {product.deliveryOptions.pickupAvailable && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Pickup available</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Specifications</CardTitle>
              <CardDescription>
                Detailed technical specifications and features
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ProductSpecifications specifications={product.specifications} />

              {/* For factory - production info */}
              {role === "factory" && product.productionTime && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-3">
                    Production Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Production Time
                      </span>
                      <span className="font-medium">
                        {product.productionTime}
                      </span>
                    </div>
                    {product.batchSize && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Batch Size
                        </span>
                        <span className="font-medium">
                          {product.batchSize} units
                        </span>
                      </div>
                    )}
                    {product.rawMaterials && (
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-2">
                          Raw Materials
                        </p>
                        {product.rawMaterials.map((material, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-xs"
                          >
                            <span>{material.name}</span>
                            <span>
                              {material.quantity} {material.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold">Customer Reviews</h3>
                  <p className="text-xs text-muted-foreground">
                    Others experience with this product.
                  </p>
                </div>
              </div>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        {/* <span className="font-medium">{review.user}</span> */}
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
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
                    Be the first to review this product
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.relatedProducts.map((related) => (
              <Link
                key={related.id}
                to={`/${role}/products/${related.id}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium line-clamp-1 group-hover:text-primary">
                      {related.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{related.rating}</span>
                    </div>
                    <p className="text-sm font-semibold mt-1">
                      {formatPrice(related.price)}
                      <span className="text-xs text-muted-foreground ml-1">
                        /{related.unit}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {product.supplierId && product.supplierName ? (
        <SupplierReviewDialog
          open={rateSupplierOpen}
          onOpenChange={setRateSupplierOpen}
          supplierId={product.supplierId}
          supplierName={product.supplierName}
        />
      ) : null}
    </div>
  );
};
