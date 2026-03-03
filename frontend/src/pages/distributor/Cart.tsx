import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Factory,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Truck,
  Shield,
  CreditCard,
  Wallet,
  Building,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Package,
  Clock,
  Scale,
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
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Mock cart data for factory products
const initialCartItems = [
  {
    id: 1001,
    productId: 1001,
    name: "Portland Cement",
    factory: "Mugher Cement",
    factoryId: 501,
    price: 520,
    unit: "bag",
    quantity: 500,
    min_order_amount: 100,
    maxOrder: 5000,
    stock: 15000,
    verified: true,
    deliveryTime: "2-3 days",
    shippingCost: 2500,
    volumeDiscount: "5% off on 1000+ bags",
    selected: true,
  },
  {
    id: 1002,
    productId: 1002,
    name: "Steel Rebars 12mm",
    factory: "Mekelle Steel",
    factoryId: 502,
    price: 7500,
    unit: "ton",
    quantity: 10,
    min_order_amount: 5,
    maxOrder: 50,
    stock: 450,
    verified: true,
    deliveryTime: "5-7 days",
    shippingCost: 5000,
    volumeDiscount: "3% off on 20+ tons",
    selected: true,
  },
  {
    id: 1005,
    productId: 1005,
    name: "White Teff Grain",
    factory: "Ethiopia Agri",
    factoryId: 505,
    price: 95,
    unit: "kg",
    quantity: 1000,
    min_order_amount: 200,
    maxOrder: 10000,
    stock: 45000,
    verified: true,
    deliveryTime: "2-4 days",
    shippingCost: 1800,
    volumeDiscount: "12% off on 1000+ kg",
    selected: true,
  },
];

