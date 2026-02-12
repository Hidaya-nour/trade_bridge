import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Building,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Lock,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Smartphone,
  Laptop,
  Moon,
  Sun,
  Languages,
  LogOut,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock user data
const userData = {
  profile: {
    name: "Hidaya Nurmeika",
    email: "hidaya@tradebridge.com",
    phone: "+251 91 234 5678",
    altPhone: "+251 91 876 5432",
    businessName: "ABC Retail Shop",
    businessType: "Retailer",
    businessAddress: "Bole Road, Adama, Ethiopia",
    tinNumber: "1234567890",
    vatRegistered: true,
    bio: "Retail business specializing in coffee, grains, and household goods. Looking for quality suppliers across Ethiopia.",
    avatar: null,
  },
  notifications: {
    emailOrders: true,
    emailPromotions: true,
    emailNewsletter: false,
    pushOrders: true,
    pushShipping: true,
    pushPromotions: false,
    smsOrders: true,
    smsShipping: false,
    orderConfirmations: true,
    paymentConfirmations: true,
    deliveryUpdates: true,
    supplierUpdates: true,
  },
  security: {
    twoFactor: false,
    loginAlerts: true,
    deviceHistory: [
      {
        device: "Chrome on Windows",
        location: "Adama, Ethiopia",
        lastActive: "5 minutes ago",
        current: true,
      },
      {
        device: "Safari on iPhone",
        location: "Adama, Ethiopia",
        lastActive: "2 days ago",
        current: false,
      },
    ],
  },
  payment: {
    defaultMethod: "credit",
    creditLimit: "ETB 50,000",
    creditUsed: "ETB 12,500",
    creditAvailable: "ETB 37,500",
    paymentTerms: "30 days",
  },
  preferences: {
    language: "english",
    theme: "light",
    timezone: "Africa/Addis_Ababa",
    dateFormat: "DD/MM/YYYY",
    currency: "ETB",
  },
};

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="md:w-64 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-1">
                <Button
                  variant={activeTab === "profile" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button
                  variant={activeTab === "business" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("business")}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Business Info
                </Button>
                <Button
                  variant={
                    activeTab === "notifications" ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button
                  variant={activeTab === "security" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("security")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </Button>
                <Button
                  variant={activeTab === "payment" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("payment")}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Settings
                </Button>
                <Button
                  variant={activeTab === "preferences" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("preferences")}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information and how others see you
                        on TradeBridge
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {getInitials(userData.profile.name)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Upload Photo
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or GIF. Max 2MB.
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        defaultValue={userData.profile.name}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={userData.profile.email}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Primary Phone</Label>
                      <Input
                        id="phone"
                        defaultValue={userData.profile.phone}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="altPhone">Alternate Phone</Label>
                      <Input
                        id="altPhone"
                        defaultValue={userData.profile.altPhone}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      defaultValue={userData.profile.bio}
                      disabled={!isEditing}
                      rows={4}
                    />
                  </div>
                </CardContent>
                {isEditing && (
                  <CardFooter className="flex justify-end gap-2 border-t pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setIsEditing(false)}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            {/* Business Info Tab */}
            <TabsContent value="business" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Manage your business details for suppliers and verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        defaultValue={userData.profile.businessName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select
                        defaultValue={userData.profile.businessType.toLowerCase()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retailer">Retailer</SelectItem>
                          <SelectItem value="distributor">
                            Distributor
                          </SelectItem>
                          <SelectItem value="wholesaler">Wholesaler</SelectItem>
                          <SelectItem value="manufacturer">
                            Manufacturer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="businessAddress">Business Address</Label>
                      <Input
                        id="businessAddress"
                        defaultValue={userData.profile.businessAddress}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tinNumber">TIN Number</Label>
                      <Input
                        id="tinNumber"
                        defaultValue={userData.profile.tinNumber}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vatRegistered">VAT Registered</Label>
                      <div className="flex items-center h-10">
                        <Switch
                          id="vatRegistered"
                          defaultChecked={userData.profile.vatRegistered}
                        />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Yes, I am VAT registered
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">
                          Verification Status
                        </h4>
                        <p className="text-xs text-blue-700 mt-1">
                          Your business information is verified. You have access
                          to verified supplier badges.
                        </p>
                      </div>
                      <Badge className="ml-auto bg-green-100 text-green-700 border-green-200">
                        Verified
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-6">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-4">
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailOrders" className="text-sm">
                            Order Updates
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Receive emails about order confirmations, shipping,
                            and delivery
                          </p>
                        </div>
                        <Switch
                          id="emailOrders"
                          defaultChecked={userData.notifications.emailOrders}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailPromotions" className="text-sm">
                            Promotions & Offers
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Receive emails about sales, discounts, and special
                            offers
                          </p>
                        </div>
                        <Switch
                          id="emailPromotions"
                          defaultChecked={
                            userData.notifications.emailPromotions
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailNewsletter" className="text-sm">
                            Newsletter
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Receive monthly newsletter with platform updates
                          </p>
                        </div>
                        <Switch
                          id="emailNewsletter"
                          defaultChecked={
                            userData.notifications.emailNewsletter
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-4">
                      Push Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="pushOrders" className="text-sm">
                            Order Updates
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Receive push notifications for order status changes
                          </p>
                        </div>
                        <Switch
                          id="pushOrders"
                          defaultChecked={userData.notifications.pushOrders}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="pushShipping" className="text-sm">
                            Shipping Updates
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Receive push notifications when orders ship
                          </p>
                        </div>
                        <Switch
                          id="pushShipping"
                          defaultChecked={userData.notifications.pushShipping}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-4">
                      SMS Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="smsOrders" className="text-sm">
                            Order Confirmations
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Receive SMS when orders are confirmed
                          </p>
                        </div>
                        <Switch
                          id="smsOrders"
                          defaultChecked={userData.notifications.smsOrders}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="smsShipping" className="text-sm">
                            Delivery Updates
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Receive SMS when orders are out for delivery
                          </p>
                        </div>
                        <Switch
                          id="smsShipping"
                          defaultChecked={userData.notifications.smsShipping}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-6">
                  <Button variant="outline">Reset to Default</Button>
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Password Change */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Change Password</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Current Password
                        </Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Update Password
                    </Button>
                  </div>

                  <Separator />

                  {/* Two-Factor Authentication */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch defaultChecked={userData.security.twoFactor} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Login Alerts</h3>
                        <p className="text-xs text-muted-foreground">
                          Receive notifications when new devices log in to your
                          account
                        </p>
                      </div>
                      <Switch defaultChecked={userData.security.loginAlerts} />
                    </div>
                  </div>

                  <Separator />

                  {/* Active Sessions */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Active Sessions</h3>
                    <div className="space-y-3">
                      {userData.security.deviceHistory.map((device, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-background rounded-full flex items-center justify-center">
                              {device.device.includes("iPhone") ? (
                                <Smartphone className="h-4 w-4" />
                              ) : (
                                <Laptop className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {device.device}
                                {device.current && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 text-[10px]"
                                  >
                                    Current
                                  </Badge>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {device.location} • Last active{" "}
                                {device.lastActive}
                              </p>
                            </div>
                          </div>
                          {!device.current && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings Tab */}
            <TabsContent value="payment" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>
                    Manage your payment methods and credit terms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Credit Summary */}
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold">Credit Summary</h3>
                      <Badge className="bg-primary/90">Active</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Credit Limit
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {userData.payment.creditLimit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Used</p>
                        <p className="text-lg font-bold">
                          {userData.payment.creditUsed}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Available
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {userData.payment.creditAvailable}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground">
                        Payment Terms:{" "}
                        <span className="font-medium">
                          {userData.payment.paymentTerms}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Default Payment Method */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">
                      Default Payment Method
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="credit"
                          name="paymentMethod"
                          defaultChecked={
                            userData.payment.defaultMethod === "credit"
                          }
                          className="h-4 w-4"
                        />
                        <Label htmlFor="credit" className="text-sm">
                          Credit (30 days terms)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="mobile"
                          name="paymentMethod"
                          className="h-4 w-4"
                        />
                        <Label htmlFor="mobile" className="text-sm">
                          Mobile Banking
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="cash"
                          name="paymentMethod"
                          className="h-4 w-4"
                        />
                        <Label htmlFor="cash" className="text-sm">
                          Cash on Delivery
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Saved Cards/Payment Methods */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">
                        Saved Payment Methods
                      </h3>
                      <Button variant="outline" size="sm">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Add New
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Smartphone className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Mobile Banking
                            </p>
                            <p className="text-xs text-muted-foreground">
                              +251 91 234 5678
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-primary/5">
                          Default
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your TradeBridge experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue={userData.preferences.language}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="amharic">አማርኛ</SelectItem>
                          <SelectItem value="oromo">Afaan Oromoo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Select defaultValue={userData.preferences.theme}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="h-10 w-10 rounded-full border flex items-center justify-center">
                          {userData.preferences.theme === "dark" ? (
                            <Moon className="h-4 w-4" />
                          ) : (
                            <Sun className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue={userData.preferences.timezone}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Africa/Addis_Ababa">
                            Addis Ababa (GMT+3)
                          </SelectItem>
                          <SelectItem value="Africa/Nairobi">
                            Nairobi (GMT+3)
                          </SelectItem>
                          <SelectItem value="Africa/Cairo">
                            Cairo (GMT+2)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select defaultValue={userData.preferences.dateFormat}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select defaultValue={userData.preferences.currency}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ETB">
                            ETB - Ethiopian Birr
                          </SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Danger Zone */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-destructive">
                      Danger Zone
                    </h3>
                    <div className="border border-destructive/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Delete Account</p>
                          <p className="text-xs text-muted-foreground">
                            Permanently delete your account and all associated
                            data
                          </p>
                        </div>
                        <AlertDialog
                          open={showDeleteDialog}
                          onOpenChange={setShowDeleteDialog}
                        >
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove all
                                your order history, messages, and data from our
                                servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Yes, delete my account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-6">
                  <Button variant="outline">Reset to Default</Button>
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
