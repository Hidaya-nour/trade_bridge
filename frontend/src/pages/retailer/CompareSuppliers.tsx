import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Scale,
  ArrowLeft,
  Star,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Package,
  Truck,
  Shield,
  Award,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Check,
  X,
  Minus,
  Plus,
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Mock supplier data (same as directory)
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
    responseTime: "< 2 hours",
    deliveryTime: "2-3 days",
    minOrder: "ETB 5,000",
    priceLevel: "$$",
    totalOrders: 1250,
    completionRate: 99.2,
    onTimeDelivery: 98.5,
    qualityRating: 4.9,
    communicationRating: 4.8,
    description: "Leading exporter of premium Ethiopian coffee.",
    tags: ["Coffee", "Organic", "Fair Trade"],
    badges: ["Top Rated", "Verified"],
    paymentTerms: ["Credit", "Mobile", "Cash"],
    shippingMethods: ["Standard", "Express"],
    returnPolicy: "7 days",
    warranty: "Not applicable",
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
    onTimeDelivery: 97.8,
    qualityRating: 4.6,
    communicationRating: 4.9,
    description: "Wholesale distributor of food products.",
    tags: ["Groceries", "Bulk", "Fast Delivery"],
    badges: ["Verified", "Fast Shipper"],
    paymentTerms: ["Cash", "Mobile", "Credit"],
    shippingMethods: ["Standard", "Express", "Same Day"],
    returnPolicy: "3 days",
    warranty: "Not applicable",
  },
  {
    id: 103,
    name: "Ethiopian Textile Industry",
    logo: null,
    category: "Textiles",
    location: "Addis Ababa",
    established: "2010",
    verified: true,
    rating: 4.5,
    reviews: 67,
    products: 120,
    responseTime: "< 4 hours",
    deliveryTime: "3-5 days",
    minOrder: "ETB 10,000",
    priceLevel: "$$$",
    totalOrders: 540,
    completionRate: 97.8,
    onTimeDelivery: 96.5,
    qualityRating: 4.6,
    communicationRating: 4.4,
    description: "Leading textile manufacturer in Ethiopia.",
    tags: ["Textiles", "Fabrics", "Garments"],
    badges: ["Verified"],
    paymentTerms: ["Credit", "Bank Transfer"],
    shippingMethods: ["Standard"],
    returnPolicy: "14 days",
    warranty: "6 months",
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
    onTimeDelivery: 99.2,
    qualityRating: 4.9,
    communicationRating: 4.7,
    description: "Pure white honey from Amhara region.",
    tags: ["Honey", "Organic", "Raw"],
    badges: ["Top Rated", "Verified"],
    paymentTerms: ["Cash", "Mobile"],
    shippingMethods: ["Standard"],
    returnPolicy: "7 days",
    warranty: "Quality guarantee",
  },
  {
    id: 105,
    name: "Addis Pharmaceutical",
    logo: null,
    category: "Pharmaceuticals",
    location: "Addis Ababa",
    established: "2012",
    verified: true,
    rating: 4.9,
    reviews: 156,
    products: 340,
    responseTime: "< 1 hour",
    deliveryTime: "1-2 days",
    minOrder: "ETB 8,000",
    priceLevel: "$$$",
    totalOrders: 2100,
    completionRate: 99.5,
    onTimeDelivery: 99.1,
    qualityRating: 5.0,
    communicationRating: 4.9,
    description: "Leading pharmaceutical distributor.",
    tags: ["Medicine", "Healthcare", "Medical Supplies"],
    badges: ["Top Rated", "Verified", "Industry Leader"],
    paymentTerms: ["Credit", "Bank Transfer", "Mobile"],
    shippingMethods: ["Standard", "Express", "Refrigerated"],
    returnPolicy: "No returns on medicine",
    warranty: "Manufacturer warranty",
  },
  {
    id: 106,
    name: "Oromia Dairy",
    logo: null,
    category: "Food",
    location: "Adama",
    established: "2017",
    verified: true,
    rating: 4.6,
    reviews: 78,
    products: 45,
    responseTime: "< 2 hours",
    deliveryTime: "1-2 days",
    minOrder: "ETB 4,000",
    priceLevel: "$$",
    totalOrders: 680,
    completionRate: 98.7,
    onTimeDelivery: 98.2,
    qualityRating: 4.7,
    communicationRating: 4.5,
    description: "Fresh dairy products from Oromia.",
    tags: ["Dairy", "Milk", "Cheese", "Yogurt"],
    badges: ["Verified", "Fast Shipper"],
    paymentTerms: ["Cash", "Mobile", "Credit"],
    shippingMethods: ["Standard", "Express", "Refrigerated"],
    returnPolicy: "3 days",
    warranty: "Freshness guarantee",
  },
  {
    id: 107,
    name: "Tigray Construction",
    logo: null,
    category: "Construction",
    location: "Mekelle",
    established: "2014",
    verified: true,
    rating: 4.4,
    reviews: 112,
    products: 65,
    responseTime: "< 3 hours",
    deliveryTime: "3-6 days",
    minOrder: "ETB 20,000",
    priceLevel: "$$$",
    totalOrders: 890,
    completionRate: 97.5,
    onTimeDelivery: 95.8,
    qualityRating: 4.5,
    communicationRating: 4.3,
    description: "Construction materials supplier.",
    tags: ["Construction", "Building Materials", "Hardware"],
    badges: ["Verified"],
    paymentTerms: ["Credit", "Bank Transfer"],
    shippingMethods: ["Standard", "Bulk"],
    returnPolicy: "7 days",
    warranty: "Varies by product",
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
    onTimeDelivery: 98.9,
    qualityRating: 4.8,
    communicationRating: 4.6,
    description: "Leading cement manufacturer.",
    tags: ["Cement", "Construction", "Industrial"],
    badges: ["Top Rated", "Verified", "Industry Leader"],
    paymentTerms: ["Credit", "Cash", "Mobile"],
    shippingMethods: ["Standard", "Bulk"],
    returnPolicy: "No returns",
    warranty: "Manufacturer warranty",
  },
  {
    id: 109,
    name: "Hawassa Fish",
    logo: null,
    category: "Food",
    location: "Hawassa",
    established: "2020",
    verified: false,
    rating: 4.2,
    reviews: 23,
    products: 12,
    responseTime: "< 5 hours",
    deliveryTime: "2-3 days",
    minOrder: "ETB 5,000",
    priceLevel: "$$",
    totalOrders: 145,
    completionRate: 96.5,
    onTimeDelivery: 94.2,
    qualityRating: 4.3,
    communicationRating: 4.1,
    description: "Fresh fish from Lake Hawassa.",
    tags: ["Fish", "Seafood", "Fresh"],
    badges: ["New"],
    paymentTerms: ["Cash", "Mobile"],
    shippingMethods: ["Standard", "Refrigerated"],
    returnPolicy: "2 days",
    warranty: "Freshness guarantee",
  },
  {
    id: 110,
    name: "Dire Dawa Logistics",
    logo: null,
    category: "Logistics",
    location: "Dire Dawa",
    established: "2016",
    verified: true,
    rating: 4.5,
    reviews: 89,
    products: 25,
    responseTime: "< 2 hours",
    deliveryTime: "1-3 days",
    minOrder: "ETB 7,000",
    priceLevel: "$$",
    totalOrders: 720,
    completionRate: 98.9,
    onTimeDelivery: 98.5,
    qualityRating: 4.4,
    communicationRating: 4.6,
    description: "Logistics and distribution services.",
    tags: ["Logistics", "Transport", "Warehousing"],
    badges: ["Verified", "Fast Shipper"],
    paymentTerms: ["Credit", "Cash", "Bank Transfer"],
    shippingMethods: ["Standard", "Express", "Bulk"],
    returnPolicy: "N/A",
    warranty: "Insurance available",
  },
];

