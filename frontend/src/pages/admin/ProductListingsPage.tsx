import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  Search,
  Store,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Eye,
  Pencil,
  Power,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { StatsCard, EmptyState, PaginationBar } from "@/components";
import { EditProductDialog } from "@/components/product/AddEditProductDialog";
import { formatPrice, formatDate } from "@/lib/formatters";
import { useProductStore } from "@/stores/product.store";
import type { Product } from "@/types/product.types";

const ProductListingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    products,
    categories,
    isLoading,
    error,
    fetchProducts,
    fetchCategories,
    updateProduct,
    deleteProduct,
    toggleAvailability,
    clearError,
  } = useProductStore();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts({ limit: 100 }, { replace: true });
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    const supplierId = searchParams.get("supplier_id");
    const initialSearch = searchParams.get("search");
    const desired = supplierId || initialSearch;
    if (desired && !searchQuery) {
      setSearchQuery(desired);
    }
  }, [searchParams, searchQuery]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const search = searchQuery.trim().toLowerCase();
      const supplierName =
        product.supplier?.business_name ||
        product.supplier?.full_name ||
        "";

      const matchesSearch =
        search === "" ||
        product.name.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search) ||
        supplierName.toLowerCase().includes(search) ||
        String(product.supplier_id || "").toLowerCase().includes(search);

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && product.is_available) ||
        (selectedStatus === "inactive" && !product.is_available) ||
        (selectedStatus === "low-stock" && product.stock_quantity <= product.min_order_amount);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.is_available).length,
      inactive: products.filter((product) => !product.is_available).length,
      lowStock: products.filter(
        (product) => product.stock_quantity <= product.min_order_amount,
      ).length,
    }),
    [products],
  );

  const handleToggleAvailability = async (productId: string) => {
    const toastId = toast.loading("Updating product status...");
    const ok = await toggleAvailability(productId);
    if (ok) {
      toast.success("Product status updated", { id: toastId });
      await fetchProducts({ limit: 100 }, { replace: true });
    } else {
      toast.error("Failed to update product status", { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    const toastId = toast.loading("Deleting product...");
    const ok = await deleteProduct(selectedProduct.id);
    if (ok) {
      toast.success("Product deleted", { id: toastId });
      setShowDeleteDialog(false);
      setSelectedProduct(null);
      await fetchProducts({ limit: 100 }, { replace: true });
    } else {
      toast.error("Failed to delete product", { id: toastId });
    }
  };

  const handleEdit = async (productId: string, payload: Partial<Product>) => {
    const toastId = toast.loading("Saving product changes...");
    const updated = await updateProduct(productId, payload);
    if (updated) {
      toast.success("Product updated", { id: toastId });
      setShowEditDialog(false);
      await fetchProducts({ limit: 100 }, { replace: true });
    } else {
      toast.error("Failed to update product", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Listings</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor all products across suppliers and manage catalog visibility.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={stats.total}
          icon={Package}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Active Listings"
          value={stats.active}
          icon={CheckCircle2}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Inactive"
          value={stats.inactive}
          icon={Power}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
        />
        <StatsCard
          title="Low Stock"
          value={stats.lowStock}
          icon={AlertCircle}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product, category, or supplier..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading products...
          </CardContent>
        </Card>
      ) : currentItems.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Try adjusting the search or filters."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((product) => {
                  const supplierName =
                    product.supplier?.business_name ||
                    product.supplier?.full_name ||
                    "Unknown supplier";

                  const lowStock =
                    product.stock_quantity <= product.min_order_amount;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.unit_type} • Min order {product.min_order_amount}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{supplierName}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.supplier?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">
                            {product.stock_quantity} {product.unit_type}
                          </p>
                          {lowStock && (
                            <p className="text-xs text-amber-600">Low stock</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            product.is_available
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-700"
                          }
                        >
                          {product.is_available ? "active" : "inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(product.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowEditDialog(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit product
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleAvailability(product.id)}
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {product.is_available ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t p-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + currentItems.length, filteredProducts.length)} of{" "}
              {filteredProducts.length} products
            </p>
            {totalPages > 1 && (
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </CardFooter>
        </Card>
      )}

      <EditProductDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        product={selectedProduct}
        mode="edit"
        onSave={handleEdit}
        categories={categories}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProduct
                ? `Delete ${selectedProduct.name} from the catalog? This cannot be undone.`
                : "Delete this product?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductListingsPage;
