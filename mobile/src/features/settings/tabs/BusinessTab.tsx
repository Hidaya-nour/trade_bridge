// settings/tabs/BusinessTab.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  StyleSheet,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';

// ---------- Types (identical to web) ----------
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
  document_type: 'tax_certificate' | 'id_card' | 'other';
  custom_document_type?: string;
  file: any; // will be { uri, name, type, size }
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
  licenseFile: any;
  setLicenseFile: React.Dispatch<React.SetStateAction<any>>;
  licenseIssuedDate: string;
  setLicenseIssuedDate: React.Dispatch<React.SetStateAction<string>>;
  licenseExpiryDate: string;
  setLicenseExpiryDate: React.Dispatch<React.SetStateAction<string>>;
  businessMessage: string | null;
  setBusinessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  businessFieldErrors: BusinessFieldErrors;
  setBusinessFieldErrors: React.Dispatch<React.SetStateAction<BusinessFieldErrors>>;
  handleBusinessSave: () => Promise<void> | void;
  isLoading: boolean;
};

// ---------- Helper Components ----------
const Badge = ({ children, variant = 'default', style }: any) => {
  let bgColor = '#f3f4f6';
  let textColor = '#1f2937';
  if (variant === 'pending') { bgColor = '#fef3c7'; textColor = '#92400e'; }
  if (variant === 'verified') { bgColor = '#dcfce7'; textColor = '#166534'; }
  if (variant === 'rejected') { bgColor = '#fee2e2'; textColor = '#b91c1c'; }
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, style]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{children}</Text>
    </View>
  );
};

const Card = ({ children, style }: any) => (
  <View style={[styles.card, style]}>{children}</View>
);

const CardHeader = ({ children }: any) => <View style={styles.cardHeader}>{children}</View>;
const CardTitle = ({ children }: any) => <Text style={styles.cardTitle}>{children}</Text>;
const CardDescription = ({ children }: any) => <Text style={styles.cardDescription}>{children}</Text>;
const CardContent = ({ children }: any) => <View style={styles.cardContent}>{children}</View>;

const Label = ({ children }: any) => <Text style={styles.label}>{children}</Text>;

