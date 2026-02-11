import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
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
  Store,
  Package,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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

// Mock cart data
const initialCartItems = [
  {
    id: 1,
    productId: 1,
    name: "Yirgacheffe Coffee",
    supplier: "Ethiopia Coffee Export",
    supplierId: 101,
    price: 450,
    unit: "kg",
    quantity: 15,
    minOrder: 10,
    maxOrder: 100,
    stock: 2450,
    image: null,
    verified: true,
    deliveryTime: "2-3 days",
    shippingCost: 250,
    selected: true,
  },
  {
    id: 2,
    productId: 2,
    name: "White Teff Flour",
    supplier: "Adama Wholesalers",
    supplierId: 102,
    price: 120,
    unit: "kg",
    quantity: 50,
    minOrder: 25,
    maxOrder: 500,
    stock: 5200,
    image: null,
    verified: true,
    deliveryTime: "1-2 days",
    shippingCost: 350,
    selected: true,
  },
  {
    id: 3,
    productId: 4,
    name: "Pure Honey",
    supplier: "Bahir Dar Honey",
    supplierId: 104,
    price: 280,
    unit: "jar",
    quantity: 24,
    minOrder: 12,
    maxOrder: 200,
    stock: 890,
    image: null,
    verified: true,
    deliveryTime: "2-4 days",
    shippingCost: 300,
    selected: false,
  },
  {
    id: 4,
    productId: 8,
    name: "Tomato Paste",
    supplier: "Ethiopia Agri",
    supplierId: 107,
    price: 85,
    unit: "can",
    quantity: 200,
    minOrder: 100,
    maxOrder: 1000,
    stock: 3500,
    image: null,
    verified: true,
    deliveryTime: "2-3 days",
    shippingCost: 400,
    selected: true,
  },
];

// Payment methods
const paymentMethods = [
  { id: "cash", name: "Cash on Delivery", icon: Wallet, description: "Pay when you receive your order" },
  { id: "credit", name: "Credit", icon: CreditCard, description: "Pay with credit (30 days terms)" },
  { id: "cheque", name: "Cheque", icon: Building, description: "Pay by cheque" },
  { id: "mobile", name: "Mobile Banking", icon: Wallet, description: "Pay with mobile money" },
  { id: "online", name: "Online Payment", icon: CreditCard, description: "Pay with Chapa, Telebirr, etc." },
];

