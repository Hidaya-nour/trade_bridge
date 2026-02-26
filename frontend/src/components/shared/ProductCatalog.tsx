import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Grid3x3,
  List,
  Star,
  ShoppingCart,
  Eye,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  X,
  Plus,
  Minus,
  MapPin,
  Factory,
  Store,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  StatusBadge,
  EmptyState,
  PaginationBar,
  SearchFilter,
} from "@/components/shared";
import { formatPrice } from "@/lib/formatters";

// ============================================================================
// TYPES
// ============================================================================

export type CatalogRole = "retailer" | "distributor";

export interface CatalogProduct {
  id: string;
  name: string;
  supplier_id: string;
  supplier_name: string;
  supplier_type?: "factory" | "distributor";
  category: string;
  subcategory?: string;
  price: number;
  unit: string;
  min_order_amount: number;
  max_order_amount?: number;
  stock_quantity: number;
  rating: number;
  reviews: number;
  location: string;
  delivery_time: string;
  description: string;
  tags: string[];
  image?: string | null;

  // For distributor (buying from factories)
  volume_discount?: string;
  lead_time?: string;
  payment_terms?: string[];
}

export interface CatalogConfig {
  role: CatalogRole;
  title: string;
  description: string;
  supplierLabel: string; // "Factory" or "Supplier"
  supplierPath: string; // "/factories" or "/suppliers"
  icon: React.ElementType; // Factory or Store
  categories: string[];
  locations: string[];
  showVolumeDiscount: boolean; // Only for distributor
  cartPath: string; // "/distributor/factory-cart" or "/retailer/cart"
  ordersPath: string; // "/distributor/factory-orders" or "/retailer/orders"
}

// ============================================================================
// PROPS
// ============================================================================

interface ProductCatalogProps {
  config: CatalogConfig;
  products: CatalogProduct[];
  onAddToCart: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  getCartQuantity: (productId: string) => number;
  getTotalCartItems: () => number;
  getTotalCartValue: () => number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  config,
  products: initialProducts,
  onAddToCart,
  onRemoveFromCart,
  getCartQuantity,
  getTotalCartItems,
  getTotalCartValue,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [manualInputValue, setManualInputValue] = useState<{
    [key: string]: string;
  }>({});
  const itemsPerPage = 9;