const paymentMethods = [
  {
    id: "credit",
    name: "Credit (30 days terms)",
    icon: CreditCard,
    description: "Pay within 30 days",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: Building,
    description: "Direct bank transfer",
  },
  {
    id: "mobile",
    name: "Mobile Banking",
    icon: Wallet,
    description: "Telebirr, M-Pesa, etc.",
  },
];

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [selectAll, setSelectAll] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [deliveryDate, setDeliveryDate] = useState("standard");
  const [purchaseOrder, setPurchaseOrder] = useState("");
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);

  const selectedItems = cartItems.filter((item) => item.selected);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const shipping = selectedItems.reduce(
    (sum, item) => sum + item.shippingCost,
    0,
  );

  // Calculate volume discounts
  const discount = selectedItems.reduce((sum, item) => {
    if (item.quantity >= 1000 && item.name === "White Teff Grain") {
      return sum + item.price * item.quantity * 0.12;
    }
    if (item.quantity >= 1000 && item.name === "Portland Cement") {
      return sum + item.price * item.quantity * 0.05;
    }
    if (item.quantity >= 20 && item.name === "Steel Rebars 12mm") {
      return sum + item.price * item.quantity * 0.03;
    }
    return sum;
  }, 0);

  const tax = (subtotal - discount) * 0.15;
  const total = subtotal + shipping + tax - discount;

  const updateQuantity = (itemId: number, newQuantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: Math.max(
                item.min_order_amount,
                Math.min(newQuantity, item.maxOrder),
              ),
            }
          : item,
      ),
    );
  };

  const toggleItem = (itemId: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item,
      ),
    );
    setSelectAll(cartItems.every((item) => item.selected));
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems((prev) =>
      prev.map((item) => ({ ...item, selected: newSelectAll })),
    );
  };

  const removeItem = (itemId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const formatPrice = (price: number) => {
    return `ETB ${price.toLocaleString()}`;
  };

  const getSupplierGroups = () => {
    const groups: any = {};
    selectedItems.forEach((item) => {
      if (!groups[item.factoryId]) {
        groups[item.factoryId] = {
          factoryId: item.factoryId,
          factoryName: item.factory,
          items: [],
          subtotal: 0,
          shipping: 0,
        };
      }
      groups[item.factoryId].items.push(item);
      groups[item.factoryId].subtotal += item.price * item.quantity;
      groups[item.factoryId].shipping += item.shippingCost;
    });
    return Object.values(groups);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/distributor/factory-products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Factory Cart
              </h1>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <Factory className="h-3 w-3 mr-1" />
                Bulk Order
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Review your factory orders before checkout
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link to="/distributor/factory-products">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      {cartItems.length === 0 ? (
        <Card className="py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center">
                <Factory className="h-12 w-12 text-blue-500/50" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Your factory cart is empty
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start sourcing products directly from Ethiopian manufacturers and
              factories.
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link to="/distributor/factory-products">
                Browse Factory Products
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Select All Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id="select-all"
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                    />
                    <Label htmlFor="select-all" className="text-sm font-medium">
                      Select All ({cartItems.length} items)
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setCartItems([])}
                    disabled={selectedItems.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Selected
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Items by Factory */}
            {getSupplierGroups().map((group: any) => (
              <Card key={group.factoryId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Factory className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          <Link
                            to={`/distributor/factories/${group.factoryId}`}
                            className="hover:text-blue-600"
                          >
                            {group.factoryName}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          {group.items.length} products • Shipping:{" "}
                          {formatPrice(group.shipping)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Verified Factory
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    {group.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 py-2"
                      >
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => toggleItem(item.id)}
                        />

                        <div className="h-16 w-16 bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-8 w-8 text-blue-500/30" />
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                            <div>
                              <Link
                                to={`/distributor/factory-products/${item.productId}`}
                                className="text-sm font-medium hover:text-blue-600"
                              >
                                {item.name}
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  Unit Price: {formatPrice(item.price)}/
                                  {item.unit}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-blue-50"
                                >
                                  MOQ: {item.min_order_amount}
                                </Badge>
                              </div>
                              {item.volumeDiscount && (
                                <p className="text-xs text-green-600 mt-1">
                                  ✓ {item.volumeDiscount}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center border rounded-md">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-r-none"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity - item.min_order_amount,
                                    )
                                  }
                                  disabled={
                                    item.quantity <= item.min_order_amount
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-12 text-center text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-l-none"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity + item.min_order_amount,
                                    )
                                  }
                                  disabled={item.quantity >= item.maxOrder}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="text-right min-w-[100px]">
                                <div className="text-sm font-bold text-blue-600">
                                  {formatPrice(item.price * item.quantity)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  +{formatPrice(item.shippingCost)} shipping
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Bulk Order Tips */}
            <Card className="bg-blue-50/50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">
                      Bulk Order Benefits
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      • Volume discounts apply automatically at checkout
                      <br />
                      • Credit terms available for verified distributors
                      <br />
                      • Schedule delivery dates to optimize inventory
                      <br />• Request samples before full order
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {selectedItems.length} items from {getSupplierGroups().length}{" "}
                  factories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{formatPrice(shipping)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Volume Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (15%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Purchase Order Number */}
                <div className="space-y-2">
                  <Label htmlFor="po-number">
                    Purchase Order Number (Optional)
                  </Label>
                  <Input
                    id="po-number"
                    placeholder="Enter PO number"
                    value={purchaseOrder}
                    onChange={(e) => setPurchaseOrder(e.target.value)}
                  />
                </div>

                {/* Delivery Schedule */}
                <div className="space-y-2">
                  <Label>Preferred Delivery</Label>
                  <Select value={deliveryDate} onValueChange={setDeliveryDate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        Standard (3-5 business days)
                      </SelectItem>
                      <SelectItem value="scheduled">
                        Schedule specific date
                      </SelectItem>
                      <SelectItem value="flexible">
                        Flexible (best match)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  disabled={selectedItems.length === 0}
                  onClick={() => setCheckoutDialogOpen(true)}
                >
                  Place Factory Order
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By placing this order, you agree to the factory's terms and
                  conditions
                </p>
              </CardFooter>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={method.id}
                        id={`payment-${method.id}`}
                      />
                      <Label
                        htmlFor={`payment-${method.id}`}
                        className="flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <method.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {method.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          {method.description}
                        </p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Factory Order</DialogTitle>
            <DialogDescription>
              Please review your order before submitting
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Order Summary</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-medium">{selectedItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Factories</span>
                  <span className="font-medium">
                    {getSupplierGroups().length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-bold text-blue-600">
                    {formatPrice(total)}
                  </span>
                </div>
                {purchaseOrder && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PO Number</span>
                    <span className="font-mono text-sm">{purchaseOrder}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="mb-2">⚠️ Important Information:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Orders are subject to factory confirmation</li>
                <li>
                  Payment terms will be applied based on your credit status
                </li>
                <li>You will receive order confirmation within 24 hours</li>
                <li>
                  Cancellations must be made within 12 hours of order placement
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCheckoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setCheckoutDialogOpen(false);
                // Navigate to order confirmation
              }}
            >
              Confirm & Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartPage;
