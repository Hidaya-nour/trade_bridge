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
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Archive,
  Download,
  Upload,
  Tag,
  Layers,
  Clock,
  Star,
  Truck,
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
  DialogTrigger,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

// Mock product data
const initialProducts = [
  {
    id: 1,
    name: "White Teff Flour",
    sku: "TFF-001",
    category: "Grains",
    subcategory: "Teff",
    price: 120,
    unit: "kg",
    minOrder: 25,
    stock: 1250,
    reserved: 450,
    available: 800,
    supplier: "Ethiopia Agri",
    supplierId: 107,
    status: "active",
    verified: true,
    image: null,
    rating: 4.7,
    reviews: 95,
    sales: 3450,
    revenue: 414000,
    lastOrdered: "2026-02-10",
    tags: ["Gluten-Free", "Organic", "Bulk"],
    description:
      "High-quality white teff flour, gluten-free, perfect for injera and baking.",
  },
  {
    id: 2,
    name: "Soybean Oil",
    sku: "OIL-002",
    category: "Food",
    subcategory: "Oils",
    price: 180,
    unit: "liter",
    minOrder: 50,
    stock: 2800,
    reserved: 600,
    available: 2200,
    supplier: "Adama Wholesalers",
    supplierId: 102,
    status: "active",
    verified: true,
    image: null,
    rating: 4.6,
    reviews: 89,
    sales: 5200,
    revenue: 936000,
    lastOrdered: "2026-02-09",
    tags: ["Cooking", "Refined", "Bulk"],
    description: "Refined soybean oil, 5L bottles. Ethiopian standard.",
  },
  {
    id: 3,
    name: "Tomato Paste",
    sku: "TOM-003",
    category: "Food",
    subcategory: "Canned Goods",
    price: 85,
    unit: "can",
    minOrder: 100,
    stock: 3500,
    reserved: 800,
    available: 2700,
    supplier: "Ethiopia Agri",
    supplierId: 107,
    status: "active",
    verified: true,
    image: null,
    rating: 4.4,
    reviews: 73,
    sales: 8900,
    revenue: 756500,
    lastOrdered: "2026-02-08",
    tags: ["Bulk", "Canned"],
    description:
      "Double-concentrated tomato paste, 500g cans. Ethiopian grown tomatoes.",
  },
  {
    id: 4,
    name: "Yirgacheffe Coffee",
    sku: "COF-004",
    category: "Beverages",
    subcategory: "Coffee",
    price: 450,
    unit: "kg",
    minOrder: 10,
    stock: 2450,
    reserved: 300,
    available: 2150,
    supplier: "Ethiopia Coffee Export",
    supplierId: 101,
    status: "active",
    verified: true,
    image: null,
    rating: 4.9,
    reviews: 128,
    sales: 1800,
    revenue: 810000,
    lastOrdered: "2026-02-07",
    tags: ["Premium", "Organic", "Fair Trade"],
    description: "Premium Yirgacheffe coffee beans, washed process, grade 1.",
  },
  {
    id: 5,
    name: "Macadamia Nuts",
    sku: "NUT-005",
    category: "Food",
    subcategory: "Nuts",
    price: 650,
    unit: "kg",
    minOrder: 20,
    stock: 780,
    reserved: 120,
    available: 660,
    supplier: "Ethiopia Coffee Export",
    supplierId: 101,
    status: "active",
    verified: true,
    image: null,
    rating: 4.9,
    reviews: 56,
    sales: 450,
    revenue: 292500,
    lastOrdered: "2026-02-06",
    tags: ["Premium", "Snacks"],
    description: "Premium macadamia nuts, roasted and salted. Export quality.",
  },
  {
    id: 6,
    name: "Plastic Chairs",
    sku: "CHR-006",
    category: "Furniture",
    subcategory: "Chairs",
    price: 450,
    unit: "piece",
    minOrder: 50,
    stock: 1200,
    reserved: 200,
    available: 1000,
    supplier: "Adama Plastics",
    supplierId: 106,
    status: "active",
    verified: false,
    image: null,
    rating: 4.3,
    reviews: 29,
    sales: 850,
    revenue: 382500,
    lastOrdered: "2026-02-05",
    tags: ["Household", "Stackable"],
    description: "Durable plastic chairs, stackable, various colors available.",
  },
  {
    id: 7,
    name: "Notebooks",
    sku: "NB-007",
    category: "Stationery",
    subcategory: "Notebooks",
    price: 45,
    unit: "piece",
    minOrder: 100,
    stock: 5600,
    reserved: 1200,
    available: 4400,
    supplier: "Adama Wholesalers",
    supplierId: 102,
    status: "active",
    verified: true,
    image: null,
    rating: 4.5,
    reviews: 112,
    sales: 12500,
    revenue: 562500,
    lastOrdered: "2026-02-04",
    tags: ["School", "Bulk"],
    description: "70-page notebooks, ruled, soft cover. School supply quality.",
  },
  {
    id: 8,
    name: "Cotton Fabric",
    sku: "FAB-008",
    category: "Textiles",
    subcategory: "Fabric",
    price: 320,
    unit: "meter",
    minOrder: 50,
    stock: 1800,
    reserved: 350,
    available: 1450,
    supplier: "Ethiopian Textile",
    supplierId: 103,
    status: "inactive",
    verified: false,
    image: null,
    rating: 4.5,
    reviews: 67,
    sales: 2300,
    revenue: 736000,
    lastOrdered: "2026-02-03",
    tags: ["Eco-Friendly", "Fabric"],
    description: "100% cotton fabric, 120 GSM, available in various colors.",
  },
  {
    id: 9,
    name: "Pure Honey",
    sku: "HON-009",
    category: "Food",
    subcategory: "Honey",
    price: 280,
    unit: "jar",
    minOrder: 12,
    stock: 890,
    reserved: 150,
    available: 740,
    supplier: "Bahir Dar Honey",
    supplierId: 104,
    status: "active",
    verified: true,
    image: null,
    rating: 4.8,
    reviews: 42,
    sales: 620,
    revenue: 173600,
    lastOrdered: "2026-02-02",
    tags: ["Organic", "Raw"],
    description: "100% pure white honey, raw and unfiltered.",
  },
  {
    id: 10,
    name: "Steel Rebars",
    sku: "STL-010",
    category: "Construction",
    subcategory: "Steel",
    price: 8500,
    unit: "ton",
    minOrder: 5,
    stock: 320,
    reserved: 50,
    available: 270,
    supplier: "Mekelle Steel",
    supplierId: 105,
    status: "active",
    verified: true,
    image: null,
    rating: 4.6,
    reviews: 38,
    sales: 180,
    revenue: 1530000,
    lastOrdered: "2026-02-01",
    tags: ["Industrial", "Construction"],
    description:
      "High-tensile steel rebars, 12mm-32mm diameter. ASTM standards.",
  },
  {
    id: 11,
    name: "Cement",
    sku: "CEM-011",
    category: "Construction",
    subcategory: "Cement",
    price: 620,
    unit: "bag",
    minOrder: 100,
    stock: 4200,
    reserved: 800,
    available: 3400,
    supplier: "Mugher Cement",
    supplierId: 108,
    status: "active",
    verified: true,
    image: null,
    rating: 4.7,
    reviews: 214,
    sales: 5600,
    revenue: 3472000,
    lastOrdered: "2026-01-30",
    tags: ["Industrial", "Bulk"],
    description: "Portland cement, 50kg bags. Grade 42.5R.",
  },
  {
    id: 12,
    name: "Pasta",
    sku: "PAS-012",
    category: "Food",
    subcategory: "Pasta",
    price: 95,
    unit: "kg",
    minOrder: 50,
    stock: 150,
    reserved: 80,
    available: 70,
    supplier: "Adama Wholesalers",
    supplierId: 102,
    status: "active",
    verified: true,
    image: null,
    rating: 4.2,
    reviews: 31,
    sales: 420,
    revenue: 39900,
    lastOrdered: "2026-01-28",
    tags: ["Food", "Bulk"],
    description: "Durum wheat pasta, various shapes.",
  },
];

