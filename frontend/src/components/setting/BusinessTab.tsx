import React, { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Check, Shield } from "lucide-react";
import LandingInput from "@/components/landing/shared/LandingInput";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";

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
  latitude: string;
  longitude: string;
};

type ExtraDoc = {
  id: string;
  document_type: "tax_certificate" | "id_card" | "other";
  file: File | null;
  issued_date: string;
  expiry_date: string;
};

type BusinessFieldErrors = {
  business_name?: string | null;
  tin_number?: string | null;
  vatRegistered?: string | null;
};

type BusinessTabProps = {
  profileForm: ProfileForm;
  setProfileForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
  isSupplier: boolean;
  isBusinessVerified: boolean;
  businessLicenseDoc: any;
  sortedDocuments: any[];
  addressForm: AddressForm;
  setAddressForm: React.Dispatch<React.SetStateAction<AddressForm>>;
  hasCoordinates: boolean;
  mapCenter: { lat: number; lng: number };
  locationMessage: string | null;
  addressMessage: string | null;
  saveAddress: (showMessage?: boolean) => Promise<boolean> | boolean;
  handleUseCurrentLocation: () => void;
  isLocating: boolean;
  extraDocs: ExtraDoc[];
  setExtraDocs: React.Dispatch<React.SetStateAction<ExtraDoc[]>>;
  docsError: string | null;
  addressesError: string | null;
  licenseMessage: string | null;
  licenseUploading: boolean;
  docsLoading: boolean;
  addressesLoading: boolean;
  handleUploadDocuments: () => Promise<void> | void;
  licenseFile: File | null;
  setLicenseFile: React.Dispatch<React.SetStateAction<File | null>>;
  licenseIssuedDate: string;
  setLicenseIssuedDate: React.Dispatch<React.SetStateAction<string>>;
  licenseExpiryDate: string;
  setLicenseExpiryDate: React.Dispatch<React.SetStateAction<string>>;
  businessMessage: string | null;
  setBusinessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  businessFieldErrors: BusinessFieldErrors;
  setBusinessFieldErrors: React.Dispatch<
    React.SetStateAction<BusinessFieldErrors>
  >;
  handleBusinessSave: () => Promise<void> | void;
  isLoading: boolean;
};

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

const getDocumentLabel = (doc: any) => {
  if (doc.original_file_name) return doc.original_file_name;
  if (doc.document_type === "business_license") return "Business License";
  if (doc.document_type === "tax_certificate") return "Tax Certificate";
  if (doc.document_type === "id_card") return "ID Card";
  return "Other Document";
};

