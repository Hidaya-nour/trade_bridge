// components/shared/MyProductDetail.tsx
import React, { useState, useEffect } from "react"; // Add useEffect
import { useNavigate } from "react-router-dom";
import {
  Package,
  Star,
  Edit,
  Trash2,
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  Factory,
  Store,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { formatPrice } from "@/lib/formatters";
import { EditProductDialog } from "../../components/product/AddEditProductDialog";
import type { Product } from "@/types/product.types";
import toast from "react-hot-toast"; // Add toast import
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSpecifications } from "@/components/product/ProductSpecifications";

// ============================================================================
// TYPES
// ============================================================================

export type MyProductRole = "factory" | "distributor";

export interface MyProductDetailProps {
  role: MyProductRole;
  product: Product & {
    available: number;
    average_rating: number;
  };
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onUpdateStock: (newStock: number) => Promise<void>;
  onUpdatePrice: (newPrice: number) => Promise<void>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MyProductDetail: React.FC<MyProductDetailProps> = ({
  role,
  product,
  onEdit,
  onDelete,
  onUpdateStock,
  onUpdatePrice,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Add delete dialog state
  const [newStock, setNewStock] = useState(product.stock_quantity);
  const [newPrice, setNewPrice] = useState(product.price);

  // Loading states
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Update local state when product prop changes
  useEffect(() => {
    setNewStock(product.stock_quantity);
    setNewPrice(product.price);
  }, [product]);

  const getRoleIcon = () => {
    switch (role) {
      case "factory":
        return Factory;
      case "distributor":
        return Store;
      default:
        return Package;
    }
  };

  const getRoleName = () => {
    switch (role) {
      case "factory":
        return "Factory";
      case "distributor":
        return "Distributor";
      default:
        return "";
    }
  };

  const RoleIcon = getRoleIcon();

  const stockPercentage = (product.available / product.stock_quantity) * 100;

  // ========================================================================
  // ACTION HANDLERS
  // ========================================================================

  const handleStockUpdate = async () => {
    try {
      setLoadingStock(true);
      await onUpdateStock(newStock);
      setShowStockDialog(false);
      toast.success(`Stock updated to ${newStock} units`);
    } catch (err) {
      toast.error("Failed to update stock");
      console.error(err);
    } finally {
      setLoadingStock(false);
    }
  };

  const handlePriceUpdate = async () => {
    try {
      setLoadingPrice(true);
      await onUpdatePrice(newPrice);
      setShowPriceDialog(false);
      toast.success(`Price updated to ${formatPrice(newPrice)}`);
    } catch (err) {
      toast.error("Failed to update price");
      console.error(err);
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);
      await onDelete();
      setShowDeleteDialog(false);
      toast.success("Product deleted successfully");
      navigate(`/${role}/products`);
    } catch (err) {
      toast.error("Failed to delete product");
      console.error(err);
    } finally {
      setLoadingDelete(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <RoleIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">SKU: {product.sku}</Badge>
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {getRoleName()} Product
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            {loadingEdit ? "Updating..." : "Edit Product"}
          </Button>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" disabled={loadingDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                {loadingDelete ? "Deleting..." : "Delete"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Product</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this product? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={loadingDelete}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loadingDelete}
                >
                  {loadingDelete ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Image */}
        <div className="lg:col-span-1">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        {/* Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              {/* Price and Stock Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {product.unit_type}
                    </span>
                  </div>
                  <Button
                    variant="link"
                    className="px-0 mt-1"
                    onClick={() => setShowPriceDialog(true)}
                    disabled={loadingPrice}
                  >
                    Update Price
                  </Button>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Minimum Order</p>
                  <p className="text-2xl font-semibold mt-1">
                    {product.min_order_amount} {product.unit_type}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Stock Information */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Stock Status</p>
                  <Button
                    variant="link"
                    className="px-0"
                    onClick={() => setShowStockDialog(true)}
                    disabled={loadingStock}
                  >
                    Update Stock
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {product.available > product.min_order_amount ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : product.available > 0 ? (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {product.available} units available
                      </span>
                    </div>
                  </div>

                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-green-500"
                      style={{ width: `${stockPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Available ({product.available})</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for Details */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm leading-relaxed">{product.description}</p>
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
              <ProductSpecifications
                specifications={product.specifications}
                emptyMessage="No specifications available for this product."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory History</CardTitle>
              <CardDescription>
                Recent stock movements and adjustments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Stock Adjustment</p>
                        <p className="text-xs text-muted-foreground">
                          2 days ago
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50">
                      +50 units
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Sales and revenue metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Monthly Sales</p>
                  <p className="text-2xl font-bold mt-1">156</p>
                  <Badge variant="outline" className="mt-2 bg-green-50">
                    +12% vs last month
                  </Badge>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Monthly Revenue
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {formatPrice(15600)}
                  </p>
                  <Badge variant="outline" className="mt-2 bg-green-50">
                    +8% vs last month
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Stock Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Update the available stock quantity for this product.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock">New Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(parseInt(e.target.value))}
                min={0}
                disabled={loadingStock}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStockDialog(false)}
              disabled={loadingStock}
            >
              Cancel
            </Button>
            <Button onClick={handleStockUpdate} disabled={loadingStock}>
              {loadingStock ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Price Dialog */}
      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Price</DialogTitle>
            <DialogDescription>
              Update the selling price for this product.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">New Price (ETB)</Label>
              <Input
                id="price"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                min={0}
                step={0.01}
                disabled={loadingPrice}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPriceDialog(false)}
              disabled={loadingPrice}
            >
              Cancel
            </Button>
            <Button onClick={handlePriceUpdate} disabled={loadingPrice}>
              {loadingPrice ? "Updating..." : "Update Price"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
