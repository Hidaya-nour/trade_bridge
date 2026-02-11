import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Grid3x3,
  List,
  ChevronDown,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  Package,
  Store,
  Truck,
  Clock,
  CheckCircle2,
  X,
  Plus,
  Minus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock product data
const allProducts = [
  {
    id: 1,
    name: "Yirgacheffe Coffee",
    supplier: "Ethiopia Coffee Export",
    supplierId: 101,
    category: "Beverages",
    subcategory: "Coffee",
    price: 450,
    unit: "kg",
    minOrder: 10,
    stock: 2450,
    rating: 4.9,
    reviews: 128,
    image: null,
    verified: true,
    deliveryTime: "2-3 days",
    location: "Addis Ababa",
    description: "Premium Yirgacheffe coffee beans, washed process, grade 1. Known for its floral and citrus notes.",
    tags: ["Organic", "Fair Trade", "Premium"],
  },
  {
    id: 2,
    name: "White Teff Flour",
    supplier: "Adama Wholesalers",
    supplierId: 102,
    category: "Grains",
    subcategory: "Teff",
    price: 120,
    unit: "kg",
    minOrder: 25,
    stock: 5200,
    rating: 4.7,
    reviews: 95,
    image: null,
    verified: true,
    deliveryTime: "1-2 days",
    location: "Adama",
    description: "High-quality white teff flour, gluten-free, perfect for injera and baking.",
    tags: ["Gluten-Free", "Organic"],
  },
  {
    id: 3,
    name: "Cotton Fabric",
    supplier: "Ethiopian Textile",
    supplierId: 103,
    category: "Textiles",
    subcategory: "Fabric",
    price: 320,
    unit: "meter",
    minOrder: 50,
    stock: 1800,
    rating: 4.5,
    reviews: 67,
    image: null,
    verified: false,
    deliveryTime: "3-5 days",
    location: "Addis Ababa",
    description: "100% cotton fabric, 120 GSM, available in various colors. Ideal for garments.",
    tags: ["Eco-Friendly"],
  },
  {
    id: 4,
    name: "Pure Honey",
    supplier: "Bahir Dar Honey",
    supplierId: 104,
    category: "Food",
    subcategory: "Honey",
    price: 280,
    unit: "jar",
    minOrder: 12,
    stock: 890,
    rating: 4.8,
    reviews: 42,
    image: null,
    verified: true,
    deliveryTime: "2-4 days",
    location: "Bahir Dar",
    description: "100% pure white honey, raw and unfiltered. Harvested from the forests of Bahir Dar.",
    tags: ["Organic", "Raw"],
  },
  {
    id: 5,
    name: "Steel Rebars",
    supplier: "Mekelle Steel",
    supplierId: 105,
    category: "Construction",
    subcategory: "Steel",
    price: 8500,
    unit: "ton",
    minOrder: 5,
    stock: 320,
    rating: 4.6,
    reviews: 38,
    image: null,
    verified: true,
    deliveryTime: "5-7 days",
    location: "Mekelle",
    description: "High-tensile steel rebars, 12mm-32mm diameter. ASTM standards.",
    tags: ["Industrial"],
  },
  {
    id: 6,
    name: "Macadamia Nuts",
    supplier: "Ethiopia Coffee Export",
    supplierId: 101,
    category: "Food",
    subcategory: "Nuts",
    price: 650,
    unit: "kg",
    minOrder: 20,
    stock: 780,
    rating: 4.9,
    reviews: 56,
    image: null,
    verified: true,
    deliveryTime: "2-3 days",
    location: "Addis Ababa",
    description: "Premium macadamia nuts, roasted and salted. Export quality.",
    tags: ["Premium", "Snacks"],
  },
  {
    id: 7,
    name: "Plastic Chairs",
    supplier: "Adama Plastics",
    supplierId: 106,
    category: "Furniture",
    subcategory: "Chairs",
    price: 450,
    unit: "piece",
    minOrder: 50,
    stock: 1200,
    rating: 4.3,
    reviews: 29,
    image: null,
    verified: false,
    deliveryTime: "3-4 days",
    location: "Adama",
    description: "Durable plastic chairs, stackable, various colors available.",
    tags: ["Household"],
  },
  {
    id: 8,
    name: "Tomato Paste",
    supplier: "Ethiopia Agri",
    supplierId: 107,
    category: "Food",
    subcategory: "Canned Goods",
    price: 85,
    unit: "can",
    minOrder: 100,
    stock: 3500,
    rating: 4.4,
    reviews: 73,
    image: null,
    verified: true,
    deliveryTime: "2-3 days",
    location: "Adama",
    description: "Double-concentrated tomato paste, 500g cans. Ethiopian grown tomatoes.",
    tags: ["Bulk"],
  },
  {
    id: 9,
    name: "Notebooks",
    supplier: "Adama Wholesalers",
    supplierId: 102,
    category: "Stationery",
    subcategory: "Notebooks",
    price: 45,
    unit: "piece",
    minOrder: 100,
    stock: 5600,
    rating: 4.5,
    reviews: 112,
    image: null,
    verified: true,
    deliveryTime: "1-2 days",
    location: "Adama",
    description: "70-page notebooks, ruled, soft cover. School supply quality.",
    tags: ["School"],
  },
  {
    id: 10,
    name: "Cement",
    supplier: "Mugher Cement",
    supplierId: 108,
    category: "Construction",
    subcategory: "Cement",
    price: 620,
    unit: "bag",
    minOrder: 100,
    stock: 4200,
    rating: 4.7,
    reviews: 214,
    image: null,
    verified: true,
    deliveryTime: "2-3 days",
    location: "Addis Ababa",
    description: "Portland cement, 50kg bags. Grade 42.5R.",
    tags: ["Industrial", "Bulk"],
  },
  {
    id: 11,
    name: "Soybean Oil",
    supplier: "Adama Wholesalers",
    supplierId: 102,
    category: "Food",
    subcategory: "Oils",
    price: 180,
    unit: "liter",
    minOrder: 50,
    stock: 2800,
    rating: 4.6,
    reviews: 89,
    image: null,
    verified: true,
    deliveryTime: "1-2 days",
    location: "Adama",
    description: "Refined soybean oil, 5L bottles. Ethiopian standard.",
    tags: ["Cooking"],
  },
  {
    id: 12,
    name: "Leather Shoes",
    supplier: "Ethiopian Textile",
    supplierId: 103,
    category: "Footwear",
    subcategory: "Shoes",
    price: 850,
    unit: "pair",
    minOrder: 30,
    stock: 450,
    rating: 4.5,
    reviews: 47,
    image: null,
    verified: false,
    deliveryTime: "4-6 days",
    location: "Addis Ababa",
    description: "Genuine leather shoes, men's formal. Various sizes available.",
    tags: ["Leather", "Formal"],
  },
];