  // Get unique suppliers for filter
  const suppliers = Array.from(
    new Map(
      initialProducts.map((p) => [
        p.supplier_id,
        { id: p.supplier_id, name: p.supplier_name },
      ]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Filter products
  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" ||
      product.category === selectedCategory;

    const matchesSupplier =
      !selectedSupplier || product.supplier_id === selectedSupplier;

    const matchesLocation =
      !selectedLocation || product.location === selectedLocation;

    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSupplier &&
      matchesLocation &&
      matchesPrice
    );
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // Handle manual quantity input change
  const handleManualInputChange = (
    productId: string,
    value: string,
    minOrder: number,
  ) => {
    setManualInputValue((prev) => ({ ...prev, [productId]: value }));
  };

  // Handle manual quantity input blur
  const handleManualInputBlur = (productId: string, minOrder: number) => {
    const value = manualInputValue[productId];
    if (value && value !== "") {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= minOrder) {
        onAddToCart(productId, numValue);
      } else {
        // Reset to current cart quantity if invalid
        setManualInputValue((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
      }
    } else {
      // Clear manual input after processing
      setManualInputValue((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
  };

  // Handle manual input key press (Enter key)
  const handleManualInputKeyDown = (
    e: React.KeyboardEvent,
    productId: string,
    minOrder: number,
  ) => {
    if (e.key === "Enter") {
      handleManualInputBlur(productId, minOrder);
    }
  };

  const SupplierIcon = config.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {config.title}
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <SupplierIcon className="h-3 w-3 mr-1" />
              {config.role === "distributor" ? "Bulk Purchasing" : "Shop Now"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{config.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {getTotalCartItems() > 0 && (
            <Button asChild variant="default">
              <Link to={config.cartPath} className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                View Cart ({getTotalCartItems()})
                <Badge variant="secondary" className="ml-1 bg-white/20">
                  {formatPrice(getTotalCartValue())}
                </Badge>
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to={config.ordersPath}>
              My Orders
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search products, ${config.supplierLabel.toLowerCase()}s, categories...`}
                className="pl-9 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {(selectedCategory !== "All Categories" ||
                      selectedSupplier ||
                      selectedLocation) && (
                      <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                        {[
                          selectedCategory !== "All Categories" ? 1 : 0,
                          selectedSupplier ? 1 : 0,
                          selectedLocation ? 1 : 0,
                        ].reduce((a, b) => a + b, 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                    <SheetDescription>
                      Narrow down products by category,{" "}
                      {config.supplierLabel.toLowerCase()}, location, and price
                    </SheetDescription>
                  </SheetHeader>

                  <ScrollArea className="flex-1 h-[calc(100vh-120px)] pr-4">
                    <div className="space-y-6 py-4">
                      {/* Category Filter */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">Category</h3>
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {config.categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Supplier Filter */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">
                          {config.supplierLabel}
                        </h3>
                        <Select
                          value={selectedSupplier}
                          onValueChange={setSelectedSupplier}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={`All ${config.supplierLabel}s`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Location Filter */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">Location</h3>
                        <Select
                          value={selectedLocation}
                          onValueChange={setSelectedLocation}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Locations" />
                          </SelectTrigger>
                          <SelectContent>
                            {config.locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Range Filter */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">
                          Price Range (ETB)
                        </h3>
                        <Slider
                          defaultValue={[0, 10000]}
                          max={10000}
                          step={100}
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="py-4"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                              Min:
                            </span>
                            <span className="text-sm font-medium">
                              {priceRange[0].toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                              Max:
                            </span>
                            <span className="text-sm font-medium">
                              {priceRange[1].toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>

                  <SheetFooter className="border-t pt-4">
                    <div className="flex w-full gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedCategory("All Categories");
                          setSelectedSupplier("");
                          setSelectedLocation("");
                          setPriceRange([0, 10000]);
                        }}
                      >
                        Reset
                      </Button>
                      <SheetClose asChild>
                        <Button className="flex-1">Apply Filters</Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* View Toggle */}
              <div className="border rounded-md flex">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {(selectedCategory !== "All Categories" ||
        selectedSupplier ||
        selectedLocation) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>

          {selectedCategory !== "All Categories" && (
            <Badge variant="secondary" className="gap-1">
              Category: {selectedCategory}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setSelectedCategory("All Categories")}
              />
            </Badge>
          )}

          {selectedSupplier && (
            <Badge variant="secondary" className="gap-1">
              {config.supplierLabel}:{" "}
              {suppliers.find((s) => s.id === selectedSupplier)?.name}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setSelectedSupplier("")}
              />
            </Badge>
          )}

          {selectedLocation && (
            <Badge variant="secondary" className="gap-1">
              Location: {selectedLocation}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setSelectedLocation("")}
              />
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setSelectedCategory("All Categories");
              setSelectedSupplier("");
              setSelectedLocation("");
              setPriceRange([0, 10000]);
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {indexOfFirstItem + 1}-
        {Math.min(indexOfLastItem, sortedProducts.length)} of{" "}
        {sortedProducts.length} products
      </div>

      {/* Products Grid/List View */}
      {sortedProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Try adjusting your filters or search query"
          actionLabel="Clear all filters"
          onAction={() => {
            setSearchQuery("");
            setSelectedCategory("All Categories");
            setSelectedSupplier("");
            setSelectedLocation("");
            setPriceRange([0, 10000]);
          }}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() =>
                (window.location.href = `/${config.role}/products/${product.id}`)
              }
            >
              <div className="relative h-40 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <Package className="h-16 w-16 text-primary/30" />
                <Badge className="absolute top-3 right-3 bg-white/90 text-foreground border-0">
                  Min: {product.min_order_amount}+
                </Badge>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {product.name}
                    </h3>
                    <Link
                      to={`/${config.role}${config.supplierPath}/${product.supplier_id}`}
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SupplierIcon className="h-3 w-3" />
                      {product.supplier_name}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium ml-1">
                      {product.rating}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({product.reviews})
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {product.location}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Truck className="h-3 w-3 mr-1" />
                    {product.delivery_time}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {product.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {product.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                  {product.tags.length > 2 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{product.tags.length - 2}
                    </Badge>
                  )}
                </div>

                {config.showVolumeDiscount && product.volume_discount && (
                  <div className="bg-blue-50/50 rounded-lg p-2 mb-3">
                    <p className="text-xs font-medium text-blue-700">
                      {product.volume_discount}
                    </p>
                  </div>
                )}

                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /{product.unit}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Min. order: {product.min_order_amount} {product.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {getCartQuantity(product.id) > 0 ? (
                      <div className="flex items-center border rounded-md">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-r-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromCart(product.id);
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        {/* Manual Input Field */}
                        <Input
                          type="number"
                          min={product.min_order_amount}
                          value={
                            manualInputValue[product.id] !== undefined
                              ? manualInputValue[product.id]
                              : getCartQuantity(product.id)
                          }
                          onChange={(e) =>
                            handleManualInputChange(
                              product.id,
                              e.target.value,
                              product.min_order_amount,
                            )
                          }
                          onBlur={() =>
                            handleManualInputBlur(
                              product.id,
                              product.min_order_amount,
                            )
                          }
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            handleManualInputKeyDown(
                              e,
                              product.id,
                              product.min_order_amount,
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-16 h-8 text-center rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-l-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product.id, 1);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product.id, product.min_order_amount);
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add (Min: {product.min_order_amount})
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {currentItems.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                (window.location.href = `/${config.role}/products/${product.id}`)
              }
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-32 h-32 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="h-12 w-12 text-primary/30" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold hover:text-primary">
                            {product.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <Link
                            to={`/${config.role}${config.supplierPath}/${product.supplier_id}`}
                            className="text-sm text-muted-foreground hover:text-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {product.supplier_name}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {product.location}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">
                          {formatPrice(product.price)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          /{product.unit} • Min: {product.min_order_amount}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium ml-1">
                          {product.rating}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({product.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        {product.delivery_time}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Stock: {product.stock_quantity.toLocaleString()}
                      </div>
                    </div>

                    {config.showVolumeDiscount && product.volume_discount && (
                      <div className="mt-3 bg-blue-50 p-2 rounded-lg">
                        <p className="text-xs font-medium text-blue-700">
                          {product.volume_discount}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      {getCartQuantity(product.id) > 0 ? (
                        <div className="flex items-center border rounded-md">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 rounded-r-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromCart(product.id);
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          {/* Manual Input Field for List View */}
                          <Input
                            type="number"
                            min={product.min_order_amount}
                            value={
                              manualInputValue[product.id] !== undefined
                                ? manualInputValue[product.id]
                                : getCartQuantity(product.id)
                            }
                            onChange={(e) =>
                              handleManualInputChange(
                                product.id,
                                e.target.value,
                                product.min_order_amount,
                              )
                            }
                            onBlur={() =>
                              handleManualInputBlur(
                                product.id,
                                product.min_order_amount,
                              )
                            }
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              handleManualInputKeyDown(
                                e,
                                product.id,
                                product.min_order_amount,
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 h-8 text-center rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 rounded-l-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product.id, 1);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product.id, product.min_order_amount);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart (Min: {product.min_order_amount})
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link to={`/${config.role}/products/${product.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
