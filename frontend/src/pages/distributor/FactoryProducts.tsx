import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Factory,
  Search,
  Filter,
  ShoppingCart,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  Scale,
  Plus,
  Minus,
  ChevronRight,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

// Mock factory products data
const factoryProducts = [
  {
    id: 1001,
    name: "Portland Cement",
    factory: "Mugher Cement",
    factoryId: 501,
    category: "Construction",
    subcategory: "Cement",
    price: 520,
    unit: "bag",
    minOrder: 100,
    maxOrder: 5000,
    stock: 15000,
    rating: 4.7,
    reviews: 312,
    location: "Addis Ababa",
    deliveryTime: "2-3 days",
    verified: true,
    description:
      "Premium Portland cement, 50kg bags. Grade 42.5R. Suitable for all construction applications.",
    tags: ["Industrial", "Bulk", "High Quality"],
    moq: 100,
    volumeDiscount: "5% off on 1000+ bags",
    leadTime: "2-3 days",
    paymentTerms: ["Credit", "Mobile", "Bank Transfer"],
  },
  {
    id: 1002,
    name: "Steel Rebars 12mm",
    factory: "Mekelle Steel",
    factoryId: 502,
    category: "Construction",
    subcategory: "Steel",
    price: 7500,
    unit: "ton",
    minOrder: 5,
    maxOrder: 50,
    stock: 450,
    rating: 4.6,
    reviews: 189,
    location: "Mekelle",
    deliveryTime: "5-7 days",
    verified: true,
    description:
      "High-tensile steel rebars, 12mm diameter. ASTM A615 Grade 60 standard.",
    tags: ["Industrial", "Steel", "Construction"],
    moq: 5,
    volumeDiscount: "3% off on 20+ tons",
    leadTime: "5-7 days",
    paymentTerms: ["Credit", "Bank Transfer"],
  },
  {
    id: 1003,
    name: "Cotton Fabric Rolls",
    factory: "Ethiopian Textile",
    factoryId: 503,
    category: "Textiles",
    subcategory: "Fabric",
    price: 280,
    unit: "meter",
    minOrder: 100,
    maxOrder: 10000,
    stock: 25000,
    rating: 4.5,
    reviews: 156,
    location: "Addis Ababa",
    deliveryTime: "3-5 days",
    verified: false,
    description:
      "100% cotton fabric, 120 GSM, 150cm width. Available in white and natural colors.",
    tags: ["Textiles", "Fabric", "Cotton"],
    moq: 100,
    volumeDiscount: "10% off on 1000+ meters",
    leadTime: "3-5 days",
    paymentTerms: ["Credit", "Mobile", "Cash"],
  },
  {
    id: 1004,
    name: "Yirgacheffe Coffee Beans",
    factory: "Ethiopia Coffee Export",
    factoryId: 504,
    category: "Beverages",
    subcategory: "Coffee",
    price: 380,
    unit: "kg",
    minOrder: 50,
    maxOrder: 2000,
    stock: 8500,
    rating: 4.9,
    reviews: 425,
    location: "Addis Ababa",
    deliveryTime: "2-3 days",
    verified: true,
    description:
      "Grade 1 Yirgacheffe coffee beans, washed process. Floral and citrus notes.",
    tags: ["Coffee", "Premium", "Organic"],
    moq: 50,
    volumeDiscount: "8% off on 500+ kg",
    leadTime: "2-3 days",
    paymentTerms: ["Credit", "Mobile", "Bank Transfer"],
  },
  {
    id: 1005,
    name: "White Teff Grain",
    factory: "Ethiopia Agri",
    factoryId: 505,
    category: "Grains",
    subcategory: "Teff",
    price: 95,
    unit: "kg",
    minOrder: 200,
    maxOrder: 10000,
    stock: 45000,
    rating: 4.8,
    reviews: 278,
    location: "Adama",
    deliveryTime: "2-4 days",
    verified: true,
    description:
      "Premium white teff grain, certified organic. High yield, excellent for injera.",
    tags: ["Grains", "Teff", "Organic"],
    moq: 200,
    volumeDiscount: "12% off on 1000+ kg",
    leadTime: "2-4 days",
    paymentTerms: ["Credit", "Mobile", "Cash"],
  },
  {
    id: 1006,
    name: "Soybean Oil - Bulk",
    factory: "Adama Oil",
    factoryId: 506,
    category: "Food",
    subcategory: "Oils",
    price: 145,
    unit: "liter",
    minOrder: 500,
    maxOrder: 20000,
    stock: 35000,
    rating: 4.6,
    reviews: 203,
    location: "Adama",
    deliveryTime: "3-5 days",
    verified: true,
    description:
      "Refined soybean oil, food grade. Packed in 20L jerry cans for bulk buyers.",
    tags: ["Oil", "Cooking", "Bulk"],
    moq: 500,
    volumeDiscount: "7% off on 2000+ liters",
    leadTime: "3-5 days",
    paymentTerms: ["Credit", "Bank Transfer"],
  },
  {
    id: 1007,
    name: "Plastic Granules",
    factory: "Adama Plastics",
    factoryId: 507,
    category: "Raw Materials",
    subcategory: "Plastics",
    price: 85,
    unit: "kg",
    minOrder: 500,
    maxOrder: 10000,
    stock: 28000,
    rating: 4.4,
    reviews: 98,
    location: "Adama",
    deliveryTime: "3-4 days",
    verified: false,
    description:
      "Polypropylene granules for injection molding. Food-grade quality.",
    tags: ["Plastics", "Raw Materials", "Industrial"],
    moq: 500,
    volumeDiscount: "5% off on 2000+ kg",
    leadTime: "3-4 days",
    paymentTerms: ["Mobile", "Cash", "Bank Transfer"],
  },
  {
    id: 1008,
    name: "Macadamia Nuts",
    factory: "Ethiopia Coffee Export",
    factoryId: 504,
    category: "Food",
    subcategory: "Nuts",
    price: 580,
    unit: "kg",
    minOrder: 100,
    maxOrder: 2000,
    stock: 3200,
    rating: 4.9,
    reviews: 167,
    location: "Addis Ababa",
    deliveryTime: "2-3 days",
    verified: true,
    description:
      "Premium macadamia nuts, roasted and lightly salted. Export quality.",
    tags: ["Nuts", "Premium", "Snacks"],
    moq: 100,
    volumeDiscount: "10% off on 500+ kg",
    leadTime: "2-3 days",
    paymentTerms: ["Credit", "Mobile", "Bank Transfer"],
  },
];

