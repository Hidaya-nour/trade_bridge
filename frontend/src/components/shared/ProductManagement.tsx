import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  StatsCard,
  StatusBadge,
  EmptyState,
  PaginationBar,
  SearchFilter,
} from "@/components/shared";
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type ProductRole = "distributor" | "factory";

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  subcategory?: string;
  price: number;
  unit: string;
  minOrder: number;
  stock: number;
  reserved: number;
  available: number;
  status: "active" | "inactive";
  verified: boolean;
  image?: string | null;
  rating: number;
  reviews: number;
  sales: number;
  revenue: number;
  lastOrdered?: string;
  tags: string[];
  description: string;

  // Distributor-specific (optional)
  supplier?: string;
  supplierId?: number;

  // Factory-specific (optional)
  // (can be added later if needed)
}

export interface ProductManagementConfig {
  role: ProductRole;
  title: string;
  description: string;
  addButtonLabel: string;
  showSupplier: boolean; // Distributor shows supplier, Factory doesn't
  supplierPath?: string; // "/suppliers" for distributor
}

// ============================================================================
// PROPS
// ============================================================================

interface ProductManagementProps {
  config: ProductManagementConfig;
  products: Product[];
  categories: string[];
  suppliers?: { id: number; name: string }[]; // For distributor only
  onAddProduct: (product: any) => void;
  onEditProduct: (id: number, product: any) => void;
  onDeleteProduct: (id: number) => void;
  onDuplicateProduct: (product: Product) => void;
  onToggleStatus: (id: number) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ProductManagement: React.FC<ProductManagementProps> = ({
  config,
  products: initialProducts,
  categories,
  suppliers = [],
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onToggleStatus,
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const itemsPerPage = 10;

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    unit: "kg",
    minOrder: "",
    stock: "",
    description: "",
    tags: [] as string[],
    active: true,
  });

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.supplier?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      );

    const matchesCategory =
      selectedCategory === "All Categories" ||
      product.category === selectedCategory;

    const matchesSupplier =
      !selectedSupplier || product.supplierId?.toString() === selectedSupplier;

    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;

    let matchesStock = true;
    if (stockFilter === "low") {
      matchesStock = product.available < product.minOrder * 2;
    } else if (stockFilter === "critical") {
      matchesStock = product.available < product.minOrder;
    } else if (stockFilter === "out") {
      matchesStock = product.available === 0;
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSupplier &&
      matchesStatus &&
      matchesStock
    );
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
  const activeProducts = products.filter((p) => p.status === "active").length;
  const lowStockItems = products.filter(
    (p) => p.available < p.minOrder * 2,
  ).length;
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

  const getStockStatus = (available: number, minOrder: number) => {
    const ratio = available / minOrder;
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

  const handleAddProduct = () => {
    onAddProduct(newProduct);
    setShowAddDialog(false);
    setNewProduct({
      name: "",
      sku: "",
      category: "",
      price: "",
      unit: "kg",
      minOrder: "",
      stock: "",
      description: "",
      tags: [],
      active: true,
    });
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
    {
      title: "Inventory Value",
      value: formatPrice(totalValue),
      icon: DollarSign,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {config.addButtonLabel}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <SearchFilter
            placeholder="Search by product name, SKU, or supplier..."
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
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {config.showSupplier && suppliers.length > 0 && (
                  <Select
                    value={selectedSupplier}
                    onValueChange={setSelectedSupplier}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem
                          key={supplier.id}
                          value={supplier.id.toString()}
                        >
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

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
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Status</TableHead>
                  {config.showSupplier && <TableHead>Supplier</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((product) => {
                  const stockStatus = getStockStatus(
                    product.available,
                    product.minOrder,
                  );
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary/30" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {product.verified && (
                                <Badge
                                  variant="outline"
                                  className="h-4 px-1 text-[10px] bg-green-50 text-green-700"
                                >
                                  Verified
                                </Badge>
                              )}
                              <div className="flex items-center">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs ml-0.5">
                                  {product.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {product.sku}
                        </code>
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
                            / {product.unit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {product.stock}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              units
                            </span>
                          </div>
                          <Progress
                            value={(product.available / product.stock) * 100}
                            className="h-1.5 w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          {product.available}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={
                            product.status === "active" ? "active" : "inactive"
                          }
                        />
                      </TableCell>
                      {config.showSupplier && (
                        <TableCell>
                          {product.supplierId && config.supplierPath ? (
                            <Link
                              to={`/${config.role}${config.supplierPath}/${product.supplierId}`}
                              className="text-sm hover:text-primary"
                            >
                              {product.supplier}
                            </Link>
                          ) : (
                            <span className="text-sm">{product.supplier}</span>
                          )}
                        </TableCell>
                      )}
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
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDuplicateProduct(product)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onToggleStatus(product.id)}
                            >
                              {product.status === "active" ? (
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
                              <Link
                                to={`/${config.role}/products/${product.id}`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
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
                product.available,
                product.minOrder,
              );
              return (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-40 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                    <Package className="h-16 w-16 text-primary/30" />
                    <Badge
                      className={cn(
                        "absolute top-3 right-3",
                        product.status === "active"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200",
                      )}
                    >
                      {product.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {product.supplier || config.role}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs ml-1">{product.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          /{product.unit}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Min: {product.minOrder}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Stock</span>
                        <span className="font-medium">
                          {product.stock} units
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Available</span>
                        <Badge className={stockStatus.color}>
                          {product.available}
                        </Badge>
                      </div>
                      <Progress
                        value={(product.available / product.stock) * 100}
                        className="h-1.5"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {product.tags.length > 2 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{product.tags.length - 2}
                        </Badge>
                      )}
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
                        <Link to={`/${config.role}/products/${product.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
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
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the product details to add to your inventory
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="Enter SKU"
                    value={newProduct.sku}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, sku: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c !== "All Categories")
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETB)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={newProduct.unit}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, unit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="liter">liter</SelectItem>
                      <SelectItem value="piece">piece</SelectItem>
                      <SelectItem value="box">box</SelectItem>
                      <SelectItem value="carton">carton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrder">Minimum Order</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    placeholder="1"
                    value={newProduct.minOrder}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, minOrder: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newProduct.active}
                  onCheckedChange={(checked) =>
                    setNewProduct({ ...newProduct, active: checked })
                  }
                />
                <Label htmlFor="active">Active (visible to customers)</Label>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input id="edit-name" defaultValue={selectedProduct?.name} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (ETB)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    defaultValue={selectedProduct?.price}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    defaultValue={selectedProduct?.stock}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  defaultValue={selectedProduct?.description}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  defaultChecked={selectedProduct?.status === "active"}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedProduct) {
                  onEditProduct(selectedProduct.id, {});
                  setShowEditDialog(false);
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
