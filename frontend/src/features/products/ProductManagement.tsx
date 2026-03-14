import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
  Star,
  Download,
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
  DropdownMenuLabel,
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
import { Progress } from "@/components/ui/progress";

import {
  StatsCard,
  StatusBadge,
  PaginationBar,
  SearchFilter,
} from "@/components";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  formatPrice,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { EditProductDialog } from "@/components/product/AddEditProductDialog";
import type { Product } from "@/types/product.types";

// ============================================================================
// TYPES (Aligned with Database Schema)
// ============================================================================

export type ProductRole = "distributor" | "factory";

export interface ProductManagementConfig {
  role: ProductRole;
  title: string;
  description: string;
  addButtonLabel: string;
  supplierPath?: string;
}

// ============================================================================
// PROPS
// ============================================================================

interface ProductManagementProps {
  config: ProductManagementConfig;
  products: Product[];
  categories: string[]; // Categories for filtering (includes "All Categories")
  suppliers?: { id: string; name: string }[];
  onAddProduct: (product: any) => void;
  onEditProduct: (id: string, product: any) => void;
  onDeleteProduct: (id: string) => void;
  onDuplicateProduct: (product: Product) => void;
  onToggleStatus: (id: string) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// ============================================================================
// COMPONENT
// ============================================================================

export const ProductManagement: React.FC<ProductManagementProps> = ({
  config,
  products: initialProducts,
  categories: filterCategories, // Categories for filtering (from props)
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onToggleStatus,
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const itemsPerPage = 10;
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Update products when initialProducts changes
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const formCategories = filterCategories.filter(
    (category) => category !== "All Categories",
  );

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" ||
      product.category === selectedCategory;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.is_available) ||
      (statusFilter === "inactive" && !product.is_available);

    const available = product.stock_quantity || 0;
    const min_order_amount = product.min_order_amount || 1;

    let matchesStock = true;
    if (stockFilter === "low") {
      matchesStock = available < min_order_amount * 2;
    } else if (stockFilter === "critical") {
      matchesStock = available < min_order_amount;
    } else if (stockFilter === "out") {
      matchesStock = available === 0;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.is_available).length;
  const lowStockItems = products.filter(
    (p) => (p.stock_quantity || 0) < (p.min_order_amount || 1) * 2,
  ).length;
  const totalValue = products.reduce(
    (sum, p) => sum + (p.stock_quantity || 0) * p.price,
    0,
  );

  const getStockStatus = (available: number, min_order_amount: number) => {
    const ratio = available / min_order_amount;
    if (available === 0)
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-800",
        progress: 0,
      };
    if (ratio < 1)
      return {
        label: "Critical",
        color: "bg-red-100 text-red-800",
        progress: 30,
      };
    if (ratio < 2)
      return {
        label: "Low",
        color: "bg-amber-100 text-amber-800",
        progress: 60,
      };
    return {
      label: "In Stock",
      color: "bg-green-100 text-green-800",
      progress: 100,
    };
  };