const categories = [
  "All Categories",
  "Food",
  "Grains",
  "Beverages",
  "Construction",
  "Textiles",
  "Furniture",
  "Stationery",
  "Household",
];

const suppliers = [
  { id: 101, name: "Ethiopia Coffee Export" },
  { id: 102, name: "Adama Wholesalers" },
  { id: 103, name: "Ethiopian Textile" },
  { id: 104, name: "Bahir Dar Honey" },
  { id: 105, name: "Mekelle Steel" },
  { id: 106, name: "Adama Plastics" },
  { id: 107, name: "Ethiopia Agri" },
  { id: 108, name: "Mugher Cement" },
];

const ManageProductsPage: React.FC = () => {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const itemsPerPage = 10;

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" ||
      product.category === selectedCategory;
    const matchesSupplier =
      !selectedSupplier || product.supplierId.toString() === selectedSupplier;
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

  const deleteProduct = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setShowDeleteDialog(false);
  };

  const toggleStatus = (productId: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, status: p.status === "active" ? "inactive" : "active" }
          : p,
      ),
    );
  };

  const duplicateProduct = (product: any) => {
    const newProduct = {
      ...product,
      id: Math.max(...products.map((p) => p.id)) + 1,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
      stock: 0,
      reserved: 0,
      available: 0,
      status: "inactive",
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const formatPrice = (price: number) => {
    return `ETB ${price.toLocaleString()}`;
  };

  const formatCurrency = (value: number) => {
    return `ETB ${value.toLocaleString()}`;
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Products</h1>
          <p className="text-muted-foreground mt-1">
            Add, edit, and manage your product inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold mt-1">{totalProducts}</p>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold mt-1">{activeProducts}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold mt-1">{lowStockItems}</p>
              </div>
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalValue)}
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name, SKU, or supplier..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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

              <Select
                value={selectedSupplier}
                onValueChange={setSelectedSupplier}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Suppliers" />{" "}
                  {/* ✅ Placeholder handles "All" */}
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
          </div>
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
                  <TableHead>Supplier</TableHead>
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
                        <Badge
                          variant="outline"
                          className={
                            product.status === "active"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/distributor/suppliers/${product.supplierId}`}
                          className="text-sm hover:text-primary"
                        >
                          {product.supplier}
                        </Link>
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
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => duplicateProduct(product)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleStatus(product.id)}
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
                              <Link to={`/distributor/products/${product.id}`}>
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
                <Pagination className="justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) => Math.max(prev - 1, 1));
                        }}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }).map(
                      (_, i) => {
                        let pageNumber = currentPage;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else {
                          if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }
                        }
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              href="#"
                              isActive={currentPage === pageNumber}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNumber);
                              }}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      },
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          );
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
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
                          {product.supplier}
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
                        <Link to={`/distributor/products/${product.id}`}>
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
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNumber = currentPage;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else {
                    if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                  }
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === pageNumber}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNumber);
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
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
                <Input id="name" placeholder="Enter product name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="Enter SKU" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="grains">Grains</SelectItem>
                      <SelectItem value="beverages">Beverages</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="textiles">Textiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETB)</Label>
                  <Input id="price" type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select>
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
                  <Input id="minOrder" type="number" placeholder="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input id="stock" type="number" placeholder="0" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Product Tags</Label>
                <div className="flex gap-2 flex-wrap">
                  {["Premium", "Organic", "Bulk", "Local", "Imported"].map(
                    (tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10"
                      >
                        {tag}
                      </Badge>
                    ),
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="active" defaultChecked />
                <Label htmlFor="active">Active (visible to retailers)</Label>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>Add Product</Button>
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
            <Button onClick={() => setShowEditDialog(false)}>
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
              onClick={() =>
                selectedProduct && deleteProduct(selectedProduct.id)
              }
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

export default ManageProductsPage;