const comparisonFeatures = [
  {
    category: "Overview",
    items: [
      { key: "verified", label: "Verification", icon: Shield },
      { key: "established", label: "Established", icon: Calendar },
      { key: "location", label: "Location", icon: MapPin },
      { key: "category", label: "Category", icon: Package },
    ],
  },
  {
    category: "Performance",
    items: [
      { key: "rating", label: "Overall Rating", icon: Star },
      { key: "totalOrders", label: "Total Orders", icon: TrendingUp },
      { key: "completionRate", label: "Completion Rate", icon: CheckCircle2 },
      { key: "onTimeDelivery", label: "On-Time Delivery", icon: Truck },
      { key: "responseTime", label: "Response Time", icon: Clock },
    ],
  },
  {
    category: "Policies",
    items: [
      { key: "minOrder", label: "Min. Order", icon: DollarSign },
      { key: "deliveryTime", label: "Delivery Time", icon: Truck },
      { key: "paymentTerms", label: "Payment Methods", icon: DollarSign },
      { key: "returnPolicy", label: "Return Policy", icon: XCircle },
      { key: "warranty", label: "Warranty", icon: Award },
    ],
  },
];

const CompareSuppliersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSuppliers, setSelectedSuppliers] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const ids = searchParams.get("ids")?.split(",").map(Number) || [];
    const filtered = suppliers.filter((s) => ids.includes(s.id));
    setSelectedSuppliers(filtered);
  }, [searchParams]);

  // Update URL when selected suppliers change
  useEffect(() => {
    const ids = selectedSuppliers.map((s) => s.id).join(",");
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("ids", ids);
    setSearchParams(newSearchParams);
  }, [selectedSuppliers, searchParams, setSearchParams]);

  const removeSupplier = (supplierId: number) => {
    setSelectedSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
  };

  const addSuppliers = () => {
    const newSuppliers = suppliers.filter(
      (s) =>
        tempSelectedIds.includes(s.id) &&
        !selectedSuppliers.some((selected) => selected.id === s.id),
    );

    setSelectedSuppliers((prev) => [...prev, ...newSuppliers]);
    setTempSelectedIds([]);
    setIsAddModalOpen(false);
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter suppliers for modal
  const availableSuppliers = suppliers.filter(
    (s) =>
      !selectedSuppliers.some((selected) => selected.id === s.id) &&
      (selectedCategory === "all" || s.category === selectedCategory) &&
      (searchQuery === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const categories = ["all", ...new Set(suppliers.map((s) => s.category))];

  const toggleSupplierSelection = (supplierId: number) => {
    setTempSelectedIds((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId],
    );
  };

  const renderValue = (supplier: any, key: string) => {
    switch (key) {
      case "verified":
        return supplier.verified ? (
          <span className="text-green-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </span>
        ) : (
          <span className="text-gray-300 flex items-center justify-center">
            <XCircle className="h-5 w-5" />
          </span>
        );

      case "rating":
        return (
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-semibold">{supplier.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({supplier.reviews} reviews)
            </span>
          </div>
        );

      case "totalOrders":
        return supplier.totalOrders.toLocaleString();

      case "completionRate":
      case "onTimeDelivery":
        return `${supplier[key]}%`;

      case "paymentTerms":
        return (
          <div className="flex flex-wrap gap-1 justify-center">
            {supplier.paymentTerms?.map((term: string) => (
              <Badge key={term} variant="outline" className="text-xs">
                {term}
              </Badge>
            ))}
          </div>
        );

      case "deliveryTime":
      case "responseTime":
        return supplier[key];

      case "minOrder":
        return supplier.minOrder;

      case "established":
        return supplier.established;

      case "location":
        return supplier.location;

      case "category":
        return supplier.category;

      case "returnPolicy":
      case "warranty":
        return supplier[key] || "—";

      default:
        return supplier[key] || "—";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/retailer/suppliers">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Compare Suppliers
            </h1>
            <p className="text-muted-foreground mt-1">
              Side-by-side comparison of selected suppliers
            </p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add More Suppliers
        </Button>
      </div>

      {/* Add Suppliers Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Suppliers to Compare</DialogTitle>
            <DialogDescription>
              Select additional suppliers to add to your comparison. You can
              compare up to 4 suppliers at once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                className="px-3 py-2 border rounded-md bg-background"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Suppliers List */}
            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="space-y-2">
                {availableSuppliers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No suppliers available to add
                  </div>
                ) : (
                  availableSuppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                        tempSelectedIds.includes(supplier.id) &&
                          "border-primary bg-primary/5",
                      )}
                      onClick={() => toggleSupplierSelection(supplier.id)}
                    >
                      <Checkbox
                        checked={tempSelectedIds.includes(supplier.id)}
                        onCheckedChange={() =>
                          toggleSupplierSelection(supplier.id)
                        }
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(supplier.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{supplier.name}</p>
                          <Badge variant="outline">{supplier.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {supplier.location}
                          </span>
                          <span className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            {supplier.rating} ({supplier.reviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Selection Summary */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {tempSelectedIds.length} suppliers selected
              </span>
              {selectedSuppliers.length + tempSelectedIds.length > 4 && (
                <span className="text-destructive">
                  Maximum 4 suppliers allowed
                </span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setTempSelectedIds([]);
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={addSuppliers}
              disabled={
                tempSelectedIds.length === 0 ||
                selectedSuppliers.length + tempSelectedIds.length > 4
              }
            >
              Add Selected ({tempSelectedIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedSuppliers.length === 0 ? (
        <Card className="py-12">
          <div className="text-center">
            <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No suppliers selected
            </h3>
            <p className="text-muted-foreground mb-4">
              Select suppliers from the directory to compare them side by side.
            </p>
            <Button asChild>
              <Link to="/retailer/suppliers">Browse Suppliers</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Supplier Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedSuppliers.map((supplier) => (
              <Card key={supplier.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeSupplier(supplier.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-16 w-16 mb-3">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {getInitials(supplier.name)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg mb-1">
                      {supplier.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Badge variant="secondary">{supplier.category}</Badge>
                      {supplier.verified && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {supplier.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add More Placeholder - Shows when less than 4 suppliers */}
            {selectedSuppliers.length < 4 && (
              <Card
                className="border-dashed hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setIsAddModalOpen(true)}
              >
                <CardContent className="p-6 h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">Add Supplier</p>
                    <p className="text-xs text-muted-foreground">
                      {4 - selectedSuppliers.length} more slot
                      {4 - selectedSuppliers.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Comparison Details</CardTitle>
              <CardDescription>
                Compare suppliers across key metrics and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="Overview" className="w-full">
                <TabsList className="w-full justify-start">
                  {comparisonFeatures.map((section) => (
                    <TabsTrigger
                      key={section.category}
                      value={section.category}
                    >
                      {section.category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {comparisonFeatures.map((section) => (
                  <TabsContent key={section.category} value={section.category}>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Feature</TableHead>
                            {selectedSuppliers.map((supplier) => (
                              <TableHead
                                key={supplier.id}
                                className="min-w-[180px]"
                              >
                                {supplier.name}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {section.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <TableRow key={item.key}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    {item.label}
                                  </div>
                                </TableCell>
                                {selectedSuppliers.map((supplier) => (
                                  <TableCell key={supplier.id}>
                                    <div className="flex items-center justify-center">
                                      {renderValue(supplier, item.key)}
                                    </div>
                                  </TableCell>
                                ))}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link to="/retailer/suppliers">Back to Directory</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareSuppliersPage;