// Delivery options
const deliveryOptions = [
  { id: "standard", name: "Standard Delivery", days: "3-5 business days", cost: "Included" },
  { id: "express", name: "Express Delivery", days: "1-2 business days", cost: "ETB 500" },
];

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [selectAll, setSelectAll] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);

  // Calculate selected items
  const selectedItems = cartItems.filter(item => item.selected);
  
  // Calculate subtotal
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculate shipping
  const shipping = selectedItems.reduce(
    (sum, item) => sum + (item.selected ? item.shippingCost : 0),
    0
  );

  // Calculate discount (mock)
  const discount = promoApplied ? subtotal * 0.1 : 0;
  
  // Calculate tax (15% VAT in Ethiopia)
  const tax = (subtotal - discount) * 0.15;
  
  // Calculate total
  const total = subtotal + shipping + tax - discount;

  // Update quantity
  const updateQuantity = (itemId: number, newQuantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(item.minOrder, Math.min(newQuantity, item.maxOrder)) }
          : item
      )
    );
  };

  // Toggle item selection
  const toggleItem = (itemId: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
    setSelectAll(cartItems.every(item => item.selected));
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems(prev =>
      prev.map(item => ({ ...item, selected: newSelectAll }))
    );
  };

  // Remove item
  const removeItem = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Remove selected items
  const removeSelected = () => {
    setCartItems(prev => prev.filter(item => !item.selected));
    setSelectAll(false);
  };

  // Apply promo code
  const applyPromo = () => {
    if (promoCode.toUpperCase() === "TRADE10") {
      setPromoApplied(true);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return `ETB ${price.toLocaleString()}`;
  };

  // Get cart summary by supplier
  const supplierGroups = selectedItems.reduce((groups, item) => {
    const key = item.supplierId;
    if (!groups[key]) {
      groups[key] = {
        supplierId: item.supplierId,
        supplierName: item.supplier,
        items: [],
        subtotal: 0,
        shipping: 0,
      };
    }
    groups[key].items.push(item);
    groups[key].subtotal += item.price * item.quantity;
    groups[key].shipping += item.shippingCost;
    return groups;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage your items before checkout
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
          </Badge>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/retailer/products" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <Card className="py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet.
              Start browsing products from verified suppliers.
            </p>
            <Button size="lg" asChild>
              <Link to="/retailer/products">
                Browse Products
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items - Left Column */}
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
                    onClick={removeSelected}
                    disabled={selectedItems.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Selected
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cart Items by Supplier */}
            {Object.values(supplierGroups).map((group: any) => (
              <Card key={group.supplierId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {group.supplierName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          <Link to={`/retailer/suppliers/${group.supplierId}`} className="hover:text-primary">
                            {group.supplierName}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          {group.items.length} items • Shipping: {formatPrice(group.shipping)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Verified Supplier
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    {group.items.map((item: any) => (
                      <div key={item.id} className="flex items-start gap-4 py-2">
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        
                        {/* Product Image Placeholder */}
                        <div className="h-16 w-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-8 w-8 text-primary/30" />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                            <div>
                              <Link 
                                to={`/retailer/products/${item.productId}`}
                                className="text-sm font-medium hover:text-primary"
                              >
                                {item.name}
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  Unit Price: {formatPrice(item.price)}/{item.unit}
                                </span>
                                <Badge variant="outline" className="text-[10px]">
                                  Min: {item.minOrder}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] bg-green-50">
                                  In Stock: {item.stock}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {/* Quantity Selector */}
                              <div className="flex items-center border rounded-md">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-r-none"
                                  onClick={() => updateQuantity(item.id, item.quantity - item.minOrder)}
                                  disabled={item.quantity <= item.minOrder}
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
                                  onClick={() => updateQuantity(item.id, item.quantity + item.minOrder)}
                                  disabled={item.quantity >= item.maxOrder}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Item Total */}
                              <div className="text-right min-w-[100px]">
                                <div className="text-sm font-bold text-primary">
                                  {formatPrice(item.price * item.quantity)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  +{formatPrice(item.shippingCost)} shipping
                                </div>
                              </div>

                              {/* Remove Button */}
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

            {/* Bulk Order Note */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Bulk Order Discount Available</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add more items to qualify for volume discounts. 
                      Spend ETB 15,000 more to get 10% off.
                    </p>
                    <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min((subtotal / 50000) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ETB {subtotal.toLocaleString()} / ETB 50,000
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - Right Column */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {selectedItems.length} items selected
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
                  {promoApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount (10%)</span>
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
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="space-y-2">
                  <Label htmlFor="promo">Promo Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <Button 
                      variant="outline" 
                      onClick={applyPromo}
                      disabled={promoApplied || !promoCode}
                    >
                      Apply
                    </Button>
                  </div>
                  {promoApplied && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      10% discount applied!
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={selectedItems.length === 0}
                  onClick={() => setCheckoutDialogOpen(true)}
                >
                  Proceed to Checkout
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By placing this order, you agree to our Terms of Service and Return Policy
                </p>
              </CardFooter>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Estimated Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      {deliveryOption === "standard" ? "3-5 business days" : "1-2 business days"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Secure Transaction</p>
                    <p className="text-xs text-muted-foreground">
                      Your payment information is encrypted
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saved for Later */}
            {cartItems.filter(item => !item.selected).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Saved for Later</CardTitle>
                  <CardDescription>
                    {cartItems.filter(item => !item.selected).length} items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cartItems.filter(item => !item.selected).slice(0, 2).map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{formatPrice(item.price)}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 text-xs"
                          onClick={() => toggleItem(item.id)}
                        >
                          Move to Cart
                        </Button>
                      </div>
                    ))}
                    {cartItems.filter(item => !item.selected).length > 2 && (
                      <Button variant="link" size="sm" className="text-xs w-full">
                        View {cartItems.filter(item => !item.selected).length - 2} more items
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Review your order and select payment method
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Order Items Summary */}
            <div>
              <h4 className="text-sm font-medium mb-3">Order Items</h4>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground ml-2">
                          x{item.quantity} {item.unit}
                        </span>
                      </div>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* Delivery Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Delivery Option</h4>
              <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption}>
                {deliveryOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{option.name}</span>
                        <span className="text-sm text-muted-foreground">{option.cost}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{option.days}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Payment Method</h4>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex-1">
                      <div className="flex items-center gap-2">
                        <method.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{method.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        {method.description}
                      </p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Order Total */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>VAT (15%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setCheckoutDialogOpen(false);
              // Navigate to order confirmation or process order
            }}>
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartPage;