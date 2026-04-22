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
  X,
  Plus,
  Minus,
  MapPin,
  ChevronRight,
  CreditCard,
  XCircle,
  Scale,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, PaginationBar } from "@/components";
import { formatPrice } from "@/lib/formatters";
import { useOrderStore } from "@/stores/order.store";
import toast from "react-hot-toast";
import { PlaceOrderDialog } from "@/components/order/PlaceOrderDialog";
import paymentService from "@/services/payment.service";
import documentService from "@/services/document.service";
import supplierPaymentMethodService from "@/services/supplier-payment-method.service";
import { supplierMethodsToPaymentMethods } from "@/lib/payment-method-utils";
import type { CatalogConfig, CatalogProduct } from "@/types/product.types";
import type { PaymentMethod } from "@/types/payment.types";
import SupplierReviewDialog from "@/components/supplier/SupplierReviewDialog";

// ============================================================================
// PROPS
// ============================================================================

interface ProductCatalogProps {
  config: CatalogConfig;
  products: CatalogProduct[];
  onAddToCart: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onRemoveItemFromCart: (productId: string) => void;
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
  onRemoveItemFromCart,
  getCartQuantity,
  getTotalCartItems,
  getTotalCartValue,
}) => {
  const DEFAULT_VAT_RATE = 0.15;
  const CHECKOUT_DISTANCE_KM = 1;
  const resolveProductVatRate = (product?: Partial<CatalogProduct> | null) => {
    const supplier = product?.supplier;
    if (!supplier || supplier.is_vat_registered !== true) return 0;
    const parsedRate = Number(supplier.vat_rate);
    if (Number.isFinite(parsedRate) && parsedRate >= 0 && parsedRate <= 1) {
      return parsedRate;
    }
    return DEFAULT_VAT_RATE;
  };
  const resolveProductShipping = (product?: Partial<CatalogProduct> | null) => {
    if (!product) return { shipping: 0, blocked: false };
    const deliveryAvailable = product.delivery_available !== false;
    if (!deliveryAvailable) return { shipping: 0, blocked: true };

    const feePerKm = Number(product.delivery_fee_per_km || 0);
    const pricing = String(product.delivery_pricing || "").toLowerCase();
    const freeMaxKm =
      product.free_delivery_max_distance_km !== null &&
      product.free_delivery_max_distance_km !== undefined
        ? Number(product.free_delivery_max_distance_km)
        : null;

    if (freeMaxKm !== null && CHECKOUT_DISTANCE_KM <= freeMaxKm) {
      return { shipping: 0, blocked: false };
    }

    if (pricing === "paid" || feePerKm > 0) {
      return {
        shipping: Number((feePerKm * CHECKOUT_DISTANCE_KM).toFixed(2)),
        blocked: false,
      };
    }

    return { shipping: 0, blocked: false };
  };

  const getMapUrl = (product: CatalogProduct) => {
    const lat = product.latitude;
    const lng = product.longitude;
    if (typeof lat === "number" && typeof lng === "number") {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return `https://www.google.com/maps?q=${lat},${lng}`;
    }
    if (product.location && product.location !== "Unknown Location") {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(product.location)}`;
    }
    return null;
  };
  const getProductImages = (product: CatalogProduct) => {
    if (product.images && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [];
  };
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [moqRange, setMoqRange] = useState([0, 0]);
  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewSupplier, setReviewSupplier] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [manualInputValue, setManualInputValue] = useState<{
    [key: string]: string;
  }>({});

  // Direct order state
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(
    null,
  );
  const [orderQuantity, setOrderQuantity] = useState<number>(0);
  const [supplierAllowedMethods, setSupplierAllowedMethods] = useState<
    PaymentMethod[]
  >([]);
  const [supplierPaymentMethods] = useState<any[]>([]);

  const { createOrder, isLoading: orderLoading } = useOrderStore();

  React.useEffect(() => {
    const loadSupplierPaymentMethods = async () => {
      if (!selectedProduct?.supplier_id) {
        setSupplierAllowedMethods([]);
        return;
      }

      try {
        const response =
          await supplierPaymentMethodService.getActiveBySupplierId(
            selectedProduct.supplier_id,
          );
        const activeMethods = response.data || response;
        setSupplierAllowedMethods(
          supplierMethodsToPaymentMethods(activeMethods),
        );
      } catch (error) {
        console.error("Unable to load supplier payment methods", error);
        setSupplierAllowedMethods([]);
      }
    };

    void loadSupplierPaymentMethods();
  }, [selectedProduct]);

  const itemsPerPage = 9;

  const moqBounds = React.useMemo(() => {
    const values = initialProducts
      .map((product) => Number(product.min_order_amount || 0))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (values.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [initialProducts]);

  React.useEffect(() => {
    setMoqRange(([currentMin, currentMax]) => {
      if (currentMin === 0 && currentMax === 0) {
        return [moqBounds.min, moqBounds.max];
      }
      return [
        Math.max(moqBounds.min, currentMin),
        Math.min(moqBounds.max, currentMax),
      ];
    });
  }, [moqBounds.min, moqBounds.max]);

  React.useEffect(() => {
    setCompareIds((prev) =>
      prev.filter((id) => initialProducts.some((p) => p.id === id)),
    );
  }, [initialProducts]);

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

    const matchesMoq =
      moqBounds.max <= 0 ||
      (product.min_order_amount >= moqRange[0] &&
        product.min_order_amount <= moqRange[1]);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSupplier &&
      matchesLocation &&
      matchesPrice &&
      matchesMoq
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
    min_order_amount: number,
  ) => {
    setManualInputValue((prev) => ({ ...prev, [productId]: value }));
  };

  // Handle manual quantity input blur
  const handleManualInputBlur = (
    productId: string,
    min_order_amount: number,
  ) => {
    const value = manualInputValue[productId];
    if (value && value !== "") {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= min_order_amount) {
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
    min_order_amount: number,
  ) => {
    if (e.key === "Enter") {
      handleManualInputBlur(productId, min_order_amount);
    }
  };

  // Handle direct order
  const handleDirectOrder = (product: CatalogProduct) => {
    setSelectedProduct(product);
    setOrderQuantity(product.min_order_amount);
    setOrderDialogOpen(true);
  };

  const handleRemoveAllFromCart = (productId: string) => {
    if (getCartQuantity(productId) <= 0) return;
    onRemoveItemFromCart(productId);
  };

  // Handle place order
  const handlePlaceOrder = async (
    paymentMethod?: string,
    deliveryOption?: string,
    deliveryAddress?: string,
  ) => {
    if (!selectedProduct) return;
    const selectedDeliveryOption = deliveryOption || "supplier_policy";

    try {
      const normalizedAddress = (deliveryAddress || "").trim();
      const itemTotal = selectedProduct.price * orderQuantity;
      const { shipping, blocked } = resolveProductShipping(selectedProduct);
      if (blocked) {
        toast(
          "This product is marked as no-delivery by supplier. You can request an independent driver after ordering.",
          { icon: "ℹ️" } as any,
        );
      }
      const vatRate = resolveProductVatRate(selectedProduct);
      const tax = itemTotal * vatRate;
      const discount = 0; // No discount for single product orders

      const orderPayload = {
        supplier_id: selectedProduct.supplier_id,
        items: [
          {
            product_id: selectedProduct.id,
            quantity: orderQuantity,
          },
        ],
        ...(normalizedAddress && !blocked
          ? { delivery_address: normalizedAddress }
          : {}),
        notes: "",
        ...(paymentMethod ? { payment_method: paymentMethod } : {}),
      };

      const order = await createOrder(orderPayload);

      if (order) {
        toast.success("Order placed successfully!");
        return {
          primaryOrderId: order.id,
          total: order.total_price,
        };
      } else {
        toast.error("Failed to place order");
        return;
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error("Failed to place order: " + (error as Error).message);
      return;
    }
  };

  const directOrderShipping = selectedProduct
    ? resolveProductShipping(selectedProduct).shipping
    : 0;
  const directOrderVatRate = selectedProduct
    ? resolveProductVatRate(selectedProduct)
    : 0;

  const handleProcessPayment = async (
    orderId: string,
    paymentMethod: string,
    paymentDetails?: any,
    documents?: File[],
  ): Promise<boolean> => {
    try {
      let proofDocumentId: string | undefined;
      if (documents && documents.length > 0) {
        const uploaded = await documentService.uploadPaymentProof(documents[0]);
        proofDocumentId = uploaded?.data?.id || uploaded?.data?.data?.id;
      }

      const result = await paymentService.submitByOrder(orderId, {
        payment_method: paymentMethod as any,
        amount_paid:
          paymentMethod === "app_payment"
            ? undefined
            : selectedProduct
              ? selectedProduct.price * orderQuantity
              : undefined,
        proof_document_id: proofDocumentId,
        notes: paymentDetails?.notes,
        payment_details: paymentDetails,
      });

      if (paymentMethod === "app_payment") {
        const checkoutUrl =
          result?.data?.chapa?.checkout_url ||
          result?.data?.payment?.chapa_payment_url;
        if (!checkoutUrl) return false;
        window.location.href = checkoutUrl;
        return true;
      }

      return true;
    } catch (error) {
      console.error("Payment submit failed:", error);
      return false;
    }
  };

  const SupplierIcon = config.icon;

  const comparedProducts = React.useMemo(() => {
    if (compareIds.length === 0) return [];
    const byId = new Map(initialProducts.map((p) => [p.id, p]));
    return compareIds
      .map((id) => byId.get(id))
      .filter(Boolean) as CatalogProduct[];
  }, [compareIds, initialProducts]);

  const toggleCompare = (productId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(productId))
        return prev.filter((id) => id !== productId);
      if (prev.length >= 3) {
        toast.error("Compare supports up to 3 products.");
        return prev;
      }
      return [...prev, productId];
    });
  };

  const openSupplierReview = (supplierId: string, supplierName: string) => {
    if (!supplierId) return;
    setReviewSupplier({ id: supplierId, name: supplierName || "Supplier" });
    setReviewOpen(true);
  };

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
          <Sheet open={compareOpen} onOpenChange={setCompareOpen}>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setCompareOpen(true)}
              disabled={compareIds.length === 0}
            >
              <Scale className="h-4 w-4" />
              Compare ({compareIds.length})
            </Button>
            <SheetContent side="right" className="w-full sm:max-w-2xl">
              <SheetHeader>
                <SheetTitle>Compare Products</SheetTitle>
                <SheetDescription>
                  Compare prices, minimum order amount, and supplier details.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                {comparedProducts.length === 0 ? (
                  <EmptyState
                    icon={Scale}
                    title="No products selected"
                    description="Select up to 3 products to compare."
                  />
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {comparedProducts.map((product) => (
                        <Badge
                          key={product.id}
                          variant="secondary"
                          className="gap-2"
                        >
                          {product.name}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => toggleCompare(product.id)}
                          />
                        </Badge>
                      ))}
                    </div>

                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[170px]">
                              Attribute
                            </TableHead>
                            {comparedProducts.map((product) => (
                              <TableHead
                                key={product.id}
                                className="min-w-[180px]"
                              >
                                <Link
                                  to={`/${config.role}/products/${product.id}`}
                                  className="hover:text-primary"
                                  onClick={() => setCompareOpen(false)}
                                >
                                  {product.name}
                                </Link>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Price</TableCell>
                            {comparedProducts.map((product) => (
                              <TableCell key={product.id}>
                                {formatPrice(product.price)} / {product.unit}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Min. Order
                            </TableCell>
                            {comparedProducts.map((product) => (
                              <TableCell key={product.id}>
                                {product.min_order_amount}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              {config.supplierLabel}
                            </TableCell>
                            {comparedProducts.map((product) => (
                              <TableCell key={product.id}>
                                <Link
                                  to={`/${config.role}${config.supplierPath}/${product.supplier_id}`}
                                  className="hover:text-primary"
                                  onClick={() => setCompareOpen(false)}
                                >
                                  {product.supplier_name}
                                </Link>
                                {product.supplier?.is_verified ? (
                                  <div className="text-xs text-emerald-700 mt-1">
                                    Verified
                                  </div>
                                ) : null}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Location
                            </TableCell>
                            {comparedProducts.map((product) => (
                              <TableCell key={product.id}>
                                {product.location}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Rating
                            </TableCell>
                            {comparedProducts.map((product) => (
                              <TableCell key={product.id}>
                                {product.rating} ({product.review_count})
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Delivery
                            </TableCell>
                            {comparedProducts.map((product) => (
                              <TableCell key={product.id}>
                                {product.delivery_available === false
                                  ? "Not available"
                                  : product.delivery_pricing === "paid"
                                    ? "Paid"
                                    : "Available"}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <SheetFooter>
                      <div className="flex w-full gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCompareIds([])}
                        >
                          Clear selection
                        </Button>
                        <SheetClose asChild>
                          <Button className="flex-1">Done</Button>
                        </SheetClose>
                      </div>
                    </SheetFooter>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
          {getTotalCartItems() > 0 && (
            <Button asChild variant="outline">
              <Link to={config.cartPath} className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                View Cart ({getTotalCartItems()})
                <Badge className="ml-1 bg-white/20">
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
                      selectedLocation ||
                      (moqBounds.max > 0 &&
                        (moqRange[0] !== moqBounds.min ||
                          moqRange[1] !== moqBounds.max))) && (
                      <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                        {[
                          selectedCategory !== "All Categories" ? 1 : 0,
                          selectedSupplier ? 1 : 0,
                          selectedLocation ? 1 : 0,
                          moqBounds.max > 0 &&
                          (moqRange[0] !== moqBounds.min ||
                            moqRange[1] !== moqBounds.max)
                            ? 1
                            : 0,
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
                      {config.supplierLabel.toLowerCase()}, location, price, and
                      minimum order amount
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
                              {priceRange[0].toLocaleString() ?? "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                              Max:
                            </span>
                            <span className="text-sm font-medium">
                              {priceRange[1].toLocaleString() ?? "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* MOQ Filter */}
                      {moqBounds.max > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">
                            Minimum Order Amount
                          </h3>
                          <Slider
                            defaultValue={[moqBounds.min, moqBounds.max]}
                            min={moqBounds.min}
                            max={moqBounds.max}
                            step={1}
                            value={moqRange}
                            onValueChange={setMoqRange}
                            className="py-4"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                Min:
                              </span>
                              <span className="text-sm font-medium">
                                {moqRange[0].toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                Max:
                              </span>
                              <span className="text-sm font-medium">
                                {moqRange[1].toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
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
                          setMoqRange([moqBounds.min, moqBounds.max]);
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
        selectedLocation ||
        (moqBounds.max > 0 &&
          (moqRange[0] !== moqBounds.min ||
            moqRange[1] !== moqBounds.max))) && (
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

          {moqBounds.max > 0 &&
            (moqRange[0] !== moqBounds.min ||
              moqRange[1] !== moqBounds.max) && (
              <Badge variant="secondary" className="gap-1">
                MOQ: {moqRange[0]}-{moqRange[1]}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setMoqRange([moqBounds.min, moqBounds.max])}
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
              setMoqRange([moqBounds.min, moqBounds.max]);
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
            setMoqRange([moqBounds.min, moqBounds.max]);
          }}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((product) => {
            const images = getProductImages(product);
            const hasImages = images.length > 0;
            return (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() =>
                  (window.location.href = `/${config.role}/products/${product.id}`)
                }
              >
                <div className="relative h-40 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                  {hasImages ? (
                    <img
                      src={images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Package className="h-16 w-16 text-primary/30" />
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant={
                      compareIds.includes(product.id) ? "default" : "secondary"
                    }
                    className="absolute top-3 left-3 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompare(product.id);
                    }}
                    title="Add to compare"
                  >
                    <Scale className="h-4 w-4" />
                  </Button>
                  <Badge className="absolute top-3 right-3 bg-white/90 text-foreground border-0">
                    Min: {product.min_order_amount}+
                  </Badge>
                </div>

                <CardContent className="p-4">
                  {images.length > 1 && (
                    <div
                      className="flex items-center gap-2 mb-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {images.slice(0, 4).map((url, index) => (
                        <img
                          key={`${url}-${index}`}
                          src={url}
                          alt={`${product.name} ${index + 1}`}
                          className="h-8 w-8 rounded border object-cover"
                          loading="lazy"
                        />
                      ))}
                      {images.length > 4 && (
                        <span className="text-xs text-muted-foreground">
                          +{images.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Link
                          to={`/${config.role}${config.supplierPath}/${product.supplier_id}`}
                          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SupplierIcon className="h-3 w-3" />
                          {product.supplier_name}
                        </Link>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSupplierReview(
                              product.supplier_id,
                              product.supplier_name,
                            );
                          }}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Rate
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium ml-1">
                        {product.rating}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({product.review_count})
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">•</span>
                    {getMapUrl(product) ? (
                      <a
                        href={getMapUrl(product) ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary flex items-center underline underline-offset-2 hover:text-primary/80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {product.location} · View on Map
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {product.location}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {product.description}
                  </p>
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
                        {typeof product.original_price === "number" &&
                          product.original_price > product.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                        <span className="text-xs text-muted-foreground">
                          /{product.unit}
                        </span>
                      </div>
                      {product.promotion_label && (
                        <p className="mt-1 text-xs font-medium text-emerald-700">
                          {product.promotion_label}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Min. order: {product.min_order_amount}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getCartQuantity(product.id) > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border rounded-lg overflow-hidden bg-background shadow-sm">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 rounded-r-none hover:bg-muted/70"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveFromCart(product.id);
                              }}
                              disabled={
                                getCartQuantity(product.id) <=
                                (product?.min_order_amount || 1)
                              }
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
                              className="w-16 h-9 text-center rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 rounded-l-none hover:bg-muted/70"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(product.id, 1);
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAllFromCart(product.id);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product.id, product.min_order_amount);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDirectOrder(product);
                            }}
                            className="gap-1"
                          >
                            <CreditCard className="h-4 w-4" />
                            Order
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {currentItems.map((product) => {
            const images = getProductImages(product);
            const hasImages = images.length > 0;
            return (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() =>
                  (window.location.href = `/${config.role}/products/${product.id}`)
                }
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative md:w-32 h-32 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                      {hasImages ? (
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-primary/30" />
                      )}
                      <Button
                        type="button"
                        size="icon"
                        variant={
                          compareIds.includes(product.id)
                            ? "default"
                            : "secondary"
                        }
                        className="absolute top-2 left-2 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(product.id);
                        }}
                        title="Add to compare"
                      >
                        <Scale className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1">
                      {images.length > 1 && (
                        <div
                          className="flex items-center gap-2 mb-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {images.slice(0, 4).map((url, index) => (
                            <img
                              key={`${url}-${index}`}
                              src={url}
                              alt={`${product.name} ${index + 1}`}
                              className="h-8 w-8 rounded border object-cover"
                              loading="lazy"
                            />
                          ))}
                          {images.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{images.length - 4}
                            </span>
                          )}
                        </div>
                      )}
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
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                openSupplierReview(
                                  product.supplier_id,
                                  product.supplier_name,
                                );
                              }}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Rate
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            {getMapUrl(product) ? (
                              <a
                                href={getMapUrl(product) ?? undefined}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {product.location} · View on Map
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {product.location}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">
                            {formatPrice(product.price)}
                          </div>
                          {typeof product.original_price === "number" &&
                            product.original_price > product.price && (
                              <div className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.original_price)}
                              </div>
                            )}
                          {product.promotion_label && (
                            <div className="text-xs font-medium text-emerald-700 mt-1">
                              {product.promotion_label}
                            </div>
                          )}
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
                            ({product.review_count} reviews)
                          </span>
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
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-lg overflow-hidden bg-background shadow-sm">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 rounded-r-none hover:bg-muted/70"
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
                                className="w-16 h-9 text-center rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 rounded-l-none hover:bg-muted/70"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToCart(product.id, 1);
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAllFromCart(product.id);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(
                                  product.id,
                                  product.min_order_amount,
                                );
                              }}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDirectOrder(product);
                              }}
                              className="gap-1"
                            >
                              <CreditCard className="h-4 w-4" />
                              Order Now
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link to={`/${config.role}/products/${product.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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

      {/* Direct Order Dialog */}
      {selectedProduct && (
        <PlaceOrderDialog
          open={orderDialogOpen}
          onOpenChange={setOrderDialogOpen}
          items={[
            {
              id: `temp-${selectedProduct.id}`,
              order_id: "",
              product_id: selectedProduct.id,
              quantity: orderQuantity,
              unit_price: selectedProduct.price,
              product: {
                ...selectedProduct,
                unit_type: selectedProduct.unit,
                supplier: {
                  ...(selectedProduct.supplier || {}),
                  id: selectedProduct.supplier_id,
                  full_name:
                    selectedProduct.supplier?.full_name ||
                    selectedProduct.supplier_name,
                  business_name:
                    selectedProduct.supplier?.business_name ||
                    selectedProduct.supplier_name,
                },
              } as any,
            },
          ]}
          summary={{
            subtotal: selectedProduct.price * orderQuantity,
            shipping: directOrderShipping,
            discount: 0,
            tax: selectedProduct.price * orderQuantity * directOrderVatRate,
            total:
              selectedProduct.price * orderQuantity +
              directOrderShipping +
              selectedProduct.price * orderQuantity * directOrderVatRate,
            promoApplied: false,
            discountPercentage: config.bulkDiscountPercentage,
            vatPercentage: directOrderVatRate,
          }}
          config={{
            role: config.role,
            ordersPath: config.ordersPath,
            bulkDiscountPercentage: config.bulkDiscountPercentage,
          }}
          supplierAllowedMethods={supplierAllowedMethods}
          supplierPaymentMethods={supplierPaymentMethods}
          onPlaceOrder={handlePlaceOrder}
          onProcessPayment={handleProcessPayment as any}
          isPlacing={orderLoading}
        />
      )}

      {reviewSupplier && (
        <SupplierReviewDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          supplierId={reviewSupplier.id}
          supplierName={reviewSupplier.name}
        />
      )}
    </div>
  );
};