const Input = ({ value, onChangeText, placeholder, error, ...rest }: any) => (
  <View>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      {...rest}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// ---------- Main Component ----------
const BusinessTab: React.FC<BusinessTabProps> = (props) => {
  const {
    profileForm, setProfileForm,
    isSupplier, isBusinessVerified,
    businessLicenseDoc, sortedDocuments,
    addressForm, setAddressForm,
    hasCoordinates, mapCenter,
    locationMessage, addressMessage,
    saveAddress, handleUseCurrentLocation, isLocating,
    extraDocs, setExtraDocs,
    docsError, addressesError,
    licenseMessage, licenseUploading,
    docsLoading, addressesLoading,
    handleUploadDocuments,
    licenseFile, setLicenseFile,
    licenseIssuedDate, setLicenseIssuedDate,
    licenseExpiryDate, setLicenseExpiryDate,
    businessMessage, setBusinessMessage,
    businessFieldErrors, setBusinessFieldErrors,
    handleBusinessSave, isLoading,
  } = props;

  // Local UI state for mobile pickers
  const [showDatePicker, setShowDatePicker] = useState<{ field: string; docId?: string } | null>(null);
  const [showSelectModal, setShowSelectModal] = useState<{ docId: string; currentValue: string } | null>(null);

  // Helper: pick a file (image or PDF)
  const pickFile = async (): Promise<{ uri: string; name: string; type: string; size?: number } | null> => {
    try {
      // Request media library permission for images
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos to upload images.');
        return null;
      }
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return null;
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
        size: asset.size,
      };
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
      return null;
    }
  };

  // Business License file picker
  const handleLicenseFilePick = async () => {
    const file = await pickFile();
    if (file) setLicenseFile(file);
  };

  // Extra doc file picker
  const handleExtraDocFilePick = async (docId: string) => {
    const file = await pickFile();
    if (file) {
      setExtraDocs(prev => prev.map(doc =>
        doc.id === docId ? { ...doc, file } : doc
      ));
    }
  };

  // Date picker helpers
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate && showDatePicker) {
      const formatted = selectedDate.toISOString().split('T')[0];
      if (showDatePicker.docId) {
        // extra doc date
        setExtraDocs(prev => prev.map(doc =>
          doc.id === showDatePicker.docId
            ? { ...doc, [showDatePicker.field]: formatted }
            : doc
        ));
      } else {
        // license dates
        if (showDatePicker.field === 'issued') setLicenseIssuedDate(formatted);
        if (showDatePicker.field === 'expiry') setLicenseExpiryDate(formatted);
      }
    }
    setShowDatePicker(null);
  };

  // Render document status badge
  const renderDocStatus = (status: string) => {
    let variant: any = 'default';
    if (status === 'pending') variant = 'pending';
    else if (status === 'verified') variant = 'verified';
    else if (status === 'rejected') variant = 'rejected';
    return <Badge variant={variant}>{status || 'pending'}</Badge>;
  };

  // Map center updater (no direct effect, just pass region)
  const mapRegion = {
    latitude: mapCenter.lat,
    longitude: mapCenter.lng,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Manage your business details for suppliers and verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View style={styles.section}>
            <Label>Business Name {isSupplier ? '*' : ''}</Label>
            <Input
              value={profileForm.business_name}
              onChangeText={(text: string) => {
                setProfileForm(prev => ({ ...prev, business_name: text }));
                setBusinessFieldErrors(prev => ({ ...prev, business_name: null }));
              }}
              placeholder="Enter business name"
              error={businessFieldErrors.business_name}
            />
          </View>

          <View style={styles.section}>
            <Label>Business Type</Label>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={profileForm.businessType || 'retailer'}
                enabled={false}
                style={styles.picker}
              >
                <Picker.Item label="Retailer" value="retailer" />
                <Picker.Item label="Distributor" value="distributor" />
                <Picker.Item label="Wholesaler" value="wholesaler" />
                <Picker.Item label="Manufacturer" value="manufacturer" />
              </Picker>
            </View>
          </View>

          <View style={styles.section}>
            <Label>TIN Number {isSupplier ? '*' : ''}</Label>
            <Input
              value={profileForm.tin_number}
              onChangeText={(text: string) => {
                setProfileForm(prev => ({ ...prev, tin_number: text }));
                setBusinessFieldErrors(prev => ({ ...prev, tin_number: null }));
              }}
              placeholder="Enter TIN number"
              error={businessFieldErrors.tin_number}
            />
          </View>

          <View style={styles.section}>
            <Label>VAT Registered</Label>
            <View style={styles.switchRow}>
              <Switch
                value={profileForm.vatRegistered}
                onValueChange={(checked) => {
                  setProfileForm(prev => ({ ...prev, vatRegistered: checked }));
                  setBusinessFieldErrors(prev => ({ ...prev, vatRegistered: null }));
                }}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              />
              <Text style={styles.switchLabel}>Yes, I am VAT registered</Text>
            </View>
            {businessFieldErrors.vatRegistered && (
              <Text style={styles.errorText}>{businessFieldErrors.vatRegistered}</Text>
            )}
          </View>

          {/* Business Address Section */}
          <View style={styles.addressSection}>
            <Text style={styles.addressTitle}>Business Address</Text>
            <Text style={styles.addressSubtitle}>
              Keep your address and location details up to date.
            </Text>

            <View style={styles.section}>
              <Label>Region</Label>
              <Input
                value={addressForm.region}
                onChangeText={(text: string) => setAddressForm(prev => ({ ...prev, region: text }))}
                placeholder="e.g. Oromia"
              />
            </View>
            <View style={styles.section}>
              <Label>City</Label>
              <Input
                value={addressForm.city}
                onChangeText={(text: string) => setAddressForm(prev => ({ ...prev, city: text }))}
                placeholder="e.g. Adama"
              />
            </View>
            <View style={styles.section}>
              <Label>Subcity</Label>
              <Input
                value={addressForm.subcity}
                onChangeText={(text: string) => setAddressForm(prev => ({ ...prev, subcity: text }))}
                placeholder="e.g. Bole"
              />
            </View>
            <View style={styles.section}>
              <Label>Area / Common Name (optional)</Label>
              <Input
                value={addressForm.commonName}
                onChangeText={(text: string) => setAddressForm(prev => ({ ...prev, commonName: text }))}
                placeholder="e.g. Near Edna Mall"
              />
              <Text style={styles.helperText}>
                Used as your pickup location for deliveries (shown to buyers and drivers).
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.locationActions}>
                <Text style={styles.label}>Business location (optional)</Text>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={handleUseCurrentLocation}
                  disabled={isLocating}
                >
                  <Text style={styles.locationButtonText}>
                    {isLocating ? 'Locating...' : 'Use my current location'}
                  </Text>
                </TouchableOpacity>
              </View>
              {hasCoordinates && (
                <TouchableOpacity
                  style={styles.clearLocation}
                  onPress={() => setAddressForm(prev => ({ ...prev, latitude: '', longitude: '' }))}
                >
                  <Text style={styles.clearLocationText}>Clear location</Text>
                </TouchableOpacity>
              )}
              <View style={styles.mapContainer}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  region={mapRegion}
                  onPress={(e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setAddressForm(prev => ({
                      ...prev,
                      latitude: latitude.toFixed(6),
                      longitude: longitude.toFixed(6),
                    }));
                  }}
                >
                  {hasCoordinates && (
                    <Marker coordinate={{ latitude: mapCenter.lat, longitude: mapCenter.lng }} />
                  )}
                </MapView>
              </View>
              <Text style={styles.helperText}>
                Click the map to drop a pin. We will use this to help locate your business.
              </Text>
              {locationMessage && <Text style={styles.infoText}>{locationMessage}</Text>}
              {hasCoordinates && !locationMessage && (
                <Text style={styles.infoText}>Location selected.</Text>
              )}
              {addressMessage && <Text style={styles.infoText}>{addressMessage}</Text>}
              {!addressMessage && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => saveAddress(true)}
                  disabled={addressesLoading}
                >
                  <Text style={styles.saveButtonText}>
                    {addressesLoading ? 'Saving...' : 'Save Address'}
                  </Text>
                </TouchableOpacity>
              )}
              {addressesError && <Text style={styles.errorText}>{addressesError}</Text>}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setBusinessMessage(null)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButtonPrimary} onPress={() => handleBusinessSave()} disabled={isLoading}>
                <Text style={styles.saveButtonPrimaryText}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
            {businessMessage && <Text style={styles.infoText}>{businessMessage}</Text>}
          </View>

          {/* Supplier Verification Section */}
          {isSupplier && (
            <View style={[styles.verificationContainer, isBusinessVerified ? styles.verifiedBg : styles.pendingBg]}>
              <View style={styles.verificationHeader}>
                <Feather name="shield" size={20} color={isBusinessVerified ? '#166534' : '#b45309'} />
                <View style={styles.verificationText}>
                  <Text style={[styles.verificationTitle, isBusinessVerified ? styles.verifiedText : styles.pendingText]}>
                    Business Verification
                  </Text>
                  <Text style={[styles.verificationDesc, isBusinessVerified ? styles.verifiedDesc : styles.pendingDesc]}>
                    Upload your business license and supporting documents so an admin can review and approve your account.
                  </Text>
                </View>
                <Badge variant={isBusinessVerified ? 'verified' : 'pending'}>
                  {isBusinessVerified ? 'Verified' : 'Pending'}
                </Badge>
              </View>

              {isBusinessVerified ? (
                <View>
                  <View style={styles.verifiedMessage}>
                    <Feather name="check" size={16} color="#166534" />
                    <Text style={styles.verifiedMessageText}>Your business account is verified.</Text>
                  </View>
                  {businessLicenseDoc?.reviewed_at && (
                    <Text style={styles.approvedDate}>
                      Approved on {new Date(businessLicenseDoc.reviewed_at).toLocaleDateString()}
                    </Text>
                  )}
                  {sortedDocuments.length > 0 && (
                    <View style={styles.documentsList}>
                      <Text style={styles.documentsTitle}>Uploaded documents</Text>
                      {sortedDocuments.map((doc: any) => (
                        <View key={doc.id} style={styles.documentItem}>
                          <View>
                            <Text style={styles.documentName}>{getDocumentLabel(doc)}</Text>
                            <Text style={styles.documentType}>{doc.document_type?.replace(/_/g, ' ') || 'document'}</Text>
                          </View>
                          {renderDocStatus(doc.verification_status)}
                        </View>
                      ))}
                    </View>
                  )}
                  <Text style={styles.supportNote}>
                    Need to update verified business details? Please contact support.
                  </Text>
                </View>
              ) : (
                <View>
                  {businessLicenseDoc && (
                    <View style={styles.licenseStatusCard}>
                      <Text style={styles.licenseStatusTitle}>Latest license document</Text>
                      {renderDocStatus(businessLicenseDoc.verification_status)}
                      {businessLicenseDoc.rejection_reason && (
                        <Text style={styles.rejectionReason}>Rejection reason: {businessLicenseDoc.rejection_reason}</Text>
                      )}
                    </View>
                  )}
                  {sortedDocuments.length > 0 && (
                    <View style={styles.documentsList}>
                      <Text style={styles.documentsTitle}>Uploaded documents</Text>
                      {sortedDocuments.map((doc: any) => (
                        <View key={doc.id} style={styles.documentItem}>
                          <View>
                            <Text style={styles.documentName}>{getDocumentLabel(doc)}</Text>
                            <Text style={styles.documentType}>{doc.document_type?.replace(/_/g, ' ') || 'document'}</Text>
                          </View>
                          {renderDocStatus(doc.verification_status)}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Additional Documents */}
                  <View style={styles.additionalDocs}>
                    <View style={styles.additionalDocsHeader}>
                      <View>
                        <Text style={styles.additionalDocsTitle}>Additional verification documents</Text>
                        <Text style={styles.additionalDocsDesc}>
                          Add TIN, ID card, or other supporting documents for admin review.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() =>
                          setExtraDocs(prev => [
                            ...prev,
                            {
                              id: `${Date.now()}-${Math.random()}`,
                              document_type: 'tax_certificate',
                              custom_document_type: '',
                              file: null,
                              issued_date: '',
                              expiry_date: '',
                            },
                          ])
                        }
                      >
                        <Text style={styles.addButtonText}>Add Document</Text>
                      </TouchableOpacity>
                    </View>
                    {extraDocs.length === 0 ? (
                      <Text style={styles.noDocsText}>No additional documents added.</Text>
                    ) : (
                      extraDocs.map(doc => (
                        <View key={doc.id} style={styles.extraDocCard}>
                          <View style={styles.extraDocRow}>
                            <Label>Document Type</Label>
                            <TouchableOpacity
                              style={styles.pickerTrigger}
                              onPress={() => setShowSelectModal({ docId: doc.id, currentValue: doc.document_type })}
                            >
                              <Text>
                                {doc.document_type === 'tax_certificate' && 'TIN / Tax Certificate'}
                                {doc.document_type === 'id_card' && 'ID Card'}
                                {doc.document_type === 'other' && 'Other Document'}
                              </Text>
                              <Feather name="chevron-down" size={16} color="#6b7280" />
                            </TouchableOpacity>
                          </View>
                          {doc.document_type === 'other' && (
                            <View style={styles.section}>
                              <Label>Specify Document Type</Label>
                              <Input
                                value={doc.custom_document_type || ''}
                                onChangeText={(text: string) =>
                                  setExtraDocs(prev =>
                                    prev.map(d =>
                                      d.id === doc.id ? { ...d, custom_document_type: text } : d
                                    )
                                  )
                                }
                                placeholder="Enter document type"
                              />
                            </View>
                          )}
                          <View style={styles.section}>
                            <Label>Document File</Label>
                            <TouchableOpacity
                              style={styles.fileButton}
                              onPress={() => handleExtraDocFilePick(doc.id)}
                            >
                              <Text style={styles.fileButtonText}>
                                {doc.file ? doc.file.name : 'Choose File'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.dateRow}>
                            <View style={styles.dateField}>
                              <Label>Issued Date (optional)</Label>
                              <TouchableOpacity
                                style={styles.dateTrigger}
                                onPress={() => setShowDatePicker({ field: 'issued_date', docId: doc.id })}
                              >
                                <Text>{doc.issued_date || 'Select date'}</Text>
                              </TouchableOpacity>
                            </View>
                            <View style={styles.dateField}>
                              <Label>Expiry Date (optional)</Label>
                              <TouchableOpacity
                                style={styles.dateTrigger}
                                onPress={() => setShowDatePicker({ field: 'expiry_date', docId: doc.id })}
                              >
                                <Text>{doc.expiry_date || 'Select date'}</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => setExtraDocs(prev => prev.filter(d => d.id !== doc.id))}
                          >
                            <Text style={styles.removeButtonText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </View>

                  {docsError && <Text style={styles.errorText}>{docsError}</Text>}
                  {licenseMessage && <Text style={styles.infoText}>{licenseMessage}</Text>}

                  <View style={styles.uploadAction}>
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => handleUploadDocuments()}
                      disabled={licenseUploading || docsLoading || addressesLoading}
                    >
                      <Text style={styles.uploadButtonText}>
                        {licenseUploading ? 'Uploading...' : 'Upload Documents'}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.formatHint}>
                      Accepted formats: PDF, JPG, PNG, WEBP. Max 10MB.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </CardContent>
      </Card>

      {/* Modal for document type selection */}
      <Modal visible={!!showSelectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Document Type</Text>
            <Picker
              selectedValue={showSelectModal?.currentValue}
              onValueChange={(itemValue) => {
                if (showSelectModal) {
                  setExtraDocs(prev =>
                    prev.map(doc =>
                      doc.id === showSelectModal.docId
                        ? {
                            ...doc,
                            document_type: itemValue as any,
                            custom_document_type: itemValue === 'other' ? doc.custom_document_type || '' : '',
                          }
                        : doc
                    )
                  );
                  setShowSelectModal(null);
                }
              }}
            >
              <Picker.Item label="TIN / Tax Certificate" value="tax_certificate" />
              <Picker.Item label="ID Card" value="id_card" />
              <Picker.Item label="Other Document" value="other" />
            </Picker>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowSelectModal(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date picker modal */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}
    </ScrollView>
  );
};

// Helper function (same as web)
const getDocumentLabel = (doc: any) => {
  if (doc.original_file_name) return doc.original_file_name;
  if (doc.document_type === 'business_license') return 'Business License';
  if (doc.document_type === 'tax_certificate') return 'Tax Certificate';
  if (doc.document_type === 'id_card') return 'ID Card';
  return 'Other Document';
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  cardContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  picker: {
    height: 50,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4b5563',
  },
  addressSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addressSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    marginBottom: 12,
  },
  helperText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  locationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  locationButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  locationButtonText: {
    fontSize: 12,
    color: '#1f2937',
  },
  clearLocation: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearLocationText: {
    fontSize: 12,
    color: '#ef4444',
  },
  mapContainer: {
    height: 200,
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  map: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#4b5563',
  },
  saveButtonPrimary: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  saveButtonPrimaryText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  verificationContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  verifiedBg: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  pendingBg: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  verificationHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  verificationText: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  verifiedText: {
    color: '#166534',
  },
  pendingText: {
    color: '#b45309',
  },
  verificationDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  verifiedDesc: {
    color: '#166534',
  },
  pendingDesc: {
    color: '#b45309',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  verifiedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  verifiedMessageText: {
    fontSize: 13,
    color: '#166534',
    marginLeft: 8,
  },
  approvedDate: {
    fontSize: 11,
    color: '#166534',
    marginTop: 4,
  },
  documentsList: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  documentsTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#92400e',
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  documentName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  documentType: {
    fontSize: 11,
    color: '#6b7280',
  },
  supportNote: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  licenseStatusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  licenseStatusTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#92400e',
  },
  rejectionReason: {
    fontSize: 12,
    color: '#b91c1c',
    marginTop: 4,
  },
  additionalDocs: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
  },
  additionalDocsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  additionalDocsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400e',
  },
  additionalDocsDesc: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 12,
    color: '#1f2937',
  },
  noDocsText: {
    fontSize: 12,
    color: '#b45309',
    marginTop: 8,
  },
  extraDocCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  extraDocRow: {
    marginBottom: 12,
  },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#ffffff',
    marginTop: 4,
  },
  fileButton: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  fileButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dateField: {
    flex: 1,
    marginRight: 8,
  },
  dateTrigger: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  removeButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    fontSize: 13,
    color: '#ef4444',
  },
  uploadAction: {
    marginTop: 16,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  formatHint: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalClose: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#1f2937',
  },
});

export default BusinessTab;