// Categories for filter
const categories = [
  "All Categories",
  "Beverages",
  "Food",
  "Grains",
  "Textiles",
  "Construction",
  "Furniture",
  "Stationery",
  "Footwear",
];

// Suppliers for filter
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

// Locations for filter
const locations = [
  "Addis Ababa",
  "Adama",
  "Bahir Dar",
  "Mekelle",
  "Hawassa",
  "Dire Dawa",
];

const ProductsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [cartItems, setCartItems] = useState<{[key: number]: number}>({});

  // Filter products
  const filteredProducts = allProducts.filter((product) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === "All Categories" || 
      product.category === selectedCategory;
    
    // Supplier filter
    const matchesSupplier = !selectedSupplier || 
      product.supplierId.toString() === selectedSupplier;
    
    // Location filter
    const matchesLocation = !selectedLocation || 
      product.location === selectedLocation;
    
    // Price filter
    const matchesPrice = product.price >= priceRange[0] && 
      product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesSupplier && 
           matchesLocation && matchesPrice;
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
      case "newest":
        return b.id - a.id;
      default:
        return 0;
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // Add to cart
  const addToCart = (productId: number) => {
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  // Remove from cart
  const removeFromCart = (productId: number) => {
    setCartItems(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  // Get cart count
  const getCartCount = (productId: number) => {
    return cartItems[productId] || 0;
  };

  // Format price
  const formatPrice = (price: number) => {
    return `ETB ${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Products</h1>
          <p className="text-muted-foreground mt-1">
            Discover products from verified suppliers across Ethiopia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Package className="h-3.5 w-3.5 mr-1" />
            {filteredProducts.length} Products
          </Badge>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, suppliers, categories..."
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
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {(selectedCategory !== "All Categories" || selectedSupplier || selectedLocation) && (
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
                  Narrow down products by category, supplier, location, and price
                </SheetDescription>
              </SheetHeader>
              
              <ScrollArea className="flex-1 h-[calc(100vh-120px)] pr-4">
                <div className="space-y-6 py-4">
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Category</h3>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

              {/* Supplier Filter */}
<div className="space-y-3">
  <h3 className="text-sm font-medium">Supplier</h3>
  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
    <SelectTrigger>
      <SelectValue placeholder="All Suppliers" />
    </SelectTrigger>
    <SelectContent>
      {/* ✅ FIX: Remove the SelectItem with empty value */}
      {/* The placeholder handles "All Suppliers" automatically */}
      {suppliers.map((supplier) => (
        <SelectItem key={supplier.id} value={supplier.id.toString()}>
          {supplier.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
                 {/* Location Filter */}
<div className="space-y-3">
  <h3 className="text-sm font-medium">Location</h3>
  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
    <SelectTrigger>
      <SelectValue placeholder="All Locations" />
    </SelectTrigger>
    <SelectContent>
      {/* ✅ REMOVE this line: <SelectItem value="">All Locations</SelectItem> */}
      {locations.map((location) => (
        <SelectItem key={location} value={location}>
          {location}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

                  {/* Price Range Filter */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Price Range (ETB)</h3>
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
                        <span className="text-xs text-muted-foreground">Min:</span>
                        <span className="text-sm font-medium">{priceRange[0].toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Max:</span>
                        <span className="text-sm font-medium">{priceRange[1].toLocaleString()}</span>
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

      {/* Active Filters */}
      {(selectedCategory !== "All Categories" || selectedSupplier || selectedLocation) && (
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
              Supplier: {suppliers.find(s => s.id.toString() === selectedSupplier)?.name}
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
        {Math.min(indexOfLastItem, sortedProducts.length)} of {sortedProducts.length} products
      </div>

      {/* Products Grid/List View */}
      {sortedProducts.length === 0 ? (
        <Card className="py-12">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
                setSelectedSupplier("");
                setSelectedLocation("");
                setPriceRange([0, 10000]);
              }}
            >
              Clear all filters
            </Button>
          </div>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <Package className="h-16 w-16 text-primary/30" />
               
                <Badge className="absolute top-3 right-3 bg-white/90 text-foreground border-0">
                  {product.minOrder}+ {product.unit}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link 
                      to={`/retailer/products/${product.id}`}
                      className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Link 
                        to={`/retailer/suppliers/${product.supplierId}`}
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        {product.supplier}
                      </Link>
                      {product.verified && (
                        <Badge variant="outline" className="h-4 px-1 text-[10px] bg-primary/5">
                          ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium ml-1">{product.rating}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({product.reviews})
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{product.deliveryTime}</span>
                </div>

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

                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      /{product.unit}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Min. order: {product.minOrder} {product.unit}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {getCartCount(product.id) > 0 ? (
                      <div className="flex items-center border rounded-md">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => removeFromCart(product.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {getCartCount(product.id)}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => addToCart(product.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => addToCart(product.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    )}
                    
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Heart className="h-4 w-4" />
                    </Button>
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
            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-32 h-32 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="h-12 w-12 text-primary/30" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/retailer/products/${product.id}`}
                            className="text-lg font-semibold hover:text-primary"
                          >
                            {product.name}
                          </Link>
                          {product.verified && (
                            <Badge variant="outline" className="bg-primary/5">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <Link 
                            to={`/retailer/suppliers/${product.supplierId}`}
                            className="text-sm text-muted-foreground hover:text-primary"
                          >
                            {product.supplier}
                          </Link>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{product.location}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">
                          {formatPrice(product.price)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          /{product.unit} • Min: {product.minOrder}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium ml-1">{product.rating}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({product.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        {product.deliveryTime}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Stock: {product.stock.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      {getCartCount(product.id) > 0 ? (
                        <div className="flex items-center border rounded-md">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => removeFromCart(product.id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {getCartCount(product.id)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => addToCart(product.id)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => addToCart(product.id)}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/retailer/products/${product.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                      
                      <Button size="sm" variant="ghost" className="h-8 w-8">
                        <Heart className="h-4 w-4" />
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
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                }}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              // Show first page, last page, and pages around current page
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
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
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
            
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ProductsPage;