const BusinessTab: React.FC<BusinessTabProps> = ({
  profileForm,
  setProfileForm,
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
  isLoading,
}) => {
  return (
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
              <Label htmlFor="businessName">
                Business Name {isSupplier ? "*" : ""}
              </Label>
              <Input
                id="businessName"
                value={profileForm.business_name}
                onChange={(e) => {
                  setProfileForm((prev) => ({
                    ...prev,
                    business_name: e.target.value,
                  }));
                  setBusinessFieldErrors((prev) => ({
                    ...prev,
                    business_name: null,
                  }));
                }}
                className={
                  businessFieldErrors.business_name ? "border-red-500" : ""
                }
                required={isSupplier}
              />
              {businessFieldErrors.business_name && (
                <p className="text-xs text-red-600">
                  {businessFieldErrors.business_name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={profileForm.businessType || "retailer"} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retailer">Retailer</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="wholesaler">Wholesaler</SelectItem>
                  <SelectItem value="manufacturer">Manufacturer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <LandingInput
                label={`TIN Number${isSupplier ? " *" : ""}`}
                name="tin_number"
                value={profileForm.tin_number}
                onChange={(e) => {
                  setProfileForm((prev) => ({
                    ...prev,
                    tin_number: e.target.value,
                  }));
                  setBusinessFieldErrors((prev) => ({
                    ...prev,
                    tin_number: null,
                  }));
                }}
                placeholder="Enter TIN number"
                required={isSupplier}
                error={businessFieldErrors.tin_number || undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vatRegistered">VAT Registered</Label>
              <div className="flex items-center h-10">
                <Switch
                  id="vatRegistered"
                  checked={profileForm.vatRegistered}
                  onCheckedChange={(checked) => {
                    setProfileForm((prev) => ({
                      ...prev,
                      vatRegistered: Boolean(checked),
                    }));
                    setBusinessFieldErrors((prev) => ({
                      ...prev,
                      vatRegistered: null,
                    }));
                  }}
                />
                <span className="ml-2 text-sm text-muted-foreground">
                  Yes, I am VAT registered
                </span>
              </div>
              {businessFieldErrors.vatRegistered && (
                <p className="text-xs text-red-600">
                  {businessFieldErrors.vatRegistered}
                </p>
              )}
            </div>
          </div>

          {isSupplier && (
            <div
              className={
                isBusinessVerified
                  ? "rounded-lg border border-green-200 bg-green-50 p-4 space-y-4"
                  : "rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-4"
              }
            >
              <div className="flex items-start gap-3">
                <Shield
                  className={
                    isBusinessVerified
                      ? "h-5 w-5 text-green-700 mt-0.5"
                      : "h-5 w-5 text-amber-700 mt-0.5"
                  }
                />
                <div className="flex-1">
                  <h4
                    className={
                      isBusinessVerified
                        ? "text-sm font-medium text-green-900"
                        : "text-sm font-medium text-amber-900"
                    }
                  >
                    Business Verification
                  </h4>
                  <p
                    className={
                      isBusinessVerified
                        ? "text-xs text-green-800 mt-1"
                        : "text-xs text-amber-800 mt-1"
                    }
                  >
                    Upload your business license and any supporting documents so
                    an admin can review and approve your account.
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

                  {sortedDocuments.length > 0 && (
                    <div
                      className={
                        isBusinessVerified
                          ? "rounded-md border border-green-200 bg-white/70 p-3 text-xs"
                          : "rounded-md border border-amber-200 bg-white/70 p-3 text-xs"
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={
                            isBusinessVerified
                              ? "text-green-900 font-medium"
                              : "text-amber-900 font-medium"
                          }
                        >
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
                                className={
                                  docStatusStyles[
                                    (doc.verification_status as
                                      | "pending"
                                      | "verified"
                                      | "rejected") || "pending"
                                  ]
                                }
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
                    Need to update verified business details? Please contact
                    support.
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
                        Your business license has been submitted successfully.
                      </div>

                      {businessLicenseDoc.verification_status === "pending" && (
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
                                className={
                                  docStatusStyles[
                                    (doc.verification_status as
                                      | "pending"
                                      | "verified"
                                      | "rejected") || "pending"
                                  ]
                                }
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
                    <div className="rounded-md border border-amber-200 bg-white/60 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-amber-900">
                            Additional verification documents
                          </p>
                          <p className="text-xs text-amber-800">
                            Add TIN, ID card, or other supporting documents for
                            admin review.
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
                                            file: e.target.files?.[0] || null,
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
                                    prev.filter((item) => item.id !== doc.id),
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

                  {docsError && (
                    <p className="text-xs text-red-600">{docsError}</p>
                  )}
                  {licenseMessage && (
                    <p className="text-xs text-amber-900">{licenseMessage}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => void handleUploadDocuments()}
                      disabled={
                        licenseUploading || docsLoading || addressesLoading
                      }
                    >
                      {licenseUploading ? "Uploading..." : "Upload Documents"}
                    </Button>
                    <p className="text-xs text-amber-800">
                      Accepted formats: PDF, JPG, PNG, WEBP. Max 10MB.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {isSupplier && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Business Address
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Keep your address and location details up to date.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessRegion">Region</Label>
                  <Input
                    id="businessRegion"
                    label="Region"
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
                    label="City"
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
                  <Label htmlFor="businessSubcity">Subcity</Label>
                  <Input
                    id="businessSubcity"
                    label="Subcity"
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
                        {isLocating ? "Locating..." : "Use my current location"}
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
                        <Marker position={mapCenter} icon={mapMarkerIcon} />
                      )}
                    </MapContainer>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click the map to drop a pin. We will use this to help locate
                    your business.
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
                  {addressesError && (
                    <p className="text-xs text-red-600">{addressesError}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-6">
          <Button variant="outline" onClick={() => setBusinessMessage(null)}>
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
  );
};

export default BusinessTab;