const categories = [
  "All Categories",
  "Construction",
  "Textiles",
  "Beverages",
  "Grains",
  "Food",
  "Raw Materials",
];

const locations = [
  "All Locations",
  "Addis Ababa",
  "Adama",
  "Mekelle",
  "Bahir Dar",
  "Hawassa",
  "Dire Dawa",
];

const FactoryProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const itemsPerPage = 6;

  // Filter products
  const filteredProducts = factoryProducts.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.factory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" ||
      product.category === selectedCategory;
    const matchesLocation =
      selectedLocation === "All Locations" ||
      product.location === selectedLocation;
    const matchesVerified = !verifiedOnly || product.verified;
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      matchesVerified &&
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

  // Cart functions
  const addToCart = (productId: number) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getCartQuantity = (productId: number) => {
    return cart[productId] || 0;
  };

  const getTotalCartItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalCartValue = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = factoryProducts.find((p) => p.id === parseInt(id));
      return sum + (product?.price || 0) * qty;
    }, 0);
  };

  const formatPrice = (price: number) => {
    return `ETB ${price.toLocaleString()}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Factory Products
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <Factory className="h-3 w-3 mr-1" />
              Bulk Purchasing
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Source products directly from Ethiopian manufacturers and factories
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getTotalCartItems() > 0 && (
            <Button asChild variant="default">
              <Link to="/distributor/factory-cart" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                View Cart ({getTotalCartItems()})
                <Badge variant="secondary" className="ml-1 bg-white/20">
                  {formatPrice(getTotalCartValue())}
                </Badge>
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/distributor/factory-orders">
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
                placeholder="Search factory products, brands, or categories..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
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
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Filter Factory Products</SheetTitle>
                    <SheetDescription>
                      Narrow down products by category, location, price, and
                      more
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
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Location Filter */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">
                          Factory Location
                        </h3>
                        <Select
                          value={selectedLocation}
                          onValueChange={setSelectedLocation}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
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

                      {/* Verified Factories Only */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="verified"
                          checked={verifiedOnly}
                          onCheckedChange={(checked) =>
                            setVerifiedOnly(checked as boolean)
                          }
                        />
                        <Label htmlFor="verified" className="text-sm">
                          Verified factories only
                        </Label>
                      </div>

                      {/* Minimum Order Filter */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">
                          Minimum Order Quantity
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            &lt; 100 units
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            100-500 units
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            500-1000 units
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            1000+ units
                          </Button>
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
                          setSelectedLocation("All Locations");
                          setVerifiedOnly(false);
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {(selectedCategory !== "All Categories" ||
        selectedLocation !== "All Locations" ||
        verifiedOnly) && (
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

          {selectedLocation !== "All Locations" && (
            <Badge variant="secondary" className="gap-1">
              Location: {selectedLocation}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setSelectedLocation("All Locations")}
              />
            </Badge>
          )}

          {verifiedOnly && (
            <Badge variant="secondary" className="gap-1">
              Verified Factories
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setVerifiedOnly(false)}
              />
            </Badge>
          )}

          {(priceRange[0] > 0 || priceRange[1] < 10000) && (
            <Badge variant="secondary" className="gap-1">
              Price: ETB {priceRange[0].toLocaleString()} -{" "}
              {priceRange[1].toLocaleString()}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setPriceRange([0, 10000])}
              />
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setSelectedCategory("All Categories");
              setSelectedLocation("All Locations");
              setVerifiedOnly(false);
              setPriceRange([0, 10000]);
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, sortedProducts.length)} of{" "}
          {sortedProducts.length} factory products
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Factory className="h-3 w-3 mr-1" />
          {filteredProducts.length} products
        </Badge>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <Card className="py-12">
          <div className="text-center">
            <Factory className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No factory products found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
                setSelectedLocation("All Locations");
                setVerifiedOnly(false);
                setPriceRange([0, 10000]);
              }}
            >
              Clear all filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-40 bg-gradient-to-br from-blue-500/5 to-blue-500/10 flex items-center justify-center">
                <Factory className="h-16 w-16 text-blue-500/30" />
                {product.verified && (
                  <Badge className="absolute top-3 left-3 bg-blue-600 text-white border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified Factory
                  </Badge>
                )}
                <Badge className="absolute top-3 right-3 bg-white/90 text-foreground border-0">
                  MOQ: {product.minOrder} {product.unit}
                </Badge>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {product.name}
                    </h3>
                    <Link
                      to={`/distributor/factories/${product.factoryId}`}
                      className="text-sm text-muted-foreground hover:text-blue-600 flex items-center gap-1 mt-1"
                    >
                      <Factory className="h-3 w-3" />
                      {product.factory}
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
                    <Clock className="h-3 w-3 mr-1" />
                    {product.deliveryTime}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {product.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {product.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[10px] bg-blue-50/50"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="bg-blue-50/50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-semibold text-blue-700">
                      Volume Discount
                    </span>
                    <Badge variant="outline" className="bg-white">
                      {product.volumeDiscount}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lead time: {product.leadTime} • Payment:{" "}
                    {product.paymentTerms.join(", ")}
                  </p>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /{product.unit}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Min. order: {product.minOrder} {product.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {getCartQuantity(product.id) > 0 ? (
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
                          {getCartQuantity(product.id)}
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
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    )}
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
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                }}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
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
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default FactoryProductsPage;
