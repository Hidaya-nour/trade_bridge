import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
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
import { useAuthStore } from "@/stores/auth.store";
import { useSupplierPaymentMethodStore } from "@/stores/supplier-payment-method.store";
import { useNotificationStore } from "@/stores/notification.store";
import { useDocumentStore } from "@/stores/document.store";
import { useAddressStore } from "@/stores/address.store";
import documentService from "@/services/document.service";

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

const DEFAULT_MAP_CENTER = { lat: 8.9806, lng: 38.7578 };
const docStatusStyles: Record<
  "pending" | "verified" | "rejected",
  string
> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  verified: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};
const mapMarkerIcon = new L.Icon({
  iconUrl: new URL(
    "leaflet/dist/images/marker-icon.png",
    import.meta.url,
  ).toString(),
  iconRetinaUrl: new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url,
  ).toString(),
  shadowUrl: new URL(
    "leaflet/dist/images/marker-shadow.png",
    import.meta.url,
  ).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapCenterUpdater: React.FC<{ center: { lat: number; lng: number } }> = ({
  center,
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [map, center.lat, center.lng]);

  return null;
};

const MapClickHandler: React.FC<{
  onPick: (lat: number, lng: number) => void;
}> = ({ onPick }) => {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
};

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [businessMessage, setBusinessMessage] = useState<string | null>(null);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    method_type: "bank_transfer",
    provider_name: "",
    account_holder_name: "",
    account_identifier: "",
    account_display: "",
    is_primary: false,
  });

  const { user, fetchUser, updateProfile, changePassword, isLoading } =
    useAuthStore();
  const isSupplier = user?.role === "factory" || user?.role === "distributor";
  const {
    items: supplierPaymentMethods,
    isLoading: isPaymentLoading,
    error: paymentError,
    fetchAll: fetchSupplierPaymentMethods,
    create: createSupplierPaymentMethod,
    update: updateSupplierPaymentMethod,
    delete: deleteSupplierPaymentMethod,
  } = useSupplierPaymentMethodStore();
  const {
    counts: notificationCounts,
    fetchCounts: fetchNotificationCounts,
    markAllRead: markAllNotificationsRead,
    clearAll: clearAllNotifications,
  } = useNotificationStore();
  const {
    items: documents,
    fetchAll: fetchDocuments,
    isLoading: docsLoading,
    error: docsError,
  } = useDocumentStore();
  const {
    items: addresses,
    fetchAll: fetchAddresses,
    create: createAddress,
    update: updateAddress,
    isLoading: addressesLoading,
    error: addressesError,
  } = useAddressStore();
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    altPhone: "",
    business_name: "",
    businessType: "",
    tin_number: "",
    vatRegistered: true,
    bio: "",
    avatar: "",
  });

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licenseIssuedDate, setLicenseIssuedDate] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const [licenseMessage, setLicenseMessage] = useState<string | null>(null);
  const [addressMessage, setAddressMessage] = useState<string | null>(null);
  const [licenseUploading, setLicenseUploading] = useState(false);
  const [extraDocs, setExtraDocs] = useState<
    {
      id: string;
      document_type: "tax_certificate" | "id_card" | "other";
      file: File | null;
      issued_date: string;
      expiry_date: string;
    }[]
  >([]);
  const [addressForm, setAddressForm] = useState({
    region: "",
    city: "",
    subcity: "",
    latitude: "",
    longitude: "",
  });
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [hasAutoLocated, setHasAutoLocated] = useState(false);

  const canManageSupplierPaymentMethods =
    user?.role === "factory" || user?.role === "distributor";
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      void fetchUser();
      return;
    }

    setProfileForm((prev) => ({
      ...prev,
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      business_name: user.business_name || "",
      businessType: user.role || "",
      tin_number: user.tin_number || "",
      avatar: user.profile_image || "",
    }));
  }, [user, fetchUser]);

  useEffect(() => {
    if (!canManageSupplierPaymentMethods && activeTab === "payment") {
      setActiveTab("profile");
    }
  }, [activeTab, canManageSupplierPaymentMethods]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (canManageSupplierPaymentMethods) {
      void fetchSupplierPaymentMethods();
    }
  }, [canManageSupplierPaymentMethods, fetchSupplierPaymentMethods]);

  useEffect(() => {
    if (isSupplier) {
      void fetchDocuments();
      void fetchAddresses();
    }
  }, [isSupplier, fetchDocuments, fetchAddresses]);

  useEffect(() => {
    void fetchNotificationCounts();
  }, [fetchNotificationCounts]);

  const handleProfileSave = async () => {
    try {
      await updateProfile({
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        business_name: profileForm.business_name,
        tin_number: profileForm.tin_number,
        profile_image: profileForm.avatar,
      });
      setSaveMessage("Profile updated successfully");
      setIsEditing(false);
    } catch {
      setSaveMessage("Failed to update profile");
    }
  };

  const handleBusinessSave = async () => {
    try {
      await updateProfile({
        business_name: profileForm.business_name,
        tin_number: profileForm.tin_number,
      });
      setBusinessMessage("Business info updated successfully");
    } catch {
      setBusinessMessage("Failed to update business info");
    }
  };

  const businessLicenseDoc = React.useMemo(() => {
    const licenseDocs = (documents || []).filter(
      (d) => d.document_type === "business_license",
    );
    if (licenseDocs.length === 0) return null;
    const sorted = [...licenseDocs].sort((a: any, b: any) => {
      const aDate = new Date(
        a.uploaded_at || a.created_at || a.updated_at || 0,
      ).getTime();
      const bDate = new Date(
        b.uploaded_at || b.created_at || b.updated_at || 0,
      ).getTime();
      return bDate - aDate;
    });
    return sorted[0];
  }, [documents]);

  const latestAddress = React.useMemo(() => {
    if (!addresses || addresses.length === 0) return null;
    const sorted = [...addresses].sort((a: any, b: any) => {
      const aDate = new Date(a.created_at || a.updated_at || 0).getTime();
      const bDate = new Date(b.created_at || b.updated_at || 0).getTime();
      return bDate - aDate;
    });
    return sorted[0];
  }, [addresses]);

  const sortedDocuments = React.useMemo(() => {
    if (!documents || documents.length === 0) return [];
    return [...documents].sort((a: any, b: any) => {
      const aDate = new Date(a.uploaded_at || a.created_at || 0).getTime();
      const bDate = new Date(b.uploaded_at || b.created_at || 0).getTime();
      return bDate - aDate;
    });
  }, [documents]);

  const getDocumentLabel = (doc: any) => {
    if (doc.original_file_name) return doc.original_file_name;
    if (doc.document_type === "business_license") return "Business License";
    if (doc.document_type === "tax_certificate") return "Tax Certificate";
    if (doc.document_type === "id_card") return "ID Card";
    return "Other Document";
  };

  useEffect(() => {
    if (!latestAddress) return;
    setAddressForm((prev) => ({
      region: prev.region || latestAddress.region || "",
      city: prev.city || latestAddress.city || "",
      subcity: prev.subcity || latestAddress.subcity || "",
      latitude:
        prev.latitude ||
        (latestAddress.latitude !== null && latestAddress.latitude !== undefined
          ? String(latestAddress.latitude)
          : ""),
      longitude:
        prev.longitude ||
        (latestAddress.longitude !== null &&
        latestAddress.longitude !== undefined
          ? String(latestAddress.longitude)
          : ""),
    }));
  }, [latestAddress]);

  const saveAddress = async (showMessage = true) => {
    if (!addressForm.region.trim() || !addressForm.city.trim()) {
      if (showMessage) {
        setAddressMessage("Please provide your region and city address details.");
      }
      return false;
    }

    try {
      const addressPayload: any = {
        region: addressForm.region.trim(),
        city: addressForm.city.trim(),
        subcity: addressForm.subcity?.trim() || undefined,
      };
      if (addressForm.latitude) addressPayload.latitude = addressForm.latitude;
      if (addressForm.longitude)
        addressPayload.longitude = addressForm.longitude;

      if (latestAddress?.id) {
        await updateAddress(latestAddress.id, addressPayload);
      } else {
        await createAddress(addressPayload);
      }

      await fetchAddresses();
      await fetchUser();

      if (showMessage) {
        setAddressMessage("Address saved successfully.");
      }
      return true;
    } catch (error: any) {
      if (showMessage) {
        setAddressMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to save address.",
        );
      }
      return false;
    }
  };

  const handleUploadDocuments = async () => {
    const uploads: {
      file: File;
      document_type:
        | "business_license"
        | "tax_certificate"
        | "id_card"
        | "other";
      issued_date?: string;
      expiry_date?: string;
    }[] = [];

    if (licenseFile) {
      uploads.push({
        file: licenseFile,
        document_type: "business_license",
        issued_date: licenseIssuedDate || undefined,
        expiry_date: licenseExpiryDate || undefined,
      });
    }

    extraDocs.forEach((doc) => {
      if (!doc.file) return;
      uploads.push({
        file: doc.file,
        document_type: doc.document_type,
        issued_date: doc.issued_date || undefined,
        expiry_date: doc.expiry_date || undefined,
      });
    });

    if (uploads.length === 0) {
      setLicenseMessage(null);
      const saved = await saveAddress(true);
      if (!saved) return;
      setLicenseMessage("Address saved. No documents uploaded.");
      return;
    }

    const addressSaved = await saveAddress(false);
    if (!addressSaved) {
      setLicenseMessage("Please provide your region and city address details.");
      return;
    }

    setLicenseUploading(true);
    setLicenseMessage(null);
    try {
      for (const doc of uploads) {
        await documentService.uploadDocument(
          doc.file,
          doc.document_type,
          doc.issued_date,
          doc.expiry_date,
        );
      }
      setLicenseMessage(
        `Uploaded ${uploads.length} document${uploads.length === 1 ? "" : "s"}. Awaiting admin review.`,
      );
      setLicenseFile(null);
      setLicenseIssuedDate("");
      setLicenseExpiryDate("");
      setExtraDocs([]);
      await fetchDocuments();
      await fetchAddresses();
      await fetchUser();
    } catch (error: any) {
      setLicenseMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to upload license document",
      );
    } finally {
      setLicenseUploading(false);
    }
  };

  const handleChangePassword = async () => {
    setSecurityMessage(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setSecurityMessage("Current password and new password are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSecurityMessage("New password and confirm password do not match");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSecurityMessage("Password changed successfully. Please login again.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setSecurityMessage(error?.message || "Failed to change password");
    }
  };

  const handleCreatePaymentMethod = async () => {
    setPaymentMessage(null);
    if (
      !newPaymentMethod.provider_name ||
      !newPaymentMethod.account_holder_name ||
      !newPaymentMethod.account_identifier ||
      !newPaymentMethod.account_display
    ) {
      setPaymentMessage("Please fill all payment method fields");
      return;
    }

    const created = await createSupplierPaymentMethod(newPaymentMethod);
    if (created) {
      setPaymentMessage("Payment method added");
      setNewPaymentMethod({
        method_type: "bank_transfer",
        provider_name: "",
        account_holder_name: "",
        account_identifier: "",
        account_display: "",
        is_primary: false,
      });
      await fetchSupplierPaymentMethods();
    } else {
      setPaymentMessage("Failed to add payment method");
    }
  };

  const handleSetPrimaryPaymentMethod = async (id: string) => {
    setPaymentMessage(null);
    const updated = await updateSupplierPaymentMethod(id, { is_primary: true });
    if (updated) {
      setPaymentMessage("Primary payment method updated");
      await fetchSupplierPaymentMethods();
    } else {
      setPaymentMessage("Failed to update primary payment method");
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    setPaymentMessage(null);
    const deleted = await deleteSupplierPaymentMethod(id);
    if (deleted) {
      setPaymentMessage("Payment method removed");
      await fetchSupplierPaymentMethods();
    } else {
      setPaymentMessage("Failed to remove payment method");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const parsedLatitude = Number.parseFloat(addressForm.latitude);
  const parsedLongitude = Number.parseFloat(addressForm.longitude);
  const hasCoordinates =
    Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude);
  const isBusinessVerified = Boolean(user?.verified);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Geolocation is not supported by this browser.");
      return;
    }
    setIsLocating(true);
    setLocationMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAddressForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLocationMessage("Location updated.");
        setIsLocating(false);
      },
      (error) => {
        setLocationMessage(
          error.message || "Unable to retrieve your location.",
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  useEffect(() => {
    if (hasAutoLocated || hasCoordinates) return;
    if (!navigator.geolocation) return;
    setHasAutoLocated(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAddressForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
      },
      () => {
        // Silent fail; user can click the map or use the button.
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }, [hasAutoLocated, hasCoordinates]);

  const mapCenter = hasCoordinates
    ? { lat: parsedLatitude, lng: parsedLongitude }
    : DEFAULT_MAP_CENTER;

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
                {canManageSupplierPaymentMethods && (
                  <Button
                    variant={activeTab === "payment" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("payment")}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment Settings
                  </Button>
                )}
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
                        {getInitials(profileForm.full_name || "User")}
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
                        value={profileForm.full_name}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            full_name: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Primary Phone</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="altPhone">Alternate Phone</Label>
                      <Input
                        id="altPhone"
                        value={profileForm.altPhone}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            altPhone: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      rows={4}
                    />
                  </div>
                  {saveMessage && (
                    <p className="text-sm text-muted-foreground">
                      {saveMessage}
                    </p>
                  )}
                </CardContent>
                {isEditing && (
                  <CardFooter className="flex justify-end gap-2 border-t pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => void handleProfileSave()}
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
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
                        value={profileForm.business_name}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            business_name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select
                        value={profileForm.businessType || "retailer"}
                        disabled
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
                    <div className="space-y-2">
                      <Label htmlFor="tinNumber">TIN Number</Label>
                      <Input
                        id="tinNumber"
                        value={profileForm.tin_number}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            tin_number: e.target.value,
                          }))
                        }
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

                  {isSupplier && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-amber-700 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-amber-900">
                            Business Verification
                          </h4>
                          <p className="text-xs text-amber-800 mt-1">
                            Upload your business license and any supporting
                            documents so an admin can review and approve your
                            account.
                          </p>
                        </div>
                        {isBusinessVerified ? (
                          <Badge className="ml-auto bg-green-100 text-green-700 border-green-200">
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="ml-auto bg-amber-100 text-amber-800 border-amber-200">
                            Pending
                          </Badge>
                        )}
                      </div>

                      {isBusinessVerified ? (
                        <div className="space-y-4">
                          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4" />
                              Your business account is verified.
                            </div>
                            {businessLicenseDoc?.reviewed_at && (
                              <p className="text-xs mt-1">
                                Approved on{" "}
                                {new Date(
                                  businessLicenseDoc.reviewed_at,
                                ).toLocaleDateString()}
                                .
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-md border bg-white p-3 text-sm">
                              <p className="text-xs text-muted-foreground">
                                Business Name
                              </p>
                              <p className="font-medium">
                                {profileForm.business_name || "—"}
                              </p>
                            </div>
                            <div className="rounded-md border bg-white p-3 text-sm">
                              <p className="text-xs text-muted-foreground">
                                TIN Number
                              </p>
                              <p className="font-medium">
                                {profileForm.tin_number || "—"}
                              </p>
                            </div>
                            <div className="rounded-md border bg-white p-3 text-sm">
                              <p className="text-xs text-muted-foreground">
                                Region
                              </p>
                              <p className="font-medium">
                                {addressForm.region || "—"}
                              </p>
                            </div>
                            <div className="rounded-md border bg-white p-3 text-sm">
                              <p className="text-xs text-muted-foreground">
                                City
                              </p>
                              <p className="font-medium">
                                {addressForm.city || "—"}
                              </p>
                            </div>
                            {addressForm.subcity && (
                              <div className="rounded-md border bg-white p-3 text-sm">
                                <p className="text-xs text-muted-foreground">
                                  Subcity
                                </p>
                                <p className="font-medium">
                                  {addressForm.subcity}
                                </p>
                              </div>
                            )}
                            <div className="rounded-md border bg-white p-3 text-sm">
                              <p className="text-xs text-muted-foreground">
                                Verification Status
                              </p>
                              <p className="font-medium">Verified</p>
                            </div>
                          </div>

                          {hasCoordinates && (
                            <div className="rounded-lg border overflow-hidden">
                              <MapContainer
                                id="businessMap"
                                center={mapCenter}
                                zoom={13}
                                scrollWheelZoom
                                className="h-56 w-full"
                              >
                                <TileLayer
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapCenterUpdater center={mapCenter} />
                                <Marker
                                  position={mapCenter}
                                  icon={mapMarkerIcon}
                                />
                              </MapContainer>
                            </div>
                          )}

                          {sortedDocuments.length > 0 && (
                            <div className="rounded-md border border-amber-200 bg-white/70 p-3 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-amber-900 font-medium">
                                  Uploaded documents
                                </span>
                                <Badge variant="outline">
                                  {sortedDocuments.length}
                                </Badge>
                              </div>
                              <div className="mt-3 space-y-2">
                                {sortedDocuments.map((doc: any) => (
                                  <div
                                    key={doc.id}
                                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-md border bg-white px-3 py-2"
                                  >
                                    <div>
                                      <p className="text-amber-900 font-medium">
                                        {getDocumentLabel(doc)}
                                      </p>
                                      <p className="text-[11px] text-amber-800">
                                        {doc.document_type?.replaceAll(
                                          "_",
                                          " ",
                                        ) || "document"}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className={docStatusStyles[
                                          doc.verification_status || "pending"
                                        ]}
                                      >
                                        {doc.verification_status || "pending"}
                                      </Badge>
                                      {doc.rejection_reason && (
                                        <span className="text-[11px] text-red-700">
                                          {doc.rejection_reason}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground">
                            Need to update verified business details? Please
                            contact support.
                          </p>
                        </div>
                      ) : (
                        <>
                      {businessLicenseDoc && (
                        <div className="rounded-md border border-amber-200 bg-white/70 p-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-amber-900 font-medium">
                              Latest license document
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                businessLicenseDoc.verification_status ===
                                "verified"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : businessLicenseDoc.verification_status ===
                                      "rejected"
                                    ? "bg-red-100 text-red-700 border-red-200"
                                    : "bg-amber-100 text-amber-800 border-amber-200"
                              }
                            >
                              {businessLicenseDoc.verification_status}
                            </Badge>
                          </div>
                          {businessLicenseDoc.rejection_reason && (
                            <p className="mt-2 text-red-700">
                              Rejection reason:{" "}
                              {businessLicenseDoc.rejection_reason}
                            </p>
                          )}
                        </div>
                      )}
                      {businessLicenseDoc && (
                        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Your business license has been submitted
                            successfully.
                          </div>

                          {businessLicenseDoc.verification_status ===
                            "pending" && (
                            <p className="text-xs mt-1">
                              It is currently under admin review.
                            </p>
                          )}

                          {businessLicenseDoc.verification_status ===
                            "verified" && (
                            <p className="text-xs mt-1">
                              Your business has been verified.
                            </p>
                          )}
                        </div>
                      )}
                      {sortedDocuments.length > 0 && (
                        <div className="rounded-md border border-amber-200 bg-white/70 p-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-amber-900 font-medium">
                              Uploaded documents
                            </span>
                            <Badge variant="outline">
                              {sortedDocuments.length}
                            </Badge>
                          </div>
                          <div className="mt-3 space-y-2">
                            {sortedDocuments.map((doc: any) => (
                              <div
                                key={doc.id}
                                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-md border bg-white px-3 py-2"
                              >
                                <div>
                                  <p className="text-amber-900 font-medium">
                                    {getDocumentLabel(doc)}
                                  </p>
                                  <p className="text-[11px] text-amber-800">
                                    {doc.document_type?.replaceAll("_", " ") ||
                                      "document"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={docStatusStyles[
                                      doc.verification_status || "pending"
                                    ]}
                                  >
                                    {doc.verification_status || "pending"}
                                  </Badge>
                                  {doc.rejection_reason && (
                                    <span className="text-[11px] text-red-700">
                                      {doc.rejection_reason}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="businessRegion">Region</Label>
                            <Input
                              id="businessRegion"
                              value={addressForm.region}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  region: e.target.value,
                                }))
                              }
                              placeholder="e.g. Oromia"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="businessCity">City</Label>
                            <Input
                              id="businessCity"
                              value={addressForm.city}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  city: e.target.value,
                                }))
                              }
                              placeholder="e.g. Adama"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="businessSubcity">
                              Subcity (optional)
                            </Label>
                            <Input
                              id="businessSubcity"
                              value={addressForm.subcity}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  subcity: e.target.value,
                                }))
                              }
                              placeholder="e.g. Bole"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center justify-between gap-3">
                              <Label htmlFor="businessMap">
                                Business location (optional)
                              </Label>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleUseCurrentLocation}
                                  disabled={isLocating}
                                >
                                  {isLocating
                                    ? "Locating..."
                                    : "Use my current location"}
                                </Button>
                                {hasCoordinates && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setAddressForm((prev) => ({
                                        ...prev,
                                        latitude: "",
                                        longitude: "",
                                      }))
                                    }
                                  >
                                    Clear location
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="rounded-lg border overflow-hidden">
                              <MapContainer
                                id="businessMap"
                                center={mapCenter}
                                zoom={13}
                                scrollWheelZoom
                                className="h-64 w-full"
                              >
                                <TileLayer
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapCenterUpdater center={mapCenter} />
                                <MapClickHandler
                                  onPick={(lat, lng) =>
                                    setAddressForm((prev) => ({
                                      ...prev,
                                      latitude: lat.toFixed(6),
                                      longitude: lng.toFixed(6),
                                    }))
                                  }
                                />
                                {hasCoordinates && (
                                  <Marker
                                    position={mapCenter}
                                    icon={mapMarkerIcon}
                                  />
                                )}
                              </MapContainer>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Click the map to drop a pin. We will use this to
                              help verify and locate your business.
                            </p>
                            {locationMessage && (
                              <p className="text-xs text-muted-foreground">
                                {locationMessage}
                              </p>
                            )}
                            {hasCoordinates && !locationMessage && (
                              <p className="text-xs text-muted-foreground">
                                Location selected.
                              </p>
                            )}
                            <div className="flex items-center justify-between gap-2">
                              {addressMessage && (
                                <p className="text-xs text-muted-foreground">
                                  {addressMessage}
                                </p>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void saveAddress(true)}
                                disabled={addressesLoading}
                              >
                                {addressesLoading ? "Saving..." : "Save Address"}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-md border border-amber-200 bg-white/60 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-amber-900">
                                Additional verification documents
                              </p>
                              <p className="text-xs text-amber-800">
                                Add TIN, ID card, or other supporting documents
                                for admin review.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setExtraDocs((prev) => [
                                  ...prev,
                                  {
                                    id: `${Date.now()}-${Math.random()}`,
                                    document_type: "tax_certificate",
                                    file: null,
                                    issued_date: "",
                                    expiry_date: "",
                                  },
                                ])
                              }
                            >
                              Add Document
                            </Button>
                          </div>

                          {extraDocs.length === 0 ? (
                            <p className="text-xs text-amber-800">
                              No additional documents added.
                            </p>
                          ) : (
                            extraDocs.map((doc) => (
                              <div
                                key={doc.id}
                                className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-md p-3 bg-white"
                              >
                                <div className="space-y-2">
                                  <Label htmlFor={`docType-${doc.id}`}>
                                    Document Type
                                  </Label>
                                  <Select
                                    value={doc.document_type}
                                    onValueChange={(value) =>
                                      setExtraDocs((prev) =>
                                        prev.map((item) =>
                                          item.id === doc.id
                                            ? {
                                                ...item,
                                                document_type: value as
                                                  | "tax_certificate"
                                                  | "id_card"
                                                  | "other",
                                              }
                                            : item,
                                        ),
                                      )
                                    }
                                  >
                                    <SelectTrigger id={`docType-${doc.id}`}>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="tax_certificate">
                                        TIN / Tax Certificate
                                      </SelectItem>
                                      <SelectItem value="id_card">
                                        ID Card
                                      </SelectItem>
                                      <SelectItem value="other">
                                        Other Document
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`docFile-${doc.id}`}>
                                    Document File
                                  </Label>
                                  <Input
                                    id={`docFile-${doc.id}`}
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={(e) =>
                                      setExtraDocs((prev) =>
                                        prev.map((item) =>
                                          item.id === doc.id
                                            ? {
                                                ...item,
                                                file:
                                                  e.target.files?.[0] || null,
                                              }
                                            : item,
                                        ),
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`docIssued-${doc.id}`}>
                                    Issued Date (optional)
                                  </Label>
                                  <Input
                                    id={`docIssued-${doc.id}`}
                                    type="date"
                                    value={doc.issued_date}
                                    onChange={(e) =>
                                      setExtraDocs((prev) =>
                                        prev.map((item) =>
                                          item.id === doc.id
                                            ? {
                                                ...item,
                                                issued_date: e.target.value,
                                              }
                                            : item,
                                        ),
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`docExpiry-${doc.id}`}>
                                    Expiry Date (optional)
                                  </Label>
                                  <Input
                                    id={`docExpiry-${doc.id}`}
                                    type="date"
                                    value={doc.expiry_date}
                                    onChange={(e) =>
                                      setExtraDocs((prev) =>
                                        prev.map((item) =>
                                          item.id === doc.id
                                            ? {
                                                ...item,
                                                expiry_date: e.target.value,
                                              }
                                            : item,
                                        ),
                                      )
                                    }
                                  />
                                </div>
                                <div className="flex items-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() =>
                                      setExtraDocs((prev) =>
                                        prev.filter(
                                          (item) => item.id !== doc.id,
                                        ),
                                      )
                                    }
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {(docsError || addressesError) && (
                        <p className="text-xs text-red-600">
                          {docsError || addressesError}
                        </p>
                      )}
                      {licenseMessage && (
                        <p className="text-xs text-amber-900">
                          {licenseMessage}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => void handleUploadDocuments()}
                          disabled={
                            licenseUploading || docsLoading || addressesLoading
                          }
                        >
                          {licenseUploading
                            ? "Uploading..."
                            : "Upload Documents"}
                        </Button>
                        <p className="text-xs text-amber-800">
                          Accepted formats: PDF, JPG, PNG, WEBP. Max 10MB.
                        </p>
                      </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setBusinessMessage(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void handleBusinessSave()}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
                {businessMessage && (
                  <p className="px-6 pb-6 text-sm text-muted-foreground">
                    {businessMessage}
                  </p>
                )}
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
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Live Notification Status
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total: {notificationCounts.total} | Unread:{" "}
                        {notificationCounts.unread}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void markAllNotificationsRead()}
                        disabled={notificationCounts.unread === 0}
                      >
                        Mark All Read
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => void clearAllNotifications()}
                        disabled={notificationCounts.total === 0}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>

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
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleChangePassword()}
                      disabled={isLoading}
                    >
                      Update Password
                    </Button>
                    {securityMessage && (
                      <p className="text-sm text-muted-foreground">
                        {securityMessage}
                      </p>
                    )}
                  </div>

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
                    Manage supplier payment methods (factory/distributor only)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!canManageSupplierPaymentMethods ? (
                    <p className="text-sm text-muted-foreground">
                      Payment methods are available only for factory and
                      distributor accounts.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-4 border rounded-lg p-4">
                        <h3 className="text-sm font-medium">
                          Add Payment Method
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Method Type</Label>
                            <Select
                              value={newPaymentMethod.method_type}
                              onValueChange={(value) =>
                                setNewPaymentMethod((prev) => ({
                                  ...prev,
                                  method_type: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select method type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bank_transfer">
                                  Bank Transfer
                                </SelectItem>
                                <SelectItem value="mobile_money">
                                  Mobile Money
                                </SelectItem>
                                <SelectItem value="cash_on_delivery">
                                  Cash on Delivery
                                </SelectItem>
                                <SelectItem value="credit_card">
                                  Credit Card
                                </SelectItem>
                                <SelectItem value="debit_card">
                                  Debit Card
                                </SelectItem>
                                <SelectItem value="paypal">PayPal</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Provider Name</Label>
                            <Input
                              value={newPaymentMethod.provider_name}
                              onChange={(e) =>
                                setNewPaymentMethod((prev) => ({
                                  ...prev,
                                  provider_name: e.target.value,
                                }))
                              }
                              placeholder="e.g. CBE, Telebirr"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Account Holder</Label>
                            <Input
                              value={newPaymentMethod.account_holder_name}
                              onChange={(e) =>
                                setNewPaymentMethod((prev) => ({
                                  ...prev,
                                  account_holder_name: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Account Identifier</Label>
                            <Input
                              value={newPaymentMethod.account_identifier}
                              onChange={(e) =>
                                setNewPaymentMethod((prev) => ({
                                  ...prev,
                                  account_identifier: e.target.value,
                                }))
                              }
                              placeholder="Account number / phone"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Display Text</Label>
                            <Input
                              value={newPaymentMethod.account_display}
                              onChange={(e) =>
                                setNewPaymentMethod((prev) => ({
                                  ...prev,
                                  account_display: e.target.value,
                                }))
                              }
                              placeholder="What buyers should see"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={newPaymentMethod.is_primary}
                              onCheckedChange={(checked) =>
                                setNewPaymentMethod((prev) => ({
                                  ...prev,
                                  is_primary: checked,
                                }))
                              }
                            />
                            <span className="text-sm">Set as primary</span>
                          </div>
                          <Button
                            onClick={() => void handleCreatePaymentMethod()}
                            disabled={isPaymentLoading}
                          >
                            Add Method
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">
                          Saved Payment Methods
                        </h3>
                        {supplierPaymentMethods.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No payment methods added yet.
                          </p>
                        ) : (
                          supplierPaymentMethods.map((method: any) => (
                            <div
                              key={method.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {method.provider_name} ({method.method_type})
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {method.account_display}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {method.is_primary ? (
                                  <Badge>Primary</Badge>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      void handleSetPrimaryPaymentMethod(
                                        method.id,
                                      )
                                    }
                                  >
                                    Set Primary
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() =>
                                    void handleDeletePaymentMethod(method.id)
                                  }
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}

                  {(paymentMessage || paymentError) && (
                    <p className="text-sm text-muted-foreground">
                      {paymentMessage || paymentError}
                    </p>
                  )}
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
