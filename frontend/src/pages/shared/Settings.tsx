import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import L from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  User,
  Building,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Lock,
  LogOut,
  Trash2,
  Truck,
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

import { useAuthStore } from "@/stores/auth.store";
import { useSupplierPaymentMethodStore } from "@/stores/supplier-payment-method.store";
import { useNotificationStore } from "@/stores/notification.store";
import { useDocumentStore } from "@/stores/document.store";
import { useAddressStore } from "@/stores/address.store";
import documentService from "@/services/document.service";
import { authService } from "@/services/auth.service";
import ProfileTab from "../../components/setting/ProfileTab";
import BusinessTab from "../../components/setting/BusinessTab";
import VehicleTab from "../../components/setting/VehicleTab";
import NotificationsTab from "../../components/setting/NotificationsTab";
import SecurityTab from "../../components/setting/SecurityTab";
import PaymentTab from "../../components/setting/PaymentTab";
import PreferencesTab from "../../components/setting/PreferencesTab";

type ProfileFormState = {
  full_name: string;
  email: string;
  phone: string;
  altPhone: string;
  business_name: string;
  businessType: string;
  tin_number: string;
  vatRegistered: boolean;
  bio: string;
  avatar: string;
};

type BusinessFieldErrors = {
  business_name?: string | null;
  tin_number?: string | null;
  vatRegistered?: string | null;
};

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
    defaultMethod: "app_payment",
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
const docStatusStyles: Record<"pending" | "verified" | "rejected", string> = {
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [businessMessage, setBusinessMessage] = useState<string | null>(null);
  const [businessFieldErrors, setBusinessFieldErrors] =
    useState<BusinessFieldErrors>({
    business_name: null,
    tin_number: null,
    vatRegistered: null,
  });
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    method_type: "credit_card",
    provider_name: "",
    account_holder_name: "",
    account_identifier: "",
    account_display: "",
    is_primary: false,
  });

  const { user, fetchUser, updateProfile, changePassword, isLoading } =
    useAuthStore();
  const isSupplier = user?.role === "factory" || user?.role === "distributor";
  const isDriver = user?.role === "driver";
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
  const [profileForm, setProfileFormState] = useState<ProfileFormState>({
    full_name: "",
    email: "",
    phone: "",
    altPhone: "",
    business_name: "",
    businessType: "",
    tin_number: "",
    vatRegistered: false,
    bio: "",
    avatar: "",
  });
  const [profileFormDirty, setProfileFormDirty] = useState(false);
  const [profileFormHydratedUserId, setProfileFormHydratedUserId] = useState<
    string | null
  >(null);
  const setProfileForm: React.Dispatch<React.SetStateAction<ProfileFormState>> =
    (next) => {
      setProfileFormDirty(true);
      setProfileFormState(next);
    };

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
    commonName: "",
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

    // Hydrate the form once per user, then stop overwriting while the user edits.
    if (profileFormHydratedUserId !== user.id) {
      setProfileFormState((prev) => ({
        ...prev,
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        business_name: user.business_name || "",
        businessType: user.role || "",
        tin_number: user.tin_number || "",
        vatRegistered: user.is_vat_registered === true,
        avatar: user.profile_image || "",
      }));
      setProfileFormHydratedUserId(user.id);
      setProfileFormDirty(false);
      return;
    }

    if (profileFormDirty) return;

    setProfileFormState((prev) => ({
      ...prev,
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      business_name: user.business_name || "",
      businessType: user.role || "",
      tin_number: user.tin_number || "",
      vatRegistered: user.is_vat_registered === true,
      avatar: user.profile_image || "",
    }));
  }, [user, fetchUser, profileFormDirty, profileFormHydratedUserId]);

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
      setProfileFormDirty(false);
    } catch {
      setSaveMessage("Failed to update profile");
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setAvatarUploading(true);
      const response = await authService.uploadProfileImage(file);
      const imageUrl = response?.data?.imageUrl;
      if (imageUrl) {
        setProfileForm((prev) => ({ ...prev, avatar: imageUrl }));
        await updateProfile({ profile_image: imageUrl });
      }
    } catch (error) {
      console.error("Failed to upload profile image", error);
    } finally {
      setAvatarUploading(false);
    }
  };

  const validateBusinessVerificationFields = () => {
    if (!isSupplier) return true;

    const errors = {
      business_name: profileForm.business_name.trim()
        ? null
        : "Business name is required.",
      tin_number: profileForm.tin_number.trim()
        ? null
        : "TIN number is required.",
      vatRegistered:
        typeof profileForm.vatRegistered === "boolean"
          ? null
          : "Please set your VAT registration status.",
    };

    setBusinessFieldErrors(errors);
    return !errors.business_name && !errors.tin_number && !errors.vatRegistered;
  };

  const handleBusinessSave = async () => {
    if (!validateBusinessVerificationFields()) {
      setBusinessMessage(
        "Please fill all required business verification fields.",
      );
      return;
    }

    try {
      await updateProfile({
        business_name: profileForm.business_name,
        tin_number: profileForm.tin_number,
        is_vat_registered: profileForm.vatRegistered,
      });
      setBusinessMessage("Business info updated successfully");
      setBusinessFieldErrors({
        business_name: null,
        tin_number: null,
        vatRegistered: null,
      });
      setProfileFormDirty(false);
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
      commonName:
        prev.commonName ||
        (latestAddress as any).commonName ||
        (latestAddress as any).common_name ||
        "",
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
        setAddressMessage(
          "Please provide your region and city address details.",
        );
      }
      return false;
    }

    try {
      const addressPayload: any = {
        region: addressForm.region.trim(),
        city: addressForm.city.trim(),
        subcity: addressForm.subcity?.trim() || undefined,
        common_name: addressForm.commonName?.trim() || undefined,
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
    if (!validateBusinessVerificationFields()) {
      setLicenseMessage(
        "Business name, TIN number, and VAT status are required before document upload.",
      );
      return;
    }

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
      !newPaymentMethod.account_identifier
    ) {
      setPaymentMessage("Please fill all payment method fields");
      return;
    }

    const created = await createSupplierPaymentMethod({
      ...newPaymentMethod,
      account_display:
        newPaymentMethod.account_display ||
        `${newPaymentMethod.provider_name} - ${newPaymentMethod.account_identifier}`,
    });
    if (created) {
      setPaymentMessage("Payment method added");
      setNewPaymentMethod({
        method_type: "credit_card",
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

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    console.log("Delete account clicked");
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
                {user?.role !== "admin" && (
                  <Button
                    variant={activeTab === "business" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("business")}
                  >
                    {isDriver ? (
                      <Truck className="h-4 w-4 mr-2" />
                    ) : (
                      <Building className="h-4 w-4 mr-2" />
                    )}
                    {isDriver ? "Vehicle Info" : "Business Info"}
                  </Button>
                )}
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
            <ProfileTab
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              saveMessage={saveMessage}
              handleProfileSave={handleProfileSave}
              isLoading={isLoading}
              onAvatarUpload={handleAvatarUpload}
              avatarUploading={avatarUploading}
            />

            {/* Business Info Tab */}
            {user?.role !== "admin" && (
              <>
                {isDriver ? (
                  <VehicleTab />
                ) : (
                  <BusinessTab
                    profileForm={profileForm}
                    setProfileForm={setProfileForm}
                    isSupplier={isSupplier}
                    isBusinessVerified={user?.verified || false}
                    businessLicenseDoc={documents.find(
                      (doc: any) => doc.document_type === "business_license",
                    )}
                    sortedDocuments={documents
                      .filter(
                        (doc: any) => doc.document_type !== "business_license",
                      )
                      .sort(
                        (a: any, b: any) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime(),
                      )}
                    addressForm={addressForm}
                    setAddressForm={setAddressForm}
                    hasCoordinates={
                      !!(addressForm.latitude && addressForm.longitude)
                    }
                    mapCenter={{
                      lat:
                        parseFloat(addressForm.latitude) ||
                        DEFAULT_MAP_CENTER.lat,
                      lng:
                        parseFloat(addressForm.longitude) ||
                        DEFAULT_MAP_CENTER.lng,
                    }}
                    locationMessage={locationMessage}
                    addressMessage={addressMessage}
                    saveAddress={saveAddress}
                    handleUseCurrentLocation={handleUseCurrentLocation}
                    isLocating={isLocating}
                    extraDocs={extraDocs}
                    setExtraDocs={setExtraDocs}
                    docsError={docsError}
                    addressesError={addressesError}
                    licenseMessage={licenseMessage}
                    licenseUploading={licenseUploading}
                    docsLoading={docsLoading}
                    addressesLoading={addressesLoading}
                    handleUploadDocuments={handleUploadDocuments}
                    licenseFile={licenseFile}
                    setLicenseFile={setLicenseFile}
                    licenseIssuedDate={licenseIssuedDate}
                    setLicenseIssuedDate={setLicenseIssuedDate}
                    licenseExpiryDate={licenseExpiryDate}
                    setLicenseExpiryDate={setLicenseExpiryDate}
                    businessMessage={businessMessage}
                    setBusinessMessage={setBusinessMessage}
                    businessFieldErrors={businessFieldErrors}
                    setBusinessFieldErrors={setBusinessFieldErrors}
                    handleBusinessSave={handleBusinessSave}
                    isLoading={isLoading}
                  />
                )}
              </>
            )}
            {/* Notifications Tab */}
            <NotificationsTab
              notificationCounts={notificationCounts}
              markAllNotificationsRead={markAllNotificationsRead}
              clearAllNotifications={clearAllNotifications}
              notifications={userData.notifications}
            />

            {/* Security Tab */}
            <SecurityTab
              passwordForm={passwordForm}
              setPasswordForm={setPasswordForm}
              handleChangePassword={handleChangePassword}
              securityMessage={securityMessage}
              isLoading={isLoading}
              deviceHistory={userData.security.deviceHistory}
            />

            {/* Payment Settings Tab */}
            <PaymentTab
              canManageSupplierPaymentMethods={canManageSupplierPaymentMethods}
              newPaymentMethod={newPaymentMethod}
              setNewPaymentMethod={setNewPaymentMethod}
              supplierPaymentMethods={supplierPaymentMethods}
              isPaymentLoading={isPaymentLoading}
              paymentError={paymentError}
              paymentMessage={paymentMessage}
              handleCreatePaymentMethod={handleCreatePaymentMethod}
              handleSetPrimaryPaymentMethod={handleSetPrimaryPaymentMethod}
              handleDeletePaymentMethod={handleDeletePaymentMethod}
            />

            {/* Preferences Tab */}
            <PreferencesTab
              preferences={userData.preferences}
              showDeleteDialog={showDeleteDialog}
              setShowDeleteDialog={setShowDeleteDialog}
              handleDeleteAccount={handleDeleteAccount}
            />
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