  const calculateProgress = (stockQuantity: number): number => {
    // Cap at 100% and ensure it's a valid number
    const maxStock = 1000; // You can adjust this based on your typical stock levels
    const percentage = Math.min((stockQuantity / maxStock) * 100, 100);
    return isNaN(percentage) ? 0 : percentage;
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const dataToExport = filteredProducts.map((product) => ({
      "Product Name": product.name,
      Category: product.category,
      "Price (ETB)": product.price,
      "Stock Quantity": product.stock_quantity,
      "Unit Type": product.unit_type,
      "Min Order": product.min_order_amount,
      Status: product.is_available ? "Active" : "Inactive",
      "Total Value (ETB)": (product.stock_quantity || 0) * product.price,
      Rating: product.rating || "N/A",
    }));

    switch (format) {
      case "csv":
        exportToCSV(
          dataToExport,
          `products_export_${new Date().toISOString().split("T")[0]}.csv`,
        );
        break;
      case "excel":
        exportToExcel(
          dataToExport,
          `products_export_${new Date().toISOString().split("T")[0]}.xlsx`,
        );
        break;
      case "pdf":
        exportToPDF(
          dataToExport,
          `products_export_${new Date().toISOString().split("T")[0]}.pdf`,
        );
        break;
    }
  };
  const statsData = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Active Products",
      value: activeProducts,
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Low Stock Items",
      value: lowStockItems,
      icon: AlertCircle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-muted-foreground mt-1">{config.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export As</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <span className="mr-2">📊</span>
                CSV File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <span className="mr-2">📑</span>
                Excel Spreadsheet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <span className="mr-2">📄</span>
                PDF Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.print()}>
                <span className="mr-2">🖨️</span>
                Print View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {config.addButtonLabel}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <SearchFilter
            placeholder="Search by product name or supplier..."
            onSearch={setSearchQuery}
            filterComponent={
              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Stock Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                <div className="border rounded-md flex">
                  <Button
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-r-none"
                    onClick={() => setViewMode("table")}
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-l-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, filteredProducts.length)} of{" "}
          {filteredProducts.length} products
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {filteredProducts.length} products
        </Badge>
      </div>

      {/* Products Table View */}
      {viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((product) => {
                  const stockStatus = getStockStatus(
                    product.stock_quantity || 0,
                    product.min_order_amount || 1,
                  );
                  return (
                    <TableRow
                      key={product.id}
                      onClick={(e) => {
                        // Prevent click if it came from a button
                        if (
                          user &&
                          !(e.target as HTMLElement).closest("button")
                        ) {
                          navigate(`/${user.role}/my-products/${product.id}`);
                        }
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary/30" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.rating && product.rating > 0 && (
                              <div className="flex items-center mt-0.5">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs ml-0.5">
                                  {product.rating}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatPrice(product.price)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            / {product.unit_type}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {product.stock_quantity || 0}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {product.unit_type}
                            </span>
                          </div>
                          <Progress
                            value={calculateProgress(
                              product.stock_quantity || 0,
                            )}
                            className="h-1.5 w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Min: {product.min_order_amount || 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={product.is_available ? "active" : "inactive"}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent the row click
                                setSelectedProduct(product);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicateProduct(product);
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleStatus(product.id);
                              }}
                            >
                              {product.is_available ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              {user && (
                                <Link
                                  to={`/${user.role}/my-products/${product.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(product);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
          <CardFooter className="border-t px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-muted-foreground">
                {filteredProducts.length} total products • {activeProducts}{" "}
                active
              </p>
              {totalPages > 1 && (
                <PaginationBar
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Products Grid View */}
      {viewMode === "grid" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentItems.map((product) => {
              const stockStatus = getStockStatus(
                product.stock_quantity || 0,
                product.min_order_amount || 1,
              );
              return (
                <Card
                  onClick={(e) => {
                    // Prevent click if it came from a button
                    if (user && !(e.target as HTMLElement).closest("button")) {
                      navigate(`/${user.role}/my-products/${product.id}`);
                    }
                  }}
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-40 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                    <Package className="h-16 w-16 text-primary/30" />
                    <Badge
                      className={cn(
                        "absolute top-3 right-3",
                        product.is_available
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200",
                      )}
                    >
                      {product.is_available ? "active" : "inactive"}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                      </div>
                      {product.rating && product.rating > 0 && (
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs ml-1">{product.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          /{product.unit_type}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Min: {product.min_order_amount || 1}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Stock</span>
                        <span className="font-medium">
                          {product.stock_quantity || 0} {product.unit_type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Status</span>
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                      <Progress
                        value={calculateProgress(product.stock_quantity || 0)}
                        className="h-1.5"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        {user && (
                          <Link to={`/${user.role}/my-products/${product.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination for Grid View */}
          {totalPages > 1 && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Add Product Dialog */}
      <EditProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        product={null}
        mode="add"
        onAdd={onAddProduct}
        categories={formCategories}
      />

      {/* Edit Product Dialog */}
      <EditProductDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        product={selectedProduct}
        onSave={onEditProduct}
        mode="edit"
        categories={formCategories}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProduct?.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedProduct) {
                  onDeleteProduct(selectedProduct.id);
                  setShowDeleteDialog(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
