import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Search,
  Filter,
  Star,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Package,
  Truck,
  Scale,
  X,
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
import { ScrollArea } from "@/components/ui/scroll-area";
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

// Mock supplier data
const suppliers = [
  {
    id: 101,
    name: "Ethiopia Coffee Export",
    logo: null,
    category: "Beverages",
    location: "Addis Ababa",
    established: "2015",
    verified: true,
    rating: 4.9,
    reviews: 128,
    products: 45,
    min_order_amount: "ETB 5,000",
    priceLevel: "$$",
    totalOrders: 1250,
    completionRate: 99.2,
    description:
      "Leading exporter of premium Ethiopian coffee. Specializing in Yirgacheffe, Sidamo, and Limu varieties.",
    tags: ["Coffee", "Organic", "Fair Trade"],
    badges: ["Top Rated", "Verified"],
  },
  {
    id: 102,
    name: "Adama Wholesalers",
    logo: null,
    category: "Groceries",
    location: "Adama",
    established: "2018",
    verified: true,
    rating: 4.7,
    reviews: 95,
    products: 230,
    responseTime: "< 1 hour",
    deliveryTime: "1-2 days",
    minOrder: "ETB 2,500",
    priceLevel: "$$",
    totalOrders: 890,
    completionRate: 98.5,
    description:
      "Wholesale distributor of food products, grains, oils, and household goods serving Oromia region.",
    tags: ["Groceries", "Bulk", "Fast Delivery"],
    badges: ["Verified", "Fast Shipper"],
  },
  {
    id: 103,
    name: "Ethiopian Textile",
    logo: null,
    category: "Textiles",
    location: "Addis Ababa",
    established: "2010",
    verified: false,
    rating: 4.5,
    reviews: 67,
    products: 120,
    responseTime: "< 4 hours",
    deliveryTime: "3-5 days",
    minOrder: "ETB 10,000",
    priceLevel: "$$$",
    totalOrders: 540,
    completionRate: 97.8,
    description:
      "Manufacturer of cotton fabrics, traditional Ethiopian textiles, and modern garments.",
    tags: ["Fabrics", "Garments", "Wholesale"],
    badges: ["Established"],
  },
  {
    id: 104,
    name: "Bahir Dar Honey",
    logo: null,
    category: "Food",
    location: "Bahir Dar",
    established: "2019",
    verified: true,
    rating: 4.8,
    reviews: 42,
    products: 15,
    responseTime: "< 3 hours",
    deliveryTime: "2-4 days",
    minOrder: "ETB 3,000",
    priceLevel: "$$",
    totalOrders: 320,
    completionRate: 100,
    description:
      "Pure white honey from the forests of Amhara region. Raw, unfiltered, and organic.",
    tags: ["Honey", "Organic", "Raw"],
    badges: ["Top Rated", "Verified"],
  },
  {
    id: 105,
    name: "Mekelle Steel",
    logo: null,
    category: "Construction",
    location: "Mekelle",
    established: "2012",
    verified: true,
    rating: 4.6,
    reviews: 38,
    products: 28,
    responseTime: "< 6 hours",
    deliveryTime: "5-7 days",
    minOrder: "ETB 25,000",
    priceLevel: "$$$",
    totalOrders: 210,
    completionRate: 96.5,
    description:
      "Steel rebars, sheets, and construction materials. ASTM standards, industrial quality.",
    tags: ["Steel", "Construction", "Industrial"],
    badges: ["Verified"],
  },
  {
    id: 106,
    name: "Adama Plastics",
    logo: null,
    category: "Household",
    location: "Adama",
    established: "2017",
    verified: false,
    rating: 4.3,
    reviews: 29,
    products: 85,
    responseTime: "< 5 hours",
    deliveryTime: "3-4 days",
    minOrder: "ETB 4,000",
    priceLevel: "$$",
    totalOrders: 180,
    completionRate: 95.2,
    description:
      "Plastic household items, furniture, and storage solutions. Durable and affordable.",
    tags: ["Plastics", "Household", "Furniture"],
    badges: ["Budget Friendly"],
  },
  {
    id: 107,
    name: "Ethiopia Agri",
    logo: null,
    category: "Agriculture",
    location: "Adama",
    established: "2016",
    verified: true,
    rating: 4.4,
    reviews: 73,
    products: 52,
    responseTime: "< 2 hours",
    deliveryTime: "2-3 days",
    minOrder: "ETB 6,000",
    priceLevel: "$$",
    totalOrders: 420,
    completionRate: 98.9,
    description:
      "Agricultural products, canned goods, and processed foods. Ethiopian grown and processed.",
    tags: ["Food", "Canned", "Bulk"],
    badges: ["Verified"],
  },
  {
    id: 108,
    name: "Mugher Cement",
    logo: null,
    category: "Construction",
    location: "Addis Ababa",
    established: "2005",
    verified: true,
    rating: 4.7,
    reviews: 214,
    products: 8,
    responseTime: "< 1 hour",
    deliveryTime: "2-3 days",
    minOrder: "ETB 15,000",
    priceLevel: "$$$",
    totalOrders: 1850,
    completionRate: 99.1,
    description:
      "Portland cement, 42.5R grade. Leading cement manufacturer in Ethiopia.",
    tags: ["Cement", "Construction", "Industrial"],
    badges: ["Top Rated", "Verified", "Industry Leader"],
  },
  {
    id: 109,
    name: "Hawassa Fish Supply",
    logo: null,
    category: "Food",
    location: "Hawassa",
    established: "2020",
    verified: false,
    rating: 4.2,
    reviews: 18,
    products: 12,
    responseTime: "< 8 hours",
    deliveryTime: "1-2 days",
    minOrder: "ETB 2,000",
    priceLevel: "$",
    totalOrders: 65,
    completionRate: 94.3,
    description:
      "Fresh and frozen fish from Lake Hawassa. Tilapia, catfish, and perch.",
    tags: ["Fish", "Seafood", "Fresh"],
    badges: ["New"],
  },
  {
    id: 110,
    name: "Dire Dawa Logistics",
    logo: null,
    category: "Logistics",
    location: "Dire Dawa",
    established: "2019",
    verified: true,
    rating: 4.5,
    reviews: 47,
    products: 5,
    responseTime: "< 30 minutes",
    deliveryTime: "1-3 days",
    minOrder: "ETB 1,000",
    priceLevel: "$$",
    totalOrders: 520,
    completionRate: 97.8,
    description:
      "Freight forwarding and logistics services. Specializing in eastern Ethiopia routes.",
    tags: ["Logistics", "Shipping", "Freight"],
    badges: ["Verified", "Fast Shipper"],
  },
];

