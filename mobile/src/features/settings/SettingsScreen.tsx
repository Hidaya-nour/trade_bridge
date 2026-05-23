// settings/SettingsScreen.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, ScrollView, Alert, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { useAuthStore } from "@/features/auth/auth.store";
import type { UserRole } from "@/features/auth/auth.types";

// Tab Components
import ProfileTab from "./tabs/ProfileTab";
import BusinessTab from "./tabs/BusinessTab";
import SecurityTab from "./tabs/SecurityTab";
import PreferencesTab from "./tabs/PreferencesTab";
import VehicleTab from "./tabs/VehicleTab";

// ---------- Types (mirror web) ----------
type ProfileForm = {
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

type AddressForm = {
  region: string;
  city: string;
  subcity: string;
  commonName: string;
  latitude: string;
  longitude: string;
};

type ExtraDoc = {
  id: string;
  document_type: "tax_certificate" | "id_card" | "other";
  custom_document_type?: string;
  file: any;
  issued_date: string;
  expiry_date: string;
};

type BusinessFieldErrors = {
  business_name?: string | null;
  tin_number?: string | null;
  vatRegistered?: string | null;
};

type SettingsScreenProps = {
  initialTab?: string;
  role?: UserRole;
};

export function SettingsScreen({ initialTab, role: roleProp }: SettingsScreenProps) {
  const user = useAuthStore((state) => state.user);
  const role = roleProp ?? user?.role ?? "retailer";
  const [activeTab, setActiveTab] = useState(initialTab ?? "profile");

  // -------------------- Profile / Business State --------------------
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    altPhone: "",
    business_name: user?.business_name || "",
    businessType: user?.role || "retailer",
    tin_number: user?.tin_number || "",
    vatRegistered: user?.is_vat_registered || false,
    bio: "",
    avatar: user?.profile_image || "",
  });

  const [addressForm, setAddressForm] = useState<AddressForm>({
    region: "",
    city: "",
    subcity: "",
    commonName: "",
    latitude: "",
    longitude: "",
  });

  const [extraDocs, setExtraDocs] = useState<ExtraDoc[]>([]);
  const [licenseFile, setLicenseFile] = useState<any>(null);
  const [licenseIssuedDate, setLicenseIssuedDate] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");

  // UI messages & loading
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [businessMessage, setBusinessMessage] = useState<string | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [addressMessage, setAddressMessage] = useState<string | null>(null);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [licenseMessage, setLicenseMessage] = useState<string | null>(null);
  const [businessFieldErrors, setBusinessFieldErrors] = useState<BusinessFieldErrors>({});

  const [isLoading, setIsLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [licenseUploading, setLicenseUploading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  // Derived values
  const isSupplier = String(role) === "supplier";
  const isBusinessVerified = user?.verified ?? false;

  // Mock documents (for demonstration)
  const businessLicenseDoc = null;
  const sortedDocuments: any[] = [];

  // Map center
  const hasCoordinates = !!(addressForm.latitude && addressForm.longitude);
  const mapCenter = {
    lat: hasCoordinates ? parseFloat(addressForm.latitude) : 9.03,
    lng: hasCoordinates ? parseFloat(addressForm.longitude) : 38.74,
  };

  // -------------------- Handlers (unchanged) --------------------
  const handleProfileSave = async () => {
    setIsLoading(true);
    setSaveMessage(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage("Profile updated successfully");
    } catch (error) {
      setSaveMessage("Failed to update profile");
    } finally {
      setIsLoading(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const onAvatarUpload = async (file: File) => {
    setAvatarUploading(true);
    try {
      Alert.alert("Success", "Avatar uploaded (mock)");
    } catch (error) {
      Alert.alert("Error", "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleBusinessSave = async () => {
    setIsLoading(true);
    setBusinessMessage(null);
    try {
      if (isSupplier) {
        if (!profileForm.business_name) {
          setBusinessFieldErrors(prev => ({ ...prev, business_name: "Business name is required" }));
          setIsLoading(false);
          return;
        }
        if (!profileForm.tin_number) {
          setBusinessFieldErrors(prev => ({ ...prev, tin_number: "TIN number is required" }));
          setIsLoading(false);
          return;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBusinessMessage("Business information saved");
    } catch (error) {
      setBusinessMessage("Failed to save business info");
    } finally {
      setIsLoading(false);
      setTimeout(() => setBusinessMessage(null), 3000);
    }
  };

  const handleUploadDocuments = async () => {
    setLicenseUploading(true);
    setDocsError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLicenseMessage("Documents uploaded successfully");
    } catch (error) {
      setDocsError("Upload failed");
    } finally {
      setLicenseUploading(false);
      setTimeout(() => setLicenseMessage(null), 3000);
    }
  };

  const saveAddress = async (showMessage = true): Promise<boolean> => {
    setAddressesLoading(true);
    setAddressesError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (showMessage) setAddressMessage("Address saved");
      setTimeout(() => setAddressMessage(null), 3000);
      return true;
    } catch (error) {
      setAddressesError("Failed to save address");
      return false;
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationMessage(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationMessage("Location permission denied");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setAddressForm(prev => ({
        ...prev,
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
      }));
      setLocationMessage("Location updated. Click 'Save Address' to persist.");
    } catch (error) {
      setLocationMessage("Could not get location");
    } finally {
      setIsLocating(false);
      setTimeout(() => setLocationMessage(null), 5000);
    }
  };

  // Menu items (same)
  const menuItems = [
    { id: "profile", label: "Profile", icon: "person-outline", component: ProfileTab, roles: ["admin", "retailer", "supplier", "driver"] },
    { id: "business", label: "Business Info", icon: "business-outline", component: BusinessTab, roles: ["retailer", "supplier"] },
    { id: "security", label: "Security", icon: "shield-checkmark-outline", component: SecurityTab, roles: ["admin", "retailer", "supplier", "driver"] },
    { id: "preferences", label: "Preferences", icon: "settings-outline", component: PreferencesTab, roles: ["admin", "retailer", "supplier", "driver"] },
    { id: "vehicle", label: "Vehicle", icon: "car-outline", component: VehicleTab, roles: ["driver"] },
  ];

  const visibleTabs = menuItems.filter(item => item.roles.includes(role));
  const ActiveComponent = visibleTabs.find(t => t.id === activeTab)?.component || ProfileTab;

  const commonProps = {
    isEditing,
    setIsEditing,
    profileForm,
    setProfileForm,
    saveMessage,
    handleProfileSave,
    isLoading,
    onAvatarUpload,
    avatarUploading,
    isSupplier,
    isBusinessVerified,
    businessLicenseDoc,
    sortedDocuments,
    addressForm,
    setAddressForm,
    hasCoordinates,
    mapCenter,
    locationMessage,
    addressMessage,
    saveAddress,
    handleUseCurrentLocation,
    isLocating,
    extraDocs,
    setExtraDocs,
    docsError,
    addressesError,
    licenseMessage,
    licenseUploading,
    docsLoading,
    addressesLoading,
    handleUploadDocuments,
    licenseFile,
    setLicenseFile,
    licenseIssuedDate,
    setLicenseIssuedDate,
    licenseExpiryDate,
    setLicenseExpiryDate,
    businessMessage,
    setBusinessMessage,
    businessFieldErrors,
    setBusinessFieldErrors,
    handleBusinessSave,
  };

  return (
    <ScreenWrapper title="Settings" subtitle="Manage your account preferences">
      <View style={styles.container}>
        {/* Top Tab Bar - Horizontal Scrollable */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
          style={styles.tabsBar}
        >
          {visibleTabs.map(item => (
            <Pressable
              key={item.id}
              onPress={() => setActiveTab(item.id)}
              style={[
                styles.tabItem,
                activeTab === item.id && styles.tabItemActive
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={activeTab === item.id ? "#1d4ed8" : "#64748b"}
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabLabel,
                activeTab === item.id && styles.tabLabelActive
              ]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Content Area - Full Width */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ActiveComponent {...commonProps} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  tabsBar: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexGrow: 0, // Prevents tabs bar from expanding vertically
  },
  tabsScrollContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 24,
    backgroundColor: "#f1f5f9",
  },
  tabItemActive: {
    backgroundColor: "#dbeafe",
  },
  tabIcon: {
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  tabLabelActive: {
    color: "#1d4ed8",
  },
  content: {
    flex: 1,
    padding: 16,
  },
});