const categories = [
  "All Categories",
  "Beverages",
  "Groceries",
  "Food",
  "Textiles",
  "Construction",
  "Household",
  "Agriculture",
  "Logistics",
];

const locations = [
  "All Locations",
  "Addis Ababa",
  "Adama",
  "Bahir Dar",
  "Mekelle",
  "Hawassa",
  "Dire Dawa",
];

const SupplierDirectoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortBy, setSortBy] = useState("rating");
  const [compareList, setCompareList] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      searchQuery === "" ||
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" ||
      supplier.category === selectedCategory;
    const matchesLocation =
      selectedLocation === "All Locations" ||
      supplier.location === selectedLocation;
    const matchesVerified = !verifiedOnly || supplier.verified;
    const matchesRating = supplier.rating >= ratingFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      matchesVerified &&
      matchesRating
    );
  });

  // Sort suppliers
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "orders":
        return b.totalOrders - a.totalOrders;

      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuppliers = sortedSuppliers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(sortedSuppliers.length / itemsPerPage);

  // Toggle compare
  const toggleCompare = (supplierId: number) => {
    setCompareList((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId],
    );
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
          <h1 className="text-3xl font-bold tracking-tight">
            Supplier Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse and discover verified suppliers across Ethiopia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Store className="h-3.5 w-3.5 mr-1" />
            {filteredSuppliers.length} Suppliers
          </Badge>
          {compareList.length > 0 && (
            <Button asChild>
              <Link to={`/retailer/compare?ids=${compareList.join(",")}`}>
                <Scale className="h-4 w-4 mr-2" />
                Compare ({compareList.length})
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers by name, category, or location..."
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
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="orders">Most Orders</SelectItem>
                  <SelectItem value="response">Fastest Response</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
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
                    <SheetTitle>Filter Suppliers</SheetTitle>
                    <SheetDescription>
                      Narrow down suppliers by category, location, and more
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
                        <h3 className="text-sm font-medium">Location</h3>
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

                      {/* Rating Filter */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">Minimum Rating</h3>
                        <div className="flex items-center gap-4">
                          {[4, 3, 2, 1].map((rating) => (
                            <Button
                              key={rating}
                              variant={
                                ratingFilter === rating ? "default" : "outline"
                              }
                              size="sm"
                              className="gap-1"
                              onClick={() => setRatingFilter(rating)}
                            >
                              <Star className="h-3 w-3 fill-current" />
                              {rating}+
                            </Button>
                          ))}
                          {ratingFilter > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRatingFilter(0)}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Verified Only */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="verified"
                          checked={verifiedOnly}
                          onCheckedChange={(checked) =>
                            setVerifiedOnly(checked as boolean)
                          }
                        />
                        <Label htmlFor="verified" className="text-sm">
                          Verified suppliers only
                        </Label>
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
                          setRatingFilter(0);
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
        verifiedOnly ||
        ratingFilter > 0) && (
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
              Verified Only
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setVerifiedOnly(false)}
              />
            </Badge>
          )}

          {ratingFilter > 0 && (
            <Badge variant="secondary" className="gap-1">
              {ratingFilter}+ Stars
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setRatingFilter(0)}
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
              setRatingFilter(0);
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {indexOfFirstItem + 1}-
        {Math.min(indexOfLastItem, sortedSuppliers.length)} of{" "}
        {sortedSuppliers.length} suppliers
      </div>

      {/* Suppliers Grid */}
      {sortedSuppliers.length === 0 ? (
        <Card className="py-12">
          <div className="text-center">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No suppliers found</h3>
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
                setRatingFilter(0);
              }}
            >
              Clear all filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentSuppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(supplier.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/retailer/suppliers/${supplier.id}`}
                          className="text-lg font-semibold hover:text-primary transition-colors"
                        >
                          {supplier.name}
                        </Link>
                        {supplier.verified && (
                          <Badge
                            variant="outline"
                            className="h-5 px-1 bg-primary/5 border-primary/20"
                          >
                            <CheckCircle2 className="h-3 w-3 text-primary mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {supplier.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {supplier.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compare Checkbox */}
                  <Button
                    variant={
                      compareList.includes(supplier.id) ? "default" : "outline"
                    }
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleCompare(supplier.id)}
                  >
                    <Scale className="h-4 w-4" />
                  </Button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {supplier.badges.map((badge) => (
                    <Badge
                      key={badge}
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        badge === "Top Rated" &&
                          "bg-yellow-50 text-yellow-700 border-yellow-200",
                        badge === "Verified" &&
                          "bg-green-50 text-green-700 border-green-200",
                        badge === "Fast Shipper" &&
                          "bg-blue-50 text-blue-700 border-blue-200",
                        badge === "Industry Leader" &&
                          "bg-purple-50 text-purple-700 border-purple-200",
                      )}
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold ml-1">
                        {supplier.rating}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({supplier.reviews})
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Package className="h-3 w-3 mr-1" />
                    {supplier.products} products
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {supplier.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {supplier.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[10px] bg-muted/50"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Min. Order</p>
                    <p className="text-sm font-semibold">{supplier.minOrder}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Response</p>
                    <p className="text-sm font-semibold">
                      {supplier.responseTime}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Completion</p>
                    <p className="text-sm font-semibold text-green-600">
                      {supplier.completionRate}%
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">
                      Total Orders
                    </p>
                    <p className="text-sm font-semibold">
                      {supplier.totalOrders.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button className="flex-1" asChild>
                    <Link to={`/retailer/suppliers/${supplier.id}`}>
                      View Profile
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to={`/retailer/products?supplier=${supplier.id}`}>
                      <Package className="h-4 w-4 mr-2" />
                      Products
                    </Link>
                  </Button>
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

export default SupplierDirectoryPage;
